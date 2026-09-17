"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  eventOffer?: string;
};

export default function TrackedLink({
  eventOffer,
  onClick,
  children,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent("cta_click", {
          cta_label: typeof children === "string" ? children : "linked content",
          destination: String(props.href),
          offer: eventOffer ?? "general",
        });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
