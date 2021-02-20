import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Button from 'components/button';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import RenderRelease from 'components/renderRelease';
import SortReleases from './sortReleases';
import Spinner from 'components/spinner';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { fetchCatalogue } from 'features/releases';
import styles from './home.module.css';
import { toastInfo } from 'features/toast';

const Home = ({ match }) => {
  const { service } = match.params;

  const { catalogue, catalogueLimit, catalogueSkip, reachedEndOfCat } = useSelector(
    state => state.releases,
    shallowEqual
  );

  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSortPath, setCurrentSortPath] = useState('dateCreated');
  const [currentSortOrder, setCurrentSortOrder] = useState(-1);

  const handleFetchCatalogue = useCallback(
    async ({ sortBy = currentSortPath, sortOrder = currentSortOrder, isPaging = false } = {}) => {
      setIsFetching(true);
      dispatch(fetchCatalogue({ catalogueLimit, catalogueSkip, sortBy, sortOrder, isPaging })).then(() =>
        setIsFetching(false)
      );
    },
    [catalogueLimit, catalogueSkip, dispatch, currentSortOrder, currentSortPath]
  );

  useEffect(() => {
    if (!catalogue.length) setIsLoading(true);
  }, [catalogue.length]);

  useEffect(() => {
    handleFetchCatalogue().then(() => {
      setIsLoading(false);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (service) {
      const serviceName = `${service.charAt(0).toUpperCase()}${service.substring(1)}`;
      dispatch(toastInfo(`You are now logged in using your ${serviceName} account.`));
    }
  }, [dispatch, service]);

  const head = (
    <Helmet>
      <title>nemp3</title>
      <meta name="description" content="Listen to the latest releases on nemp3." />
    </Helmet>
  );

  if (isLoading) {
    return (
      <>
        {head}
        <Spinner>
          <h2>Loading catalogue&hellip;</h2>
        </Spinner>
      </>
    );
  }

  return (
    <main className="container-fluid">
      {head}
      <div className="row">
        <div className="col p-3">
          <SortReleases
            handleFetchCatalogue={handleFetchCatalogue}
            currentSortPath={currentSortPath}
            setCurrentSortPath={setCurrentSortPath}
            currentSortOrder={currentSortOrder}
            setCurrentSortOrder={setCurrentSortOrder}
          />
          <div className={styles.frontPage}>
            {catalogue.map(release => (
              <RenderRelease key={release._id} release={release} />
            ))}
          </div>
          <div className={styles.wrapper}>
            <Button
              className={styles.button}
              disabled={isFetching || reachedEndOfCat}
              icon={reachedEndOfCat ? null : faSync}
              onClick={() =>
                handleFetchCatalogue({ sortBy: currentSortPath, sortOrder: currentSortOrder, isPaging: true })
              }
              size="small"
              spin={isFetching}
            >
              {reachedEndOfCat ? null : 'Load More'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

Home.propTypes = {
  match: PropTypes.object
};

export default Home;
