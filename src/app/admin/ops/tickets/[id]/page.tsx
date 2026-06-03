import { notFound } from 'next/navigation';
import { getTicket, listComments } from '@/lib/ops/tickets-service';
import { listOperators } from '@/lib/ops/operators';
import NotConnectedBanner from '../../NotConnectedBanner';
import TicketDetailClient from './TicketDetailClient';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) notFound();
  const [comments, operators] = await Promise.all([listComments(id), listOperators()]);

  return (
    <>
      <NotConnectedBanner />
      <TicketDetailClient
        ticket={ticket}
        comments={comments}
        operators={operators.map((o) => ({ id: o.id, slug: o.slug, displayName: o.displayName }))}
      />
    </>
  );
}
