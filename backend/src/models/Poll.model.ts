// backend/src/models/Poll.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
  title: string;
  description?: string;
  creatorId: mongoose.Types.ObjectId;
  shareableLink: string;
  expiryDate: Date;
  isActive: boolean;
  isPublished: boolean;
  responseMode: 'anonymous' | 'authenticated';
  totalResponses: number;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shareableLink: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    responseMode: {
      type: String,
      enum: ['anonymous', 'authenticated'],
      default: 'anonymous',
    },
    totalResponses: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
PollSchema.index({ creatorId: 1, createdAt: -1 });
PollSchema.index({ shareableLink: 1, isActive: 1 });
PollSchema.index({ expiryDate: 1, isActive: 1 });

// Pre-save middleware to generate shareable link
PollSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = `poll_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }
  next();
});

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);