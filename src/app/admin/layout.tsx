import { Roboto } from 'next/font/google';
import AdminSectionNav from './AdminSectionNav';

// Scoped admin typography: Roboto for /admin/agent + /admin/ops only.
// Public marketing pages keep the Geist setup wired in the root layout
// (src/app/layout.tsx). We override the cascade on the wrapper div via an
// inline style — Tailwind's arbitrary font class can't carry a comma-
// separated fallback list cleanly, and we want a hard override regardless
// of what the root <body> sets.

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${roboto.variable} min-h-screen bg-[#0a0a0b]`}
      style={{
        fontFamily: 'var(--font-roboto), Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <AdminSectionNav />
      {children}
    </div>
  );
}
