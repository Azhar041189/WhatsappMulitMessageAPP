import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContactManager from './components/ContactManager';
import MessageEditor from './components/MessageEditor';
import CampaignRunner from './components/CampaignRunner';
import { ViewState, Contact } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('CONTACTS');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState<string>('');

  // Extract available variables dynamically from contacts
  const getAvailableVariables = (): string[] => {
    if (contacts.length === 0) return ['name', 'phone'];
    // Get keys from first contact object, exclude internal ID
    return Object.keys(contacts[0]).filter(k => k !== 'id');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'CONTACTS':
        return <ContactManager contacts={contacts} setContacts={setContacts} />;
      case 'MESSAGE':
        return (
          <MessageEditor 
            template={template} 
            setTemplate={setTemplate} 
            availableVariables={getAvailableVariables()}
          />
        );
      case 'CAMPAIGN':
        return <CampaignRunner contacts={contacts} template={template} />;
      default:
        return <ContactManager contacts={contacts} setContacts={setContacts} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        contactCount={contacts.length}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
           {renderContent()}
        </div>
      </main>

      {/* Global Toast/Notification placeholder could go here */}
    </div>
  );
};

export default App;
