// backend/src/models/Question.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  pollId: mongoose.Types.ObjectId;
  text: string;
  type: 'single-select';
  isMandatory: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['single-select'],
      default: 'single-select',
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
QuestionSchema.index({ pollId: 1, order: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);