import { z } from 'zod';

/**
 * Paraguayan phone: accepts "+595 9xx xxx xxx" or local "09xx xxx xxx"
 * (spaces, dots and dashes tolerated). Mobile numbers only — orders are
 * followed up via WhatsApp.
 */
export const phonePY = z
  .string()
  .min(6)
  .max(25)
  .transform((v) => v.replace(/[\s.\-()]/g, ''))
  .refine((v) => /^(\+?5959\d{8}|09\d{8})$/.test(v), {
    message: 'Ingresá un celular paraguayo válido (+595 9xx xxx xxx o 09xx xxx xxx)',
  });

export const customerSchema = z.object({
  nombre: z.string().trim().min(3).max(120),
  telefono: phonePY,
  email: z
    .string()
    .trim()
    .email()
    .max(160)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  ciudad: z.string().trim().min(2).max(120),
  direccion: z.string().trim().min(5).max(300),
  notas: z.string().trim().max(1000).optional(),
});

export const orderItemSchema = z.object({
  slug: z.string().min(1).max(120),
  qty: z.number().int().min(1).max(99),
});

export const deliveryZoneSchema = z.enum(['asuncion', 'gran_asuncion', 'interior']);

export const orderInputSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  deliveryZone: deliveryZoneSchema,
  assemblyRequested: z.boolean().default(false),
  paymentMethod: z.enum(['pagopar', 'transferencia', 'whatsapp']),
  receiptUrl: z.string().url().max(1000).optional(),
  // Client-generated id for WhatsApp orders so the wa.me message and the
  // beacon-submitted order share the same reference. Server validates format.
  clientOrderId: z
    .string()
    .regex(/^MUE-[A-Za-z0-9_-]{6,21}$/)
    .optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export const receiptUploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']),
  size: z
    .number()
    .int()
    .min(1)
    .max(5 * 1024 * 1024, 'El comprobante no puede superar 5MB'),
});
