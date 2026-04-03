import React, { useState } from 'react';
import { Sparkles, MessageSquare, Copy, RefreshCw, Save, Trash2, Plus, HelpCircle } from 'lucide-react';
import { generateMessageDraft } from '../services/geminiService';
import { MessageTemplate } from '../types';

interface MessageEditorProps {
  templates: MessageTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  currentTemplateId: string;
  setCurrentTemplateId: (id: string) => void;
  availableVariables: string[];
}

const MessageEditor: React.FC<MessageEditorProps> = ({ 
  templates, 
  setTemplates, 
  currentTemplateId, 
  setCurrentTemplateId,
  availableVariables 
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const currentTemplate = templates.find(t => t.id === currentTemplateId) || templates[0];

  const updateCurrentTemplate = (text: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === currentTemplateId ? { ...t, text } : t
    ));
  };

  const updateCurrentTemplateName = (name: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === currentTemplateId ? { ...t, name } : t
    ));
  };

  const addNewTemplate = () => {
    const newId = `temp-${Date.now()}`;
    const newTemplate: MessageTemplate = {
      id: newId,
      name: `New Template ${templates.length + 1}`,
      text: ''
    };
    setTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplateId(newId);
  };

  const deleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      return;
    }
    const newTemplates = templates.filter(t => t.id !== id);
    setTemplates(newTemplates);
    if (currentTemplateId === id) {
      setCurrentTemplateId(newTemplates[0].id);
    }
  };

  const insertVariable = (variable: string) => {
    updateCurrentTemplate(currentTemplate.text + ` {${variable}} `);
  };

  const insertSpintax = () => {
    updateCurrentTemplate(currentTemplate.text + " {Hello|Hi|Greetings} ");
  };

  const insertConditional = () => {
    updateCurrentTemplate(currentTemplate.text + " {if city == 'New York'}Special offer for NY!{else}Check our global offers!{endif} ");
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const draft = await generateMessageDraft(aiPrompt, availableVariables);
      updateCurrentTemplate(draft);
    } catch (e) {
      alert("Failed to generate draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Compose Message</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create your campaign message template. Use variables to personalize.</p>
        </div>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
          title="Syntax Help"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 space-y-2 animate-slide-down">
          <p><strong>Variables:</strong> Use <code>{`{name}`}</code>, <code>{`{city}`}</code>, etc. based on your CSV columns.</p>
          <p><strong>Spintax:</strong> Use <code>{`{Hello|Hi|Hey}`}</code> to randomly pick one word for each recipient.</p>
          <p><strong>Conditionals:</strong> Use <code>{`{if field == 'value'}...{else}...{endif}`}</code> for dynamic content.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Editor Column */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Template Selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {templates.map(t => (
              <div key={t.id} className="flex items-center group">
                <button
                  onClick={() => setCurrentTemplateId(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    currentTemplateId === t.id 
                      ? 'bg-green-600 text-white border-green-600 shadow-md' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
                  }`}
                >
                  {t.name}
                </button>
                {templates.length > 1 && (
                  <button 
                    onClick={(e) => deleteTemplate(e, t.id)}
                    className={`ml-1 p-1 rounded-md transition-all ${
                      currentTemplateId === t.id 
                        ? 'text-green-100 hover:bg-green-500' 
                        : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    } ${currentTemplateId === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addNewTemplate}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex-1 flex flex-col">
            <div className="mb-4 space-y-3">
              <input 
                type="text"
                value={currentTemplate.name}
                onChange={(e) => updateCurrentTemplateName(e.target.value)}
                className="w-full text-lg font-semibold bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white p-0"
                placeholder="Template Name"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">Variables:</span>
                {availableVariables.map(v => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="px-2 py-1 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] rounded-md border border-green-200 dark:border-green-800 transition-colors"
                  >
                    {`{${v}}`}
                  </button>
                ))}
                <button
                  onClick={insertSpintax}
                  className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] rounded-md border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  + Spintax
                </button>
                <button
                  onClick={insertConditional}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[10px] rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  + Conditional
                </button>
              </div>
            </div>
            
            <textarea
              value={currentTemplate.text}
              onChange={(e) => updateCurrentTemplate(e.target.value)}
              placeholder="Hi {name}, checkout our new offer..."
              className="flex-1 w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-sans text-gray-700 dark:text-gray-200"
            />
            
            <div className="mt-3 flex justify-between items-center text-[10px] text-gray-400">
              <div className="flex space-x-4">
                <span>{currentTemplate.text.length} characters</span>
                <span>~ {Math.ceil(currentTemplate.text.length / 160)} SMS units</span>
              </div>
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
            <p className="text-purple-100 text-xs mb-4">
              Describe what you want to say, and Gemini will draft a perfect WhatsApp message for you.
            </p>
            
            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Write a follow-up message for a potential client named John who asked about pricing..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg placeholder-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-white/30 text-white resize-none h-32"
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
              Preview
            </h3>
            <div className="bg-[#e5ddd5] dark:bg-gray-900 p-4 rounded-lg min-h-[100px] relative">
               <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm rounded-tl-none inline-block max-w-[90%] relative">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {currentTemplate.text.replace(/{(\w+)}/g, (match, p1) => {
                       return availableVariables.includes(p1) ? `[${p1.toUpperCase()}]` : match;
                    }) || <span className="text-gray-400 italic">Your message preview will appear here...</span>}
                  </p>
                  <span className="text-[10px] text-gray-400 block text-right mt-1">12:00 PM</span>
               </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">Note: Spintax and Conditionals will be resolved during the sending process.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
