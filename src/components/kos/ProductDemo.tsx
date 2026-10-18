import type { ProductKey } from "@/lib/kos/catalogue";
import BookingsDemo from "./BookingsDemo";
import EmailDemo from "./EmailDemo";
import ReceptionistDemo from "./ReceptionistDemo";

export default function ProductDemo({ k, business }: { k: ProductKey; business?: string }) {
  if (k === "receptionist") return <ReceptionistDemo business={business} />;
  if (k === "bookings") return <BookingsDemo business={business} />;
  return <EmailDemo />;
}
