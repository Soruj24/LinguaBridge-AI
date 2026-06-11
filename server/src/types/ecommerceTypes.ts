export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface SavedItem {
  id: string;
  productId: string;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  savedItems: SavedItem[];
  couponCode?: string;
  discountPercentage?: number;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  validUntil: Date;
}

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDays: number;
}

export interface TaxRate {
  state: string;
  rate: number;
}
