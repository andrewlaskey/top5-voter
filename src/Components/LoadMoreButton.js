import React from 'react';

// Load more tracks button component
export default class LoadMoreButton extends React.Component {
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