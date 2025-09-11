/* eslint-disable @typescript-eslint/no-explicit-any */
import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose"; // Assumes you have a mongoose connection helper
import Transaction from "@/models/Transaction";

// Create a transaction for a user
export async function createTransaction(userId: string, transactionJson: any) {
    await dbConnect();
    const { business_id, data, timestamp, type } = transactionJson;
    const tx = await Transaction.create({
        userId,
        business_id,
        data,
        timestamp,
        type,
    });
    return deepClone(tx);
}

// Get all transactions for a user
export async function getTransactionsByUser(userId: string) {
    await dbConnect();
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5);
    return deepClone(transactions);
}