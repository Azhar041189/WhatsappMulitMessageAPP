import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Plus, Trash2, Download, Wand2, FileText, Users, UserPlus, Filter, CheckCircle2 } from 'lucide-react';
import { Contact } from '../types';
import { cleanContactsData } from '../services/geminiService';
import { formatPhone } from '../lib/utils';

interface ContactManagerProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  defaultCountryCode?: string;
}

const ContactManager: React.FC<ContactManagerProps> = ({ contacts, setContacts, defaultCountryCode = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newContacts: Contact[] = results.data.map((row: any, index) => {
          // Find phone number in various possible column names
          const phoneKey = Object.keys(row).find(k => 
            /phone|number|mobile|whatsapp|tel/i.test(k)
          );
          const nameKey = Object.keys(row).find(k => 
            /name|first|contact/i.test(k)
          );

          const rawPhone = phoneKey ? String(row[phoneKey]) : '';
          const formattedPhone = formatPhone(rawPhone, defaultCountryCode);

          return {
            id: `csv-${Date.now()}-${index}`,
            name: (nameKey ? row[nameKey] : 'Friend') || 'Friend',
            phone: formattedPhone,
            tags: [],
            ...row
          };
        }).filter((c: Contact) => c.phone && c.phone.length >= 8); // Basic validation

        if (newContacts.length === 0) {
          alert("No valid contacts found. Please ensure your CSV has a 'Phone' or 'Number' column.");
          return;
        }

        setContacts(prev => [...prev, ...newContacts]);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Phone,City,Tags\nJohn Doe,1234567890,New York,VIP\nJane Smith,0987654321,London,Lead";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "whatsapp_contacts_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const unique = contacts.filter(c => {
      if (seen.has(c.phone)) return false;
      seen.add(c.phone);
      return true;
    });
    setContacts(unique);
    alert(`Removed ${contacts.length - unique.length} duplicate contacts.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      parseFile(file);
    }
  };

  const clearContacts = () => {
    setContacts([]);
  };

  const addDummyData = () => {
    const dummy: Contact[] = [
      { id: '1', name: 'Alice Smith', phone: '15550101', city: 'New York', tags: ['VIP'] },
      { id: '2', name: 'Bob Jones', phone: '15550102', city: 'London', tags: ['Lead'] },
      { id: '3', name: 'Charlie Day', phone: '15550103', city: 'Philadelphia', tags: ['Customer'] },
    ];
    setContacts(prev => [...prev, ...dummy]);
  };

  const handleAIExtraction = async () => {
    const text = prompt("Paste your unstructured text (emails, messages, lists) containing contacts here:");
    if (!text) return;

    setIsProcessingAI(true);
    try {
      const extracted = await cleanContactsData(text);
      const newContacts = extracted.map((c, i) => ({
        id: `ai-${Date.now()}-${i}`,
        name: c.name,
        phone: formatPhone(c.phone, defaultCountryCode),
        tags: ['AI-Extracted']
      }));
      setContacts(prev => [...prev, ...newContacts]);
    } catch (e) {
      alert("Failed to extract contacts.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  const filteredContacts = filterTag 
    ? contacts.filter(c => c.tags?.includes(filterTag))
    : contacts;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Contacts</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your recipient list. Upload CSV or add manually.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={downloadTemplate}
            className="px-4 py-2 text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Template
          </button>
          <button 
            onClick={removeDuplicates}
            className="px-4 py-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg font-medium transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" /> Remove Duplicates
          </button>
          <button 
            onClick={addDummyData}
            className="px-4 py-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg font-medium transition-colors"
          >
            Load Sample
          </button>
          {contacts.length > 0 && (
            <button 
              onClick={clearContacts}
              className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">CSV files only (Auto-detects Name and Phone columns)</p>
          </div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm transition-all"
            >
              Select CSV File
            </button>
            <button
               onClick={handleAIExtraction}
               disabled={isProcessingAI}
               className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center"
            >
              {isProcessingAI ? (
                <span className="animate-pulse">Extracting...</span>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Paste & Extract
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Stats */}
      {contacts.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Tag:</span>
            <select 
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:ring-green-500"
            >
              <option value="">All Contacts</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Total: <strong>{contacts.length}</strong></span>
            {filterTag && <span>Filtered: <strong>{filteredContacts.length}</strong></span>}
          </div>
        </div>
      )}

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Other Data</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{contact.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{contact.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            {tag}
                          </span>
                        ))}
                        <button 
                          onClick={() => {
                            const tag = prompt("Enter tag name:");
                            if (tag) {
                              setContacts(prev => prev.map(c => 
                                c.id === contact.id ? { ...c, tags: [...(c.tags || []), tag] } : c
                              ));
                            }
                          }}
                          className="text-gray-400 hover:text-green-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(contact)
                          .filter(k => k !== 'id' && k !== 'name' && k !== 'phone' && k !== 'tags')
                          .map(k => (
                            <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              {k}: {contact[k]}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a CSV file or clearing filters.</p>
        </div>
      )}
    </div>
  );
};

export default ContactManager;