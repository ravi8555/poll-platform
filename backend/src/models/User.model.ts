// backend/src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  oidcId?: string; // For OIDC authentication
  email: string;
  name: string;
  password?: string; // Only for fallback local auth
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    oidcId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include by default in queries
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for efficient lookups
UserSchema.index({ oidcId: 1, email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);