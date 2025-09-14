
import WalletModuleComponent from "@/modules/wallet/WalletModuleComponent";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Wallet - OneAccountAI",
    description: "Manage your AI model usage and optimize performance from a single wallet interface.",
};

export default async function SecurePage() {
    return (
        <>
            <WalletModuleComponent />
        </>
    );
}
