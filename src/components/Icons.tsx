import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size: number = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function WorkflowIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 6h6M4 12h6M4 18h6M14 6h6M14 12h6M14 18h6" />
      <path d="M10 6l4 6-4 6" className="icon-arrow-flow" opacity={0.5} />
    </svg>
  );
}

export function PortalIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18" />
      <circle cx="6" cy="6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="6" r="0.5" fill="currentColor" stroke="none" />
      <path d="M8 14h8M10 17h4" />
    </svg>
  );
}

export function ApprovalIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M9 12l2 2 4-4" />
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9" />
      <path d="M21 5l-2-2M19 3l2 4h-4" />
    </svg>
  );
}

export function DashboardIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" className="icon-panel-pulse-1" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" className="icon-panel-pulse-2" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" className="icon-panel-pulse-3" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" className="icon-panel-pulse-4" />
    </svg>
  );
}

export function KnowledgeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v17H6.5a2.5 2.5 0 000 5H20" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  );
}

export function AIIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 14l8-10v6h8l-8 10v-6H4z" className="icon-bolt-pulse" />
    </svg>
  );
}

export function AuditIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <g className="icon-scan-wobble">
        <circle cx="11" cy="11" r="7" />
        <path d="M8 11h6M11 8v6" />
      </g>
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function ScopeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="9" className="icon-ring-pulse" />
      <circle cx="12" cy="12" r="5" className="icon-ring-pulse-delayed" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PrototypeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 7v10M8 12h8M16 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

export function BuildIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

export function OptimiseIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 2 5-6" />
    </svg>
  );
}

export function MiningIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M14 4l-4 16M8 8l-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  );
}

export function AgricultureIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 22V12" />
      <path d="M12 12c0-4 3-7 7-7-1 4-4 7-7 7z" />
      <path d="M12 15c0-3-2.5-5.5-5.5-5.5C7 12.5 9 15 12 15z" />
    </svg>
  );
}

export function LogisticsIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function IndustrialIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M2 20h20M5 20V8l5 4V8l5 4V4h5v16" />
    </svg>
  );
}

export function ComplianceIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function MultiBranchIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M12 8v3M9 13l-2.5 3.5M15 13l2.5 3.5" />
    </svg>
  );
}

export function TrainingIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

export function SpreadsheetIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}

export function ProcessIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 12h4l3-9 4 18 3-9h4" />
    </svg>
  );
}

export function CustomIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function AdminIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function RetainerIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <g className="icon-spin-slow">
        <path d="M21 12a9 9 0 11-6.22-8.57" />
        <path d="M21 3v6h-6" />
      </g>
    </svg>
  );
}

export function PilotIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
