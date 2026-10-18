import { notFound } from "next/navigation";

// Any address on 2kosystems.com with no page gets this site's 404, not the
// consultancy's.
export default function Missing() {
  notFound();
}
