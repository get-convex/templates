"use client";

import { SignInMethodDivider } from "@/components/SignInMethodDivider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { toast, Toaster } from "sonner";
import { useState } from "react";

export default function SignInPage() {
  const [step, setStep] = useState<"signIn" | "linkSent">("signIn");

  return (
    <div className="flex min-h-screen w-full container my-auto mx-auto">
      <div className="max-w-[384px] mx-auto flex flex-col my-auto gap-4 pb-8">
        {step === "signIn" ? (
          <>
            <h2 className="font-semibold text-2xl tracking-tight">
              Sign in or create an account
            </h2>
            <SignInWithGitHub />
            <SignInMethodDivider />
            <SignInWithMagicLink handleLinkSent={() => setStep("linkSent")} />
          </>
        ) : (
          <>
            <h2 className="font-semibold text-2xl tracking-tight">
              Check your email
            </h2>
            <p>A sign-in link has been sent to your email address.</p>
            <Button
              className="p-0 self-start"
              variant="link"
              onClick={() => setStep("signIn")}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => void signIn("github", { redirectTo: "/product" })}
    >
      <GitHubLogoIcon className="mr-2 h-4 w-4" /> GitHub
    </Button>
  );
}

function SignInWithMagicLink({
  handleLinkSent,
}: {
  handleLinkSent: () => void;
}) {
  const { signIn } = useAuthActions();
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("redirectTo", "/product");
        signIn("resend", formData)
          .then(handleLinkSent)
          .catch((error) => {
            console.error(error);
            toast.error("Could not send sign-in link");
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      <Button type="submit">Send sign-in link</Button>
      <Toaster />
    </form>
  );
}
