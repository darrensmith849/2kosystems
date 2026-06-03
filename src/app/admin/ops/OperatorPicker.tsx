import { listOperators } from '@/lib/ops/operators';
import { isDbConfigured } from '@/lib/db/client';
import OperatorPickerClient from './OperatorPickerClient';

export default async function OperatorPicker() {
  const dbOk = isDbConfigured();
  const operators = dbOk ? await listOperators() : [];
  return <OperatorPickerClient operators={operators} dbConfigured={dbOk} />;
}
