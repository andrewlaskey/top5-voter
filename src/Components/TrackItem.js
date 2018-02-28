import React from 'react';
import { Link } from 'react-router-dom';

// Component for individual track item
export default class TrackItem extends React.Component {
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