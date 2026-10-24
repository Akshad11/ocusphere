export type DiscountType = 'Percentage' | 'Fixed_Amount' | 'Product_Specific' | 'Category_Specific';

export interface Offer {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15% or 500 for ₹500
  minimumPurchase: number;
  maximumDiscount?: number;
  applicableCategory?: string;
  applicableProductId?: string;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string; // e.g. "SUMMERLOOK15"
  offerId: string;
  offerName: string;
  usageLimit: number;
  perCustomerLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}
