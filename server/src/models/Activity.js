import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS } from '../utils/constants.js';

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    issueKey: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ isDemo: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
