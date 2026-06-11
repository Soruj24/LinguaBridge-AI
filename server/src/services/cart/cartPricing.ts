import { Cart, ShippingOption } from '../../types';
import { coupons, shippingOptions, taxRates } from './cartData';
import { getUserCart, saveCart } from './cartOperations';

export const applyCoupon = async (userId: string, couponCode: string): Promise<Cart> => {
  const cart = await getUserCart(userId);
  const coupon = coupons.find(c => c.code === couponCode);
  if (!coupon) throw new Error('Invalid coupon');
  if (coupon.validUntil < new Date()) throw new Error('Coupon has expired');
  cart.couponCode = coupon.code;
  cart.discountPercentage = coupon.discountPercentage;
  await saveCart(cart);
  return cart;
};

export const removeCoupon = async (userId: string): Promise<Cart> => {
  const cart = await getUserCart(userId);
  delete cart.couponCode;
  delete cart.discountPercentage;
  await saveCart(cart);
  return cart;
};

export const getShippingOptions = async (): Promise<ShippingOption[]> => {
  return shippingOptions;
};

export const calculateShipping = async (shippingMethodId: string): Promise<number> => {
  const option = shippingOptions.find(o => o.id === shippingMethodId);
  if (!option) throw new Error('Invalid shipping method');
  return option.cost;
};

export const calculateTax = async (userId: string, state: string): Promise<number> => {
  const cart = await getUserCart(userId);
  const taxRate = taxRates.find(rate => rate.state === state);
  if (!taxRate) throw new Error('Tax rate not found for state');
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  const discount = cart.discountPercentage
    ? subtotal * (cart.discountPercentage / 100)
    : 0;
  const taxableAmount = subtotal - discount;
  return taxableAmount * taxRate.rate;
};
