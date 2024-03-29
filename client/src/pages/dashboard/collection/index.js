import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import RenderRelease from 'components/renderRelease';
import Spinner from 'components/spinner';
import { fetchCollection } from 'features/releases';
import { frontPage } from './collection.module.css';
import { nanoid } from '@reduxjs/toolkit';

const Collection = () => {
  const dispatch = useDispatch();
  const { collection } = useSelector(state => state.releases, shallowEqual);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!collection.length) setLoading(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    dispatch(fetchCollection()).then(() => setLoading(false));
  }, []);

  const renderReleases = collection.map(({ release }) => (
    <RenderRelease key={release?._id ?? nanoid()} release={release} type="collection" />
  ));

  if (isLoading) {
    return (
      <Spinner>
        <h2>Loading collection&hellip;</h2>
      </Spinner>
    );
  }

  if (!collection.length) {
    return (
      <main className="container">
        <div className="row">
          <div className="col">
            <h3 className="text-center mt-4">No releases found</h3>
            <p className="text-center">
              Once you&rsquo;ve purchased a release it will be added to your collection, where you&rsquo;ll have easy
              access to downloads.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-fluid">
      <div className="row">
        <div className="col py-3">
          <h3 className="text-center">
            Your Collection ({collection.length} release
            {collection.length > 1 ? 's' : ''})
          </h3>
          <div className={frontPage}>{renderReleases}</div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
