import { Cart, Coupon, ShippingOption, TaxRate } from '../../types';

export const carts: Cart[] = [];

export const coupons: Coupon[] = [
  { code: 'SAVE10', discountPercentage: 10, validUntil: new Date('2025-12-31') },
  { code: 'SUMMER20', discountPercentage: 20, validUntil: new Date('2025-08-31') },
];

export const shippingOptions: ShippingOption[] = [
  { id: 'standard', name: 'Standard Shipping', cost: 4.99, estimatedDays: 5 },
  { id: 'express', name: 'Express Shipping', cost: 9.99, estimatedDays: 2 },
  { id: 'priority', name: 'Priority Shipping', cost: 19.99, estimatedDays: 1 },
];

export const taxRates: TaxRate[] = [
  { state: 'CA', rate: 0.0825 },
  { state: 'NY', rate: 0.08875 },
  { state: 'TX', rate: 0.0625 },
];
