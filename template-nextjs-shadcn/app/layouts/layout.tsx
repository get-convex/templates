import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Layout showcase - you can delete me",
  description: 'You can delete the whole "layouts" directory',
};

export default function LayoutsLayout({ children }: { children: ReactNode }) {
  return children;
}
