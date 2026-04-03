import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, ExternalLink, AlertCircle, RefreshCcw } from 'lucide-react';
import { Contact, SendingStatus } from '../types';

interface CampaignRunnerProps {
  contacts: Contact[];
  template: string;
}

interface ProcessedItem extends Contact {
  status: SendingStatus;
  processedMessage: string;
  waLink: string;
}

const CampaignRunner: React.FC<CampaignRunnerProps> = ({ contacts, template }) => {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });

  useEffect(() => {
    // Initialize campaign items
    const newItems = contacts.map(contact => {
      // Process template variables
      let processedMessage = template;
      Object.keys(contact).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'gi');
        processedMessage = String(processedMessage).replace(regex, String(contact[key]));
      });

      // Simple phone cleaning - remove non-digits
      const cleanPhone = contact.phone.replace(/\D/g, '');
      
      const encodedMessage = encodeURIComponent(processedMessage);
      // Use universal wa.me link for better compatibility
      const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      return {
        ...contact,
        status: SendingStatus.PENDING,
        processedMessage,
        waLink
      };
    });

    setItems(newItems);
    setProgress({ sent: 0, total: newItems.length });
  }, [contacts, template]);

  const markAsSent = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: SendingStatus.SENT };
      }
      return item;
    }));
  };

  const handleSendClick = (item: ProcessedItem) => {
    // Open WhatsApp in new tab
    window.open(item.waLink, '_blank');
    markAsSent(item.id);
  };

  const handleBulkSend = () => {
    const pendingItems = items.filter(i => i.status === SendingStatus.PENDING);
    if (pendingItems.length === 0) {
      alert('All messages have been sent!');
      return;
    }

    // Open the first pending item
    handleSendClick(pendingItems[0]);
  };

  const resetCampaign = () => {
    if (window.confirm('Reset all statuses to Pending?')) {
      setItems(prev => prev.map(item => ({ ...item, status: SendingStatus.PENDING })));
    }
  };

  const sentCount = items.filter(i => i.status === SendingStatus.SENT).length;
  const progressPercentage = items.length > 0 ? (sentCount / items.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Send Campaign</h2>
          <p className="text-gray-500 text-sm">Review your messages and send them one by one.</p>
        </div>
        <div className="flex items-center space-x-4">
          {sentCount > 0 && (
            <button 
              onClick={resetCampaign}
              className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Reset All
            </button>
          )}
          <div className="flex items-center space-x-4 bg-white p-2 px-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="pr-4 border-r border-gray-100">
              <span className="block text-xs text-gray-500 uppercase font-bold">Total</span>
              <span className="text-xl font-bold text-gray-800">{items.length}</span>
            </div>
            <div className="pl-4">
               <span className="block text-xs text-gray-500 uppercase font-bold">Sent</span>
               <span className="text-xl font-bold text-green-600">{sentCount}</span>
            </div>
          </div>
          
          {items.length > 0 && sentCount < items.length && (
            <button
              onClick={handleBulkSend}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center animate-pulse"
            >
              Send Next <Send className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-green-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Message Preview</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={item.status === SendingStatus.SENT ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-xs" title={item.processedMessage}>
                      {item.processedMessage}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === SendingStatus.SENT ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <RefreshCcw className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status !== SendingStatus.SENT ? (
                      <button
                        onClick={() => handleSendClick(item)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Send <Send className="ml-1.5 w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendClick(item)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors opacity-50 hover:opacity-100"
                      >
                        Resend <ExternalLink className="ml-1.5 w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No contacts to display. Go to the Contacts tab to add recipients.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {items.length > 0 && (
         <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
               <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
               <h4 className="text-lg font-semibold text-blue-900">Bulk Sending Instructions</h4>
               <ul className="text-sm text-blue-800 mt-2 space-y-2 list-disc list-inside">
                  <li>Click <strong>"Send Next"</strong> to open the next contact in WhatsApp.</li>
                  <li>WhatsApp Web/Desktop will open with the message pre-filled.</li>
                  <li>You must manually click the <strong>Send button</strong> in WhatsApp to finalize.</li>
                  <li>Come back to this app and click <strong>"Send Next"</strong> again for the next person.</li>
                  <li>This method is 100% safe and doesn't require a paid WhatsApp API key.</li>
               </ul>
            </div>
         </div>
      )}
    </div>
  );
};

export default CampaignRunner;
