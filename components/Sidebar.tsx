import React from 'react';
import { Users, MessageSquareText, Send, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  contactCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, contactCount }) => {
  const navItems = [
    { id: 'CONTACTS' as ViewState, label: 'Contacts', icon: Users, badge: contactCount },
    { id: 'MESSAGE' as ViewState, label: 'Compose', icon: MessageSquareText },
    { id: 'CAMPAIGN' as ViewState, label: 'Send Campaign', icon: Send },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-2 border-b border-gray-100">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          W
        </div>
        <span className="text-xl font-bold text-gray-800">WaBlast</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-green-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs text-green-800 font-bold mb-1 uppercase tracking-wider">How it works</p>
          <ul className="text-[10px] text-green-700 space-y-1 list-decimal list-inside">
            <li>Upload CSV in <strong>Contacts</strong></li>
            <li>Draft message in <strong>Compose</strong></li>
            <li>Click <strong>Send Next</strong> in Campaign</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800 font-bold mb-1 uppercase tracking-wider">No API Key Needed</p>
          <p className="text-[10px] text-blue-600">This app uses official WhatsApp links to send messages safely.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
