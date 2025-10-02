
"use client";

import { getLatestTransactionsByUser } from "@/actions/transaction/transaction.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGlobalContext } from "@/providers/context-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Wallet, CreditCard, History, Plus, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

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
                "product_id": "pdt_q3HgpB3QzMJjfN8fF7GqK",
                "quantity": 1,
                "paymentCurrency": "USD",
            }
        ],
        "paymentCurrency": "USD",
        "customer": {
            "email": state.user?.email,
            "name": state.user?.name ?? "Customer",
            "paymentCurrency": "USD",
        },
        "feature_flags": {
            "allow_phone_number_collection": false
        },
        "customization": {
            "theme": theme ?? "light",
        },
        "return_url": "https://oneaccountai.com/secure/checkout/order-complete",
    };
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
            await deposit.mutateAsync();
            setSuccess("Deposit initiated!");
        } catch {
            setSuccess("Deposit failed.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-secondary">
            {/* Balance Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-3 text-green-900 dark:text-green-100">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        Account Balance
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                        Your current available credits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ${`${state?.user?.balance?.toFixed(2) ?? "0.00"}`}
                                </div>
                                <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                                    Available Credits
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {parseFloat(state?.user?.balance ?? "0") > 0 ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 shadow-sm border-green-200 dark:border-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 shadow-sm border-yellow-200 dark:border-yellow-800">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Low Balance
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            onClick={handleDeposit}
                            disabled={deposit.isPending}
                        >
                            {deposit.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add Credits
                                </>
                            )}
                        </Button>

                        {success && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">{success}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction History Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-3 text-blue-900 dark:text-blue-100">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        Recent Transactions
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                        Your latest payment and usage history
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {txLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="w-full h-16 rounded-xl" />
                            <Skeleton className="w-full h-16 rounded-xl" />
                            <Skeleton className="w-full h-16 rounded-xl" />
                        </div>
                    ) : txError ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                <p className="text-red-600 text-sm">Failed to load transactions</p>
                            </div>
                        </div>
                    ) : txData?.length ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {txData.map((tx: any) => {
                                // Extract data from the nested structure
                                const transactionData = tx.data || {};
                                const isPayment = tx.type === 'payment.succeeded';
                                const amount = transactionData.total_amount ? (transactionData.total_amount / 100) : 0; // Convert from paise to rupees
                                const paymentMethod = transactionData.payment_method || 'Unknown';
                                const status = transactionData.status || 'Unknown';

                                return (
                                    <div key={tx._id} className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl shadow-sm ${isPayment ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                                                {isPayment ? (
                                                    <CreditCard className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                                                    {isPayment ? 'Payment' : tx.type?.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                                    {paymentMethod.toUpperCase()} • {status}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${isPayment ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                                                {isPayment ? "+" : ""}
                                                ₹{amount.toFixed(2)}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs shadow-sm ${isPayment ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}`}
                                            >
                                                {isPayment ? 'Credit' : 'Transaction'}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <History className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions found</p>
                                <p className="text-xs text-slate-400 mt-1">Your transaction history will appear here</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}