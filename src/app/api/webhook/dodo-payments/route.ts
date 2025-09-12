/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/webhook/dodo-payments/route.ts
import { depositBalanceByUserId, getFindByEmail } from "@/actions/auth/user.action";
import { createTransaction } from "@/actions/transaction/transaction.action";
import { Webhooks } from "@dodopayments/nextjs";

export const POST = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || "",
    onPayload: async (payload: any) => {
        console.log("🚀💡💡💡💡💡=====> ~ route.ts:10 ~ payload:", payload);
        const userId: any = await getFindByEmail(payload.data.customer.email);
        if (userId) {
            await depositBalanceByUserId(userId, payload.data.total_amount);
            await createTransaction(userId, payload);
        }
        // handle the payload
    },
});