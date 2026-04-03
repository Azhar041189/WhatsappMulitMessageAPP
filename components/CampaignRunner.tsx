import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, ExternalLink, AlertCircle, RefreshCcw, Save, History, Eye, CheckCheck } from 'lucide-react';
import { Contact, SendingStatus, MessageTemplate, CampaignHistory } from '../types';
import { parseSpintax, parseConditionals } from '../lib/utils';

interface CampaignRunnerProps {
  contacts: Contact[];
  template: MessageTemplate;
  onCampaignFinish?: (history: CampaignHistory) => void;
}

interface ProcessedItem extends Contact {
  status: SendingStatus;
  processedMessage: string;
  waLink: string;
  readAt?: string;
}

const CampaignRunner: React.FC<CampaignRunnerProps> = ({ contacts, template, onCampaignFinish }) => {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [campaignName, setCampaignName] = useState(`Campaign ${new Date().toLocaleDateString()}`);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Initialize campaign items
    const newItems = contacts.map(contact => {
      // 1. Resolve Spintax
      let processedMessage = parseSpintax(template.text);
      
      // 2. Resolve Conditionals
      processedMessage = parseConditionals(processedMessage, contact);

      // 3. Process template variables
      Object.keys(contact).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'gi');
        processedMessage = String(processedMessage).replace(regex, String(contact[key]));
      });

      // 4. Clean phone number
      const cleanPhone = contact.phone.replace(/\D/g, '');
      
      const encodedMessage = encodeURIComponent(processedMessage);
      const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      return {
        ...contact,
        status: SendingStatus.PENDING,
        processedMessage,
        waLink
      };
    });

    setItems(newItems);
  }, [contacts, template]);

  const markAsSent = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: SendingStatus.SENT };
      }
      return item;
    }));
  };

  const markAsRead = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: SendingStatus.READ, readAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const handleSendClick = (item: ProcessedItem) => {
    window.open(item.waLink, '_blank');
    setActiveItemId(item.id);
    setShowConfirmModal(true);
  };

  const confirmSent = () => {
    if (activeItemId) {
      markAsSent(activeItemId);
      setShowConfirmModal(false);
      setActiveItemId(null);
    }
  };

  const handleBulkSend = () => {
    const pendingItems = items.filter(i => i.status === SendingStatus.PENDING);
    if (pendingItems.length === 0) {
      alert('All messages have been sent!');
      return;
    }
    handleSendClick(pendingItems[0]);
  };

  const resetCampaign = () => {
    setItems(prev => prev.map(item => ({ ...item, status: SendingStatus.PENDING })));
  };

  const saveToHistory = () => {
    if (!onCampaignFinish) return;
    
    const sentCount = items.filter(i => i.status === SendingStatus.SENT || i.status === SendingStatus.READ).length;
    const readCount = items.filter(i => i.status === SendingStatus.READ).length;
    const historyItem: CampaignHistory = {
      id: `hist-${Date.now()}`,
      name: campaignName,
      date: new Date().toISOString(),
      total: items.length,
      sent: sentCount,
      read: readCount,
      templateName: template.name
    };
    
    onCampaignFinish(historyItem);
    alert("Campaign saved to history!");
  };

  const sentCount = items.filter(i => i.status === SendingStatus.SENT || i.status === SendingStatus.READ).length;
  const readCount = items.filter(i => i.status === SendingStatus.READ).length;
  const progressPercentage = items.length > 0 ? (sentCount / items.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <input 
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-none focus:ring-0 p-0"
            placeholder="Campaign Name"
          />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review your messages and send them one by one.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {sentCount > 0 && (
            <button 
              onClick={saveToHistory}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" /> Save History
            </button>
          )}
          {sentCount > 0 && (
            <button 
              onClick={resetCampaign}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
            >
              Reset All
            </button>
          )}
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="pr-4 border-r border-gray-100 dark:border-gray-700">
              <span className="block text-[10px] text-gray-500 uppercase font-bold">Total</span>
              <span className="text-xl font-bold text-gray-800 dark:text-white">{items.length}</span>
            </div>
            <div className="pl-4 border-r border-gray-100 dark:border-gray-700 pr-4">
               <span className="block text-[10px] text-gray-500 uppercase font-bold">Sent</span>
               <span className="text-xl font-bold text-green-600 dark:text-green-400">{sentCount}</span>
            </div>
            <div className="pl-4">
               <span className="block text-[10px] text-gray-500 uppercase font-bold">Read</span>
               <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{readCount}</span>
            </div>
          </div>
          
          {items.length > 0 && sentCount < items.length && (
            <button
              onClick={handleBulkSend}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center animate-pulse"
            >
              Send Next <Send className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-green-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Final Step!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The message has been pre-filled in WhatsApp. <br />
                <strong>Please click the "Send" button in WhatsApp</strong> to finish.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmSent}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none transition-all"
              >
                I've Sent It!
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel / Not Sent
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recipient</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Message Preview</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.id} className={item.status === SendingStatus.SENT ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs" title={item.processedMessage}>
                      {item.processedMessage}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === SendingStatus.READ ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        <CheckCheck className="w-3 h-3 mr-1" /> Read
                      </span>
                    ) : item.status === SendingStatus.SENT ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                        <RefreshCcw className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {item.status === SendingStatus.SENT && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 dark:border-blue-600 text-xs font-medium rounded shadow-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          title="Confirm if the recipient has read the message"
                        >
                          Mark Read <Eye className="ml-1.5 w-3 h-3" />
                        </button>
                      )}
                      {item.status !== SendingStatus.SENT && item.status !== SendingStatus.READ ? (
                        <button
                          onClick={() => handleSendClick(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          Send <Send className="ml-1.5 w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendClick(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors opacity-50 hover:opacity-100"
                        >
                          Resend <ExternalLink className="ml-1.5 w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
               <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
               <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Bulk Sending Instructions</h4>
               <ul className="text-sm text-blue-800 dark:text-blue-400 mt-2 space-y-2 list-disc list-inside">
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
