export type MaterialBadge =
  | 'MDP'
  | 'Melamina RH'
  | 'MDF RH'
  | 'Terciado Fenólico'
  | 'Pino Tratado'
  | 'Madera Maciza + Hierro';

export type ProductTier = 'entrada' | 'media' | 'premium';

export type Product = {
  slug: string;
  name: string; // Spanish
  category: string; // category slug
  tier: ProductTier;
  price: number; // PYG — the ONLY price; financing cushion already baked in
  material: {
    structure: string; // e.g. "Terciado fenólico 18mm"
    surfaces: string; // e.g. "Melamina RH (resistente a humedad)"
    badge: MaterialBadge;
  };
  dimensions: { width: number; height: number; depth: number }; // cm
  weightKg: number;
  assembly: { required: boolean; feeAsuncion: number }; // PYG
  delivery: { asuncion: number; granAsuncion: number; interiorNote: string }; // PYG
  images: string[]; // /images/products/... — local placeholders only
  description: string; // Spanish
  featured: boolean;
  stock: 'disponible' | 'a_pedido'; // a_pedido shows production lead time
  leadTimeDays?: number;
  tags?: string[]; // sub-filter tags, e.g. "4 puertas", "con espejo", "gamer"
};

export type Category = {
  slug: string;
  name: string; // Spanish display name
  keyword: string; // SEO keyword target
  metaTitle: string;
  metaDescription: string;
  intro: string; // 150–250 word SEO copy block, Spanish
  filterTags?: string[]; // optional sub-filter chips
};

export type DeliveryZone = 'asuncion' | 'gran_asuncion' | 'interior';

export type PaymentMethod = 'pagopar' | 'transferencia' | 'whatsapp';

export type PipelineStage =
  | 'pagado_online'
  | 'esperando_comprobante'
  | 'comprobante_pendiente'
  | 'chat_order'
  | 'pendiente_pago';

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  price: number; // unit price PYG (server re-validates against catalog)
};

export type OrderCustomer = {
  nombre: string;
  telefono: string;
  email?: string;
  ciudad: string;
  direccion: string;
  notas?: string;
};

export type OrderTotals = {
  subtotal: number;
  delivery: number;
  assembly: number;
  total: number;
};

export type Order = {
  orderId: string;
  createdAt: string; // ISO
  customer: OrderCustomer;
  items: OrderItem[];
  deliveryZone: DeliveryZone;
  assemblyRequested: boolean;
  totals: OrderTotals;
  paymentMethod: PaymentMethod;
  pipelineStage: PipelineStage;
  receiptUrl?: string;
};

export type CartItem = {
  slug: string;
  qty: number;
};
