import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInClient } from "@/components/signin-client";

export const metadata: Metadata = {
  title: "Sign in — Learn Everything",
  description: "Sign in with Google or GitHub to sync your lab progress across devices.",
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInClient />
    </Suspense>
  );
}
