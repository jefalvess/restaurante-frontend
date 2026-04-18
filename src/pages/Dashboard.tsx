import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ShoppingBag,
  DollarSign,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Pedidos Abertos',
      value: stats.openOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      link: '/pedidos',
    },
    {
      title: 'Vendas do Dia',
      value: `R$ ${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/relatorios',
    },
    {
      title: 'Delivery Ativos',
      value: stats.activeDeliveries,
      icon: Truck,
      color: 'bg-orange-500',
      link: '/pedidos?type=delivery',
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do restaurante</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h2 className="font-semibold text-lg">Produtos Mais Vendidos</h2>
          </div>

          {stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {product.quantity} vendidos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada hoje</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/pedidos/novo"
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition text-center"
        >
          <ShoppingBag size={32} className="mx-auto mb-2" />
          <span className="font-medium">Novo Pedido</span>
        </Link>
        <Link
          to="/pedidos"
          className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition text-center"
        >
          <ShoppingBag size={32} className="mx-auto mb-2 text-gray-700" />
          <span className="font-medium">Ver Pedidos</span>
        </Link>
        <Link
          to="/relatorios"
          className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition text-center"
        >
          <TrendingUp size={32} className="mx-auto mb-2 text-gray-700" />
          <span className="font-medium">Relatórios</span>
        </Link>
      </div>
    </div>
  );
}
