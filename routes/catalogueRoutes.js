import { AWS_REGION } from '../config/constants.js';
import aws from 'aws-sdk';
import express from 'express';
import mongoose from 'mongoose';
import Artist from '../models/Artist.js';
import Release from '../models/Release.js';
aws.config.update({ region: AWS_REGION });
const router = express.Router();

router.get('/search', async (req, res) => {
  const { searchQuery } = req.query;

  const results = await Release.find(
    { published: true, $text: { $search: searchQuery } },
    'artistName artwork releaseTitle trackList._id trackList.trackTitle',
    { lean: true, limit: 50 }
  ).exec();

  res.send(results);
});

router.get('/count', async (req, res) => {
  const count = await Release.count();
  res.send({ count });
});

router.get('/:artistIdOrSlug', async (req, res) => {
  const { artistIdOrSlug } = req.params;
  const { isValidObjectId, Types } = mongoose;
  const { ObjectId } = Types;

  const [catalogue] = await Artist.aggregate([
    { $match: isValidObjectId(artistIdOrSlug) ? { _id: ObjectId(artistIdOrSlug) } : { slug: artistIdOrSlug } },
    {
      $lookup: {
        from: 'releases',
        let: { artistId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$artist', '$$artistId'] }, { $eq: ['$published', true] }] }
            }
          },
          { $sort: { releaseDate: -1 } }
        ],
        as: 'releases'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        biography: 1,
        links: 1,
        releases: 1
      }
    }
  ]).exec();

  res.send(catalogue);
});

router.get('/', async (req, res) => {
  try {
    const { catalogueLimit, catalogueSkip, sortBy, sortOrder } = req.query;

    const releases = await Release.find(
      { published: true },
      `
      -artwork.dateCreated
      -artwork.dateUpdated 
      -createdAt
      -updatedAt
      -trackList.initRange
      -trackList.mpd
      -trackList.segmentDuration
      -trackList.segmentTimescale
      -trackList.segmentList
      -trackList.createdAt
      -trackList.updatedAt
      `,
      {
        limit: parseInt(catalogueLimit),
        skip: parseInt(catalogueSkip),
        sort: { [sortBy]: parseInt(sortOrder) }
      }
    );

    res.send(releases);
  } catch (error) {
    res.status(500).send({ error: 'Music catalogue could not be fetched.' });
  }
});

export default router;
