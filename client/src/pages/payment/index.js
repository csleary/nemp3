import Button from 'components/button';
import { Link } from 'react-router-dom';
import PaymentMethods from './paymentMethods';
import Payments from './payments';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'components/spinner';
import styles from './payment.module.css';
import { toastError } from 'features/toast';
import { useApi } from 'hooks/useApi';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const Payment = props => {
  const { releaseId } = props.match.params;
  const { data, error, isLoading } = useApi(`/api/purchase/${releaseId}`);
  const dispatch = useDispatch();
  const history = useHistory();
  if (error) dispatch(toastError(error));

  if (isLoading) {
    return (
      <Spinner>
        <h2>Loading Payment Info&hellip;</h2>
      </Spinner>
    );
  }

  const {
    release: { artist, artistName, releaseTitle },
    paymentInfo: { paymentAddress, paymentHash },
    price
  } = data;

  if (!paymentAddress) {
    return (
      <>
        <h2 className={styles.heading}>Payment</h2>
        <p>
          Unfortunately, <Link to={`/artist/${artist}`}>{artistName}</Link> doesn&rsquo;t have a NEM payment address in
          their account, so we are unable to process payments for them at the moment.
        </p>
        <p>Hopefully they&rsquo;ll have an address in place soon.</p>
      </>
    );
  }

  return (
    <>
      <Button
        className={styles.back}
        icon={'chevron-left'}
        onClick={() => history.push(`/release/${releaseId}`)}
        size="small"
        textLink
      >
        Back
      </Button>
      <h2 className={styles.heading}>Payment</h2>
      <PaymentMethods paymentAddress={paymentAddress} paymentHash={paymentHash} priceInXem={price} />
      <Payments
        artistName={artistName}
        paymentHash={paymentHash}
        price={price}
        releaseId={releaseId}
        releaseTitle={releaseTitle}
      />
    </>
  );
};

Payment.propTypes = {
  match: PropTypes.object,
  releaseId: PropTypes.string
};

export default Payment;
