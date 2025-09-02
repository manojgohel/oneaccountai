'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRightIcon,
  BrainIcon,
  CreditCardIcon,
  DollarSignIcon,
  SparklesIcon,
  UnlockIcon
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <BrainIcon className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">OneAccountAI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
              Try Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
          All AI Models in
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {' '}One Place
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-xl text-gray-300 md:text-2xl">
          Pay only for what you use with access to GPT-4, Claude, Gemini, and 50+ AI models.
          No monthly subscriptions, no commitments - just transparent, usage-based pricing.
        </p>

        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link href="/">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
              Get Early Access
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
            Learn More
          </Button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Why Choose OneAccountAI?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-gray-800/50 p-8 backdrop-blur-sm">
              <DollarSignIcon className="mb-4 h-12 w-12 text-green-400" />
              <h3 className="mb-4 text-xl font-semibold text-white">Pay As You Go</h3>
              <p className="text-gray-300">
                No monthly fees or subscriptions. Pay only for the AI tokens you actually use across all models.
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-8 backdrop-blur-sm">
              <UnlockIcon className="mb-4 h-12 w-12 text-purple-400" />
              <h3 className="mb-4 text-xl font-semibold text-white">Access All Models</h3>
              <p className="text-gray-300">
                Use GPT-4, Claude, Gemini, Llama, and 50+ other AI models without separate accounts or subscriptions.
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-8 backdrop-blur-sm">
              <CreditCardIcon className="mb-4 h-12 w-12 text-blue-400" />
              <h3 className="mb-4 text-xl font-semibold text-white">Transparent Pricing</h3>
              <p className="text-gray-300">
                See exactly what you&apos;re spending with real-time usage tracking and detailed billing per model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Benefits Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-gray-900/50 to-purple-900/50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Simple, Fair Pricing
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            Start free, pay only for what you use. No hidden fees, no monthly commitments.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-800/70 p-8 backdrop-blur-sm border border-gray-700">
              <h3 className="mb-4 text-2xl font-bold text-white">Free Tier</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-green-400">$0</span>
                <span className="text-gray-300">/month</span>
              </div>
              <ul className="space-y-3 text-left text-gray-300">
                <li className="flex items-center">
                  <span className="mr-3 text-green-400">✓</span>
                  Access to 10+ AI models
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-green-400">✓</span>
                  10,000 free tokens monthly
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-green-400">✓</span>
                  Basic chat interface
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-800/70 to-pink-800/70 p-8 backdrop-blur-sm border border-purple-600">
              <h3 className="mb-4 text-2xl font-bold text-white">Pay-As-You-Go</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0.001</span>
                <span className="text-gray-300">/1K tokens</span>
              </div>
              <ul className="space-y-3 text-left text-gray-300">
                <li className="flex items-center">
                  <span className="mr-3 text-purple-400">✓</span>
                  Access to 50+ premium models
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-purple-400">✓</span>
                  GPT-4, Claude, Gemini Pro
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-purple-400">✓</span>
                  Real-time usage tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-purple-400">✓</span>
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 px-6 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-8 flex items-center justify-center space-x-2">
            <BrainIcon className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-semibold text-white">OneAccountAI</span>
          </div>
          <p className="text-gray-400">
            © 2025 OneAccountAI. All rights reserved. Building the future of AI accessibility.
          </p>
        </div>
      </footer>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/2 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute -right-4 top-1/4 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
      </div>
    </div>
  );
}
