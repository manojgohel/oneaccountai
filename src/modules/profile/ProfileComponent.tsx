"use client";

import { getCurrentUser, updateProfile } from "@/actions/auth/user.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Calendar, Shield, CheckCircle, Edit3, Save, X } from "lucide-react";

export default function ProfileComponent() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [originalName, setOriginalName] = useState("");

    // Fetch user on mount
    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            const res = await getCurrentUser();
            if (res.status && res.user) {
                setUser(res.user);
                setName(res.user.name || "");
                setOriginalName(res.user.name || "");
            } else {
                setError(res.message || "Failed to load user");
            }
            setLoading(false);
        }
        fetchUser();
    }, []);

    // Handle form submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!name.trim()) {
            setError("Name is required");
            setSubmitting(false);
            return;
        }

        const res = await updateProfile({ name: name.trim() });
        if (res.status) {
            setUser((prev) => prev ? { ...prev, name: name.trim() } : prev);
            setOriginalName(name.trim());
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } else {
            setError(res.message || "Failed to update profile");
        }
        setSubmitting(false);
    }

    // Handle edit toggle
    const handleEditToggle = () => {
        if (isEditing) {
            setName(originalName);
            setError(null);
        }
        setIsEditing(!isEditing);
    };

    // Handle cancel edit
    const handleCancel = () => {
        setName(originalName);
        setError(null);
        setIsEditing(false);
    };
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information Card */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your personal details and account information
                                        </CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEditToggle}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <Skeleton className="h-10 w-32 rounded-lg" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-500" />
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={user?.email ?? ""}
                                                    readOnly
                                                    className="bg-slate-50 dark:bg-slate-700 cursor-not-allowed border-slate-200 dark:border-slate-600"
                                                    tabIndex={-1}
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500">Email cannot be changed</p>
                                        </div>

                                        <Separator />

                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-500" />
                                                Full Name
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your full name"
                                                    autoComplete="off"
                                                    required
                                                    disabled={submitting}
                                                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                                                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                                                        {user?.name ?? "Not set"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {isEditing && (
                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4" />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                    disabled={submitting}
                                                    className="flex items-center gap-2"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Account Stats Card */}
                    <div className="space-y-6">
                        {/* Account Status */}
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Account Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                        Verified
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Account Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Member since</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Last updated</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {user?.name ? "Recently" : "Never"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}