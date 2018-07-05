import React, { Component } from 'react';
import { connect } from 'react-redux';
import RenderRelease from './RenderRelease';
import Spinner from './Spinner';
import {
  fetchCatalogue,
  fetchRelease,
  playTrack,
  toastMessage
} from '../actions';
import '../style/home.css';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    this.setLoading();
    this.props.fetchCatalogue().then(() => this.setState({ isLoading: false }));
  }

  setLoading() {
    this.setState({ isLoading: true });
  }

  render() {
    const { catalogue } = this.props;
    const renderReleases = catalogue.map(release => (
      <RenderRelease
        fetchRelease={this.props.fetchRelease}
        key={release._id}
        playTrack={this.props.playTrack}
        release={release}
        toastMessage={this.props.toastMessage}
      />
    ));

    if (this.state.isLoading) {
      return (
        <Spinner>
          <h2>Loading catalogue&hellip;</h2>
        </Spinner>
      );
    }
    return (
      <main className="container-fluid">
        <div className="row">
          <div className="col">
            <div className="front-page">{renderReleases}</div>
          </div>
        </div>
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {
    catalogue: state.releases.catalogue
  };
}

export default connect(
  mapStateToProps,
  {
    fetchCatalogue,
    fetchRelease,
    playTrack,
    toastMessage
  }
)(Home);
