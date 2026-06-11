import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem } from '../../types';
import { carts } from './cartData';
import Product from '../../models/productsModel';

const getUserCart = async (userId: string): Promise<Cart> => {
  let cart = carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [], savedItems: [] };
    carts.push(cart);
  }
  return cart;
};

const saveCart = async (cart: Cart): Promise<void> => {
  const index = carts.findIndex(c => c.userId === cart.userId);
  if (index !== -1) {
    carts[index] = cart;
  } else {
    carts.push(cart);
  }
};

export { getUserCart, saveCart };

export const addItemToCart = async (userId: string, productId: string, quantity: number): Promise<Cart> => {
  const cart = await getUserCart(userId);
  let product = (Product as any).find((p: { id: string }) => p.id === productId);
  if (!product) {
    product = await Product.findById(productId);
  }
  if (!product) throw new Error('Product not found');
  if (!product || (product as any).stock < quantity) throw new Error('Insufficient stock');
  const existingItem = cart.items.find((item: CartItem) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      id: uuidv4(),
      productId,
      quantity,
      price: (product as any).price,
      name: (product as any).name,
    });
  }
  await saveCart(cart);
  return cart;
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number): Promise<Cart> => {
  if (quantity <= 0) throw new Error('Quantity must be at least 1');
  const cart = await getUserCart(userId);
  const item = cart.items.find((i: CartItem) => i.id === itemId);
  if (!item) throw new Error('Cart item not found');
  let product = (Product as any).find((p: { id: string }) => p.id === item.productId);
  if (!product) {
    product = await Product.findById(item.productId);
  }
  if (!product) throw new Error('Product not found');
  if ((product as any).stock < quantity) throw new Error('Insufficient stock');
  item.quantity = quantity;
  await saveCart(cart);
  return cart;
};

export const removeCartItem = async (userId: string, itemId: string): Promise<Cart> => {
  const cart = await getUserCart(userId);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter((item: CartItem) => item.id !== itemId);
  if (cart.items.length === initialLength) throw new Error('Cart item not found');
  await saveCart(cart);
  return cart;
};

export const clearUserCart = async (userId: string): Promise<void> => {
  const cart = await getUserCart(userId);
  cart.items = [];
  delete cart.couponCode;
  delete cart.discountPercentage;
  await saveCart(cart);
};

export const mergeGuestCart = async (userId: string, guestCart: CartItem[]): Promise<Cart> => {
  const cart = await getUserCart(userId);
  for (const guestItem of guestCart) {
    const existingItem = cart.items.find((item: CartItem) => item.productId === guestItem.productId);
    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      cart.items.push({ ...guestItem, id: uuidv4() });
    }
  }
  await saveCart(cart);
  return cart;
};

export const getCartItemCount = async (userId: string): Promise<number> => {
  const cart = await getUserCart(userId);
  return cart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
};

export { getUserCart as _getUserCart };
