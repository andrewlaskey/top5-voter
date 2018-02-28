import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, IndexRoute, Link, NavLink } from 'react-router-dom';
import TrackList from './Components/TrackList';

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