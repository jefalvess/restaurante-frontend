import { Outlet, Link, useLocation } from 'react-router';
import {
  ShoppingBag,
  Utensils,
  Tag,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useState } from 'react';

const navigation = [
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
  { name: 'Produtos', href: '/produtos', icon: Utensils },
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const visibleNavigation = navigation.filter((item) => {
    if (item.href === '/relatorios' && user?.role !== 'admin') {
      return false;
    }

    return true;
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleMenuTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (!mobileMenuOpen) return;
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    setIsDraggingMenu(true);
  };

  const handleMenuTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!mobileMenuOpen || touchStartXRef.current === null) return;

    const currentX = e.touches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = currentX - touchStartXRef.current;

    if (deltaX < 0) {
      setDragOffset(Math.max(deltaX, -256));
    }
  };

  const handleMenuTouchEnd = () => {
    if (!mobileMenuOpen) return;

    if (dragOffset <= -80) {
      setMobileMenuOpen(false);
    }

    touchStartXRef.current = null;
    setDragOffset(0);
    setIsDraggingMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <h1 className="font-semibold">Sistema Restaurante</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        onTouchStart={handleMenuTouchStart}
        onTouchMove={handleMenuTouchMove}
        onTouchEnd={handleMenuTouchEnd}
        className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
        ${isDraggingMenu ? 'transition-none' : 'transition-transform duration-300'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
        style={mobileMenuOpen && dragOffset !== 0 ? { transform: `translateX(${dragOffset}px)` } : undefined}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="font-semibold text-lg">Sistema Restaurante</h1>
            <p style={{ marginTop: '30px' }} className="text-sm text-gray-600">Usuario: {user?.name}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {visibleNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
