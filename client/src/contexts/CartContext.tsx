import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CartAddon = {
  name: string;
  price: number;
};

type CartConfigurationItem = {
  label: string;
  value: string;
  priceDelta: number;
};

export type CartItem = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  packageSlug: string;
  packageName: string;
  price: number;
  turnaround: string;
  revisions: string;
  addons: CartAddon[];
  configuration: CartConfigurationItem[];
  brandName: string;
  scopeDetails: string;
  notes: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "dative-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return;

    try {
      setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((total, item) => {
      const addonsTotal = item.addons.reduce((addonsSum, addon) => addonsSum + addon.price, 0);
      return total + item.price + addonsTotal;
    }, 0);

    return {
      items,
      count: items.length,
      subtotal,
      addItem: (item) => setItems((current) => [...current, item]),
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
