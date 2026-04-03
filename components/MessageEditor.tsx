import React, { useState } from 'react';
import { Sparkles, MessageSquare, Copy, RefreshCw } from 'lucide-react';
import { generateMessageDraft } from '../services/geminiService';

interface MessageEditorProps {
  template: string;
  setTemplate: (text: string) => void;
  availableVariables: string[];
}

const MessageEditor: React.FC<MessageEditorProps> = ({ template, setTemplate, availableVariables }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const insertVariable = (variable: string) => {
    setTemplate(template + ` {${variable}} `);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    const draft = await generateMessageDraft(aiPrompt, availableVariables);
    setTemplate(draft);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Compose Message</h2>
        <p className="text-gray-500 text-sm">Create your campaign message template. Use variables to personalize.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Editor Column */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2 py-1">Variables:</span>
              {availableVariables.map(v => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-md border border-green-200 transition-colors"
                >
                  {`{${v}}`}
                </button>
              ))}
              {availableVariables.length === 0 && (
                <span className="text-xs text-gray-400 italic">Upload contacts to see variables (e.g. name, phone)</span>
              )}
            </div>
            
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hi {name}, checkout our new offer..."
              className="flex-1 w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-sans text-gray-700"
            />
            
            <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
              <span>{template.length} characters</span>
              <span>Formatting: *bold*, _italics_, ~strike~</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Column */}
        <div className="flex flex-col space-y-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold text-lg">AI Assistant</h3>
            </div>
            <p className="text-purple-100 text-sm mb-4">
              Describe what you want to say, and Gemini will draft a perfect WhatsApp message for you.
            </p>
            
            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Write a follow-up message for a potential client named John who asked about pricing..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg placeholder-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 text-white resize-none h-32"
              />
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-2 bg-white text-purple-700 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Draft
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
              Preview
            </h3>
            <div className="bg-[#e5ddd5] p-4 rounded-lg min-h-[100px] relative">
               <div className="bg-white p-3 rounded-lg shadow-sm rounded-tl-none inline-block max-w-[90%] relative">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {template.replace(/{(\w+)}/g, (match, p1) => {
                       return availableVariables.includes(p1) ? `[${p1.toUpperCase()}]` : match;
                    }) || <span className="text-gray-400 italic">Your message preview will appear here...</span>}
                  </p>
                  <span className="text-[10px] text-gray-400 block text-right mt-1">12:00 PM</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
