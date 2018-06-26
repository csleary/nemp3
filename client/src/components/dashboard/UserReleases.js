import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import Spinner from './../Spinner';

const handlePublishStatus = (props, release) => {
  if (
    release.artwork &&
    release.trackList.length &&
    release.trackList.filter(track => track.hasAudio === false).length === 0
  ) {
    props.publishStatus(release._id).then(() => {
      let message;
      release.published
        ? (message = `'${release.releaseTitle}' has been taken offline.`)
        : (message = `'${release.releaseTitle}' is now live and on sale.`);
      props.toastMessage({
        alertClass: 'alert-success',
        message
      });
    });
  } else {
    props.toastMessage({
      alertClass: 'alert-danger',
      message:
        'Please ensure your release has artwork, and that all tracks have audio uploaded, before publishing.'
    });
  }
};

const pleaseConfirm = (title, callback) => {
  const confirmation = window.confirm(
    `Are you sure you want to delete ${title || 'this release'}?`
  );
  if (confirmation) callback();
};

const renderTitle = release => {
  if (release.artistName) {
    return (
      <h6>
        {release.artistName} &bull;{' '}
        <Link to={`/release/${release._id}`}>
          <span className="ibm-type-italic">{release.releaseTitle}</span>
        </Link>
      </h6>
    );
  }
  return <h6>Untitled Release</h6>;
};

const copiesSold = (releaseId, salesData) => {
  const releaseSales =
    salesData &&
    salesData.filter(release => release.releaseId === releaseId)[0];
  const salesArray =
    releaseSales && releaseSales.purchases.map(sale => sale.numSold);
  const numSold = salesArray && salesArray.reduce((acc, el) => acc + el);
  if (numSold) {
    return (
      <h6>
        <span className="red">Sold:</span> {numSold}
      </h6>
    );
  }
};

// chart line

const UserReleases = props => {
  const renderUserReleases = () => {
    if (props.isLoadingUserReleases) {
      return <Spinner />;
    }
    return props.userReleases.map(release => (
      <li
        className={`row no-gutters release ${
          release.published ? 'published' : 'unpublished'
        }`}
        key={release._id}
      >
        <div className="artwork">
          <Link to={`/release/${release._id}`}>
            <img
              className="lazyload img-fluid"
              data-src={release.artwork ? release.artwork : null}
              alt={release.artwork && `'${release.releaseTitle}' Artwork`}
            />
          </Link>
        </div>
        <div className="col d-flex flex-column">
          <div>
            {renderTitle(release)}
            <h6>
              <FontAwesome name="tag" className="icon-left red" />
              ${release.price} USD
            </h6>
            <h6>
              <FontAwesome name="calendar-o" className="icon-left red" />
              {moment(new Date(release.releaseDate)).format('Do of MMM, YYYY')}
            </h6>
            <h6>
              <FontAwesome name="file-audio-o" className="icon-left red" />
              {release.trackList.length} Tracks
            </h6>
            {copiesSold(release._id, props.salesData)}
          </div>
          <div className="d-flex align-items-end ml-auto mt-auto">
            <button
              onClick={() => props.history.push(`/release/edit/${release._id}`)}
              className="btn btn-outline-primary btn-sm"
            >
              <FontAwesome name="pencil" className="icon-left" />
              Edit
            </button>
            <button
              onClick={() => handlePublishStatus(props, release)}
              className="btn btn-outline-warning btn-sm"
            >
              <FontAwesome name="eye-slash" className="icon-left" />
              {release.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() =>
                pleaseConfirm(release.releaseTitle, () =>
                  props.deleteRelease(release._id).then(
                    props.toastMessage({
                      alertClass: 'alert-success',
                      message: `'${release.releaseTitle}' deleted.`
                    })
                  )
                )
              }
              className="btn btn-outline-danger btn-sm"
            >
              <FontAwesome name="trash" className="icon-left" />
              Delete
            </button>
          </div>
        </div>
      </li>
    ));
  };

  return (
    <main className="container-fluid">
      <div className="row">
        <div className="col-lg">
          {!props.isLoadingUserReleases &&
            props.userReleases &&
            !props.userReleases.length && (
              <p>
                You don&rsquo;t currently have any releases for sale. Please hit
                the button below to add your first release.
              </p>
            )}
          <ul className="user-releases">{renderUserReleases()}</ul>
          <Link
            className="btn btn-outline-primary btn-sm add-release"
            title="Add Release"
            role="button"
            to={'/release/add/'}
          >
            <FontAwesome name="plus-circle" className="icon-left" />
            Add Release
          </Link>
        </div>
      </div>
    </main>
  );
};

export default UserReleases;
