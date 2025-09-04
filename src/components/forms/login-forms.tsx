"use client";

import { createOrUpdateUser, verifyOTPAndLogin } from "@/actions/auth/user.action";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Logo from "../common/Logo";

type FormStep = 'email' | 'otp';

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [step, setStep] = useState<FormStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await createOrUpdateUser({ email });

            if (result.status) {
                setStep('otp');
                setMessage(result.message);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await verifyOTPAndLogin({ email, otp });

            if (result.status) {
                setMessage('Login successful! Redirecting...');
                // Redirect to dashboard or reload page
                window.location.href = '/secure';
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await createOrUpdateUser({ email });

            if (result.status) {
                setMessage('OTP sent again to your email');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const goBackToEmail = () => {
        setStep('email');
        setOtp('');
        setError('');
        setMessage('');
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex justify-center">
                <Logo />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 'email' ? 'Login to your account' : 'Enter OTP'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'email'
                            ? 'Enter your email address to receive an OTP'
                            : `We've sent a 4-digit OTP to ${email}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                {message && (
                                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                        {message}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading || !email.trim()}
                                    >
                                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                    </Button>
                                    <Button variant="outline" className="w-full" type="button">
                                        Login with Google
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <a href="#" className="underline underline-offset-4">
                                    Sign up with email
                                </a>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="otp">4-Digit OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 4-digit OTP"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 4) {
                                                setOtp(value);
                                            }
                                        }}
                                        maxLength={4}
                                        required
                                        disabled={isLoading}
                                        className="text-center text-lg tracking-widest"
                                        autoFocus
                                    />
                                    <div className="flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-sm underline-offset-4 hover:underline p-0"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                        >
                                            Resend OTP
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-sm underline-offset-4 hover:underline p-0"
                                            onClick={goBackToEmail}
                                            disabled={isLoading}
                                        >
                                            Change email
                                        </Button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                {message && (
                                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                        {message}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading || otp.length !== 4}
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
