import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { getCurrentUser, apiFetch } from '../lib/apiClient';

interface ComplianceReport {
  id: string;
  file_name: string;
  project_name: string;
  industry: string;
  description: string;
  report: string;
  soc2_score: number | null;
  gdpr_score: number | null;
  hipaa_score: number | null;
  pci_score: number | null;
  critical_issues: number | null;
  moderate_issues: number | null;
  low_issues: number | null;
  recommendations: string;
  created_at: string;
}

function ComplianceMapPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const [activeTab, setActiveTab] = useState('Compliance Map');
  const [selectedIndustry, setSelectedIndustry] = useState('SaaS');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Dynamic state from backend
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield, active: true },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings }
  ];

  const industries = ['SaaS', 'FinTech', 'HealthTech'];

  const notifications = [
    { id: 1, title: 'New compliance requirement', message: 'SOC 2 Type II audit scheduled for next month', time: '2 hours ago', type: 'info' },
    { id: 2, title: 'Security alert', message: 'Unusual login activity detected', time: '4 hours ago', type: 'warning' },
    { id: 3, title: 'Task completed', message: 'Data encryption policy has been updated', time: '1 day ago', type: 'success' }
  ];

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ComplianceReport[]>('/reports');
      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReportId(data[0].id);
        // Sync tab with report's industry if valid
        const industry = data[0].industry;
        if (industries.includes(industry)) {
          setSelectedIndustry(industry);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch compliance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Update selected industry when report changes
  useEffect(() => {
    const report = reports.find(r => r.id === selectedReportId);
    if (report && industries.includes(report.industry)) {
      setSelectedIndustry(report.industry);
    }
  }, [selectedReportId, reports]);

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

  const handleRunComplianceScan = () => {
    navigate('/setup');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const handleChatbotClick = () => {
    setShowChatbot(!showChatbot);
  };

  const toggleFrameworkExpansion = (frameworkName: string) => {
    setExpandedFrameworks(prev => 
      prev.includes(frameworkName) 
        ? prev.filter(name => name !== frameworkName)
        : [...prev, frameworkName]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-purple-500 text-white';
      case 'needs-attention':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in progress';
      case 'needs-attention':
        return 'needs attention';
      default:
        return 'not started';
    }
  };

  // Find active report & score
  const activeReport = reports.find(r => r.id === selectedReportId) || null;

  const getFrameworkScore = (framework: string): number => {
    if (!activeReport) return 0;
    switch (framework) {
      case 'SOC 2 Type II':
        return activeReport.soc2_score ?? 0;
      case 'GDPR':
        return activeReport.gdpr_score ?? 0;
      case 'HIPAA':
        return activeReport.hipaa_score ?? 0;
      case 'PCI DSS':
        return activeReport.pci_score ?? 0;
      default:
        return 0;
    }
  };

  // Maps controls list to dynamic statuses based on framework score
  const getMappedControls = (controls: string[], score: number) => {
    const total = controls.length;
    return controls.map((name, index) => {
      const threshold = (index / total) * 100;
      let status: 'completed' | 'in-progress' | 'needs-attention' = 'needs-attention';
      let icon = AlertCircle;
      let color = 'text-red-500';

      if (threshold < score - 15) {
        status = 'completed';
        icon = CheckCircle;
        color = 'text-green-500';
      } else if (threshold < score + 15) {
        status = 'in-progress';
        icon = Clock;
        color = 'text-yellow-500';
      }

      return { name, status, icon, color };
    });
  };

  // Dynamic industry mapping structure
  const getComplianceData = () => {
    const frameworksByIndustry: Record<string, string[]> = {
      SaaS: ['SOC 2 Type II', 'GDPR'],
      FinTech: ['SOC 2 Type II', 'PCI DSS', 'GDPR'],
      HealthTech: ['HIPAA', 'SOC 2 Type II']
    };

    const colors: Record<string, string> = {
      'SOC 2 Type II': 'text-green-500',
      'GDPR': 'text-orange-500',
      'HIPAA': 'text-purple-500',
      'PCI DSS': 'text-yellow-500'
    };

    const progressColors: Record<string, string> = {
      'SOC 2 Type II': 'from-green-500 to-green-600',
      'GDPR': 'from-orange-500 to-orange-600',
      'HIPAA': 'from-purple-500 to-purple-600',
      'PCI DSS': 'from-yellow-500 to-yellow-600'
    };

    const controlsMap: Record<string, string[]> = {
      'SOC 2 Type II': ['Access Controls', 'Data Encryption', 'Incident Response', 'Risk Management', 'Vendor Management', 'Business Continuity'],
      'PCI DSS': ['Network Security', 'Data Protection', 'Access Management', 'Monitoring', 'Testing', 'Policy Management'],
      'GDPR': ['Data Processing', 'Consent Management', 'Data Subject Rights', 'Privacy by Design', 'Breach Notification', 'Data Protection Officer'],
      'HIPAA': ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards', 'Access Management', 'Audit Controls', 'Data Integrity']
    };

    const activeIndustryFrameworks = frameworksByIndustry[selectedIndustry] || frameworksByIndustry['SaaS'];

    return activeIndustryFrameworks.map(name => {
      const score = getFrameworkScore(name);
      const controls = getMappedControls(controlsMap[name] || [], score);
      const totalControls = controls.length;
      const completedControls = controls.filter(c => c.status === 'completed').length;

      let status = 'needs-attention';
      if (score >= 90) status = 'completed';
      else if (score >= 40) status = 'in-progress';

      return {
        name,
        completed: completedControls,
        total: totalControls,
        status,
        icon: Shield,
        color: colors[name] || 'text-purple-500',
        progressColor: progressColors[name] || 'from-purple-500 to-purple-600',
        controls
      };
    });
  };

  const dynamicComplianceData = getComplianceData();

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
                      } else if (item.name === 'Documentation & Reports') {
                        navigate('/documentation-reports');
                      } else if (item.name === 'AI Compliance Assistant') {
                        navigate('/ai-assistant');
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`${themeClasses.bg} border-b ${themeClasses.border} px-6 py-3`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Compliance Map</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Navigate compliance requirements by industry vertical</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Project Selection Dropdown */}
              {reports.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProjectDropdown(!showProjectDropdown);
                    }}
                    className={`flex items-center space-x-2 px-3 py-1.5 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} hover:${themeClasses.hoverBg} transition-colors text-sm font-medium`}
                  >
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                    <span>Project: {activeReport?.project_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showProjectDropdown && (
                    <div className={`absolute right-0 top-10 w-56 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50 overflow-hidden`}>
                      {reports.map((report) => (
                        <button
                          key={report.id}
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setShowProjectDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:${themeClasses.hoverBg} transition-colors text-sm block ${selectedReportId === report.id ? 'text-purple-400 font-semibold' : ''}`}
                        >
                          {report.project_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${themeClasses.inputBg} ${themeClasses.hoverBg}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRunComplianceScan}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Run Compliance Scan
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

              {/* Profile Avatar */}
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs transition-transform active:scale-95"
                >
                  {userInitials}
                </button>
                
                {showProfile && (
                  <div className={`absolute right-0 top-12 w-48 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50`}>
                    <div className={`p-4 border-b ${themeClasses.border}`}>
                      <p className="font-medium text-sm">{userDisplayName}</p>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{userEmail}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => navigate('/settings')}
                        className={`w-full text-left px-3 py-2 text-sm ${themeClasses.hoverBg} rounded`}
                      >
                        Profile Settings
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

        {/* Compliance Map Content */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className={themeClasses.textSecondary}>Loading compliance maps...</p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-lg border-gray-800">
              <Shield className={`w-16 h-16 ${themeClasses.textSecondary} mb-4`} />
              <h2 className="text-xl font-bold mb-2">No Compliance Map Available</h2>
              <p className={`text-sm ${themeClasses.textSecondary} max-w-sm mb-6 leading-relaxed`}>
                Please run a compliance scan on the Setup page to view industry maps and dynamic controls matrices.
              </p>
              <button
                onClick={() => navigate('/setup')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all text-sm"
              >
                Scan A Project
              </button>
            </div>
          ) : (
            <>
              {/* Industry Tabs */}
              <div className="mb-8">
                <div className={`flex space-x-1 ${themeClasses.cardBg} p-1 rounded-xl border ${themeClasses.border} w-fit`}>
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedIndustry === industry
                          ? `${themeClasses.activeBg} ${themeClasses.text}`
                          : `${themeClasses.textSecondary} hover:${themeClasses.text} ${themeClasses.hoverBg}`
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance Frameworks */}
              <div className="space-y-6">
                {dynamicComplianceData.map((framework) => {
                  const isExpanded = expandedFrameworks.includes(framework.name);
                  const score = getFrameworkScore(framework.name);

                  return (
                    <div
                      key={framework.name}
                      className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4`}
                    >
                      {/* Framework Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center min-w-0">
                          <Shield className={`w-5 h-5 mr-3 flex-shrink-0 ${framework.color}`} />
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">{framework.name}</h3>
                            <p className={`text-xs ${themeClasses.textSecondary} truncate`}>
                              {framework.completed}/{framework.total} controls passed • Score: {score}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadge(framework.status)}`}>
                            {getStatusText(framework.status)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-1.5`}>
                          <motion.div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${framework.progressColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* View Compliance Matrix Button */}
                      <button
                        onClick={() => toggleFrameworkExpansion(framework.name)}
                        className={`flex items-center justify-between w-full p-3 ${themeClasses.taskItemBg} rounded-lg transition-colors border ${themeClasses.border}`}
                      >
                        <span className="font-medium text-xs">View Compliance Matrix</span>
                        {isExpanded ? (
                          <ChevronUp className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                        ) : (
                          <ChevronDown className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                        )}
                      </button>

                      {/* Expanded Controls Matrix */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`mt-3 p-3 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border} grid grid-cols-1 md:grid-cols-2 gap-3`}>
                              {framework.controls.map((control) => {
                                const ControlIcon = control.icon;
                                return (
                                  <div
                                    key={control.name}
                                    className={`flex items-center justify-between p-3.5 ${themeClasses.cardBg} rounded-lg border ${themeClasses.border}`}
                                  >
                                    <div className="flex items-center min-w-0">
                                      <ControlIcon className={`w-4 h-4 mr-2.5 flex-shrink-0 ${control.color}`} />
                                      <span className="font-semibold text-xs truncate">{control.name}</span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                      control.status === 'completed' ? 'bg-green-950/40 text-green-400 border border-green-500/20' :
                                      control.status === 'in-progress' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/20' :
                                      'bg-red-950/40 text-red-400 border border-red-500/20'
                                    }`}>
                                      {control.status}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showProjectDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowProjectDropdown(false);
          }}
        />
      )}
    </div>
  );
}

export default ComplianceMapPage;