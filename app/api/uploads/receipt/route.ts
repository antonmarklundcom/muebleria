import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { receiptUploadSchema } from '@/lib/validation';
import { isR2Configured, presignReceiptUpload } from '@/lib/r2';

export const runtime = 'nodejs';

/**
 * POST /api/uploads/receipt — returns a presigned PUT URL for the transfer
 * receipt (Cloudflare R2). When R2 isn't configured we answer with
 * { configured: false } so the client follows the NEVER-BLOCK rule and
 * falls back to WhatsApp instead of failing the order.
 */
export async function POST(req: Request) {
  if (!isR2Configured()) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = receiptUploadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Archivo inválido: se aceptan imágenes o PDF de hasta 5MB' },
      { status: 400 },
    );
  }

  const ext = parsed.data.filename.includes('.')
    ? parsed.data.filename.slice(parsed.data.filename.lastIndexOf('.') + 1).toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'bin';
  const key = `comprobantes/${new Date().toISOString().slice(0, 10)}/${nanoid(12)}.${ext}`;

  try {
    const { uploadUrl, publicUrl } = await presignReceiptUpload({
      key,
      contentType: parsed.data.contentType,
      size: parsed.data.size,
    });
    return NextResponse.json({ ok: true, configured: true, uploadUrl, publicUrl });
  } catch (error) {
    console.error('[uploads] presign failed:', error);
    return NextResponse.json({ ok: false, configured: true, error: 'No se pudo preparar la subida' }, { status: 500 });
  }
}
