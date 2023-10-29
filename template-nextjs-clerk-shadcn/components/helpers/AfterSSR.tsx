import { useEffect, useState, ReactNode } from "react";

export function AfterSSR({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  if (!show) {
    return null;
  }
  return children;
}
