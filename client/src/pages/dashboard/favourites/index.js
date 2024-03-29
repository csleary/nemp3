import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import RenderRelease from 'components/renderRelease';
import Spinner from 'components/spinner';
import { fetchUserFavourites } from 'features/releases';
import { grid } from './favourites.module.css';

const Favourites = () => {
  const dispatch = useDispatch();
  const { userFavourites } = useSelector(state => state.releases, shallowEqual);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!userFavourites.length) setLoading(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    dispatch(fetchUserFavourites()).then(() => setLoading(false));
  }, []);

  const renderReleases = userFavourites.map(fav => <RenderRelease key={fav._id} release={fav.release} />);

  if (isLoading) {
    return (
      <Spinner>
        <h2>Loading favourites&hellip;</h2>
      </Spinner>
    );
  }

  if (!userFavourites.length) {
    return (
      <main className="container">
        <div className="row">
          <div className="col">
            <h3 className="text-center mt-4">Favourites empty</h3>
            <p className="text-center">Keep all your favourites release to hand here.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-fluid">
      <div className="row">
        <div className="col py-3">
          <h3 className="text-center">Favourites</h3>
          <div className={grid}>{renderReleases}</div>
        </div>
      </div>
    </main>
  );
};

export default Favourites;
