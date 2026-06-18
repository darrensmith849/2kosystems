import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { isDbConfigured } from '@/lib/db/client';
import { getSubmission } from '@/lib/ops/submissions-service';

export const runtime = 'nodejs';

// Streams a stored document (SLA / Brief PDF or the client's logo) for a
// submission. Gated by the admin session, like the rest of the team dashboard.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'No database connected' }, { status: 503 });
  }

  const { id } = await params;
  const type = new URL(request.url).searchParams.get('type') || 'sla';
  const s = await getSubmission(id);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const safe = (s.businessName || 'client').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'client';
  let base64: string | null = null;
  let contentType = 'application/pdf';
  let filename = '';
  if (type === 'sla') {
    base64 = s.slaPdf;
    filename = `2KO-SLA-${safe}.pdf`;
  } else if (type === 'brief') {
    base64 = s.briefPdf;
    filename = `2KO-Brief-${safe}.pdf`;
  } else if (type === 'logo') {
    base64 = s.logoBase64;
    contentType = s.logoContentType || 'image/png';
    filename = `${safe}-logo.${contentType.includes('png') ? 'png' : 'jpg'}`;
  }
  if (!base64) return NextResponse.json({ error: 'Not available' }, { status: 404 });

  const bytes = Buffer.from(base64, 'base64');
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
