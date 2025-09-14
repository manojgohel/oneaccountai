"use client";

import { getCurrentUser, updateProfile } from "@/actions/auth/user.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileComponent() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Fetch user on mount
    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            const res = await getCurrentUser();
            if (res.status && res.user) {
                setUser(res.user);
                setName(res.user.name || "");
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
            toast.success("Profile updated successfully");
        } else {
            setError(res.message || "Failed to update profile");
        }
        setSubmitting(false);
    }
    return (
        <>
            <div className="flex flex-col items-center justify-center h-full">
                {loading ? (
                    <div className="space-y-4 max-w-sm">
                        <Skeleton className="h-8 w-full rounded" />
                        <Skeleton className="h-8 w-full rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                        <div>
                            <Label htmlFor="email" className="mb-1 block text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                readOnly
                                className="bg-gray-100 cursor-not-allowed"
                                tabIndex={-1}
                            />
                        </div>
                        <div>
                            <Label htmlFor="name" className="mb-1 block text-sm font-medium">
                                Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                autoComplete="off"
                                required
                                disabled={submitting}
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600">{error}</div>
                        )}
                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={submitting}
                        >
                            {submitting ? "Updating..." : "Update Profile"}
                        </Button>
                    </form>
                )}
            </div>
        </>
    );
}