import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String }, // Keep mobile as optional field
    balance: { type: Number, default: 0 },
    lastDepositAt: { type: Date },
    lastLoginAt: { type: Date },
    lastDepositAmount: { type: Number, default: 0 },
    otp: { type: Number },
    otpExpireTime: { type: Date },
    status: { type: Boolean, default: false },
    selectedModels: { type: [String], default: [] }, // Array of enabled AI model IDs
  },
  { timestamps: true }
);

const User = mongoose?.models?.User || mongoose?.model("User", UserSchema);

export default User;
