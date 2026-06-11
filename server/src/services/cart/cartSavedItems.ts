import { v4 as uuidv4 } from 'uuid';
import { CartItem, SavedItem } from '../../types';
import { getUserCart, saveCart } from './cartOperations';

export const moveToSavedItems = async (userId: string, itemId: string): Promise<void> => {
  const cart = await getUserCart(userId);
  const itemIndex = cart.items.findIndex((item: CartItem) => item.id === itemId);
  if (itemIndex === -1) throw new Error('Cart item not found');
  const [item] = cart.items.splice(itemIndex, 1);
  cart.savedItems.push({
    id: uuidv4(),
    productId: item?.productId ?? '',
    addedAt: new Date(),
  });
  await saveCart(cart);
};

export const getSavedItems = async (userId: string): Promise<SavedItem[]> => {
  const cart = await getUserCart(userId);
  return cart.savedItems;
};
