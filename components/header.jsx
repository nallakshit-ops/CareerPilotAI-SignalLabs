import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  Mic,
  Rocket,
  GitBranch,
  Compass,
  Bookmark,
  Building2,
  ClipboardList,
  User,
  Briefcase,
  Plus,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

export default async function Header() {
  const user = await checkUser();
  const isRecruiter = user?.role === "recruiter";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Student Navigation Bar */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              {/* Student Career & Learning OS Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 font-medium">
                    <StarsIcon className="h-3.5 w-3.5 text-accent" />
                    <span>Career OS</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/intelligence" className="flex items-center gap-2 cursor-pointer font-medium text-accent">
                      <Brain className="h-4 w-4 text-accent" />
                      Signal Intelligence
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/career-simulator" className="flex items-center gap-2 cursor-pointer">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      Career Simulator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resume" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Resume Builder
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ai-cover-letter" className="flex items-center gap-2 cursor-pointer">
                      <PenBox className="h-4 w-4 text-muted-foreground" />
                      Cover Letter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2 cursor-pointer">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Interview Prep
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/live-interview" className="flex items-center gap-2 cursor-pointer">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      Live Mock Interview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/growth-tools" className="flex items-center gap-2 cursor-pointer">
                      <Rocket className="h-4 w-4 text-muted-foreground" />
                      TalentSync AI
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/explore" className="flex items-center gap-2 cursor-pointer">
                      <Compass className="h-4 w-4 text-muted-foreground" />
                      Explore Opportunities
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/jobs" className="flex items-center gap-2 cursor-pointer">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Browse Jobs
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/applications" className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      Applications
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
                afterSignOutUrl="/"
              />
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <SignInButton fallbackRedirectUrl="/onboarding">
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/onboarding">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
