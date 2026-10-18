"use client";

import dynamic from "next/dynamic";

// Its dates come from the visitor's own clock, so it renders in the browser only — a server-rendered
// copy could disagree about what "tomorrow" is and fail to hydrate.
const BookingTry = dynamic(() => import("./BookingTry"), {
  ssr: false,
  loading: () => <div className="ks-booktry" style={{ minHeight: 520 }} aria-busy="true" />,
});

export default function BookingTryLazy() {
  return <BookingTry />;
}
