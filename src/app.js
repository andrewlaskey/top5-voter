import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, IndexRoute, Link, NavLink } from 'react-router-dom'
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyAZNs9U2enT8lxTDzuUyNuSjlHlnA97wPs",
  authDomain: "top5voter.firebaseapp.com",
  databaseURL: "https://top5voter.firebaseio.com",
  projectId: "top5voter",
  storageBucket: "top5voter.appspot.com",
  messagingSenderId: "134373023663"
};

firebase.initializeApp(firebaseConfig);

// Load more tracks button component
class LoadMoreButton extends React.Component {
  render() {
    var content = '';

    // Only show the button if there are tracks and the number of tracks mod the number
    // of tracks per page is not 0. If there is a remainder that means we've loaded all
    // the tracks
    if (this.props.numItems === 0 || this.props.numItems % this.props.itemsPerPage !== 0) {
      content = <p>End of the line</p>;
    } else {
      content = <button className="more-button" onClick={ this.props.loadMore }>More</button>;
    }

    return (<div>{ content }</div>);
  }
}

// Component for individual track item
class TrackItem extends React.Component {
  render() {
    return (
      <li className="track">
        <img src={ this.props.track.art } alt={ this.props.track.track } />
        <div className="track-content">
          <h4 className="track-title"><a href={ this.props.track.link } target="_blank" title="Open in Spotify">{ this.props.track.track } <sup><i className="fa fa-external-link"></i></sup></a></h4>
          <h5 className="track-artist"><Link to={ '/artist/' + this.props.track.artist.split(' ').join('-') } >{ this.props.track.artist }</Link></h5>
          <p><small>Added by <Link to={ '/user/' + this.props.track.user.split(' ').join('-') } >{ this.props.track.user }</Link> on <span>{ this.props.track.added }</span></small></p>
          <button 
            className={ this.props.track.localLiked ? 'liked' : '' }
            onClick={ this.props.addLike.bind(null, this.props.track['.key']) }>
            <i className="fa fa-heart"></i>{ this.props.track.likes > 0 ? ' ' + this.props.track.likes : ''  }
          </button>
        </div>
      </li>
    );
  }
}

// Main component that downloads the data from firebase and displays the list
class TrackList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracksPerPage: 20,
      totalTracks: 20,
      tracks: []
    }

    this.loadMore = this.loadMore.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
    this.getTrackList = this.getTrackList.bind(this);
    this.addTracksToList = this.addTracksToList.bind(this);
  }

  componentWillMount() {
    this.getTrackList();
  }

  componentWillUnmount() {

  }

  // Depending on which route the user is viewing we query different data from firebase
  getTrackList() {
    this.firebaseRef = firebase.database().ref('tracks');

    if (this.props.type == 'recent') {
      this.firebaseRef
        .limitToLast(this.state.totalTracks)
        .once('value', (snapshot) => { this.addTracksToList(snapshot) }); 
    }

    if (this.props.type == 'popular') {
      this.firebaseRef
        .orderByChild("likes")
        .limitToLast(this.state.totalTracks)
        .once('value', (snapshot) => { this.addTracksToList(snapshot) }); 
    }

    if (this.props.type == 'user') {
      var user = this.props.params.userId.split('-').join(' ');

      this.firebaseRef
        .orderByChild("user")
        .equalTo(user)
        .limitToLast(this.state.totalTracks)
        .once('value', (snapshot) => { this.addTracksToList(snapshot) }); 
    }

    if (this.props.type == 'artist') {
      var artist = this.props.params.artist.split('-').join(' ');

      this.firebaseRef
        .orderByChild('artist')
        .equalTo(artist)
        .once('value', (snapshot) => { this.addTracksToList(snapshot) }); 
    }

    // Get all tracks saved locally
    if (this.props.type == 'saved') {
      this.setState({
        tracks: []
      });

      // Lookup all localstorage keys
      for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        var key = localStorage.key(i),
          value = localStorage.getItem(key);

        if (value === 'true') {
          // Using the tracks Firebase key stored locally we pull it from
          // Firebase
          var trackRef = this.firebaseRef.child(key);

          trackRef.once('value', (snap) => {
            var item = snap.val();
            
            if (typeof item !== 'undefined' && item !== null) {
              item['.key'] = snap.key;

              item['localLiked'] = true;

              this.setState(function(oldState) {
                return oldState.tracks.push(item);
              });
            }
          });
        }
      }
    }
  }

  // Firebase callback. Adds returned items to state's track array.
  addTracksToList(snapshot) {
    let items = [];

    snapshot.forEach((childSnapshot) => {
      let item = childSnapshot.val();
      let key = childSnapshot.key;
      
      if (typeof item !== 'undefined' && item !== null) {
        item['.key'] = key;
        item['localLiked'] = localStorage.getItem(key) ? true : false;
        items.push(item);
      }

    });

    // Reverse the list so items are in decending order
    items.reverse();

    this.setState((prevState) => ({
      tracks: items
    }));
  }

  // Update Firebase and local storage when someone likes or dislikes a track
  toggleLike(key) {
    let updateAmt = 0,
      localLiked = localStorage.getItem(key) ? true : false

    if (localLiked) {
      updateAmt--;
    } else {
      updateAmt++;
    }

    let siteLikesRef = firebase.database().ref('tracks/' + key + '/likes');

    // transaction(update function, callback)
    siteLikesRef.transaction((current_value) => {
        var likes = current_value || 0;
        return likes + updateAmt;
      }, (error, committed, snapshot) => {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        } else if (!committed) {
          console.log('No update');
        } else {
          // Update successful
          if (localLiked) {
            localStorage.removeItem(key);

            // if we're looking at local saves, manually remove track from state because we're not listening to Firebase
            if (this.props.type == 'saved') {
              this.setState((oldState) => {
                for (var i = oldState.tracks.length - 1; i >= 0; i--) {
                  if (oldState.tracks[i]['.key'] === key) {
                    oldState.tracks.splice(i, 1);
                  }
                };

                return oldState.tracks;
              });
            }
          } else {
            localStorage.setItem(key, true);
          }
        }
      });
  }

  // Update the total number of tracks to download and get them
  loadMore() {
    this.setState((previousState) => {
      return {
        totalTracks: previousState.totalTracks + previousState.tracksPerPage
      };
    }, this.getTrackList);
  }

  render() {
    let createTrack = (track, index) => {
      return (
        <TrackItem 
          key={ index }
          track = { track }
          addLike={ this.toggleLike }
        />
      );
    }

    return (
      <div>
        <ul className="tracklist">{ this.state.tracks.map(createTrack) }</ul>
        <LoadMoreButton
          numItems={ this.state.tracks.length } 
          itemsPerPage={ this.state.tracksPerPage }
          loadMore={ this.loadMore }
        />
      </div>
    );
  }
}

// App level component with navigation and tracklist
class App extends React.Component{
  render () {
    return (
      <div>
        <h1 className="app-title">Top 5 Voter</h1>
        <ul className="nav">
          <li><NavLink to="/" activeClassName="active">Recent</NavLink></li>
          <li><NavLink to="/popular" activeClassName="active">Popular</NavLink></li>
          <li><NavLink to="/saved" activeClassName="active">Saved</NavLink></li>
        </ul>

        <Route exact path="/" render={() => <div><TrackList {...this.props} type="recent" /></div>} />
        <Route path="/popular" render={() => <div><TrackList {...this.props} type="popular" /></div>} />
        <Route path="/saved" render={() => <div><TrackList {...this.props} type="saved" /></div>} />
        <Route path="/user/:userId" render={() => <div><TrackList {...this.props} type="user" /></div>} />
        <Route path="/artist/:artist" render={() => <div><TrackList {...this.props} type="artist" /></div>} />
      </div>
    );
  }
};

ReactDOM.render((
  <BrowserRouter>
    <App></App>
  </BrowserRouter>
), document.getElementById('app'));