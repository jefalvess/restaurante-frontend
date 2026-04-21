import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../services/api';
import type { ReportData } from '../types';
import { TrendingUp, DollarSign, ShoppingBag, XCircle, ShoppingCart } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PERIOD_OPTIONS = [
  { label: '24h', days: 1 },
  { label: '2 dias', days: 2 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
];

const toDateTimeLabel = (date: Date) => {
  const day = date.toLocaleDateString('pt-BR');
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${day} ${time}`;
};

const getPeriodRange = (days: number) => {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startLabel: toDateTimeLabel(start),
    endLabel: toDateTimeLabel(end),
  };
};

export function Reports() {
  const [activeTab, setActiveTab] = useState<'reports' | 'suggestions'>('reports');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodDays, setSelectedPeriodDays] = useState(7);
  const [{ startDate, endDate, startLabel, endLabel }, setDateRange] = useState(() =>
    getPeriodRange(7)
  );

  // Suggestions state
  const [suggestionPeriodDays, setSuggestionPeriodDays] = useState(7);
  const [suggestionsData, setSuggestionsData] = useState<any | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  useEffect(() => {
    setDateRange(getPeriodRange(selectedPeriodDays));
  }, [selectedPeriodDays]);

  useEffect(() => {
    if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab, suggestionPeriodDays]);

  const loadSuggestions = async () => {
    setSuggestionLoading(true);
    setSuggestionError(null);
    setSuggestionsData(null);
    const { startDate: s, endDate: e } = getPeriodRange(suggestionPeriodDays);
    try {
      const result = await reportsApi.getSuggestions(s, e);
      setSuggestionsData(result);
    } catch (err) {
      setSuggestionError(err instanceof Error ? err.message : 'Erro ao buscar sugestões');
    } finally {
      setSuggestionLoading(false);
    }
  };

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

  const paymentLabelMap: Record<string, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao: 'Cartão',
  };

  const allowedPaymentMethods = new Set(['dinheiro', 'pix', 'cartao']);

  const paymentChartData = reportData.paymentMethods
    .filter((pm) => allowedPaymentMethods.has(pm.method))
    .map((pm) => ({
      name: paymentLabelMap[pm.method] ?? pm.method,
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

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Relatórios
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'suggestions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart size={15} />
          Sugestões de Compra
        </button>
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-base mb-1">Período de análise</h2>
                <p className="text-sm text-gray-500">Com base nas vendas do período selecionado</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setSuggestionPeriodDays(option.days)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      suggestionPeriodDays === option.days
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {suggestionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {suggestionError}
            </div>
          )}

          {!suggestionsData && !suggestionLoading && !suggestionError && (
            <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <ShoppingCart size={40} />
              <p className="text-sm">Carregando sugestões de compra...</p>
            </div>
          )}

          {suggestionLoading && (
            <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Analisando vendas e gerando sugestões...</p>
            </div>
          )}

          {suggestionsData && !suggestionLoading && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-green-600" size={20} />
                </div>
                <h2 className="font-semibold text-lg">Sugestão de Compras</h2>
              </div>
              
              {/* Suggestion Content */}
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
                  {suggestionsData.suggestion.split('\n\n').map((paragraph: string, idx: number) => {
                    // Check if it's a markdown heading (starts with #, **, etc)
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={idx} className="font-semibold text-base mt-6 mb-3 text-gray-900">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // Check if it's a list with bullets
                    if (paragraph.includes('*   ')) {
                      const items = paragraph.split('\n').filter((line: string) => line.trim().startsWith('*'));
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-2 text-gray-700">
                          {items.map((item: string, itemIdx: number) => (
                            <li key={itemIdx} className="ml-2">
                              {item.replace('*   ', '').replace(/\*\*/g, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    // Regular paragraph
                    if (paragraph.trim()) {
                      return (
                        <p key={idx} className="text-gray-700">
                          {paragraph.trim().replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.days}
                onClick={() => setSelectedPeriodDays(option.days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriodDays === option.days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Período: <span className="font-medium">{startLabel}</span> até{' '}
            <span className="font-medium">{endLabel}</span>
          </div>
        </div>
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
        </>
      )}
    </div>
  );
}
