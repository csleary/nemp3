import React, { useState } from 'react';
import { animated, useTransition } from 'react-spring';
import { faChevronRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import ReadOnlyTextArea from 'components/readOnlyTextArea';
import styles from './manualPayment.module.css';

const ManualPayment = props => {
  const { paymentAddress, paymentHash, priceInXem } = props;
  const [step, setStep] = useState(0);

  const transition = useTransition(step, {
    config: { mass: 1, tension: 250, friction: 30, clamp: true },
    from: { opacity: 0, transform: 'scale(0.9) translateX(100%)' },
    enter: { opacity: 1, transform: 'scale(1) translateX(0%)' },
    leave: { opacity: 0, transform: 'scale(0.9) translateX(-100%)' }
  });

  const copyPrice = parseFloat(priceInXem) ? (
    <>
      of <span className="yellow">{priceInXem} XEM</span>
    </>
  ) : (
    '(name your price!)'
  );

  return (
    <>
      {transition((style, item) =>
        item % 3 === 0 ? (
          <animated.div className={styles.step} style={style}>
            <h4 className={styles.heading}>
              <span className={styles.number}>1.</span> Payment ID
            </h4>
            <p>
              Please remember to include the payment ID below in the &lsquo;message&rsquo; field when making your
              payment, as it&rsquo;s your unique, personalised purchase ID, used to confirm your purchase.
            </p>
            <ReadOnlyTextArea text={paymentHash} placeholder="Please log in to see your payment ID" />
            <p className={styles.note} role="alert">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              Your payment ID is essential to your purchase. Please don&rsquo;t forget to include this.
            </p>
          </animated.div>
        ) : item % 3 === 1 ? (
          <animated.div className={styles.step} style={style}>
            <h4 className={styles.heading}>
              <span className={styles.number}>2.</span> Address
            </h4>
            <p>Add the artist&rsquo;s payment address below:</p>
            <ReadOnlyTextArea text={paymentAddress} placeholder="Payment Address" />
          </animated.div>
        ) : item % 3 === 2 ? (
          <animated.div className={styles.step} style={style}>
            <h4 className={styles.heading}>
              <span className={styles.number}>3.</span> Amount
            </h4>
            <p>Fill in the payment amount {copyPrice} and hit send.</p>
            <ReadOnlyTextArea
              text={parseFloat(priceInXem) ? priceInXem : 'Name your price!'}
              placeholder="Payment Amount"
            />
            <p>
              <span role="img" aria-label="Celebration emoji">
                🙌
              </span>{' '}
              Done! Wait for block confirmation, and grab your download.
            </p>
          </animated.div>
        ) : null
      )}
      <Button
        className={styles.button}
        icon={faChevronRight}
        iconClassName={styles.icon}
        iconRight
        textLink
        onClick={() => setStep(prev => prev + 1)}
      >
        Step {(step % 3) + 2 === 4 ? 1 : (step % 3) + 2}/3
      </Button>
    </>
  );
};

ManualPayment.propTypes = {
  paymentAddress: PropTypes.string,
  paymentHash: PropTypes.string,
  priceInXem: PropTypes.string
};

export default ManualPayment;
