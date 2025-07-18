import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, Archive, Settings, MapPin, Menu, X } from 'lucide-react';
import LanguageSelector from '../../shared/components/LanguageSelector';

const Layout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/planning', icon: Calendar, label: t('nav.planning') },
    { path: '/navigation', icon: MapPin, label: t('nav.navigate') },
    { path: '/archived', icon: Archive, label: t('nav.archived') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop & Mobile Overlay */}
        <nav className={`bg-white shadow-lg w-full md:w-64 md:min-h-screen ${
          isMobileMenuOpen 
            ? 'fixed inset-0 z-50 md:relative md:inset-auto' 
            : 'hidden md:block'
        }`}>
          {/* Desktop Header */}
          <div className="hidden md:block p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
            </div>
          </div>

          {/* Mobile Header in Overlay */}
          <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <LanguageSelector />
            </div>
          </div>
        </nav>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;