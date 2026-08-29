import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp fallbackRedirectUrl="/onboarding" signInUrl="/sign-in" />;
}
