import React, { useState, useEffect, useCallback } from 'react';
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
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Newspaper,
  Info,
  Loader2
} from 'lucide-react';
import { getToken, getCurrentUser } from '../lib/apiClient';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  source: string;
  framework: string;
  region: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  publishedAt: string;
  url: string;
  urlToImage: string;
  impact: string;
}

function AlertsUpdatesPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';
  const [activeTab, setActiveTab] = useState('Alerts & Updates');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // News state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [complianceFrameworks, setComplianceFrameworks] = useState([
    { name: 'SOC2', enabled: true },
    { name: 'GDPR', enabled: true },
    { name: 'HIPAA', enabled: false },
    { name: 'PCI', enabled: true }
  ]);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle, active: true },
    { name: 'Settings', icon: Settings }
  ];

  const regions = ['All Regions', 'United States', 'European Union', 'India', 'Global'];

  const notifications = [
    { id: 1, title: 'New compliance requirement', message: 'SOC 2 Type II audit scheduled for next month', time: '2 hours ago', type: 'info' },
    { id: 2, title: 'Security alert', message: 'Unusual login activity detected', time: '4 hours ago', type: 'warning' },
    { id: 3, title: 'Task completed', message: 'Data encryption policy has been updated', time: '1 day ago', type: 'success' }
  ];

  // ── Fetch compliance news ──────────────────────────────────────────────────
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('You must be logged in to view compliance news.');
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({ region: selectedRegion });
      const res = await fetch(`${API_BASE}/compliance-news?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setNewsArticles(data.articles || []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance news.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // ── Filter by search query ─────────────────────────────────────────────────
  const filteredArticles = newsArticles.filter(article => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(q) ||
      article.description?.toLowerCase().includes(q) ||
      article.framework.toLowerCase().includes(q) ||
      article.source.toLowerCase().includes(q)
    );
  });

  // ── Regional summary derived from fetched news ─────────────────────────────
  const regionCounts = newsArticles.reduce<Record<string, { count: number; latest: string; flag: string }>>((acc, a) => {
    const key = a.region === 'EU' ? 'European Union'
      : a.region === 'US' ? 'United States'
      : a.region === 'UK' ? 'United Kingdom'
      : a.region === 'India' ? 'India'
      : 'Global';
    const flagMap: Record<string, string> = {
      'United States': '🇺🇸',
      'European Union': '🇪🇺',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Global': '🌐'
    };
    if (!acc[key]) acc[key] = { count: 0, latest: a.title, flag: flagMap[key] || '🌐' };
    acc[key].count++;
    return acc;
  }, {});

  const regionUpdates = Object.entries(regionCounts).map(([region, data]) => ({
    region,
    flag: data.flag,
    updateCount: data.count,
    latestUpdate: data.latest.length > 60 ? data.latest.slice(0, 60) + '…' : data.latest
  }));

  // ── Theme ──────────────────────────────────────────────────────────────────
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

  const toggleFramework = (frameworkName: string) => {
    setComplianceFrameworks(prev =>
      prev.map(fw => fw.name === frameworkName ? { ...fw, enabled: !fw.enabled } : fw)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
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
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex`}>
      {/* Sidebar */}
      <div className={`w-64 ${themeClasses.sidebarBg} border-r ${themeClasses.border} flex flex-col`}>
        <div className={`p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-3 text-lg font-semibold">AICON</span>
          </div>
        </div>

        <div className="flex-1 p-3">
          <div className="mb-4">
            <h3 className={`text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider mb-2`}>Navigation</h3>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.name === 'Dashboard') navigate('/dashboard');
                      else if (item.name === 'Compliance Map') navigate('/compliance-map');
                      else if (item.name === 'Documentation & Reports') navigate('/documentation-reports');
                      else if (item.name === 'AI Compliance Assistant') navigate('/ai-assistant');
                      else if (item.name === 'Certifications') navigate('/certifications');
                      else if (item.name === 'Settings') navigate('/settings');
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

        <div className={`p-3 border-t ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${themeClasses.textSecondary}`}>© 2025 AICON</span>
            <button onClick={() => navigate('/')} className={`${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`${themeClasses.bg} border-b ${themeClasses.border} px-6 py-3`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Alerts & Updates</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Stay informed about global compliance changes and their impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search compliance frameworks, documents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80 text-sm`}
                />
              </div>

              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${themeClasses.inputBg} ${themeClasses.hoverBg}`}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className={`relative p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 top-12 w-80 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                    <div className={`p-4 border-b ${themeClasses.border}`}><h3 className="font-semibold text-sm">Notifications</h3></div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b ${themeClasses.border} ${themeClasses.hoverBg}`}>
                          <h4 className="font-medium text-sm">{n.title}</h4>
                          <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>{n.message}</p>
                          <span className={`text-xs ${themeClasses.textSecondary} mt-2 block`}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                  <User className="w-5 h-5" />
                </button>
                {showProfile && (
                  <div className={`absolute right-0 top-12 w-48 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                      <p className="font-medium text-sm">{userDisplayName}</p>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{userEmail}</p>
                    </div>
                    <div className="p-2">
                      <button className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded`}>Profile Settings</button>
                      <button onClick={() => navigate('/')} className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded text-red-400`}>Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>

          {/* Auto-Alert Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-purple-400 mr-3" />
              <div>
                <h2 className="text-lg font-bold">Auto-Alert Settings</h2>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Configure automatic notifications for compliance framework updates</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {complianceFrameworks.map((framework, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium text-sm">{framework.name}</span>
                  <button
                    onClick={() => toggleFramework(framework.name)}
                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out ${framework.enabled ? 'bg-purple-600' : 'bg-gray-600'} rounded-full`}
                  >
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${framework.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live Compliance News */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Newspaper className="w-5 h-5 text-purple-400 mr-3" />
                <div>
                  <h2 className="text-lg font-bold">Live Compliance News</h2>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Real-time feed powered by NewsAPI.org
                    {lastRefreshed && (
                      <span className="ml-2">· Updated {lastRefreshed.toLocaleTimeString()}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                <button
                  onClick={fetchNews}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg text-sm transition-colors ${themeClasses.hoverBg} disabled:opacity-50`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {/* Region Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} ${themeClasses.hoverBg} transition-colors text-sm`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>{selectedRegion}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showRegionDropdown && (
                    <div className={`absolute right-0 top-12 w-48 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() => { setSelectedRegion(region); setShowRegionDropdown(false); }}
                          className={`w-full text-left px-4 py-3 ${themeClasses.hoverBg} transition-colors first:rounded-t-lg last:rounded-b-lg text-sm ${selectedRegion === region ? 'text-purple-400 font-medium' : ''}`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                <p className={`text-sm ${themeClasses.textSecondary}`}>Fetching latest compliance news…</p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className={`p-6 rounded-lg border ${themeClasses.border} ${themeClasses.taskItemBg}`}>
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Unable to load live news</h3>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>{error}</p>
                    {error.includes('NEWS_API_KEY') || error.includes('not configured') ? (
                      <div className={`text-xs ${themeClasses.textSecondary} space-y-1 p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <p className="font-semibold text-yellow-400">Setup required:</p>
                        <p>1. Get a free API key at <a href="https://newsapi.org/register" target="_blank" rel="noreferrer" className="text-purple-400 underline">newsapi.org/register</a></p>
                        <p>2. Add <code className="bg-black px-1 rounded">NEWS_API_KEY=your_key_here</code> to <code className="bg-black px-1 rounded">AICON Backend/.env</code></p>
                        <p>3. Restart the backend server</p>
                      </div>
                    ) : null}
                    <button onClick={fetchNews} className="mt-3 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Articles */}
            {!isLoading && !error && (
              <>
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <Newspaper className={`w-12 h-12 ${themeClasses.textSecondary} mx-auto mb-3`} />
                    <p className={`${themeClasses.textSecondary} text-sm`}>
                      {searchQuery ? `No articles matching "${searchQuery}"` : 'No articles found for this region.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`p-4 ${themeClasses.taskItemBg} rounded-lg border-l-4 border ${themeClasses.border} ${getPriorityBorder(article.priority)} overflow-hidden`}
                      >
                        <div className="flex gap-4">
                          {/* Article thumbnail */}
                          {article.urlToImage && (
                            <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden hidden sm:block">
                              <img
                                src={article.urlToImage}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${article.priority === 'high' ? 'text-red-500' : article.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{article.title}</h3>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${getPriorityColor(article.priority)}`}>
                                  {article.priority}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                                  {article.framework}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-600 text-white font-medium">
                                  {article.region}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            {article.description && (
                              <p className={`text-xs ${themeClasses.textSecondary} mb-2 line-clamp-2`}>
                                {article.description}
                              </p>
                            )}

                            {/* Impact box */}
                            <div className={`p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded mb-2`}>
                              <span className="font-medium text-xs">Impact: </span>
                              <span className={`text-xs ${themeClasses.textSecondary}`}>{article.impact}</span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center space-x-2 text-xs ${themeClasses.textSecondary}`}>
                                <span>{article.time}</span>
                                <span>·</span>
                                <span>{article.source}</span>
                              </div>
                              <div className="flex space-x-2">
                                {article.url && (
                                  <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full transition-colors flex items-center space-x-1"
                                  >
                                    <span>Read More</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full transition-colors">
                                  Take Action
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Regional Updates (derived from live news) */}
          {!isLoading && !error && regionUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {regionUpdates.slice(0, 3).map((region, index) => (
                <div key={index} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 text-center`}>
                  <div className="text-4xl mb-4">{region.flag}</div>
                  <h3 className="font-bold text-lg mb-2">{region.region}</h3>
                  <div className="text-2xl font-bold text-purple-400 mb-2">{region.updateCount} updates</div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-4 line-clamp-2`}>Latest: {region.latestUpdate}</p>
                  <button
                    onClick={() => { setSelectedRegion(region.region === 'United States' ? 'United States' : region.region === 'European Union' ? 'European Union' : 'Global'); }}
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View All Updates
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* Click-outside overlay */}
      {(showNotifications || showProfile || showRegionDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotifications(false); setShowProfile(false); setShowRegionDropdown(false); }}
        />
      )}
    </div>
  );
}

export default AlertsUpdatesPage;