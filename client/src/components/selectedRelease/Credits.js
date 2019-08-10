import React from 'react';
import styles from '../../style/SelectedRelease.module.css';

const Credits = ({ credits }) => {
  if (!credits) return null;

  return (
    <>
      <h6 className="red mt-4">{credits && 'Credits'}</h6>
      <p className={styles.credits}>{credits}</p>
    </>
  );
};

export default Credits;