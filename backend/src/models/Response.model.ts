// backend/src/models/Response.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOptionId: mongoose.Types.ObjectId;
  answeredAt: Date;
}

export interface IResponse extends Document {
  pollId: mongoose.Types.ObjectId;
  respondentId?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  answers: IAnswer[];
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selectedOptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Option',
    required: true,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const ResponseSchema = new Schema<IResponse>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    respondentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    answers: [AnswerSchema],
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: String,
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
ResponseSchema.index({ pollId: 1, submittedAt: -1 });
ResponseSchema.index({ pollId: 1, respondentId: 1 });
ResponseSchema.index({ 'answers.selectedOptionId': 1 });

// Ensure one response per user per poll (for authenticated mode)
ResponseSchema.index({ pollId: 1, respondentId: 1 }, { 
  unique: true, 
  partialFilterExpression: { respondentId: { $exists: true } } 
});

export const Response = mongoose.model<IResponse>('Response', ResponseSchema);