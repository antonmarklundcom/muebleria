import { google } from 'googleapis';
import type { Order } from './types';
import { withRetry } from './retry';

/**
 * Google Sheets backup: appends one row per order using a service account.
 * Required env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID.
 * Share the sheet with the service-account email (Editor) for this to work.
 */
export async function appendOrderToSheet(order: Order): Promise<void> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn(`[sheets] Google Sheets env vars not configured — skipping for order ${order.orderId}`);
    return;
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    order.createdAt,
    order.orderId,
    order.customer.nombre,
    order.customer.telefono,
    order.customer.ciudad,
    order.items.map((i) => `${i.name} x${i.qty}`).join(' | '),
    order.totals.total,
    order.paymentMethod,
    order.pipelineStage,
    order.receiptUrl ?? '',
  ];

  await withRetry(`Sheets append (order ${order.orderId})`, async () => {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:J',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
  });
}

/** Used by the Pagopar webhook for idempotency: true if the order already has a row. */
export async function orderExistsInSheet(orderId: string): Promise<boolean> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !privateKey || !sheetId) return false;

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'B:B' });
    return (res.data.values ?? []).some((cells) => cells[0] === orderId);
  } catch (error) {
    console.error(`[sheets] lookup failed for ${orderId}:`, error);
    return false;
  }
}
