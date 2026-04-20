import type {
  User,
  Category,
  Ingredient,
  Product,
  Order,
  OrderItem,
  DashboardStats,
  ReportData,
  OrderType,
  OrderStatus,
  PaymentMethod,
} from '../types';

// Mock data storage
let mockCategories: Category[] = [
  { id: '1', name: 'Almoço', active: true },
  { id: '2', name: 'Lanche', active: true },
  { id: '3', name: 'Bebida', active: true },
  { id: '4', name: 'Sobremesa', active: true },
  { id: '5', name: 'Adicional', active: true },
];

let mockIngredients: Ingredient[] = [
  { id: '1', name: 'Frango', unit: 'g', cost: 0.02 },
  { id: '2', name: 'Arroz', unit: 'g', cost: 0.01 },
  { id: '3', name: 'Queijo', unit: 'g', cost: 0.04 },
  { id: '4', name: 'Tomate', unit: 'g', cost: 0.008 },
  { id: '5', name: 'Alface', unit: 'g', cost: 0.006 },
];

let mockProducts: Product[] = [
  {
    id: '1',
    name: 'Parmegiana',
    categoryId: '1',
    price: 35.0,
    description: 'Filé de frango à parmegiana com arroz e batata',
    active: true,
    recipe: [
      { ingredientId: '1', quantity: 180 },
      { ingredientId: '2', quantity: 150 },
      { ingredientId: '3', quantity: 40 },
    ],
  },
  {
    id: '2',
    name: 'Hambúrguer Artesanal',
    categoryId: '2',
    price: 28.0,
    description: 'Hambúrguer 180g com queijo, alface e tomate',
    active: true,
  },
  {
    id: '3',
    name: 'Refrigerante',
    categoryId: '3',
    price: 6.0,
    description: 'Lata 350ml',
    active: true,
  },
  {
    id: '4',
    name: 'Pudim',
    categoryId: '4',
    price: 12.0,
    description: 'Pudim de leite condensado',
    active: true,
  },
];

let mockOrders: Order[] = [
  {
    id: '1',
    number: 101,
    type: 'mesa',
    status: 'aberto',
    customerName: 'Cliente 1',
    tableNumber: '5',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Parmegiana',
        quantity: 2,
        unitPrice: 35.0,
        total: 70.0,
      },
    ],
    subtotal: 70.0,
    discount: 0,
    deliveryFee: 0,
    total: 70.0,
    createdAt: new Date().toISOString(),
    paid: false,
  },
  {
    id: '2',
    number: 102,
    type: 'delivery',
    status: 'aberto',
    customerName: 'Cliente 2',
    customerPhone: '11999999999',
    customerAddress: 'Rua ABC, 123',
    items: [
      {
        id: '1',
        productId: '2',
        productName: 'Hambúrguer Artesanal',
        quantity: 1,
        unitPrice: 28.0,
        total: 28.0,
      },
    ],
    subtotal: 28.0,
    discount: 0,
    deliveryFee: 8.0,
    total: 36.0,
    createdAt: new Date().toISOString(),
    paid: false,
  },
];

const API_BASE_URL = import.meta.env.PROD
  ? 'https://restaurante-frontend-back.vercel.app'
  : 'http://localhost:3000';

const AUTH_TOKEN_COOKIE_NAME = 'auth_token';
const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

const setAuthTokenCookie = (token: string) => {
  if (typeof document === 'undefined') return;

  const secureFlag =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${AUTH_TOKEN_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secureFlag}`;
};

const clearAuthTokenCookie = () => {
  if (typeof document === 'undefined') return;

  const secureFlag =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secureFlag}`;
};

const getAuthTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
};

const buildApiHeaders = (includeAuth: boolean = true): HeadersInit => {
  const token = getAuthTokenFromCookie();

  return {
    'Content-Type': 'application/json',
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

let currentUser: User | null = null;

// Simulated API delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (userName: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: buildApiHeaders(),
      body: JSON.stringify({ userName, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }

    const data = (await response.json()) as {
      token?: string;
      user?: Partial<User>;
      id?: string | number;
      userName?: string;
      name?: string;
      role?: string;
    };

    const payloadUser = data.user ?? data;

    currentUser = {
      id: String(payloadUser.id ?? '1'),
      userName: payloadUser.userName ?? userName,
      name: payloadUser.name ?? 'Usuário',
      role: payloadUser.role ?? 'staff',
    };

    if (data.token) {
      setAuthTokenCookie(data.token);
    }

    return currentUser;
  },

  logout: async (): Promise<void> => {
    await delay();
    currentUser = null;
    clearAuthTokenCookie();
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay();
    return currentUser;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    await delay();
    return mockCategories;
  },

  getById: async (id: string): Promise<Category> => {
    await delay();
    const category = mockCategories.find((c) => c.id === id);
    if (!category) throw new Error('Categoria não encontrada');
    return category;
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    await delay();
    const newCategory = { ...data, id: Date.now().toString() };
    mockCategories.push(newCategory);
    return newCategory;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    await delay();
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Categoria não encontrada');
    mockCategories[index] = { ...mockCategories[index], ...data };
    return mockCategories[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    mockCategories = mockCategories.filter((c) => c.id !== id);
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    await delay();
    return mockProducts;
  },

  getById: async (id: string): Promise<Product> => {
    await delay();
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    await delay();
    const newProduct = { ...data, id: Date.now().toString() };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    await delay();
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    mockProducts[index] = { ...mockProducts[index], ...data };
    return mockProducts[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    mockProducts = mockProducts.filter((p) => p.id !== id);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (filters?: {
    type?: OrderType;
    status?: OrderStatus;
  }): Promise<Order[]> => {
    await delay();
    let filtered = [...mockOrders];
    if (filters?.type) {
      filtered = filtered.filter((o) => o.type === filters.type);
    }
    if (filters?.status) {
      filtered = filtered.filter((o) => o.status === filters.status);
    }
    return filtered;
  },

  getById: async (id: string): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  },

  create: async (data: Omit<Order, 'id' | 'number' | 'createdAt'>): Promise<Order> => {
    await delay();
    const newOrder: Order = {
      ...data,
      id: Date.now().toString(),
      number: Math.max(...mockOrders.map((o) => o.number), 100) + 1,
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    await delay();
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Pedido não encontrado');
    mockOrders[index] = { ...mockOrders[index], ...data };
    return mockOrders[index];
  },

  addItem: async (orderId: string, item: Omit<OrderItem, 'id'>): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Pedido não encontrado');

    const newItem: OrderItem = { ...item, id: Date.now().toString() };
    order.items.push(newItem);

    order.subtotal = order.items.reduce((sum, i) => sum + i.total, 0);
    order.total = order.subtotal - order.discount + order.deliveryFee;

    return order;
  },

  removeItem: async (orderId: string, itemId: string): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Pedido não encontrado');

    order.items = order.items.filter((i) => i.id !== itemId);
    order.subtotal = order.items.reduce((sum, i) => sum + i.total, 0);
    order.total = order.subtotal - order.discount + order.deliveryFee;

    return order;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');
    order.status = status;
    return order;
  },

  checkout: async (
    id: string,
    paymentMethod: PaymentMethod,
    discount: number = 0
  ): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');

    order.discount = discount;
    order.total = order.subtotal - order.discount + order.deliveryFee;
    order.paymentMethod = paymentMethod;
    order.paid = true;
    order.status = 'pago';

    return order;
  },

  cancel: async (id: string): Promise<Order> => {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');
    order.status = 'cancelado';
    return order;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay();

    const openOrders = mockOrders.filter((o) => !o.paid).length;
    const todayOrders = mockOrders.filter((o) => o.paid);
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const activeDeliveries = mockOrders.filter(
      (o) => o.type === 'delivery' && o.status !== 'pago' && o.status !== 'cancelado'
    ).length;

    const productCounts: Record<string, number> = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      openOrders,
      todaySales,
      activeDeliveries,
      topProducts,
      lowStockAlerts: [],
    };
  },
};

// Reports API
export const reportsApi = {
  getReport: async (startDate: string, endDate: string): Promise<ReportData> => {
    await delay();

    const orders = mockOrders.filter((o) => o.paid);
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { quantity: 0, revenue: 0 };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.total;
      });
    });

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const paymentStats: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.paymentMethod) {
        paymentStats[order.paymentMethod] = (paymentStats[order.paymentMethod] || 0) + order.total;
      }
    });

    const paymentMethods = Object.entries(paymentStats).map(([method, total]) => ({
      method,
      total,
    }));

    const cancellations = mockOrders.filter((o) => o.status === 'cancelado').length;

    return {
      totalSales,
      totalOrders,
      averageTicket,
      topProducts,
      paymentMethods,
      cancellations,
      lowStock: [],
    };
  },
};
