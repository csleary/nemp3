const aws = require('aws-sdk');
const Release = require(__basedir + '/models/Release');
const { AWS_REGION, BUCKET_IMG } = require('../config/constants');
aws.config.update({ region: AWS_REGION });

const deleteArtwork = async (releaseId, release) => {
  release.updateOne({ $set: { 'artwork.status': 'deleting', 'artwork.dateUpdated': Date.now() } }).exec();
  const listImgParams = { Bucket: BUCKET_IMG, Prefix: `${releaseId}` };
  const s3 = new aws.S3();
  const s3ImgData = await s3.listObjectsV2(listImgParams).promise();

  if (s3ImgData.Contents.length) {
    const deleteImgParams = {
      Bucket: BUCKET_IMG,
      Key: s3ImgData.Contents[0].Key
    };

    await s3.deleteObject(deleteImgParams).promise();

    const updatedRelease = await Release.findByIdAndUpdate(
      releaseId,
      { $set: { 'artwork.status': 'deleted', 'artwork.dateUpdated': Date.now(), published: false } },
      { new: true }
    ).exec();

    return updatedRelease.toJSON();
  } else {
    release
      .updateOne({ $set: { 'artwork.status': 'error', 'artwork.dateUpdated': Date.now(), published: false } })
      .exec();
    throw new Error('Artwork file not found. Please upload a new file.');
  }
};

module.exports = {
  deleteArtwork
};
