// backend/src/models/Option.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IOption extends Document{
  questionId : mongoose.Types.ObjectId,
  text: String,
  order:number,
  responseCount : number,
  createdAt:Date,
  updatedAt:Date,
}

const OptionSchema = new Schema<IOption>({
  questionId:{
    type : Schema.Types.ObjectId,
    ref : 'Question',
    required:true,
    index:true
  },
  text:{
    type:String,
    required:true,
    maxLength :500,
  },
  order:{
    type:Number,
    required:true,
    min :0
  },
  responseCount:{
    type:Number,
    default :0,
    min :0
  }
  



},{
    timestamps:true
  }
)
OptionSchema.index({questionId:1,order:1})

export const Option = mongoose.model<IOption>('Option', OptionSchema) 















































// import mongoose, { Schema, Document } from 'mongoose';

// export interface IOption extends Document {
//   questionId: mongoose.Types.ObjectId;
//   text: string;
//   order: number;
//   responseCount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const OptionSchema = new Schema<IOption>(
//   {
//     questionId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Question',
//       required: true,
//       index: true,
//     },
//     text: {
//       type: String,
//       required: true,
//       maxlength: 500,
//     },
//     order: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     responseCount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Compound index
// OptionSchema.index({ questionId: 1, order: 1 });

// export const Option = mongoose.model<IOption>('Option', OptionSchema);