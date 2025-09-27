"use server";

import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";


interface UpdateSelectedModelsResponse {
    status: boolean;
    message: string;
    selectedModels?: string[];
    user?: any;
}

/**
 * Update user's selected AI models
 * @param selectedModels - Array of selected model IDs
 * @returns Response with update status and updated models
 */
export async function updateSelectedModels(
    selectedModels: string[]
): Promise<UpdateSelectedModelsResponse> {
    try {
        // Connect to database
        await dbConnect();

        // Get current user from session
        const { verifySession } = await import("@/lib/session");
        const session: any = await verifySession();

        if (!session || !session.userId) {
            return {
                status: false,
                message: "Not authenticated. Please login first.",
            };
        }

        // Validate selectedModels array
        if (!Array.isArray(selectedModels)) {
            return {
                status: false,
                message: "Invalid selectedModels format. Expected an array.",
            };
        }

        // Validate that all selectedModels are strings
        if (!selectedModels.every(model => typeof model === 'string')) {
            return {
                status: false,
                message: "All model IDs must be strings.",
            };
        }

        // Find and update user
        const user: any = await User.findById(session.userId);

        if (!user) {
            return {
                status: false,
                message: "User not found.",
            };
        }

        // Update selectedModels
        user.selectedModels = selectedModels;
        user.updatedAt = new Date();
        await user.save();

        return {
            status: true,
            message: "Selected models updated successfully",
            selectedModels: user.selectedModels,
            user: deepClone({
                _id: user._id,
                email: user.email,
                name: user.name,
                selectedModels: user.selectedModels,
                status: user.status
            })
        };

    } catch (error: any) {
        console.error("Error updating selected models:", error);
        return {
            status: false,
            message: "Failed to update selected models. Please try again.",
        };
    }
}

/**
 * Get user's currently selected AI models
 * @returns Response with user's selected models
 */
export async function getSelectedModels(): Promise<UpdateSelectedModelsResponse> {
    try {
        // Connect to database
        await dbConnect();

        // Get current user from session
        const { verifySession } = await import("@/lib/session");
        const session: any = await verifySession();

        if (!session || !session.userId) {
            return {
                status: false,
                message: "Not authenticated. Please login first.",
            };
        }

        // Find user
        const user: any = await User.findById(session.userId).select('selectedModels email name status');

        if (!user) {
            return {
                status: false,
                message: "User not found.",
            };
        }

        return {
            status: true,
            message: "Selected models retrieved successfully",
            selectedModels: user.selectedModels || [],
            user: deepClone({
                _id: user._id,
                email: user.email,
                name: user.name,
                selectedModels: user.selectedModels || [],
                status: user.status
            })
        };

    } catch (error: any) {
        console.error("Error getting selected models:", error);
        return {
            status: false,
            message: "Failed to get selected models. Please try again.",
        };
    }
}

