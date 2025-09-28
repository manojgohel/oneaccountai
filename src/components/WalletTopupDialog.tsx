"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, AlertCircle, CheckCircle, DollarSign } from "lucide-react";

interface WalletTopupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    modelName: string;
    requiredBalance: number;
    currentBalance: number;
    onTopup: () => void;
}

export default function WalletTopupDialog({
    isOpen,
    onClose,
    modelName,
    requiredBalance,
    currentBalance,
    onTopup
}: WalletTopupDialogProps) {
    const shortfall = requiredBalance - currentBalance;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Insufficient Balance
                    </DialogTitle>
                    <DialogDescription>
                        You need to top up your wallet to enable this premium model.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Model Info */}
                    <Card className="border-amber-200 dark:border-amber-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-amber-600" />
                                Model Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Model:</span>
                                    <span className="font-medium">{modelName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Required Balance:</span>
                                    <span className="font-medium text-amber-600">${requiredBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Current Balance:</span>
                                    <span className="font-medium">${currentBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Shortfall:</span>
                                    <span className="font-bold text-red-600">${shortfall.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance Status */}
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800 dark:text-amber-200">
                            You need ${shortfall.toFixed(2)} more to enable this model.
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onTopup}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <Wallet className="h-4 w-4 mr-2" />
                            Top Up Wallet
                        </Button>
                    </div>

                    {/* Info Note */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Free models can be enabled without any balance requirements.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

