import { productInquiryLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

/** Green WhatsApp chip on product pages: opens wa.me with product name + URL. */
export default function WhatsAppChip({
  productName,
  productUrl,
}: {
  productName: string;
  productUrl: string;
}) {
  return (
    <a
      href={productInquiryLink(productName, productUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-whatsapp"
    >
      <WhatsAppIcon className="h-5 w-5" />
      Consultar por WhatsApp
    </a>
  );
}
