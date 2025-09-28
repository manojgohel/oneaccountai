import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already authenticated
  const session = await verifySession();

  if (session) {
    // User is authenticated, redirect to secure area
    redirect("/secure");
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
