import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String }, // Keep mobile as optional field
    standard: { type: String }, // Class/Grade
    board: { type: String }, // Education Board
    answerLanguage: { type: String, default: 'English' }, // Preferred answer language
    otp: { type: Number },
    otpExpireTime: { type: Date },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose?.models?.User || mongoose?.model("User", UserSchema);

export default User;
