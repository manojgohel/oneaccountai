/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
    userId: string;
    business_id: string;
    data: any; // Store the full JSON as-is
    timestamp: string;
    type: string;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true, index: true },
        business_id: { type: String, required: true },
        data: { type: Schema.Types.Mixed, required: true },
        timestamp: { type: String, required: true },
        type: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Transaction ||
    mongoose.model<ITransaction>("Transaction", TransactionSchema);