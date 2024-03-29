import mongoose from 'mongoose';
const { Schema } = mongoose;

const trackSchema = new Schema(
  {
    trackTitle: { type: String, trim: true },
    status: { type: String, default: 'pending' },
    duration: { type: Number, trim: true },
    mpd: { type: Buffer },
    segmentDuration: { type: Number },
    segmentTimescale: { type: Number },
    segmentList: { type: Array },
    initRange: { type: String }
  },
  { timestamps: true }
);

const releaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    artist: { type: Schema.Types.ObjectId, ref: 'Artist' },
    artistName: { type: String, trim: true },
    releaseTitle: { type: String, trim: true },
    artwork: {
      dateCreated: { type: Date },
      dateUpdated: { type: Date },
      status: { type: String, default: 'pending' }
    },
    releaseDate: { type: Date },
    price: { type: Number },
    recordLabel: { type: String, trim: true },
    catNumber: { type: String, trim: true },
    credits: { type: String, trim: true },
    info: { type: String, trim: true },
    pubYear: { type: Number, trim: true },
    pubName: { type: String, trim: true },
    recYear: { type: Number, trim: true },
    recName: { type: String, trim: true },
    trackList: [trackSchema],
    tags: [String],
    published: { type: Boolean, default: false }
  },
  { timestamps: true, usePushEach: true }
);

releaseSchema.index({
  artistName: 'text',
  releaseTitle: 'text',
  'trackList.trackTitle': 'text',
  tags: 'text'
});

releaseSchema.post('save', release => {
  release.updateOne({ dateUpdated: Date.now() }).exec();
});

releaseSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.artwork.dateCreated;
    delete ret.artwork.dateUpdated;

    ret.trackList.forEach(track => {
      delete track.createdAt;
      delete track.initRange;
      delete track.mpd;
      delete track.segmentDuration;
      delete track.segmentList;
      delete track.segmentTimescale;
      delete track.updatedAt;
    });

    return ret;
  }
});

const Release = mongoose.model('Release', releaseSchema, 'releases');
export default Release;
