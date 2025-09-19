/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getLatestTransactionsByUser } from "@/actions/transaction/transaction.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalContext } from "@/providers/context-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useState } from "react";

// Fetch transaction history
function useTransactionHistory() {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: getLatestTransactionsByUser,
        refetchOnWindowFocus: false,
    });
}

// Deposit mutation
function useDeposit() {
    const { state } = useGlobalContext();
    const { theme } = useTheme();
    const bodyPayload = {
        "product_cart": [
            {
                "product_id": "pdt_JaSHimijvPTWxcZ3oxD2e",
                "quantity": 1,
                "paymentCurrency": "USD",
            }
        ],
        "paymentCurrency": "USD",
        "customer": {
            "email": state.user?.email,
            "name": state.user?.name || "Customer",
            "paymentCurrency": "USD",
        },
        "feature_flags": {
            "allow_phone_number_collection": false
        },
        "customization": {
            "theme": theme || "light",
        },
        "return_url": "https://oneaccountai.com/secure/checkout/order-complete",
    };
    console.log("🚀💡💡💡💡💡=====> ~ WalletComponent.tsx:54 ~ useDeposit ~ bodyPayload:", bodyPayload);
    return useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/checkout", {
                method: "POST", body: JSON.stringify(bodyPayload)
            });
            console.log("🚀💡💡💡💡💡=====> ~ WalletComponent.tsx:40 ~ useDeposit ~ res:", res);
            if (!res.ok) throw new Error("Deposit failed");
            const response = await res.json();
            if (response.checkout_url) window.open(response.checkout_url, "_blank");
            return response;
        },
    });
}

export default function WalletComponent() {
    const { state }: any = useGlobalContext();
    const { data: txData, isLoading: txLoading, isError: txError } = useTransactionHistory();
    const deposit = useDeposit();
    const [success, setSuccess] = useState<string | null>(null);

    const handleDeposit = async () => {
        setSuccess(null);
        try {
            const response = await deposit.mutateAsync();
            console.log("🚀💡💡💡💡💡=====> ~ WalletComponent.tsx:80 ~ handleDeposit ~ response:", response);
            setSuccess("Deposit initiated!");
        } catch {
            setSuccess("Deposit failed.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Balance Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Remaining Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold">
                            ${`${state?.user?.balance?.toFixed(2) ?? "0.00"}`}
                        </span>
                        <Button className="cursor-pointer" onClick={handleDeposit} disabled={deposit.isPending}>
                            {deposit.isPending ? "Processing..." : "Deposit"}
                        </Button>
                    </div>
                    {success && (
                        <div className="text-xs text-green-600">{success}</div>
                    )}
                </CardContent>
            </Card>
            {/* Transaction History Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {txLoading ? (
                        <Skeleton className="w-full h-16 rounded-md" />
                    ) : txError ? (
                        <div className="text-red-600 text-sm">Failed to load transactions.</div>
                    ) : txData?.transactions?.length ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                            {txData.transactions.map((tx: any) => (
                                <div key={tx.id} className="flex justify-between items-center border-b pb-1 last:border-b-0 last:pb-0">
                                    <span className="text-sm">{tx.type}</span>
                                    <span className={`font-semibold ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                                        {tx.amount > 0 ? "+" : ""}
                                        ${Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-sm">No transactions found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}