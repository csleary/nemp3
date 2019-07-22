import '../style/home.css';
import { fetchRelease, playTrack, toastInfo } from '../actions';
import React from 'react';
import RenderRelease from './RenderRelease';
import Spinner from './Spinner';
import { connect } from 'react-redux';

const SearchResults = props => {
  const { searchQuery, searchResults } = this.props;
  const number = searchResults.length;

  const renderReleases = searchResults.map(release => (
    <RenderRelease
      fetchRelease={this.props.fetchRelease}
      key={release._id}
      playTrack={this.props.playTrack}
      release={release}
      toastInfo={this.props.toastInfo}
    />
  ));

  const renderSearchResults = () => {
    if (searchQuery.length) {
      return (
        <>
          <h3 className="text-center mt-4">
            {number} result{number === 1 ? '' : 's'} for &lsquo;{searchQuery}
            &rsquo;.
          </h3>
          <div className="front-page">{renderReleases}</div>
        </>
      );
    }

    return (
      <h3 className="text-center mt-4">
        Search for releases by artist, titles and tags.
      </h3>
    );
  };

  if (props.isSearching) {
    return (
      <Spinner>
        <h3 className="mt-4">Searching for &lsquo;{searchQuery}&rsquo;…</h3>
      </Spinner>
    );
  }

  return (
    <main className="container-fluid">
      <div className="row">
        <div className="col py-3">{renderSearchResults()}</div>
      </div>
    </main>
  );
};

function mapStateToProps(state) {
  return {
    isSearching: state.releases.isSearching,
    searchQuery: state.releases.searchQuery,
    searchResults: state.releases.searchResults
  };
}

export default connect(
  mapStateToProps,
  {
    fetchRelease,
    playTrack,
    toastInfo
  }
)(SearchResults);
