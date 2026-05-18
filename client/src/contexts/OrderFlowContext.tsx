import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/contexts/CartContext";
import type { Locale } from "@/lib/localeRoutes";

export type OrderStatus =
  | "checkout_started"
  | "brief_pending"
  | "brief_submitted"
  | "ready_for_review";

export type DeliveryState = "pending" | "sent" | "skipped" | "failed";

export type CheckoutCustomerData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  taxId: string;
  paymentMethod: string;
  notes: string;
};

export type OrderBriefFile = {
  name: string;
  type: string;
  size: number;
  content: string;
};

export type OrderBriefAnswer = {
  itemId: string;
  brandName: string;
  projectGoal: string;
  audience: string;
  visualDirection: string;
  references: string;
  contentScope: string;
  deadline: string;
  additionalNotes: string;
  attachments: OrderBriefFile[];
};

export type OrderRecord = {
  id: string;
  number: string;
  locale: Locale;
  status: OrderStatus;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  customer: CheckoutCustomerData;
  briefAnswers: OrderBriefAnswer[];
  briefSubmittedAt: string;
  delivery: {
    savedToServer: boolean;
    adminEmail: DeliveryState;
    customerEmail: DeliveryState;
    message: string;
  };
};

type OrderFlowContextValue = {
  activeOrder: OrderRecord | null;
  orders: OrderRecord[];
  isSubmitting: boolean;
  createCheckoutOrder: (input: {
    locale: Locale;
    items: CartItem[];
    subtotal: number;
    customer: CheckoutCustomerData;
  }) => Promise<OrderRecord>;
  submitBrief: (answers: OrderBriefAnswer[]) => Promise<OrderRecord>;
  clearActiveOrder: () => void;
};

const ORDER_STORAGE_KEY = "dative-orders";
const ACTIVE_ORDER_STORAGE_KEY = "dative-active-order-id";

const OrderFlowContext = createContext<OrderFlowContextValue | null>(null);

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const rawOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    const rawActive = localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);

    if (rawOrders) {
      try {
        setOrders(JSON.parse(rawOrders));
      } catch {
        localStorage.removeItem(ORDER_STORAGE_KEY);
      }
    }

    if (rawActive) {
      setActiveOrderId(rawActive);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, activeOrderId);
    } else {
      localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    }
  }, [activeOrderId]);

  const value = useMemo<OrderFlowContextValue>(() => {
    const activeOrder = orders.find((order) => order.id === activeOrderId) ?? null;

    return {
      activeOrder,
      orders,
      isSubmitting,
      createCheckoutOrder: async ({ locale, items, subtotal, customer }) => {
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              locale,
              items,
              subtotal,
              customer,
            }),
          });

          if (!response.ok) {
            throw new Error("ORDER_CREATE_FAILED");
          }

          const order = (await response.json()) as OrderRecord;
          setOrders((current) => [order, ...current.filter((entry) => entry.id !== order.id)]);
          setActiveOrderId(order.id);
          return order;
        } finally {
          setIsSubmitting(false);
        }
      },
      submitBrief: async (answers) => {
        if (!activeOrderId) {
          throw new Error("NO_ACTIVE_ORDER");
        }

        setIsSubmitting(true);
        try {
          const response = await fetch(`/api/orders/${activeOrderId}/brief`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ answers }),
          });

          if (!response.ok) {
            throw new Error("ORDER_BRIEF_FAILED");
          }

          const order = (await response.json()) as OrderRecord;
          setOrders((current) => current.map((entry) => (entry.id === order.id ? order : entry)));
          return order;
        } finally {
          setIsSubmitting(false);
        }
      },
      clearActiveOrder: () => {
        setActiveOrderId(null);
      },
    };
  }, [activeOrderId, isSubmitting, orders]);

  return <OrderFlowContext.Provider value={value}>{children}</OrderFlowContext.Provider>;
}

export function useOrderFlow() {
  const context = useContext(OrderFlowContext);
  if (!context) {
    throw new Error("useOrderFlow must be used within OrderFlowProvider");
  }

  return context;
}
