'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { AdminCard, Row, Badge } from './ui';
import { fitColor } from '../utils/formatters';

export function ClassificationCard({
  classification,
}: {
  classification: AgentOutput['classification'];
}) {
  return (
    <AdminCard title="Classification">
      <Row
        label="Commercial value"
        value={
          <span className={fitColor(classification.commercialValue)}>
            {classification.commercialValue}
          </span>
        }
      />
      <Row
        label="Strategic fit"
        value={
          <span className={fitColor(classification.strategicFit)}>
            {classification.strategicFit}
          </span>
        }
      />
      <Row label="Complexity" value={classification.complexity} />
      <div className="mt-3">
        <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Categories</p>
        <div className="flex flex-wrap gap-1.5">
          {classification.categories.map((c) => (
            <Badge key={c} text={c} />
          ))}
        </div>
      </div>
    </AdminCard>
  );
}
