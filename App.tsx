import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContactManager from './components/ContactManager';
import MessageEditor from './components/MessageEditor';
import CampaignRunner from './components/CampaignRunner';
import { ViewState, Contact, MessageTemplate, CampaignHistory } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('CONTACTS');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    { id: '1', name: 'Default Template', text: 'Hi {name}, hope you are doing well!' }
  ]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('1');
  const [history, setHistory] = useState<CampaignHistory[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [settings, setSettings] = useState({ defaultCountryCode: '' });

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];

  // Load from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('wablast_contacts');
    const savedTemplates = localStorage.getItem('wablast_templates');
    const savedHistory = localStorage.getItem('wablast_history');
    const savedDarkMode = localStorage.getItem('wablast_darkmode');
    const savedSettings = localStorage.getItem('wablast_settings');

    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('wablast_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('wablast_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('wablast_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('wablast_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('wablast_settings', JSON.stringify(settings));
  }, [settings]);

  // Extract available variables dynamically from contacts
  const getAvailableVariables = (): string[] => {
    if (contacts.length === 0) return ['name', 'phone'];
    const firstContact = contacts[0];
    return Object.keys(firstContact).filter(k => k !== 'id' && k !== 'tags');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'CONTACTS':
        return (
          <ContactManager 
            contacts={contacts} 
            setContacts={setContacts} 
            defaultCountryCode={settings.defaultCountryCode}
          />
        );
      case 'MESSAGE':
        return (
          <MessageEditor 
            templates={templates}
            setTemplates={setTemplates}
            currentTemplateId={activeTemplateId}
            setCurrentTemplateId={setActiveTemplateId}
            availableVariables={getAvailableVariables()}
          />
        );
      case 'CAMPAIGN':
        return (
          <CampaignRunner 
            contacts={contacts} 
            template={activeTemplate} 
            onCampaignFinish={(historyItem) => {
              setHistory(prev => [historyItem, ...prev]);
            }}
          />
        );
      case 'HISTORY':
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Campaign History</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Template</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Stats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {history.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.templateName}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        <div className="text-green-600 dark:text-green-400">{item.sent} / {item.total} Sent</div>
                        {item.read !== undefined && (
                          <div className="text-blue-600 dark:text-blue-400 text-[10px]">{item.read} Read</div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No campaigns sent yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'SETTINGS':
        return (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Country Code
                </label>
                <input 
                  type="text"
                  value={settings.defaultCountryCode}
                  onChange={(e) => setSettings({ ...settings, defaultCountryCode: e.target.value })}
                  placeholder="e.g., 91"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically added to numbers without country codes.</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                  Clear All App Data
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <ContactManager contacts={contacts} setContacts={setContacts} />;
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        contactCount={contacts.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
