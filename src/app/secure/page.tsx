
import { getMostRecentlyUpdatedConversationId } from "@/actions/conversation/conversation.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Wallet - OneAccountAI",
  description: "Manage your AI model usage and optimize performance from a single wallet interface.",
};

export default async function SecurePage() {
  const mostRecentlyUpdatedConversationId = await getMostRecentlyUpdatedConversationId();
  if (mostRecentlyUpdatedConversationId) {
    redirect(`/secure/${mostRecentlyUpdatedConversationId}`);
  } else {
    redirect(`/secure/new`);
  }
  return null;
}
