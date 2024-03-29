import { shallowEqual, useSelector } from 'react-redux';
import React from 'react';
import Underpaid from './underPaid';
import styles from './status.module.css';

const Status = () => {
  const { priceInRawXem, transactions } = useSelector(state => state.payment, shallowEqual);
  const hasUnconfirmed = transactions.some(({ meta }) => meta.height === 9007199254740991);

  const amountPaid = transactions
    .map(({ transaction: { amount, otherTrans, type } }) => (type === 257 ? amount : otherTrans.amount))
    .reduce((total, current) => total + current, 0);

  if (transactions.length) {
    return (
      <div className={styles.root}>
        <div className={styles.info}>
          <div>Total paid{hasUnconfirmed ? ' (inc. unconfirmed)' : null}:</div>
          <div className={styles.paid}>{(amountPaid / 10 ** 6).toFixed(6)} XEM</div>
        </div>
        <Underpaid amountPaid={amountPaid} priceInRawXem={priceInRawXem} />
      </div>
    );
  }

  return null;
};

export default Status;
