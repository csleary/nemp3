const fetchIncomingTransactions = require('./fetchIncomingTransactions');
const fetchOwnedMosaics = require('./fetchOwnedMosaics');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { getXemPrice, recordSale, checkSignedMessage } = require('./utils');

const Release = mongoose.model('releases');
const User = mongoose.model('users');

module.exports = app => {
  app.post('/api/nem/transactions', requireLogin, async (req, res) => {
    try {
      const { releaseId, paymentHash } = req.body;
      const { price } = req.session;
      const user = await User.findById(req.user._id);
      const release = await Release.findById(releaseId);
      const artist = await User.findById(release.user);
      const paymentAddress = artist.nemAddress;

      const hasPurchased = user.purchases.some(purchase =>
        purchase.releaseId.equals(releaseId)
      );

      const transactions = await fetchIncomingTransactions(
        paymentAddress,
        paymentHash
      );

      transactions.hasPurchased = hasPurchased;

      if (transactions.paidToDate >= price && !hasPurchased) {
        recordSale(releaseId);
        transactions.hasPurchased = true;
        user.purchases.push({ purchaseDate: Date.now(), releaseId });
        user.save();
      }

      res.send(transactions);
    } catch (error) {
      if (error.data) {
        res.status(500).send({
          error: error.data.message
        });
        return;
      }
      res.status(500).send({ error: error.message });
    }
  });

  app.get('/api/nem/price', async (req, res) => {
    try {
      const xemPriceUsd = await getXemPrice();
      res.send({ xemPriceUsd });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  app.post('/api/nem/address', requireLogin, async (req, res) => {
    try {
      const signedMessage =
        req.body.signedMessage && JSON.parse(req.body.signedMessage);
      const nemAddress = req.body.nemAddress.toUpperCase().replace(/-/g, '');
      const user = await User.findById(req.user.id);
      const existingNemAddress = user.nemAddress;
      const addressChanged = nemAddress !== existingNemAddress;

      if (addressChanged) {
        user.nemAddress = nemAddress;
        user.nemAddressVerified = false;
        user.credit = 0;
      }

      if (nemAddress && signedMessage) {
        user.nemAddressVerified = checkSignedMessage(nemAddress, signedMessage);
      }

      if (nemAddress && user.nemAddressVerified) {
        const credit = await fetchOwnedMosaics(nemAddress);
        user.credit = credit;
      }

      user.save();
      res.send(user);
    } catch (error) {
      res
        .status(500)
        .send({ error: `We could not verify your address: ${error.message}` });
    }
  });
};
