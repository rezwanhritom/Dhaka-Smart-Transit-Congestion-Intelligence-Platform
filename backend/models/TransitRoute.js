import mongoose from 'mongoose';

const transitRouteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    stops: [{ type: String, trim: true }],
    scheduleNote: { type: String, trim: true, default: '' },
    headwayMinutes: { type: Number, min: 1, default: 12 },
    serviceWindowStart: { type: String, trim: true, default: '06:00' },
    serviceWindowEnd: { type: String, trim: true, default: '23:00' },
  },
  { timestamps: true },
);

transitRouteSchema.index({ name: 1 }, { unique: true });

const TransitRoute = mongoose.model('TransitRoute', transitRouteSchema);
export default TransitRoute;
