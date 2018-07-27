import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { Field } from 'redux-form';
import classNames from 'classnames';
import ProgressBar from './ProgressBar';
import RenderTrackField from './RenderTrackField';

class RenderTrack extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDeletingTrack: false
    };
  }

  handleDeleteTrack = (remove, index) => {
    const { trackTitle } = this.props.release.trackList[index];
    this.props.handleConfirm(trackTitle, hasConfirmed => {
      if (!hasConfirmed) return;
      this.setState({ isDeletingTrack: true });
      this.props
        .deleteTrack(
          this.props.release._id,
          this.props.release.trackList[index]._id
        )
        .then(() => {
          this.props.toastSuccess(
            `${(trackTitle && `'${trackTitle}'`) || 'Track'} deleted.`
          );
          this.setState({ isDeletingTrack: false }, () => remove(index));
        });
    });
  };

  handleMoveTrack = (swap, id, index, direction) => {
    this.props.moveTrack(id, index, index + direction).then(res => {
      if (res.error) return;
      swap(index, index + direction);
    });
  };

  render() {
    const {
      audioUploading,
      index,
      isTranscoding,
      fields,
      release,
      track
    } = this.props;
    const { isDeletingTrack } = this.state;
    const releaseId = release._id;
    const trackId = release.trackList[index] && release.trackList[index]._id;
    const isaudioUploading = audioUploading[trackId] < 100;
    const transcoding = isTranscoding.some(id => id === trackId);

    const hasAudio =
      (release.trackList[index] && release.trackList[index].hasAudio) ||
      audioUploading[trackId] === 100;

    const audioClassNames = classNames({
      'audio-true': hasAudio,
      'audio-uploading': isaudioUploading,
      'audio-false': !hasAudio && !isaudioUploading
    });

    const trackClassNames = classNames('list-group-item', audioClassNames, {
      'drag-active': this.props.dragActive === index,
      'drag-origin': this.props.dragOrigin === index
    });

    return (
      <li
        className={trackClassNames}
        draggable="true"
        key={`${track}._id`}
        onDragStart={() => this.props.handleDragStart(index)}
        onDragEnter={() => this.props.handleDragEnter(index)}
        onDragOver={() => this.props.handleDragOver()}
        onDragLeave={() => this.props.handleDragLeave()}
        onDrop={() => this.props.handleDrop(fields.move, index)}
        onDragEnd={() => this.props.handleDragEnd()}
        onTouchStart={() => {}}
      >
        <Field
          component={RenderTrackField}
          trackId={trackId}
          hasAudio={hasAudio}
          audioClassNames={audioClassNames}
          index={index}
          label={index + 1}
          name={`${track}.trackTitle`}
          release={this.props.release}
          type="text"
          onDropAudio={this.props.onDropAudio}
          audioUploading={audioUploading[trackId]}
        />
        <div className="d-flex mt-3">
          {transcoding && (
            <span className="ml-2 yellow">
              <FontAwesome name="cog" spin className="mr-2" />
              <strong>Transcoding</strong>
            </span>
          )}
          {index < fields.length - 1 && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() =>
                this.handleMoveTrack(fields.swap, releaseId, index, 1)
              }
              title="Move Down"
              type="button"
            >
              <FontAwesome name="arrow-down" className="mr-2" />
              Down
            </button>
          )}
          {index > 0 && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() =>
                this.handleMoveTrack(fields.swap, releaseId, index, -1)
              }
              title="Move Up"
              type="button"
            >
              <FontAwesome name="arrow-up" className="mr-2" />
              Up
            </button>
          )}
          <button
            className="btn btn-outline-danger btn-sm ml-auto"
            disabled={isDeletingTrack}
            onClick={() => this.handleDeleteTrack(fields.remove, index)}
            title="Delete Track"
            type="button"
          >
            {isDeletingTrack ? (
              <FontAwesome name="circle-o-notch" spin className="mr-2" />
            ) : (
              <FontAwesome name="trash" className="mr-2" />
            )}
            {isDeletingTrack ? 'Deleting…' : 'Delete'}
          </button>
        </div>
        <ProgressBar
          percentComplete={audioUploading[trackId]}
          willDisplay={audioUploading[trackId] && audioUploading[trackId] < 100}
        />
      </li>
    );
  }
}

export default RenderTrack;
