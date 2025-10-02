
import HeaderComponent from "@/components/common/HeaderComponent";
import ProfileComponent from "@/modules/profile/ProfileComponent";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Profile - OneAccountAI",
    description: "Manage your AI model usage and optimize performance from a single wallet interface.",
};

export default async function SecurePage() {
    return (
        <div>
            <HeaderComponent title="Profile" description="Manage your profile information and settings." />
            <ProfileComponent />
        </div>
    );
}
