import React from 'react';
import { Users, MessageSquareText, Send, History, Settings, Moon, Sun, HelpCircle } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  contactCount: number;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, contactCount, darkMode, setDarkMode }) => {
  const navItems = [
    { id: 'CONTACTS' as ViewState, label: 'Contacts', icon: Users, badge: contactCount },
    { id: 'MESSAGE' as ViewState, label: 'Compose', icon: MessageSquareText },
    { id: 'CAMPAIGN' as ViewState, label: 'Send Campaign', icon: Send },
    { id: 'HISTORY' as ViewState, label: 'History', icon: History },
    { id: 'SETTINGS' as ViewState, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen border-r border-gray-200 dark:border-gray-800 flex flex-col fixed left-0 top-0 transition-colors duration-300">
      <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200 dark:shadow-none">
            W
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">WaBlast</span>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-sm">{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold ${
                currentView === item.id 
                  ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
            <p className="text-[10px] text-green-800 dark:text-green-300 font-bold uppercase tracking-wider">How it works</p>
          </div>
          <ul className="text-[10px] text-green-700 dark:text-green-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Upload CSV in <strong>Contacts</strong></li>
            <li>Draft message in <strong>Compose</strong></li>
            <li>Click <strong>Send Next</strong> in Campaign</li>
          </ul>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold mb-1 uppercase tracking-wider">No API Key Needed</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">This app uses official WhatsApp links to send messages safely.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
