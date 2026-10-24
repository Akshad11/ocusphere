export function formatPhoneNumber(phone: string): string {
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}

export function generateInvoiceNumber(seq: number): string {
  const pad = String(seq).padStart(5, '0');
  return `INV-2026-${pad}`;
}

export function generateBookingReference(type: 'appointment' | 'reservation', seq: number): string {
  const prefix = type === 'appointment' ? 'APT' : 'RES';
  const pad = String(seq).padStart(4, '0');
  return `${prefix}-2026-${pad}`;
}
