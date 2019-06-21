const aws = require('aws-sdk');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { nemp3Secret } = require('../config/keys');
const { AWS_REGION, BUCKET_MP3 } = require('./constants');
const { downloadArchive, generateMp3 } = require('./encoders');
const requireLogin = require('../middlewares/requireLogin');
const { generateToken } = require('./utils');

aws.config.update({ region: AWS_REGION });
const Release = mongoose.model('releases');
const User = mongoose.model('users');

module.exports = app => {
  // Fetch Download Token
  app.post('/api/download', requireLogin, async (req, res) => {
    const { releaseId } = req.body;
    const user = await User.findById(req.user._id);

    const hasPurchased = user.purchases.some(purchase =>
      purchase.releaseId.equals(releaseId)
    );

    if (hasPurchased) {
      const token = generateToken({ releaseId });
      res.append('Authorization', `Bearer ${token}`);
      res.send();
    } else {
      res.status(401).send({ error: 'Not authorised.' });
    }
  });

  // Check if mp3s are cached or need building
  app.get('/api/download/:token/check', async (req, res) => {
    const s3 = new aws.S3();
    const token = req.params.token.substring(7);
    const decoded = jwt.verify(token, nemp3Secret);
    const { releaseId } = decoded;
    const release = await Release.findById(releaseId);
    const { trackList } = release;

    const s3AudioMp3Query = await s3
      .listObjectsV2({ Bucket: BUCKET_MP3, Prefix: releaseId })
      .promise();

    const audioMp3Available = s3AudioMp3Query.KeyCount === trackList.length;

    if (audioMp3Available) {
      res.end();
    } else {
      generateMp3(res, release).then(() => {
        res.end();
      });
    }
  });

  // Download Release
  app.get('/api/download/:token/:format?', async (req, res) => {
    const format = req.params.format;
    const token = req.params.token.substring(7);
    const decoded = jwt.verify(token, nemp3Secret);
    const { releaseId } = decoded;
    const release = await Release.findById(releaseId);

    switch (format) {
      case 'flac':
        downloadArchive(res, release, 'flac');
        break;
      default:
        downloadArchive(res, release);
    }
  });
};
