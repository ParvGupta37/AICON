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
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Sun,
  Moon,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { reportsApi, ComplianceReport } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClients';

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

function CertificationsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';
  const userInitials = userDisplayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          email: user.email ?? '',
          full_name: (user.user_metadata?.full_name as string) ?? '',
        });
      }
    });
  }, []);

  const [activeTab, setActiveTab] = useState('Certifications');
  const [selectedFramework, setSelectedFramework] = useState('SOC 2 Type II');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFrameworkDropdown, setShowFrameworkDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Dynamic state from backend
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award, active: true },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings }
  ];

  const frameworks = [
    'SOC 2 Type II',
    'GDPR',
    'HIPAA',
    'PCI DSS'
  ];

  const notifications = [
    { id: 1, title: 'New compliance requirement', message: 'SOC 2 Type II audit scheduled for next month', time: '2 hours ago', type: 'info' },
    { id: 2, title: 'Security alert', message: 'Unusual login activity detected', time: '4 hours ago', type: 'warning' },
    { id: 3, title: 'Task completed', message: 'Data encryption policy has been updated', time: '1 day ago', type: 'success' }
  ];

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getReports();
      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReportId(data[0].id);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-purple-500 text-white';
      case 'pending':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  const currentScore = getFrameworkScore(selectedFramework);

  // Generate description based on score
  const getProgressDescription = (score: number) => {
    if (!activeReport) return 'No compliance scan data found. Please run a scan on the Setup page.';
    if (score >= 90) {
      return `Outstanding progress! The audit findings show that you have resolved almost all requirements for this framework. Focus on keeping logs active.`;
    }
    if (score >= 70) {
      return `Good readiness status (${score}%). Focus on resolving the remaining medium/critical issues highlighted in your recommendations to prepare for final audit.`;
    }
    if (score >= 40) {
      return `Progressing (${score}%). Several compliance gaps and policies require attention. Review the parsed AI recommendations checklist to proceed.`;
    }
    return `Critical compliance issues detected. Readiness is low (${score}%). Immediate configuration of encryption, backups, and user management policies is required.`;
  };

  // Dynamically map checklist status using the score to make items realistic
  const getMappedItems = (items: string[], score: number) => {
    const total = items.length;
    return items.map((name, index) => {
      const threshold = (index / total) * 100;
      let status: 'completed' | 'in-progress' | 'pending' = 'pending';
      if (threshold < score - 15) {
        status = 'completed';
      } else if (threshold < score + 15) {
        status = 'in-progress';
      }
      return { name, status };
    });
  };

  // Standard checklists for each framework
  const getRequiredDocuments = (framework: string, score: number) => {
    const listMap: Record<string, string[]> = {
      'SOC 2 Type II': [
        'Information Security Policy',
        'Access Control Procedures',
        'Incident Response Plan',
        'Data Backup Procedures',
        'Vendor Management Policy',
        'Risk Assessment Report'
      ],
      'GDPR': [
        'Privacy Policy',
        'Data Processing Agreement (DPA)',
        'Data Retention Policy',
        'Data Breach Notification Procedures',
        'Data Protection Impact Assessment (DPIA)'
      ],
      'HIPAA': [
        'HIPAA Privacy & Security Policies',
        'Business Associate Agreements (BAA)',
        'Risk Analysis Document',
        'Technical Access Control Rules'
      ],
      'PCI DSS': [
        'Firewall Configuration Standards',
        'Cardholder Data Retention Policy',
        'Vulnerability Assessment Plan',
        'Security Incident Response Plan'
      ]
    };
    return getMappedItems(listMap[framework] || listMap['SOC 2 Type II'], score);
  };

  const getComplianceChecklist = (framework: string, score: number) => {
    const listMap: Record<string, string[]> = {
      'SOC 2 Type II': [
        'Establish security policies & procedures',
        'Configure multi-factor authentication (MFA)',
        'Set up continuous infrastructure monitoring',
        'Automate DB backup and verification tests',
        'Formulate formal incident response plans',
        'Conduct yearly risk assessment evaluations'
      ],
      'GDPR': [
        'Update public privacy & consent policies',
        'Implement Cookie & consent preference rules',
        'Implement dynamic data subject rights (DSR) options',
        'Configure data breach alert automation',
        'Designate a Data Protection Officer (DPO)'
      ],
      'HIPAA': [
        'Enforce user encryption policies for ePHI',
        'Document physical and technical safeguards',
        'Define role-based logical access boundaries',
        'Review systems audit tracking & log captures'
      ],
      'PCI DSS': [
        'Configure firewall policies around cardholder data',
        'Implement advanced TLS encryption for transactions',
        'Verify strong boundary level logical accesses',
        'Schedule regular infrastructure penetration scans'
      ]
    };
    return getMappedItems(listMap[framework] || listMap['SOC 2 Type II'], score);
  };

  // Dynamic AI Recommendations parsed from actual report
  const getDynamicAIRecommendations = () => {
    if (!activeReport) return [];

    const recsString = activeReport.recommendations || '';
    const output: { id: number; title: string; description: string; priority: string; action: string }[] = [];
    const lines = recsString.split('\n');
    let count = 0;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const match = line.match(/^(\d+)[\.\s]+(?:\*\*)?([^\*]+)(?:\*\*)?:?(.*)/);
      if (match) {
        count++;
        const title = match[2].trim();
        const detail = match[3].trim();
        
        // Filter recommendations relevant to framework keyword
        const cleanFramework = selectedFramework.replace(/\s+Type\s+\w+$/, '').toLowerCase(); // e.g. "soc 2" or "gdpr"
        const isMatch = title.toLowerCase().includes(cleanFramework) || 
                        detail.toLowerCase().includes(cleanFramework) ||
                        (cleanFramework === 'soc 2' && (title.toLowerCase().includes('mfa') || title.toLowerCase().includes('access') || title.toLowerCase().includes('audit') || title.toLowerCase().includes('log'))) ||
                        (cleanFramework === 'gdpr' && (title.toLowerCase().includes('privacy') || title.toLowerCase().includes('consent') || title.toLowerCase().includes('retention'))) ||
                        (cleanFramework === 'hipaa' && (title.toLowerCase().includes('phi') || title.toLowerCase().includes('encrypt') || title.toLowerCase().includes('safeguard'))) ||
                        (cleanFramework === 'pci dss' && (title.toLowerCase().includes('card') || title.toLowerCase().includes('firewall') || title.toLowerCase().includes('payment')));

        if (isMatch || count <= 3) {
          const priorities = ['high', 'medium', 'low'];
          output.push({
            id: count,
            title,
            description: detail || 'Review recommendations detail in your compliance audit report.',
            priority: priorities[(count - 1) % 3],
            action: 'Add to Roadmap'
          });
        }
      }
    }

    if (output.length > 0) return output;

    // Fallback based on score
    return [
      {
        id: 1,
        title: `Remediate ${selectedFramework} Compliance Gaps`,
        description: `Your ${selectedFramework} score is ${currentScore}%. Address critical findings listed in your analysis report.`,
        priority: currentScore < 70 ? 'high' : 'medium',
        action: 'View Report'
      }
    ];
  };

  const dynamicRecs = getDynamicAIRecommendations();

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
    modalBg: isDarkMode ? 'bg-gray-900' : 'bg-white'
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
                      } else if (item.name === 'Compliance Map') {
                        navigate('/compliance-map');
                      } else if (item.name === 'Documentation & Reports') {
                        navigate('/documentation-reports');
                      } else if (item.name === 'AI Compliance Assistant') {
                        navigate('/ai-assistant');
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
              <h1 className="text-lg font-semibold">Certifications</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Track your progress toward compliance certifications</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Project/Scan Selector */}
              {reports.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProjectDropdown(!showProjectDropdown);
                      setShowFrameworkDropdown(false);
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
 
        {/* Main Body */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className={themeClasses.textSecondary}>Loading compliance scanner data...</p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-lg border-gray-800">
              <Award className={`w-16 h-16 ${themeClasses.textSecondary} mb-4`} />
              <h2 className="text-xl font-bold mb-2">No Certifications Tracked</h2>
              <p className={`text-sm ${themeClasses.textSecondary} max-w-sm mb-6 leading-relaxed`}>
                Upload and scan a project compliance document to map audit checklists and view dynamically generated recommendations.
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
              {/* Framework Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
              >
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 text-purple-400 mr-3" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">Select Compliance Framework</h2>
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFrameworkDropdown(!showFrameworkDropdown);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} ${themeClasses.hoverBg} transition-colors text-sm`}
                  >
                    <span>{selectedFramework}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showFrameworkDropdown && (
                    <div className={`absolute top-12 left-0 w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl z-50 overflow-hidden`}>
                      {frameworks.map((framework) => (
                        <button
                          key={framework}
                          onClick={() => {
                            setSelectedFramework(framework);
                            setShowFrameworkDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:${themeClasses.hoverBg} transition-colors text-sm block ${selectedFramework === framework ? 'text-purple-400 font-semibold' : ''}`}
                        >
                          {framework}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Certification Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
              >
                <div className="flex items-center mb-6">
                  <Award className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <h2 className="text-lg font-bold">{selectedFramework} Certification</h2>
                    <p className={`text-xs ${themeClasses.textSecondary}`}>AI-analyzed status and progress tracking for {activeReport?.project_name}</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-4">Completion Progress</h3>
                  <div className="flex flex-col sm:flex-row items-center">
                    <div className="relative w-24 h-24 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={isDarkMode ? "#1f2937" : "#E5E7EB"}
                          strokeWidth="2.5"
                        />
                        <motion.path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                          strokeDasharray={`${currentScore}, 100`}
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: `${currentScore}, 100` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-purple-400">{currentScore}%</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className={`${themeClasses.textSecondary} mb-4 text-xs leading-relaxed max-w-xl`}>
                        {getProgressDescription(currentScore)}
                      </p>
                      <button 
                        onClick={() => setShowRecommendations(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2 rounded-lg font-medium transition-all text-xs"
                      >
                        View AI Recommendations ({dynamicRecs.length})
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Documents and Checklist Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Required Documents */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-purple-400 mr-2" />
                      <h3 className="text-sm font-semibold">Required Documents</h3>
                    </div>
                    <button
                      onClick={() => setShowDocuments(!showDocuments)}
                      className={`text-xs ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
                    >
                      {showDocuments ? 'Hide' : 'Show All'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {getRequiredDocuments(selectedFramework, currentScore).slice(0, showDocuments ? undefined : 3).map((doc, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-100'} rounded-lg border ${themeClasses.border}`}>
                        <div className="flex items-center min-w-0">
                          {getStatusIcon(doc.status)}
                          <span className="ml-3 text-xs truncate">{doc.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Compliance Checklist */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}
                >
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
                    <h3 className="text-sm font-semibold">Compliance Checklist</h3>
                  </div>

                  <div className="space-y-3">
                    {getComplianceChecklist(selectedFramework, currentScore).map((item, index) => (
                      <div key={index} className={`flex items-center p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-100'} rounded-lg border ${themeClasses.border}`}>
                        {getStatusIcon(item.status)}
                        <span className={`ml-3 text-xs ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* AI Recommendations Modal */}
      <AnimatePresence>
        {showRecommendations && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`${themeClasses.modalBg} border ${themeClasses.border} rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              <div className={`p-6 border-b ${themeClasses.border} flex items-center justify-between`}>
                <div>
                  <h3 className="text-lg font-bold">AI Certification Recommendations</h3>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>
                    Tailored fixes to advance your {selectedFramework} status on project {activeReport?.project_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-gray-800 rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {dynamicRecs.map((rec) => (
                  <div key={rec.id} className={`p-4 ${themeClasses.cardBg} rounded-lg border ${themeClasses.border} flex items-start justify-between gap-4`}>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1.5">{rec.title}</h4>
                      <p className={`text-xs leading-relaxed ${themeClasses.textSecondary}`}>{rec.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-500/20' : 
                        rec.priority === 'medium' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/20' : 
                        'bg-green-950/40 text-green-400 border border-green-500/20'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showFrameworkDropdown || showProjectDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowFrameworkDropdown(false);
            setShowProjectDropdown(false);
          }}
        />
      )}
    </div>
  );
}

export default CertificationsPage;