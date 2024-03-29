import PropTypes from 'prop-types';
import React from 'react';
import styles from './credits.module.css';

const Credits = ({ credits }) => {
  if (!credits) return null;

  return (
    <>
      <h6 className={styles.label}>{credits && 'Credits'}</h6>
      <p className={styles.credits}>{credits}</p>
    </>
  );
};

Credits.propTypes = {
  credits: PropTypes.string
};

export default Credits;
