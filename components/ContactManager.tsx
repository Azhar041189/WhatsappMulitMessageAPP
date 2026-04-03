import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Plus, Trash2, Download, Wand2, FileText, Users } from 'lucide-react';
import { Contact } from '../types';
import { cleanContactsData } from '../services/geminiService';

interface ContactManagerProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const ContactManager: React.FC<ContactManagerProps> = ({ contacts, setContacts }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
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

          return {
            id: `csv-${Date.now()}-${index}`,
            name: (nameKey ? row[nameKey] : 'Friend') || 'Friend',
            phone: (phoneKey ? String(row[phoneKey]) : '').replace(/\D/g, ''),
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
    const csvContent = "Name,Phone,City\nJohn Doe,1234567890,New York\nJane Smith,0987654321,London";
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      parseFile(file);
    }
  };

  const clearContacts = () => {
    if (window.confirm('Are you sure you want to delete all contacts?')) {
      setContacts([]);
    }
  };

  const addDummyData = () => {
    const dummy: Contact[] = [
      { id: '1', name: 'Alice Smith', phone: '15550101', city: 'New York' },
      { id: '2', name: 'Bob Jones', phone: '15550102', city: 'London' },
      { id: '3', name: 'Charlie Day', phone: '15550103', city: 'Philadelphia' },
    ];
    setContacts(prev => [...prev, ...dummy]);
  };

  // Advanced: AI Extraction from Clipboard/Text
  const handleAIExtraction = async () => {
    const text = prompt("Paste your unstructured text (emails, messages, lists) containing contacts here:");
    if (!text) return;

    setIsProcessingAI(true);
    try {
      const extracted = await cleanContactsData(text);
      const newContacts = extracted.map((c, i) => ({
        id: `ai-${Date.now()}-${i}`,
        name: c.name,
        phone: c.phone
      }));
      setContacts(prev => [...prev, ...newContacts]);
    } catch (e) {
      alert("Failed to extract contacts.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
          <p className="text-gray-500 text-sm">Manage your recipient list. Upload CSV or add manually.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={downloadTemplate}
            className="px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Template
          </button>
          <button 
            onClick={addDummyData}
            className="px-4 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium transition-colors"
          >
            Load Sample
          </button>
          {contacts.length > 0 && (
            <button 
              onClick={clearContacts}
              className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">CSV files only (Must contain Name and Phone columns)</p>
          </div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex gap-2">
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

      {/* Contacts Table */}
      {contacts.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Data</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{contact.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Object.keys(contact)
                        .filter(k => k !== 'id' && k !== 'name' && k !== 'phone')
                        .map(k => (
                          <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            {k}: {contact[k]}
                          </span>
                        ))}
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
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            Showing {contacts.length} contacts
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No contacts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a CSV file.</p>
        </div>
      )}
    </div>
  );
};

export default ContactManager;