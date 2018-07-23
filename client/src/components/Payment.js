import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';
import ManualPayment from './payment/ManualPayment';
import QRCode from './payment/QRCode';
import Spinner from './Spinner';
import TransactionsList from './payment/TransactionsList';
import '../style/payment.css';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showPaymentInfo: false
    };
  }

  componentDidMount() {
    const { releaseId } = this.props.match.params;
    this.props.purchaseRelease(releaseId).then(() => {
      this.setState({ isLoading: false });
      if (!this.props.paymentAddress) return null;
      this.handleFetchIncomingTxs();
    });
  }

  handleFetchIncomingTxs = (isUpdating = false) => {
    const { releaseId } = this.props.match.params;
    const { paymentHash } = this.props;
    this.props.fetchIncomingTxs({ releaseId, paymentHash }, isUpdating);
  };

  handleShowPaymentInfo = () => {
    this.setState({
      showPaymentInfo: !this.state.showPaymentInfo
    });
  };

  roundUp(value, precision) {
    const factor = 10 ** precision;
    return Math.ceil(value * factor) / factor;
  }

  render() {
    const {
      downloadToken,
      isLoadingTxs,
      isUpdating,
      nemNode,
      paidToDate,
      paymentAddress,
      paymentHash,
      release,
      toastMessage,
      transactions
    } = this.props;
    const { artist, artistName, releaseTitle } = release;
    const { showPaymentInfo } = this.state;
    const priceInXem = this.roundUp(this.props.priceInXem, 2).toFixed(2);

    const manualPaymentButton = (
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-outline-primary btn-sm show-payment-info"
          onClick={this.handleShowPaymentInfo}
        >
          Manual Payment Info
        </button>
      </div>
    );

    const paymentInfo = showPaymentInfo ? (
      <ManualPayment
        paymentAddress={paymentAddress}
        paymentHash={paymentHash}
        priceInXem={priceInXem}
        handleShowPaymentInfo={this.handleShowPaymentInfo}
      />
    ) : (
      manualPaymentButton
    );

    if (this.state.isLoading) {
      return (
        <Spinner>
          <h2>Loading Payment Info&hellip;</h2>
        </Spinner>
      );
    }

    if (!paymentAddress) {
      return (
        <main className="container">
          <div className="row">
            <div className="col">
              <h2 className="text-center">Payment</h2>
              <h3 className="text-center red">
                {artistName} &bull;{' '}
                <span className="ibm-type-italic">{releaseTitle}</span>
              </h3>
              <p className="text-center">
                Oh no! <Link to={`/artist/${artist}`}>{artistName}</Link>{' '}
                doesn&rsquo;t have a NEM payment address in their account, so we
                are unable to process payments for them at the moment.
              </p>
              <p className="text-center">
                Hopefully they&rsquo;ll have an address in place soon!
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="container">
        <div className="row">
          <div className="col">
            <h2 className="text-center">Payment</h2>
            <h3 className="text-center red">
              {artistName} &bull;{' '}
              <span className="ibm-type-italic">{releaseTitle}</span>
            </h3>
            {!showPaymentInfo && (
              <p>
                Please scan the QR code below with the NEM Wallet app to make
                your payment. If you&rsquo;re on a mobile device, or otherwise
                cannot scan the QR code, you can also{' '}
                <a
                  onClick={this.handleShowPaymentInfo}
                  role="button"
                  style={{ cursor: 'pointer' }}
                  tabIndex="-1"
                >
                  pay manually
                </a>.
              </p>
            )}
            {!showPaymentInfo && (
              <QRCode
                paymentAddress={paymentAddress.replace(/-/g, '')}
                price={priceInXem}
                idHash={paymentHash}
              />
            )}
            {paymentInfo}
            <TransactionsList
              artistName={release.artistName}
              downloadToken={downloadToken}
              handleFetchIncomingTxs={this.handleFetchIncomingTxs}
              isLoadingTxs={isLoadingTxs}
              isUpdating={isUpdating}
              nemNode={nemNode}
              paidToDate={paidToDate}
              price={priceInXem}
              releaseTitle={release.releaseTitle}
              roundUp={this.roundUp}
              toastMessage={toastMessage}
              transactions={transactions}
            />
          </div>
        </div>
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {
    downloadToken: state.transactions.downloadToken,
    isLoading: state.releases.isLoading,
    isLoadingTxs: state.transactions.isLoading,
    isUpdating: state.transactions.isUpdating,
    nemNode: state.transactions.nemNode,
    paidToDate: state.transactions.paidToDate,
    paymentAddress: state.releases.paymentAddress,
    paymentHash: state.releases.paymentHash,
    priceInXem: state.releases.priceInXem,
    release: state.releases.selectedRelease,
    transactions: state.transactions.incomingTxs
  };
}

export default connect(
  mapStateToProps,
  actions
)(Payment);
