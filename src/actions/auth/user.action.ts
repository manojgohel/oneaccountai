/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import deepClone from "@/lib/deepClone";
import sendEmail from "@/lib/email";
import dbConnect from "@/lib/mongoose";
import { createSessionOnly } from "@/lib/session";
import User from "@/models/User";
import generateOtpEmail from "@/utils/generateOtpEmail";
import { redirect } from "next/navigation";

// Type definitions
interface CreateOrUpdateUserParams {
  email: string;
}

interface VerifyOTPAndLoginParams {
  email: string;
  otp: string;
}

interface UpdateProfileParams {
  name?: string;
  standard?: string;
  board?: string;
  answerLanguage?: string;
  mobile?: string; // Keep mobile as optional
}

interface UserResponse {
  status: boolean;
  message: string;
  email?: string;
  token?: string;
  user?: any;
}

const generateOTP = (): number => {
  return Math.floor(1000 + Math.random() * 9000);
};

/**
 * Create or update user and send OTP via email
 * @param email - User's email address
 * @returns Response with OTP send status
 */
export async function createOrUpdateUser({ email }: CreateOrUpdateUserParams): Promise<UserResponse> {
  try {
    await dbConnect();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: false,
        message: "Please enter a valid email address",
      };
    }

    // Generate new OTP
    const newOTP: number = generateOTP();
    const otpExpireTime: Date = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Find existing user or create new one
    let user: any = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        otp: newOTP,
        otpExpireTime,
        createdAt: new Date(),
      });
    } else {
      // Update existing user with new OTP
      user.otp = newOTP;
      user.otpExpireTime = otpExpireTime;
      user.updatedAt = new Date();
    }

    await user.save();
    const { html, subject } = generateOtpEmail(newOTP, 15);

    // Send OTP via email
    const emailResult: any = await sendEmail(
      email,
      subject,
      html
    );

    if (!emailResult.status) {
      return {
        status: false,
        message: "Failed to send OTP. Please try again.",
      };
    }

    return {
      status: true,
      message: "OTP sent successfully to your email address",
      email,
    };

  } catch (error: any) {
    console.error("Error in createOrUpdateUser:", error);
    return {
      status: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Verify OTP and create session
 * @param email - User's email address
 * @param otp - OTP entered by user
 * @returns Response with login status and user data
 */
export async function verifyOTPAndLogin({ email, otp }: VerifyOTPAndLoginParams): Promise<UserResponse> {
  try {
    await dbConnect();

    // Find user by email address
    const user: any = await User.findOne({ email });

    if (!user) {
      return {
        status: false,
        message: "User not found. Please request OTP first.",
      };
    }

    // Check if OTP is valid and not expired
    if (user.otp !== Number(otp)) {
      return {
        status: false,
        message: "Invalid OTP. Please check and try again.",
      };
    }

    if (!user.otpExpireTime || user.otpExpireTime < new Date()) {
      return {
        status: false,
        message: "OTP has expired. Please request a new OTP.",
      };
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpireTime = undefined;
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    await user.save();

    // Create session without redirect using createSessionOnly
    const tokenResponse: any = await createSessionOnly(deepClone({
      _id: user._id,
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      status: user.status
    }));

    console.log("✅ User logged in successfully:", user._id);

    return {
      status: true,
      message: "Login successful",
      user: deepClone({
        _id: user._id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        ...tokenResponse
      })
    };

  } catch (error: any) {
    console.error("Error in verifyOTPAndLogin:", error);
    return {
      status: false,
      message: "Login failed. Please try again.",
    };
  }
}

/**
 * Update user profile
 * @param profileData - Profile data to update
 * @returns Response with update status
 */
export async function updateProfile(profileData: UpdateProfileParams): Promise<UserResponse> {
  try {
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

    // Find and update user
    const user: any = await User.findById(session.userId);

    if (!user) {
      return {
        status: false,
        message: "User not found.",
      };
    }

    // Update only provided fields
    if (profileData.name !== undefined) user.name = profileData.name;
    if (profileData.standard !== undefined) user.standard = profileData.standard;
    if (profileData.board !== undefined) user.board = profileData.board;
    if (profileData.answerLanguage !== undefined) user.answerLanguage = profileData.answerLanguage;
    if (profileData.mobile !== undefined) user.mobile = profileData.mobile;

    user.updatedAt = new Date();
    await user.save();

    return {
      status: true,
      message: "Profile updated successfully",
      user: deepClone({
        _id: user._id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        standard: user.standard,
        board: user.board,
        answerLanguage: user.answerLanguage,
        status: user.status
      })
    };

  } catch (error: any) {
    console.error("Error in updateProfile:", error);
    return {
      status: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Logout user by clearing session
 */
export async function logout(): Promise<void> {
  try {
    const { deleteSession } = await import("@/lib/session");
    await deleteSession();
  } catch (error: any) {
    console.error("Error in logout:", error);
    // Handle redirect on client side
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    await dbConnect();

    const { verifySession } = await import("@/lib/session");
    const session: any = await verifySession();

    if (!session || !session.userId) {
      return {
        status: false,
        message: "No active session found",
      };
    }

    // Find user by ID from session
    const user: any = await User.findById(session.userId).select(
      "-password -otp -otpExpireTime"
    );

    if (!user) {
      return {
        status: false,
        message: "User not found",
      };
    }

    return deepClone({
      status: true,
      message: "User found",
      user,
    });

  } catch (error: any) {
    console.error("Error in getCurrentUser:", error);
    return {
      status: false,
      message: "Failed to get user information",
    };
  }
}


/**
 * Find user by email and return _id.
 * If user does not exist, create a new user and return the new _id.
 * @param email - User's email address
 * @returns User _id if found or created, otherwise null
 */
export async function getFindByEmail(email: string): Promise<string | null> {
  try {
    await dbConnect();
    let user = await User.findOne({ email }).select("_id");
    if (!user) {
      user = await User.create({ email, createdAt: new Date() });
    }
    return user ? user._id.toString() : null;
  } catch (error: any) {
    console.error("Error in getFindByEmail:", error);
    return null;
  }
}

/**
 * Deposit balance and update deposit details by userId
 * @param userId - User's ID
 * @param amount - Amount to deposit
 * @returns Response with deposit status and updated user info
 */
export async function depositBalanceByUserId(userId: string, amount: number): Promise<UserResponse> {
  try {
    await dbConnect();

    if (!userId || typeof amount !== "number" || amount <= 0) {
      return {
        status: false,
        message: "Invalid user ID or deposit amount.",
      };
    }

    const user: any = await User.findById(userId);

    if (!user) {
      return {
        status: false,
        message: "User not found.",
      };
    }

    user.balance = Number(user.balance || 0) + Number(amount / 10000);
    user.lastDepositAt = new Date();
    user.lastDepositAmount = amount;
    user.updatedAt = new Date();

    await user.save();

    return {
      status: true,
      message: "Deposit successful.",
    };
  } catch (error: any) {
    console.error("Error in depositBalanceByUserId:", error);
    return {
      status: false,
      message: "Failed to deposit balance. Please try again.",
    };
  }
}