import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../services/api';
import type { ReportData } from '../types';
import { TrendingUp, DollarSign, ShoppingBag, XCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getReport(startDate, endDate);
      setReportData(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const paymentChartData = reportData.paymentMethods.map((pm) => ({
    name: pm.method === 'dinheiro' ? 'Dinheiro' : pm.method === 'pix' ? 'PIX' : 'Cartão',
    value: pm.total,
  }));

  const topProductsChartData = reportData.topProducts.slice(0, 5).map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    receita: p.revenue,
  }));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold mb-2">Relatórios</h1>
        <p className="text-gray-600">Análise de vendas e desempenho</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total de Vendas</h3>
          <p className="text-2xl font-semibold">R$ {reportData.totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total de Pedidos</h3>
          <p className="text-2xl font-semibold">{reportData.totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Ticket Médio</h3>
          <p className="text-2xl font-semibold">R$ {reportData.averageTicket.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Cancelamentos</h3>
          <p className="text-2xl font-semibold">{reportData.cancellations}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-6">Top 5 Produtos por Receita</h2>
          {topProductsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Bar dataKey="receita" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">Sem dados de vendas</p>
          )}
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-6">Formas de Pagamento</h2>
          {paymentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">Sem dados de pagamento</p>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Produtos Mais Vendidos</h2>
          {reportData.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700">Produto</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-700">Qtd</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-700">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="py-3 text-sm">{product.name}</td>
                      <td className="py-3 text-sm text-right">{product.quantity}</td>
                      <td className="py-3 text-sm text-right font-medium">
                        R$ {product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum produto vendido</p>
          )}
        </div>
      </div>
    </div>
  );
}
