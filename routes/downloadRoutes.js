const archiver = require('archiver');
const aws = require('aws-sdk');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');
const { AWS_REGION, BUCKET_IMG, BUCKET_SRC } = require('./constants');

const Release = mongoose.model('releases');
const User = mongoose.model('users');
aws.config.update({ region: AWS_REGION });
const { nemp3Secret } = keys;

module.exports = app => {
  // Fetch Download Token
  app.post('/api/download', requireLogin, async (req, res) => {
    const { releaseId } = req.body;
    const user = await User.findById(req.user._id);

    const hasPreviouslyPurchased = user.purchases.some(purchase =>
      purchase.releaseId.equals(releaseId)
    );

    if (hasPreviouslyPurchased) {
      const token = jwt.sign(
        {
          releaseId,
          expiresIn: '1m'
        },
        nemp3Secret
      );
      res.append('Authorization', `Bearer ${token}`);
      res.send();
    } else {
      res.status(401).send({ error: 'Not authorised.' });
    }
  });

  // Download Release
  app.get('/api/download/:token', async (req, res) => {
    const archive = archiver('zip');
    const s3 = new aws.S3();
    const token = req.params.token.substring(7);
    const decoded = jwt.verify(token, nemp3Secret);
    const { releaseId } = decoded;
    const prefix =
      process.env.NEM_NETWORK === 'mainnet' ? `${releaseId}` : 'test/test';
    const release = await Release.findById(releaseId);
    const { artistName, releaseTitle, trackList } = release;

    const s3List = await s3
      .listObjectsV2({ Bucket: BUCKET_SRC, Prefix: prefix })
      .promise();

    archive.on('end', () => {});
    archive.on('warning', () => {});
    archive.on('error', () => {});

    res.attachment(`${artistName} - ${releaseTitle}.zip`);
    archive.pipe(res);

    s3List.Contents.forEach((s3Track, index) => {
      const { Key } = s3Track;

      const trackNumber =
        process.env.NEM_NETWORK === 'mainnet'
          ? trackList.findIndex(track => Key.includes(track._id)) + 1
          : index + 1;

      const title =
        process.env.NEM_NETWORK === 'mainnet'
          ? trackList.filter(track => Key.includes(track._id))[0].trackTitle
          : 'Test Track';

      const ext = Key.substring(Key.lastIndexOf('.'));

      const trackSrc = s3
        .getObject({ Bucket: BUCKET_SRC, Key })
        .createReadStream();

      archive.append(trackSrc, {
        name: `${trackNumber.toString(10).padStart(2, '0')} ${title}${ext}`
      });
    });

    const s3Art = await s3
      .listObjectsV2({ Bucket: BUCKET_IMG, Prefix: releaseId })
      .promise();

    const Key = s3Art.Contents[0].Key;
    const artSrc = s3.getObject({ Bucket: BUCKET_IMG, Key }).createReadStream();

    archive.append(artSrc, {
      name: `${artistName} - ${releaseTitle}.jpg`
    });

    archive.finalize();
  });
};
