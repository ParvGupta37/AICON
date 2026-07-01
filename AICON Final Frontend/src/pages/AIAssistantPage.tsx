import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  FileText, 
  Bot, 
  Award, 
  AlertTriangle, 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  MessageCircle,
  Send,
  Lightbulb,
  Sun,
  Moon,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { getCurrentUser, apiFetch } from '../lib/apiClient';

function AIAssistantPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';
  const [activeTab, setActiveTab] = useState('AI Compliance Assistant');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Document context state
  const [reports, setReports] = useState<any[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showPromptsDropdown, setShowPromptsDropdown] = useState(false);

  const activeReport = reports.find(r => r.id === activeReportId) || null;

  // Load user's reports on mount
  useEffect(() => {
    apiFetch('/reports')
      .then((data: any[]) => {
        setReports(data || []);
        if (data && data.length > 0) {
          setActiveReportId(data[0].id); // auto-select latest
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: "Hello! I'm your AI Compliance Assistant. I have access to your uploaded compliance documents. Ask me anything about your compliance status, issues, or how to improve your scores!",
      type: 'assistant' as 'assistant' | 'user'
    }
  ]);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot, active: true },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings }
  ];

  const quickPrompts = [
    'What are the critical issues in my document?',
    'Summarize my compliance scores',
    'What should I fix first to improve GDPR compliance?',
    'Explain the recommendations from my report',
    'What are the key requirements for HIPAA compliance?',
    'How can I improve my SOC 2 score?'
  ];

  const notifications = [
    {
      id: 1,
      title: 'New compliance requirement',
      message: 'SOC 2 Type II audit scheduled for next month',
      time: '2 hours ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'Security alert',
      message: 'Unusual login activity detected',
      time: '4 hours ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Task completed',
      message: 'Data encryption policy has been updated',
      time: '1 day ago',
      type: 'success'
    }
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  // Send message with report context
  const handleSendMessage = async (messageText?: string) => {
    const queryText = messageText || message.trim();
    if (!queryText) return;

    setChatError('');
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: queryText,
      type: 'user' as const
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const user = getCurrentUser();
      if (!user) throw new Error('User not authenticated. Please log in again.');

      // Include the active report ID so the backend injects document context
      const payload: { message: string; report_id?: string } = { message: queryText };
      if (activeReportId) payload.report_id = activeReportId;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const result = await apiFetch('/chat', {
          method: 'POST',
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const assistantMessage = {
          id: Date.now() + 1,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: result.response || 'No response received.',
          type: 'assistant' as const,
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') throw new Error('Request timed out.');
        throw fetchError;
      }
    } catch (error: any) {
      const msg = error?.message || 'Unknown error';
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Sorry, I encountered an error: ${msg}`,
        type: 'assistant' as const
      }]);
      setChatError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced handleQuickPrompt to use the same chat flow
  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    handleSendMessage(prompt);
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    border: isDarkMode ? 'border-gray-800' : 'border-gray-200',
    cardBg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    sidebarBg: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100',
    inputBg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    hoverBg: isDarkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-100',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    activeBg: isDarkMode ? 'bg-gray-800' : 'bg-gray-200',
    taskItemBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
  };

  return (
    <div className={`h-screen ${themeClasses.bg} ${themeClasses.text} flex overflow-hidden`}>
      {/* Sidebar */}
      <div className={`w-64 ${themeClasses.sidebarBg} border-r ${themeClasses.border} flex flex-col`}>
        {/* Logo */}
        <div className={`p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-3 text-lg font-semibold">AICON</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-3">
          <div className="mb-4">
            <h3 className={`text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider mb-2`}>
              Navigation
            </h3>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.name === 'Dashboard') {
                        navigate('/dashboard');
                      } else if (item.name === 'Compliance Map') {
                        navigate('/compliance-map');
                      } else if (item.name === 'Documentation & Reports') {
                        navigate('/documentation-reports');
                      } else if (item.name === 'Certifications') {
                        navigate('/certifications');
                      } else if (item.name === 'Alerts & Updates') {
                        navigate('/alerts-updates');
                      } else if (item.name === 'Settings') {
                        navigate('/settings');
                      }
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-normal rounded-lg transition-colors ${
                      isActive
                        ? `${themeClasses.activeBg} ${themeClasses.text}`
                        : `${themeClasses.textSecondary} hover:${themeClasses.text} ${themeClasses.hoverBg}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="truncate text-sm">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${themeClasses.textSecondary}`}>© 2025 AICON</span>
            <button
              onClick={() => navigate('/')}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className={`${themeClasses.bg} border-b ${themeClasses.border} px-6 py-3`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-[#A259FF]">AI Compliance Assistant</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Get instant compliance guidance and infrastructure analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search compliance frameworks, documents..."
                  className={`pl-10 pr-4 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder-${themeClasses.textSecondary} focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80 text-sm`}
                />
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${themeClasses.inputBg} ${themeClasses.hoverBg}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className={`relative p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </button>
                
                {showNotifications && (
                  <div className={`absolute right-0 top-12 w-80 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b ${themeClasses.border} ${themeClasses.hoverBg}`}>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>{notification.message}</p>
                          <span className={`text-xs ${themeClasses.textSecondary} mt-2 block`}>{notification.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
                >
                  <User className="w-5 h-5" />
                </button>
                
                {showProfile && (
                  <div className={`absolute right-0 top-12 w-48 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                      <p className="font-medium text-sm">{userDisplayName}</p>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{userEmail}</p>
                    </div>
                    <div className="p-2">
                      <button className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded`}>
                        Profile Settings
                      </button>
                      <button className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded`}>
                        Account Settings
                      </button>
                      <button 
                        onClick={() => navigate('/')}
                        className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded text-red-400`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* AI Assistant Content */}
        <main className={`flex-1 p-6 overflow-hidden ${themeClasses.bg} flex gap-6`}>
          {/* Chat Section */}
          <div className="flex-1 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg h-full flex flex-col shadow-sm`}
            >
              {/* Chat Header */}
              <div className={`p-4 border-b ${themeClasses.border} flex items-center justify-between`}>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 text-purple-400 mr-2" />
                  <h2 className="text-base font-semibold">Chat with AI Assistant</h2>
                  {isLoading && (
                    <Loader2 className="w-4 h-4 text-purple-400 ml-2 animate-spin" />
                  )}
                </div>
                {/* Active context badge */}
                {activeReport && (
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30">
                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium truncate max-w-[180px]">
                      Context: {activeReport.project_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Error banner */}
              {chatError && (
                <div className="p-4 bg-red-900/20 border-b border-red-500/30">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-red-400 text-sm">Error: {chatError}</span>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : `${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} ${themeClasses.text}`
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                        <p className={`text-xs mt-2 ${chat.type === 'user' ? 'text-purple-200' : themeClasses.textSecondary}`}>
                          {chat.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span className="text-sm">AI is analyzing your document…</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className={`p-4 border-t ${themeClasses.border}`}>
                {!activeReport && !loadingReports && reports.length === 0 && (
                  <p className={`text-xs ${themeClasses.textSecondary} mb-2 text-center`}>
                    💡 Upload a compliance document first to get document-aware answers.
                  </p>
                )}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={activeReport ? `Ask about "${activeReport.project_name}"…` : 'Ask about compliance…'}
                    className={`flex-1 px-4 py-3 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !message.trim()}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center justify-center ${
                      isLoading || !message.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
                    } text-white`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="w-80 space-y-6 overflow-y-auto h-full pr-1">

            {/* Document Context Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4 shadow-sm`}
            >
              <div className="flex items-center mb-3">
                <FileCheck2 className="w-4 h-4 text-purple-400 mr-2" />
                <h3 className="text-sm font-semibold">Active Document Context</h3>
              </div>

              {loadingReports ? (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Loading reports…</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-xs text-gray-400 space-y-2">
                  <p>No compliance reports found.</p>
                  <button
                    onClick={() => navigate('/setup')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Upload a document →
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                    className={`w-full text-left p-3 rounded-lg border ${themeClasses.border} ${themeClasses.taskItemBg} text-sm flex items-center justify-between`}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      {activeReport ? (
                        <>
                          <p className="font-medium truncate text-xs">{activeReport.project_name}</p>
                          <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{activeReport.industry} · {new Date(activeReport.created_at).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">No context selected</p>
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </button>

                  {showReportDropdown && (
                    <div className={`absolute top-full left-0 right-0 mt-1 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto`}>
                      <button
                        onClick={() => { setActiveReportId(null); setShowReportDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs ${themeClasses.hoverBg} ${!activeReportId ? 'text-purple-400' : ''}`}
                      >
                        No context (general chat)
                      </button>
                      {reports.map(r => (
                        <button
                          key={r.id}
                          onClick={() => { setActiveReportId(r.id); setShowReportDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs ${themeClasses.hoverBg} ${activeReportId === r.id ? 'text-purple-400 font-semibold' : ''}`}
                        >
                          <p className="truncate">{r.project_name}</p>
                          <p className={`${themeClasses.textSecondary}`}>{r.industry} · {new Date(r.created_at).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Scores preview */}
              {activeReport && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'SOC 2', score: activeReport.soc2_score },
                    { label: 'GDPR', score: activeReport.gdpr_score },
                    { label: 'HIPAA', score: activeReport.hipaa_score },
                    { label: 'PCI DSS', score: activeReport.pci_score },
                  ].map(({ label, score }) => (
                    <div key={label} className={`p-2 rounded-lg ${themeClasses.taskItemBg} text-center`}>
                      <p className="text-xs font-medium">{label}</p>
                      <p className={`text-sm font-bold ${ score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score != null ? `${score}%` : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Prompts Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4 shadow-sm relative`}
            >
              <div className="flex items-center mb-3">
                <Lightbulb className="w-4 h-4 text-purple-400 mr-2" />
                <h3 className="text-sm font-semibold">Quick Prompts</h3>
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPromptsDropdown(!showPromptsDropdown);
                    setShowReportDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} hover:${themeClasses.hoverBg} transition-colors text-xs`}
                >
                  <span className="truncate">Select a quick prompt...</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
                
                {showPromptsDropdown && (
                  <div className={`absolute top-11 left-0 w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50 overflow-hidden`}>
                    <div className="max-h-60 overflow-y-auto">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleQuickPrompt(prompt);
                            setShowPromptsDropdown(false);
                          }}
                          disabled={isLoading}
                          className={`w-full text-left px-4 py-2.5 hover:${themeClasses.hoverBg} transition-colors text-xs border-b last:border-b-0 ${themeClasses.border} disabled:opacity-50`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4 shadow-sm`}
            >
              <div className="flex items-center mb-3">
                <Bot className="w-4 h-4 text-purple-400 mr-2" />
                <h3 className="text-sm font-semibold">AI Status</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${chatError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="text-sm">{chatError ? 'Error' : activeReport ? 'Document context active' : 'Ready'}</span>
              </div>
              <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>
                {activeReport
                  ? `Answering questions about "${activeReport.project_name}" with full document context.`
                  : 'Select a document above for context-aware answers.'}
              </p>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showReportDropdown || showPromptsDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowReportDropdown(false);
            setShowPromptsDropdown(false);
          }}
        />
      )}
    </div>
  );
}

export default AIAssistantPage;