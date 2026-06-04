'use client';

// Local inline-SVG icon module for the admin Ops console.
//
// Why a hand-rolled module rather than a library?
//   - No icon library is installed in this repo (verified: lucide-react,
//     @heroicons/react, react-icons, phosphor-icons, tabler-icons,
//     @radix-ui/react-icons are all absent). Adding one would inflate the
//     runtime dependency footprint and complicate the future Hetzner
//     migration. The existing src/components/Icons.tsx already follows a
//     hand-rolled pattern for the public marketing pages — this module
//     does the same for the admin UI at a denser 16x16 size.
//   - Keeping admin icons separate from marketing icons avoids accidental
//     visual drift across surfaces (marketing icons are 24x24 stroke 1.5;
//     admin icons are 16x16 stroke 1.75) and gives each surface room to
//     evolve independently.
//
// Geometry contract: every icon renders inside a 16x16 viewBox with
// stroke='currentColor', fill='none', strokeWidth=1.75, and round line
// caps/joins. The default className 'h-4 w-4 shrink-0' keeps icons from
// expanding inside flex rows. Consumers can override className for size
// or colour.

import type { ReactElement, SVGProps } from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;
export type IconComponent = (props: IconProps) => ReactElement;

const BASE_PROPS: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Svg({
  className = 'h-4 w-4 shrink-0',
  children,
  ...rest
}: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export function Dashboard(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="8.5" width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
    </Svg>
  );
}

export function Search(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5 10.2 10.2" />
    </Svg>
  );
}

export function Chat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 4.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6.5L3.5 14V11.5a1 1 0 0 1-1-1V4.5z" />
    </Svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="m2.5 4.5 5.5 4 5.5-4" />
    </Svg>
  );
}

export function Building(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 14V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11" />
      <path d="M10 14V7h2.5a1 1 0 0 1 1 1v6" />
      <path d="M2 14h12" />
      <path d="M5 5h2M5 8h2M5 11h2" />
    </Svg>
  );
}

export function User(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2.5 13.5a5.5 5.5 0 0 1 11 0" />
    </Svg>
  );
}

export function Boxes(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2" width="5" height="5" rx="0.5" />
      <rect x="9" y="2" width="5" height="5" rx="0.5" />
      <rect x="2" y="9" width="5" height="5" rx="0.5" />
      <rect x="9" y="9" width="5" height="5" rx="0.5" />
    </Svg>
  );
}

export function NetworkMap(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="13" cy="12" r="1.5" />
      <path d="M8 4.5v3M7 8.5 4 10.7M9 8.5l3 2.2" />
    </Svg>
  );
}

export function Code(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 5-3 3 3 3" />
      <path d="m11 5 3 3-3 3" />
      <path d="m9.5 3-3 10" />
    </Svg>
  );
}

export function Triangle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 14 13H2L8 2.5z" />
    </Svg>
  );
}

export function Server(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.5" width="12" height="4.5" rx="1" />
      <rect x="2" y="9" width="12" height="4.5" rx="1" />
      <path d="M4.5 4.7h0M4.5 11.2h0" />
    </Svg>
  );
}

export function Clipboard(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="10" height="11" rx="1.5" />
      <rect x="5.5" y="1.5" width="5" height="2.5" rx="0.5" />
      <path d="M5.5 7.5h5M5.5 10h5" />
    </Svg>
  );
}

export function Calendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5 2v2.5M11 2v2.5" />
    </Svg>
  );
}

export function AlertTriangle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 14.5 13.5h-13L8 2.5z" />
      <path d="M8 6.5v3M8 11.5h0" />
    </Svg>
  );
}

export function CreditCard(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="M1.5 6.5h13M4 10.5h2" />
    </Svg>
  );
}

export function Chart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 2.5v11h11" />
      <path d="M5 11V8.5M8 11V6M11 11V4" />
    </Svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 1.5 2.5 3.5v4c0 3 2.5 5.5 5.5 6.5 3-1 5.5-3.5 5.5-6.5v-4L8 1.5z" />
    </Svg>
  );
}

export function Eye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </Svg>
  );
}

export function Rocket(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 2c-3.5 0-6 3-7 5l3 3c2-1 5-3.5 5-7l-1-1z" />
      <path d="m6 9-1.5 1.5 1 1L7 10" />
      <path d="M4 11.5c-1 0-2 1-2 2.5 1.5 0 2.5-1 2.5-2" />
    </Svg>
  );
}

export function Activity(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M1.5 8h3l2-5 3 10 2-5h3" />
    </Svg>
  );
}

export function Book(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 12.5V3a1 1 0 0 1 1-1h9v10.5" />
      <path d="M2.5 12.5a1.5 1.5 0 0 0 1.5 1.5h8.5" />
      <path d="M5 4.5h5M5 6.5h5" />
    </Svg>
  );
}

export function Refresh(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 7a5.5 5.5 0 0 1 9.5-3.5L14 5" />
      <path d="M14 2v3h-3" />
      <path d="M13.5 9a5.5 5.5 0 0 1-9.5 3.5L2 11" />
      <path d="M2 14v-3h3" />
    </Svg>
  );
}

export function Cog(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </Svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5v11M2.5 8h11" />
    </Svg>
  );
}

export function Edit(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 2.5 13.5 5 5 13.5H2.5V11L11 2.5z" />
    </Svg>
  );
}

export function Trash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 4h11" />
      <path d="M5 4V2.5h6V4" />
      <path d="M3.5 4v9.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4" />
      <path d="M6.5 6.5v6M9.5 6.5v6" />
    </Svg>
  );
}

export function Download(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2v8" />
      <path d="m4.5 7 3.5 3 3.5-3" />
      <path d="M2.5 12.5v1h11v-1" />
    </Svg>
  );
}

export function Save(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 2.5h8.5l2.5 2.5v8.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" />
      <path d="M4.5 2.5v3.5h6V2.5" />
      <rect x="4.5" y="9" width="6" height="4.5" rx="0.25" />
    </Svg>
  );
}

export function X(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
    </Svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 8h11" />
      <path d="m9.5 4 4 4-4 4" />
    </Svg>
  );
}

export function Filter(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 3h12l-4.5 5.5v4L6.5 14V8.5L2 3z" />
    </Svg>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 2.5h4.5V7" />
      <path d="m13.5 2.5-6 6" />
      <path d="M11.5 9v3.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1H7" />
    </Svg>
  );
}

// Map of icon keys used by opsNavData to icon components. Centralised so the
// sidebar/mobile bar look up by string key without importing every icon
// individually. New entries must be added here AND exported by name above.
export const OPS_NAV_ICONS: Record<string, IconComponent> = {
  Dashboard,
  Search,
  Chat,
  Mail,
  Building,
  User,
  Boxes,
  NetworkMap,
  Code,
  Triangle,
  Server,
  Clipboard,
  Calendar,
  AlertTriangle,
  CreditCard,
  Chart,
  Shield,
  Eye,
  Rocket,
  Activity,
  Book,
  Refresh,
  Cog,
  Plus,
  Edit,
  Trash,
  Download,
  Save,
  X,
  ArrowRight,
  Filter,
  ExternalLink,
};
