import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to OneAccount AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your intelligent assistant for managing accounts and conversations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Get Started</CardTitle>
              <CardDescription>
                Sign in to access your personalized AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✨ Features</CardTitle>
              <CardDescription>
                Discover what you can do with OneAccount AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Intelligent conversation management</li>
                <li>• Secure account management</li>
                <li>• AI-powered insights</li>
                <li>• Real-time assistance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/auth" className="text-blue-600 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
