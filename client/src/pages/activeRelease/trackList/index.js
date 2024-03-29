import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { playTrack, playerPlay } from 'features/player';
import Button from 'components/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styles from './trackList.module.css';
import { toastInfo } from 'features/toast';

const TrackList = () => {
  const dispatch = useDispatch();
  const release = useSelector(state => state.releases.activeRelease, shallowEqual);
  const { isPlaying, isPaused, trackId: playerTrackId } = useSelector(state => state.player, shallowEqual);
  const { _id: releaseId, artistName, trackList } = release;

  return trackList.map(({ _id: trackId, trackTitle }) => {
    const nowPlaying = () => {
      if (trackId === playerTrackId && isPlaying)
        return <FontAwesomeIcon className={styles.nowPlaying} icon={faPlay} />;
      if (trackId === playerTrackId && isPaused)
        return <FontAwesomeIcon className={styles.nowPlaying} icon={faPause} />;
      return null;
    };

    return (
      <li key={trackId}>
        <Button
          textLink
          className={styles.track}
          onClick={() => {
            if (trackId !== playerTrackId) {
              batch(() => {
                dispatch(playTrack({ releaseId, trackId, artistName, trackTitle }));
                dispatch(toastInfo(`Loading '${trackTitle}'`));
              });
            } else if (!isPlaying) {
              const audioPlayer = document.getElementById('player');
              audioPlayer.play();
              return dispatch(playerPlay());
            }
          }}
        >
          {trackTitle}
        </Button>
        {nowPlaying()}
      </li>
    );
  });
};

export default TrackList;
