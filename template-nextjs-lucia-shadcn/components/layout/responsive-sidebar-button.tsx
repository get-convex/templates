"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { fr } from "@/lib/utils";
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Slot } from "@radix-ui/react-slot";
import { useState } from "react";
import { RemoveScroll } from "react-remove-scroll";

// Pass the sidebar displayed when the button is clicked as children
export const ResponsiveSidebarButton = fr<HTMLButtonElement, ButtonProps>(
  function ResponsiveSidebarButton({ children, ...props }, ref) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(!showSidebar)}
          ref={ref}
          {...props}
        >
          {showSidebar ? (
            <Cross2Icon className="h-6 w-6" />
          ) : (
            <HamburgerMenuIcon className="h-6 w-6" />
          )}
        </Button>
        {showSidebar ? (
          <RemoveScroll as={Slot} allowPinchZoom enabled>
            {children}
          </RemoveScroll>
        ) : null}
      </>
    );
  }
);
