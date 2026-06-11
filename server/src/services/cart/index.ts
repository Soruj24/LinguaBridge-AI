import {
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
} from './cartOperations';
import { mergeGuestCart, getCartItemCount, getUserCart } from './cartOperations';
import { applyCoupon, removeCoupon, getShippingOptions, calculateShipping, calculateTax } from './cartPricing';
import { moveToSavedItems, getSavedItems } from './cartSavedItems';

const cartService = {
  getUserCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
  mergeGuestCart,
  getCartItemCount,
  applyCoupon,
  removeCoupon,
  getShippingOptions,
  calculateShipping,
  calculateTax,
  moveToSavedItems,
  getSavedItems,
};

export default cartService;
export {
  mergeGuestCart,
  getCartItemCount,
  applyCoupon,
  removeCoupon,
  getShippingOptions,
  calculateShipping,
  calculateTax,
  moveToSavedItems,
  getSavedItems,
};
