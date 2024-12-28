"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        Convex + Next.js + Clerk
        <SignInAndSignUpButtons />
      </header>
      <main>
        <h1>Convex + Next.js + Clerk Auth</h1>
        <Authenticated>
          <SignedInContent />
        </Authenticated>
        <Unauthenticated>
          <p>Click one of the buttons in the top right corner to sign in.</p>
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInAndSignUpButtons() {
  return (
    <div>
      <Authenticated>
        <UserButton afterSignOutUrl="#" />
      </Authenticated>
      <Unauthenticated>
        <SignInButton mode="modal">
          <button>Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button>Sign up</button>
        </SignUpButton>
      </Unauthenticated>
    </div>
  );
}

function SignedInContent() {
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  if (viewer === undefined || numbers === undefined) {
    return "loading... (consider a loading skeleton)";
  }

  return (
    <>
      <p>Welcome {viewer ?? "N/A"}!</p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <button
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers?.join(", ") ?? "..."}
      </p>
      <p>
        Edit <code>convex/myFunctions.ts</code> to change your backend
      </p>
      <p>
        Edit <code>app/page.tsx</code> to change your frontend
      </p>
      <p>
        See <Link href="/server">the /server route</Link> for an example of
        loading data in a server component
      </p>
      <p>
        Check out{" "}
        <a target="_blank" href="https://docs.convex.dev/home">
          Convex docs
        </a>
      </p>
    </>
  );
}
