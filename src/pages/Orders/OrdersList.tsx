import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { ordersApi } from '../../services/api';
import type { Order, OrderType, OrderStatus } from '../../types';

const PAGE_SIZE = 30;

const orderTypeLabels: Record<OrderType, string> = {
  mesa: 'Mesa',
  balcao: 'Balcão',
  retirada: 'Retirada',
  delivery: 'Delivery',
};

const orderStatusLabels: Record<OrderStatus, string> = {
  aberto: 'Aberto',
  pago: 'Pago',
  cancelado: 'Cancelado',
};

const orderStatusColors: Record<OrderStatus, string> = {
  aberto: 'bg-yellow-100 text-yellow-800',
  pago: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800',
};

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState<OrderType | 'todos'>('todos');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('aberto');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filterType, filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterType !== 'todos') filters.type = filterType;
      if (filterStatus !== 'todos') filters.status = filterStatus;

      const data = await ordersApi.getAll(filters);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const pid = (order.publicId ?? order.number.toString()).toLowerCase();
        return (
          pid.includes(term) ||
          order.customerName.toLowerCase().includes(term) ||
          order.customerPhone?.includes(term)
        );
      }),
    [orders, searchTerm]
  );

  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleCount),
    [filteredOrders, visibleCount]
  );

  const hasMore = visibleCount < filteredOrders.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    if (loading || !hasMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || isLoadingMore) return;

        setIsLoadingMore(true);
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredOrders.length));
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 120);
      },
      {
        root: null,
        rootMargin: '220px 0px',
        threshold: 0,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [filteredOrders.length, hasMore, isLoadingMore, loading]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold mb-2">Pedidos</h1>
          <p className="text-gray-600">Gerencie todos os pedidos do restaurante</p>
        </div>
        <Link
          to="/pedidos/novo"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Novo Pedido</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="todos">Todos os tipos</option>
            <option value="retirada">Retirada</option>
            <option value="delivery">Delivery</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleOrders.map((order) => (
              <Link
                key={order._id}
                to={`/pedidos/${order._id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-600 font-semibold px-3 py-1 rounded-lg">
                      #{order.publicId ?? order.number}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        orderStatusColors[order.status]
                      }`}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">{order.customerName}</h3>
                  <p className="text-sm text-gray-600">{orderTypeLabels[order.type]}</p>
                  {order.tableNumber && (
                    <p className="text-sm text-gray-600">Mesa {order.tableNumber}</p>
                  )}
                  {order.customerPhone && (
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  )}
                </div>

                {/* Items Count */}
                <div className="text-sm text-gray-600 mb-4">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-lg font-semibold">R$ {order.total.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">
                {isLoadingMore ? 'Carregando mais pedidos...' : 'Role para carregar mais'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
