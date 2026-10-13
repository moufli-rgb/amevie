import React, { useState } from 'react';
import { useApp, PageRoute } from '../../context/AppContext';
import {
  Menu,
  X,
  Bell,
  Shield,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
  Bookmark,
  Settings,
  CreditCard,
  MessageCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    switchUserRole,
    setCurrentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    showToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const navLinks: { label: string; page: PageRoute }[] = [
    { label: 'Accueil', page: 'home' },
    { label: 'Prières', page: 'prayers' },
    { label: 'Ressources', page: 'resources' },
    { label: 'Communauté', page: 'community' },
    { label: 'Abonnements', page: 'pricing' },
    { label: 'WhatsApp & Email', page: 'connect' },
    { label: 'À propos', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNav = (page: PageRoute) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileDropdownOpen(false);
    showToast('Vous avez été déconnecté', 'info');
    setCurrentPage('login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Zone 1: Brand Wordmark & Identity */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Âme & Vie
              </span>
              <span className="text-[11px] tracking-wider text-amber-400 font-medium -mt-1 uppercase">
                Prières, Méditations & Élévation
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-2 relative cursor-pointer ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Auth & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Role Switcher (Admin / Membre Demo) */}
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => switchUserRole('member')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currentUser?.role === 'member'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Se connecter avec le profil Membre (Marie Dupont)"
              >
                Membre
              </button>
              <button
                onClick={() => switchUserRole('admin')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Se connecter avec le profil Guide Jean · Fondateur & Responsable de la communauté"
              >
                <Shield className="w-3 h-3" />
                Guide Jean
              </button>
            </div>

            {/* Direct Admin Dashboard Link if admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 border-amber-400/40 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Espace Admin
              </button>
            )}

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-3 z-50 text-slate-200">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-800">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/60 ${
                            !notif.isRead ? 'bg-slate-800/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-medium text-white mb-1">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
                          </div>
                          <p className="text-slate-300 text-xs line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Menu or Login CTA */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-slate-200">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                        {currentUser.role === 'admin' ? 'Guide Jean · Fondateur & Responsable de la communauté' : 'Membre'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNav('dashboard')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                        Espace Membre / Dashboard
                      </button>
                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        Mon profil
                      </button>
                      <button
                        onClick={() => handleNav('prayers')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        Prières quotidiennes
                      </button>
                      <button
                        onClick={() => handleNav('pricing')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Mon abonnement
                      </button>
                      <button
                        onClick={() => handleNav('settings')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Paramètres
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-amber-950/40 text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-800/80"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Dashboard Administrateur
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Commencer maintenant
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-1">
          {/* Quick role switch on mobile */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs">
            <span className="text-slate-400">Mode démo :</span>
            <div className="flex gap-2">
              <button
                onClick={() => switchUserRole('member')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  currentUser?.role === 'member'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Membre
              </button>
              <button
                onClick={() => switchUserRole('admin')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Guide Jean
              </button>
            </div>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === link.page
                  ? 'bg-amber-400/10 text-amber-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.label}
            </button>
          ))}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-2 cursor-pointer mt-2"
            >
              <Shield className="w-4 h-4" />
              Espace Administrateur
            </button>
          )}

          {currentUser && (
            <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Espace Membre / Dashboard
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Mon profil
              </button>
              <button
                onClick={() => handleNav('settings')}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Paramètres
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
