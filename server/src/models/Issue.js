import mongoose from 'mongoose';
import { STATUS_LIST, PRIORITY_LIST, TYPE_LIST, STATUSES, PRIORITIES, TYPES } from '../utils/constants.js';

const issueSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: TYPE_LIST,
        message: '{VALUE} is not a valid issue type',
      },
      default: TYPES.TASK,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_LIST,
        message: '{VALUE} is not a valid status',
      },
      default: STATUSES.BACKLOG,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_LIST,
        message: '{VALUE} is not a valid priority',
      },
      default: PRIORITIES.MEDIUM,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockingReason: {
      type: String,
      trim: true,
      default: '',
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

issueSchema.index({ title: 'text', description: 'text', key: 'text' });
issueSchema.index({ userId: 1, key: 1 });
issueSchema.index({ isDemo: 1, createdAt: -1 });

export const Issue = mongoose.model('Issue', issueSchema);
