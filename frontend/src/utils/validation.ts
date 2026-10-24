export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

export function isValidPrescriptionPower(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const num = parseFloat(val);
  return !isNaN(num) && num >= -25 && num <= 25;
}

export function isValidAxis(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const num = parseInt(val, 10);
  return !isNaN(num) && num >= 0 && num <= 180;
}
