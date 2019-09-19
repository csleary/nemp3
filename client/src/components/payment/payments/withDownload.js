import React, { useState } from 'react';
import {
  checkFormatMp3,
  fetchDownloadToken,
  toastInfo
} from '../../../actions';
import { compose } from 'redux';
import { connect } from 'react-redux';

const withDownload = WrappedComponent => props => {
  const { artistName, format, releaseId, releaseTitle } = props;
  const [isPreparingDownload, setPreparingDownload] = useState(false);
  const [formatExists, setFormatExists] = useState(false);

  const handleDownload = () => {
    props.fetchDownloadToken(releaseId, downloadToken => {
      if (downloadToken) {
        setPreparingDownload(true);
        props.toastInfo(
          `Fetching download: ${artistName} - '${releaseTitle}' (${format.toUpperCase()})`
        );

        switch (format) {
        case 'mp3':
          props.checkFormatMp3(downloadToken, () => {
            setFormatExists(true);
            setPreparingDownload(false);
            window.location = `/api/download/${downloadToken}`;
          });
          break;
        default:
          setPreparingDownload(false);
          window.location = `/api/download/${downloadToken}/flac`;
        }
      } else {
        setPreparingDownload(false);
      }
    });
  };

  return (
    <WrappedComponent
      formatExists={formatExists}
      handleDownload={handleDownload}
      isPreparingDownload={isPreparingDownload}
      releaseTitle={releaseTitle}
      {...props}
    />
  );
};

export default compose(
  connect(
    null,
    {
      checkFormatMp3,
      fetchDownloadToken,
      toastInfo
    }
  ),
  withDownload
);