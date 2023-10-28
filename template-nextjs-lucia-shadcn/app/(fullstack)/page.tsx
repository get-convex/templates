"use client";

import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  SignOutButton,
  SignUpSignIn,
  useMutationWithAuth,
  useQueryWithAuth,
  useSessionId,
} from "@convex-dev/convex-lucia-auth/react";
import { useMutation } from "convex/react";

export default function Home() {
  const sessionId = useSessionId();

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        Convex + Next.js + Lucia Auth
      </h1>
      {sessionId ? <SignedIn /> : <AuthForm />}
    </main>
  );
}

function SignedIn() {
  const { viewer, numbers } =
    useQueryWithAuth(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  return (
    <>
      <p className="flex gap-4 items-center">
        Welcome {viewer}!
        <SignOutButton
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:pointer-events-none disabled:opacity-50
        bg-primary text-primary-foreground shadow hover:bg-primary/90
        h-9 px-4 py-2"
        />
      </p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <Button
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </Button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers?.join(", ") ?? "..."}
      </p>
      <p>
        Edit <Code>convex/myFunctions.ts</Code> to change your backend
      </p>
      <p>
        Edit <Code>app/(fullstack)/page.tsx</Code> to change your frontend
      </p>
      <p>
        Check out{" "}
        <Link target="_blank" href="https://docs.convex.dev/home">
          Convex docs
        </Link>
      </p>
      <p>
        To build a full page layout copy one of the included{" "}
        <Link target="_blank" href="/layouts">
          layouts
        </Link>
      </p>
    </>
  );
}

function AuthForm() {
  const signIn = useMutationWithAuth(api.auth.signIn);
  const signUp = useMutationWithAuth(api.auth.signUp);
  return (
    <div className="flex flex-col items-center px-20 gap-4">
      <SignUpSignIn
        signIn={signIn}
        signUp={signUp}
        onError={(flow) => {
          alert(
            flow === "signIn"
              ? "Could not sign in, did you mean to sign up?"
              : "Could not sign up, did you mean to sign in?"
          );
        }}
        labelClassName="mb-4"
        inputClassName="
          flex h-9 rounded-md border border-input bg-transparent px-3 py-1
          text-sm shadow-sm transition-colors file:border-0 file:bg-transparent
          file:text-sm file:font-medium placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          mb-4 w-[18rem]"
        buttonClassName="
          inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:pointer-events-none disabled:opacity-50
          bg-primary text-primary-foreground shadow hover:bg-primary/90
          h-9 px-4 py-2
          cursor-pointer w-full mb-4"
        flowToggleClassName="block font-medium text-primary cursor-pointer text-center hover:underline underline-offset-4"
      />
    </div>
  );
}
