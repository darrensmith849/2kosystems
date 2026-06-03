import { notFound } from 'next/navigation';
import { getTicket, listComments } from '@/lib/ops/tickets-service';
import NotConnectedBanner from '../../NotConnectedBanner';
import TicketDetailClient from './TicketDetailClient';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) notFound();
  const comments = await listComments(id);

  return (
    <>
      <NotConnectedBanner />
      <TicketDetailClient ticket={ticket} comments={comments} />
    </>
  );
}
