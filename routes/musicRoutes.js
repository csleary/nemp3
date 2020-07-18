const aws = require('aws-sdk');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { AWS_REGION } = require('../config/constants');
const Artist = mongoose.model('artists');
const Release = mongoose.model('releases');
const Sale = mongoose.model('sales');
const User = mongoose.model('users');
aws.config.update({ region: AWS_REGION });

module.exports = app => {
  // Fetch user collection
  app.get('/api/collection/', requireLogin, async (req, res) => {
    const { purchases } = req.user;
    const releaseIds = purchases.map(release => release._id);

    const releases = await Release.find({ _id: { $in: releaseIds } }, '-__v', {
      lean: true,
      sort: '-purchaseDate'
    }).exec();

    res.send(releases);
  });

  // Fetch user favourites
  app.get('/api/favourites/', requireLogin, async (req, res) => {
    const { favourites } = req.user;
    const releaseIds = favourites.map(release => release._id);

    const releases = await Release.find({ _id: { $in: releaseIds } }, '-__v', {
      lean: true,
      sort: '-releaseDate'
    }).exec();

    res.send(releases);
  });

  // Fetch user wish list
  app.get('/api/wish-list/', requireLogin, async (req, res) => {
    const { wishList } = req.user;
    const releaseIds = wishList.map(release => release._id);

    const releases = await Release.find({ _id: { $in: releaseIds } }, '-__v', {
      lean: true,
      sort: '-releaseDate'
    }).exec();

    res.send(releases);
  });

  // Fetch artist catalogue
  app.get('/api/catalogue/:artist', async (req, res) => {
    const { artist } = req.params;

    const catalogue = await Artist.findById(artist)
      .populate({
        path: 'releases',
        match: { published: true },
        model: Release,
        options: { lean: true, sort: '-releaseDate' }
      })
      .exec();

    res.send(catalogue);
  });

  // Fetch site catalogue
  app.get('/api/catalogue/', async (req, res) => {
    const { catalogueLimit, catalogueSkip, sortPath, sortOrder } = req.query;

    const releases = await Release.find({ published: true }, '-__v', {
      skip: parseInt(catalogueSkip),
      limit: parseInt(catalogueLimit)
    }).sort({ [sortPath]: sortOrder });

    res.send(releases);
  });

  // Fetch site catalogue count
  app.get('/api/catalogue/count', async (req, res) => {
    const count = await Release.count();
    res.send({ count });
  });

  // Fetch release sales figures
  app.get('/api/sales', requireLogin, async (req, res) => {
    const releases = await Release.find({ user: req.user._id });
    const releaseIds = releases.map(release => release._id);
    const sales = await Sale.find({ releaseId: { $in: releaseIds } }, '-__v', {
      lean: true
    }).exec();
    res.send(sales);
  });

  // Fetch single user release
  app.get('/api/user/release/:releaseId', requireLogin, async (req, res) => {
    const release = await Release.findById(req.params.releaseId, '-__v', { lean: true }).exec();
    res.send(release);
  });

  // Fetch user releases
  app.get('/api/user/releases/', requireLogin, async (req, res) => {
    const releases = await Release.find({ user: req.user._id }, '-__v', {
      lean: true,
      sort: '-releaseDate'
    }).exec();
    res.send(releases);
  });

  // Search releases
  app.get('/api/search', async (req, res) => {
    const { searchQuery } = req.query;
    const results = await Release.find({ published: true, $text: { $search: searchQuery } }, '-__v', {
      lean: true,
      limit: 50
    }).exec();

    res.send(results);
  });

  // Add release to user favourites
  app.post('/api/user/favourite/:releaseId', requireLogin, async (req, res) => {
    const { releaseId } = req.params;
    const userId = req.user._id;
    const favExists = await User.exists({ _id: userId, favourites: { $in: releaseId } });
    const operator = favExists ? '$pull' : '$push';

    const user = await User.findByIdAndUpdate(
      userId,
      { [operator]: { favourites: releaseId } },
      { new: true, select: { favourites: 1 } }
    ).exec();

    res.send(user.toJSON().favourites);
  });

  // Add release to user wish list
  app.post('/api/user/wish-list/:releaseId', requireLogin, async (req, res) => {
    const { releaseId } = req.params;
    const userId = req.user._id;
    const releaseExists = await User.exists({ _id: userId, wishList: { $in: releaseId } });
    const operator = releaseExists ? '$pull' : '$push';

    const user = await User.findByIdAndUpdate(
      userId,
      { [operator]: { wishList: releaseId } },
      { new: true, select: { wishList: 1 } }
    ).exec();

    res.send(user.toJSON().wishList);
  });
};
