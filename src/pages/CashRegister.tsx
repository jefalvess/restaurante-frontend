import { useEffect, useState, FormEvent } from 'react';
import { cashRegisterApi } from '../services/api';
import type { CashRegister } from '../types';
import { DollarSign, TrendingDown, TrendingUp, Lock } from 'lucide-react';

export function CashRegisterPage() {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'sangria'>('entrada');
  const [initialAmount, setInitialAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  useEffect(() => {
    loadCashRegister();
  }, []);

  const loadCashRegister = async () => {
    setLoading(true);
    try {
      const data = await cashRegisterApi.getCurrent();
      setCashRegister(data);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCashRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const register = await cashRegisterApi.open(parseFloat(initialAmount));
      setCashRegister(register);
      setShowOpenModal(false);
      setInitialAmount('');
    } catch (error) {
      alert('Erro ao abrir caixa');
    }
  };

  const handleCloseCashRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await cashRegisterApi.close(parseFloat(finalAmount));
      setCashRegister(null);
      setShowCloseModal(false);
      setFinalAmount('');
    } catch (error) {
      alert('Erro ao fechar caixa');
    }
  };

  const handleAddMovement = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const updated = await cashRegisterApi.addMovement({
        type: movementType,
        amount: parseFloat(movementAmount),
        reason: movementReason,
      });
      setCashRegister(updated);
      setShowMovementModal(false);
      setMovementAmount('');
      setMovementReason('');
    } catch (error) {
      alert('Erro ao registrar movimentação');
    }
  };

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

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold mb-2">Caixa</h1>
        <p className="text-gray-600">Gerencie o caixa do restaurante</p>
      </div>

      {!cashRegister || cashRegister.closedAt ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-red-600" size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-4">Caixa Fechado</h2>
          <p className="text-gray-600 mb-8">Abra o caixa para começar o expediente</p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Abrir Caixa
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-600 text-sm mb-2">Valor Inicial</h3>
              <p className="text-2xl font-semibold">R$ {cashRegister.initialAmount.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-600 text-sm mb-2">Dinheiro</h3>
              <p className="text-2xl font-semibold">R$ {cashRegister.cashTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-600 text-sm mb-2">PIX</h3>
              <p className="text-2xl font-semibold">R$ {cashRegister.pixTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-600 text-sm mb-2">Cartão</h3>
              <p className="text-2xl font-semibold">R$ {cashRegister.cardTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg">Total de Vendas</span>
              <span className="text-3xl font-semibold">R$ {cashRegister.salesTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => {
                setMovementType('entrada');
                setShowMovementModal(true);
              }}
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-3"
            >
              <TrendingUp size={24} />
              <span>Registrar Entrada</span>
            </button>
            <button
              onClick={() => {
                setMovementType('sangria');
                setShowMovementModal(true);
              }}
              className="bg-orange-600 text-white p-6 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-3"
            >
              <TrendingDown size={24} />
              <span>Registrar Sangria</span>
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="bg-red-600 text-white p-6 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-3"
            >
              <Lock size={24} />
              <span>Fechar Caixa</span>
            </button>
          </div>

          {/* Movements History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Entradas</h2>
              {cashRegister.deposits.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma entrada registrada</p>
              ) : (
                <div className="space-y-3">
                  {cashRegister.deposits.map((deposit) => (
                    <div key={deposit.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{deposit.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(deposit.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-green-600 font-semibold">
                        + R$ {deposit.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Sangrias</h2>
              {cashRegister.withdrawals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma sangria registrada</p>
              ) : (
                <div className="space-y-3">
                  {cashRegister.withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{withdrawal.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(withdrawal.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-red-600 font-semibold">
                        - R$ {withdrawal.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Open Cash Register Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-semibold mb-6">Abrir Caixa</h2>
            <form onSubmit={handleOpenCashRegister}>
              <div className="mb-6">
                <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Inicial (R$)
                </label>
                <input
                  id="initialAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Cash Register Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-semibold mb-6">Fechar Caixa</h2>
            <form onSubmit={handleCloseCashRegister}>
              <div className="mb-6">
                <label htmlFor="finalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Final em Dinheiro (R$)
                </label>
                <input
                  id="finalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-semibold mb-6">
              {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Sangria'}
            </h2>
            <form onSubmit={handleAddMovement}>
              <div className="mb-4">
                <label htmlFor="movementAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  id="movementAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="movementReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <input
                  id="movementReason"
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white py-3 rounded-lg transition ${
                    movementType === 'entrada'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
