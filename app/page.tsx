import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Wizroll"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold">Wizroll</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <HugeiconsIcon
              icon={SparklesIcon}
              strokeWidth={2}
              className="size-4 text-primary"
            />
            <span>Smart WhatsApp Link Management</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Never Lose a Member to a{" "}
            <span className="text-primary">Full Group</span>
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Create smart invite links that automatically roll over to the next
            available WhatsApp group when one fills up. Keep your community
            growing without lifting a finger.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for Free
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="ml-2"
                />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-2 shadow-2xl">
            <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500" />
                <div className="size-3 rounded-full bg-yellow-500" />
                <div className="size-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                yoursite.com/j/my-community
              </span>
            </div>
            <CardContent className="p-8 text-center bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">My Awesome Community</h3>
              <p className="text-muted-foreground mb-6">
                Click below to join our WhatsApp community
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 text-lg">
                Join WhatsApp Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wizroll handles the complexity of managing multiple WhatsApp groups
            so you can focus on building your community.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <HugeiconsIcon
                icon={Link01Icon}
                strokeWidth={2}
                className="size-6 text-primary"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Rollover Links</h3>
            <p className="text-muted-foreground">
              When one group fills up, users are automatically redirected to the
              next available group. No manual intervention needed.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={2}
                className="size-6 text-primary"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Communities</h3>
            <p className="text-muted-foreground">
              Manage multiple WhatsApp communities from a single dashboard. Add
              unlimited invite links per community.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <HugeiconsIcon
                icon={SparklesIcon}
                strokeWidth={2}
                className="size-6 text-primary"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Branded Join Pages</h3>
            <p className="text-muted-foreground">
              Create beautiful, branded landing pages with your logo and colors
              that make joining seamless.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create a Community</h3>
              <p className="text-muted-foreground">
                Add your community with a name and set the max members per
                group.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Invite Links</h3>
              <p className="text-muted-foreground">
                Paste your WhatsApp group invite URLs and set the priority
                order.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Share Your Link</h3>
              <p className="text-muted-foreground">
                Share your custom public link. We handle the rest automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="text-3xl font-bold mt-2">$0</div>
              <p className="text-muted-foreground">Forever free</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>1 Community</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>1 Public Link</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Unlimited WhatsApp Links</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Join Analytics</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </Card>
          <Card className="p-6 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="text-3xl font-bold mt-2">$9/mo</div>
              <p className="text-muted-foreground">For growing communities</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Unlimited Communities</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Unlimited Public Links</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Unlimited WhatsApp Links</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Advanced Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-5 text-green-500"
                />
                <span>Priority Support</span>
              </li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/signup">Upgrade to Pro</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Grow Your Community?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of community managers who use Wizroll to keep their
            WhatsApp groups running smoothly.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Get Started for Free
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="ml-2"
              />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Wizroll"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold">Wizroll</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Wizroll. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
