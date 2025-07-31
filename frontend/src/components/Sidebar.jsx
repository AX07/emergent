import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Bot,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/spending', icon: CreditCard, label: 'Spending' },
    { path: '/assets', icon: PiggyBank, label: 'Assets' },
    { path: '/ai', icon: Bot, label: 'AI Assistant' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-10">
      <div className="flex items-center gap-3 p-6 border-b border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-100">FinTrack AI</h1>
          <p className="text-xs text-gray-400">Smart Finance Manager</p>
        </div>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-500'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Quick Tip</p>
          <p className="text-xs text-gray-300">
            Use the AI Assistant to quickly add transactions with natural language.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;