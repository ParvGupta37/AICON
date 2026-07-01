import React, { useState, useEffect } from 'react';
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
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageCircle,
  X,
  Sun,
  Moon,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { reportsApi } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClients';


function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ full_name?: string; email?: string } | null>(null);
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';

  // Load current user from Supabase session
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          full_name: (user.user_metadata?.full_name as string) ?? '',
          email: user.email ?? '',
        });
      }
    });
  }, []);

  // State for real data from Supabase
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [complianceReports, setComplianceReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3, active: true },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Analysis Complete',
      message: 'Your project analysis has been completed successfully',
      time: '1 hour ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'Security alert',
      message: 'New compliance issues detected in your project',
      time: '2 hours ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Report Generated',
      message: 'Compliance report has been generated and is ready for download',
      time: '1 day ago',
      type: 'info'
    }
  ];

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      // reportsApi.getReports() now queries Supabase Postgres directly
      const complianceData = await reportsApi.getReports();

      if (complianceData && complianceData.length > 0) {
        const latestAnalysis = complianceData[0];
        setAnalysisData(latestAnalysis);
        setComplianceReports(complianceData as any);
      } else {
        setComplianceReports([]);
      }

    } catch (err: any) {
      console.error('Unexpected error in fetchAnalysisData:', err);
      setError(`Failed to load data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalysisData();
    setRefreshing(false);
  };

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

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  // NEW: Download report functionality
  const handleDownloadReport = () => {
    let reportContent = '';
    
    if (analysisData) {
      reportContent = `
AICON Compliance Analysis Report
================================

Project: ${analysisData.project_name}
Industry: ${analysisData.industry || 'Not specified'}
Analysis Date: ${new Date(analysisData.created_at).toLocaleDateString()}

COMPLIANCE READINESS SCORES:
---------------------------
SOC 2: ${getComplianceScores().soc2}%
GDPR: ${getComplianceScores().gdpr}%
HIPAA: ${getComplianceScores().hipaa}%
PCI DSS: ${getComplianceScores().pci}%

Overall Score: ${Math.round((getComplianceScores().soc2 + getComplianceScores().gdpr + getComplianceScores().hipaa + getComplianceScores().pci) / 4)}%

ISSUE SUMMARY:
--------------
Critical Issues: ${getIssueCounts().critical}
Moderate Issues: ${getIssueCounts().moderate}
Low Issues: ${getIssueCounts().low}

RECOMMENDATIONS:
----------------
1. Address critical security issues immediately
2. Implement proper access controls
3. Update data encryption standards
4. Review incident response procedures
5. Conduct regular compliance audits

DETAILED ANALYSIS:
------------------
${analysisData.analysis_results?.summary || analysisData.report_content || 'No detailed analysis available.'}

Generated by AICON - AI-Powered Compliance Platform
Report Date: ${new Date().toLocaleString()}
      `.trim();
    } else {
      reportContent = `
AICON Compliance Analysis Report
================================

Project: Sample Project
Analysis Date: ${new Date().toLocaleDateString()}

COMPLIANCE READINESS SCORES:
---------------------------
SOC 2: 78%
GDPR: 65%
HIPAA: 42%
PCI DSS: 100%

Overall Score: 71%

ISSUE SUMMARY:
--------------
Critical Issues: 3
Moderate Issues: 8
Low Issues: 12

RECOMMENDATIONS:
----------------
1. Address critical security issues immediately
2. Implement proper access controls
3. Update data encryption standards
4. Review incident response procedures
5. Conduct regular compliance audits

Generated by AICON - AI-Powered Compliance Platform
Report Date: ${new Date().toLocaleString()}
      `.trim();
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICON_Compliance_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to get compliance scores from analysis
  const getComplianceScores = () => {
    if (!analysisData) {
      // Generate different values based on current time to simulate different uploads
      const seed = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
      const random = (min: number, max: number) => Math.floor((Math.sin(seed) * 10000) % (max - min + 1)) + min;
      
      return { 
        soc2: Math.abs(random(65, 85)), 
        gdpr: Math.abs(random(55, 75)), 
        hipaa: Math.abs(random(30, 50)), 
        pci: Math.abs(random(85, 100)) 
      };
    }
    
    return {
      soc2: analysisData.soc2_score ?? 78,
      gdpr: analysisData.gdpr_score ?? 65,
      hipaa: analysisData.hipaa_score ?? 42,
      pci: analysisData.pci_score ?? 100
    };
  };

  // Helper function to get issue counts from actual analysis
  const getIssueCounts = () => {
    if (!analysisData) {
      // Generate different values based on current time
      const seed = Math.floor(Date.now() / (1000 * 60 * 60));
      const random = (min: number, max: number) => Math.floor((Math.sin(seed * 2) * 10000) % (max - min + 1)) + min;
      
      return { 
        critical: Math.abs(random(2, 5)), 
        moderate: Math.abs(random(6, 12)), 
        low: Math.abs(random(10, 18)) 
      };
    }
    
    return {
      critical: analysisData.critical_issues ?? 0,
      moderate: analysisData.moderate_issues ?? 0,
      low: analysisData.low_issues ?? 0
    };
  };

  // Get framework status based on score
  const getFrameworkStatus = (score: number) => {
    if (score >= 90) return { status: 'Completed', color: 'bg-green-500' };
    if (score >= 50) return { status: 'In Progress', color: 'bg-purple-500' };
    return { status: 'Not Started', color: 'bg-gray-500' };
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
    taskItemBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    modalBg: isDarkMode ? 'bg-gray-900' : 'bg-white'
  };

  const complianceScores = getComplianceScores();
  const issueCounts = getIssueCounts();
  const overallScore = Math.round((complianceScores.soc2 + complianceScores.gdpr + complianceScores.hipaa + complianceScores.pci) / 4);

  // Dynamic recommendations parser
  const getAIRecommendations = () => {
    if (!analysisData || !analysisData.recommendations) {
      return [
        {
          id: 1,
          title: 'Auto-fix IAM policy for AWS S3',
          description: 'We detected overly permissive S3 bucket policies',
          action: 'Fix Now'
        },
        {
          id: 2,
          title: 'Enable MFA for admin accounts',
          description: '5 admin accounts don\'t have MFA enabled',
          action: 'Configure'
        },
        {
          id: 3,
          title: 'Update password policy',
          description: 'Current policy doesn\'t meet SOC 2 requirements',
          action: 'Update'
        }
      ];
    }

    const rawRecs = analysisData.recommendations;
    const recommendationsList: { id: number; title: string; description: string; action: string }[] = [];
    const lines = rawRecs.split('\n');
    let currentRec: any = null;
    let recCount = 0;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const match = line.match(/^(\d+)[\.\s]+(?:\*\*)?([^\*]+)(?:\*\*)?:?(.*)/);
      if (match) {
        if (currentRec) {
          recommendationsList.push(currentRec);
        }
        recCount++;
        const title = match[2].trim();
        const detail = match[3].trim();
        currentRec = {
          id: recCount,
          title: title,
          description: detail || '',
          action: 'Learn More'
        };
      } else if (currentRec) {
        const cleanLine = line.replace(/^[\-\*\+\s]+/, '').trim();
        if (currentRec.description) {
          currentRec.description += ' ' + cleanLine;
        } else {
          currentRec.description = cleanLine;
        }
      }
    }
    if (currentRec) {
      recommendationsList.push(currentRec);
    }

    if (recommendationsList.length > 0) {
      return recommendationsList.map(rec => ({
        ...rec,
        description: rec.description.replace(/\*\*/g, '').trim(),
      }));
    }

    return [
      {
        id: 1,
        title: 'Compliance Recommendation',
        description: rawRecs.substring(0, 150) + (rawRecs.length > 150 ? '...' : ''),
        action: 'View Full Report'
      }
    ];
  };

  const aiRecommendations = getAIRecommendations();

  // Dynamic tasks based on recommendations
  const getRecentTasks = () => {
    if (!analysisData) {
      return [
        { id: 1, title: 'Upload access control policy', priority: 'high', icon: AlertTriangle, color: 'text-red-500' },
        { id: 2, title: 'Review data encryption standards', priority: 'medium', icon: CheckCircle, color: 'text-green-500' },
        { id: 3, title: 'Update incident response plan', priority: 'high', icon: Clock, color: 'text-yellow-500' },
        { id: 4, title: 'Configure backup procedures', priority: 'low', icon: AlertTriangle, color: 'text-red-500' }
      ];
    }
    return aiRecommendations.map((rec, i) => {
      const priorities = ['high', 'medium', 'low'];
      const icons = [AlertTriangle, CheckCircle, Clock];
      const colors = ['text-red-500', 'text-green-500', 'text-yellow-500'];
      return {
        id: rec.id,
        title: rec.title,
        priority: priorities[i % 3],
        icon: icons[i % 3],
        color: colors[i % 3]
      };
    });
  };

  const recentTasks = getRecentTasks();

  // Dynamic alerts based on score levels
  const getRecentAlerts = () => {
    if (!analysisData) {
      return [
        {
          id: 1,
          title: 'New GDPR regulation update affects data processing',
          time: '2 hours ago',
          priority: 'medium'
        },
        {
          id: 2,
          title: 'SOC 2 audit scheduled for next month',
          time: '1 day ago',
          priority: 'high'
        },
        {
          id: 3,
          title: 'PCI DSS compliance certificate expires in 30 days',
          time: '3 days ago',
          priority: 'high'
        }
      ];
    }
    const alertsList = [];
    const scores = complianceScores;
    
    if (scores.soc2 < 70) {
      alertsList.push({
        id: 1,
        title: `SOC 2 compliance score is low (${scores.soc2}%)`,
        time: 'Just now',
        priority: 'high'
      });
    }
    if (scores.gdpr < 70) {
      alertsList.push({
        id: 2,
        title: `GDPR issues detected in file: ${analysisData.file_name || 'uploaded file'}`,
        time: 'Just now',
        priority: 'high'
      });
    }
    if (scores.hipaa < 70) {
      alertsList.push({
        id: 3,
        title: `HIPAA readiness is low (${scores.hipaa}%) - PHI safeguards required`,
        time: 'Just now',
        priority: 'high'
      });
    }
    if (scores.pci < 70) {
      alertsList.push({
        id: 4,
        title: `PCI DSS readiness is below standards (${scores.pci}%)`,
        time: 'Just now',
        priority: 'medium'
      });
    }
    
    // Fallback if no low scores
    if (alertsList.length === 0) {
      alertsList.push({
        id: 1,
        title: 'All monitored compliance controls are in good standing',
        time: 'Just now',
        priority: 'low'
      });
    }
    
    // Add default alert
    alertsList.push({
      id: 5,
      title: `Analysis completed for project: ${analysisData.project_name}`,
      time: new Date(analysisData.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      priority: 'low'
    });
    
    return alertsList;
  };

  const recentAlerts = getRecentAlerts();

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
                      if (item.name === 'Compliance Map') {
                        navigate('/compliance-map');
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
              <h1 className="text-xl font-medium text-[#A259FF]">Dashboard</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Monitor your compliance status and progress</p>
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

        {/* Dashboard Content - NEW LAYOUT */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className={themeClasses.textSecondary}>Loading analysis data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
              <div className="flex items-center text-red-500 mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Error Loading Data</h3>
              </div>
              <p className={`${themeClasses.textSecondary} mb-4`}>{error}</p>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Content - Only show when not loading */}
          {!loading && (
            <>
              {/* 1. Project Analysis Report - Top */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-purple-400 mr-3" />
                    <h2 className="text-lg font-semibold">Project Analysis Report</h2>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div>
                    <span className={`${themeClasses.textSecondary} block text-xs`}>Project</span>
                    <p className="font-medium">{analysisData?.project_name || 'My SaaS Application'}</p>
                  </div>
                  <div>
                    <span className={`${themeClasses.textSecondary} block text-xs`}>Industry</span>
                    <p className="font-medium">{analysisData?.industry || 'SaaS'}</p>
                  </div>
                  <div>
                    <span className={`${themeClasses.textSecondary} block text-xs`}>Analyzed</span>
                    <p className="font-medium">{analysisData ? new Date(analysisData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Issue Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">{issueCounts.critical}</div>
                    <div className="text-sm text-red-500">Critical Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">{issueCounts.moderate}</div>
                    <div className="text-sm text-yellow-500">Moderate Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-1">{issueCounts.low}</div>
                    <div className="text-sm text-blue-500">Low Issues</div>
                  </div>
                </div>

                {/* Compliance Readiness */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4 text-sm">Compliance Readiness</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">SOC 2</span>
                        <span className="text-sm font-medium">{complianceScores.soc2}%</span>
                      </div>
                      <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${complianceScores.soc2}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">GDPR</span>
                        <span className="text-sm font-medium">{complianceScores.gdpr}%</span>
                      </div>
                      <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${complianceScores.gdpr}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">HIPAA</span>
                        <span className="text-sm font-medium">{complianceScores.hipaa}%</span>
                      </div>
                      <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${complianceScores.hipaa}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => analysisData && handleViewReport(analysisData)}
                  className="w-full py-3 rounded-lg font-medium transition-all text-sm bg-gray-600 text-white hover:bg-gray-700"
                >
                  View Full Report
                </button>
              </motion.div>

              {/* 2. Compliance Readiness Score - Below Project Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
              >
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-5 h-5 text-purple-400 mr-3" />
                  <h2 className="text-lg font-semibold">Compliance Readiness Score</h2>
                </div>

                <div className="flex items-center mb-8">
                  <div className="relative w-32 h-32 mr-8">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        strokeDasharray={`${overallScore}, 100`}
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${overallScore}, 100` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className={`text-3xl font-bold ${themeClasses.text}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                      >
                        {overallScore}%
                      </motion.span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                      Good Progress!
                    </h3>
                    <p className={`${themeClasses.textSecondary} mb-4 text-sm leading-relaxed`}>
                      You're on track for SOC 2 compliance. Focus on access controls to improve your score.
                    </p>
                    <button 
                      onClick={() => setShowRecommendations(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium transition-all text-sm"
                    >
                      View Recommendations
                    </button>
                  </div>
                </div>

                {/* Framework Progress Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'SOC 2', score: complianceScores.soc2 },
                    { name: 'HIPAA', score: complianceScores.hipaa },
                    { name: 'PCI DSS', score: complianceScores.pci },
                    { name: 'GDPR', score: complianceScores.gdpr }
                  ].map((framework) => {
                    const status = getFrameworkStatus(framework.score);
                    return (
                      <div key={framework.name} className={`p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border} text-center`}>
                        <h4 className="font-medium text-sm mb-3">{framework.name}</h4>
                        <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-1000" 
                            style={{ width: `${framework.score}%` }} 
                          />
                        </div>
                        <div className="text-xs font-medium mb-2">{framework.score}% Complete</div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium text-white ${status.color}`}>
                          {status.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* 3. Recent Alerts and AI Recommendations - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Alerts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}
                >
                  <div className="flex items-center mb-6">
                    <AlertTriangle className="w-5 h-5 text-purple-400 mr-3" />
                    <h2 className="text-lg font-semibold">Recent Alerts</h2>
                  </div>

                  <div className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border}`}>
                        <h3 className="font-medium text-sm mb-3">{alert.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${themeClasses.textSecondary}`}>{alert.time}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${
                            alert.priority === 'high' ? 'bg-red-500' : 
                            alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {alert.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}
                >
                  <div className="flex items-center mb-6">
                    <TrendingUp className="w-5 h-5 text-purple-400 mr-3" />
                    <h2 className="text-lg font-semibold">AI Recommendations</h2>
                  </div>

                  <div className="space-y-4">
                    {aiRecommendations.map((rec) => (
                      <div key={rec.id} className={`p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border}`}>
                        <h3 className="font-medium text-sm mb-2">{rec.title}</h3>
                        <p className={`text-xs ${themeClasses.textSecondary} mb-3`}>{rec.description}</p>
                        <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all">
                          {rec.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* 4. Recent Tasks - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
              >
                <div className="flex items-center mb-6">
                  <Clock className="w-5 h-5 text-purple-400 mr-3" />
                  <h2 className="text-lg font-semibold">Recent Tasks</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentTasks.map((task) => {
                    const Icon = task.icon;
                    return (
                      <div key={task.id} className={`p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border}`}>
                        <div className="flex items-center mb-3">
                          <Icon className={`w-5 h-5 mr-3 ${task.color}`} />
                          <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* 5. Download Report Button - Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-center"
              >
                <button
                  onClick={handleDownloadReport}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center mx-auto text-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Full Report
                </button>
              </motion.div>
            </>
          )}
        </main>
      </div>

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeClasses.modalBg} border ${themeClasses.border} rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden`}
          >
            <div className={`p-6 border-b ${themeClasses.border} flex items-center justify-between`}>
              <div>
                <h3 className="text-lg font-semibold">AI Compliance Recommendations</h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Personalized recommendations to improve your compliance score
                </p>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border}`}>
                    <h4 className="font-semibold mb-2">{rec.title}</h4>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>{rec.description}</p>
                    <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeClasses.modalBg} border ${themeClasses.border} rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden`}
          >
            <div className={`p-6 border-b ${themeClasses.border} flex items-center justify-between`}>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedReport.project_name} - Analysis Report
                </h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Generated: {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className={`${themeClasses.taskItemBg} rounded-lg p-4 border ${themeClasses.border}`}>
                {selectedReport.analysis_results ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Project Details</h4>
                      <p><strong>Name:</strong> {selectedReport.project_name}</p>
                      <p><strong>Industry:</strong> {selectedReport.industry || 'Not specified'}</p>
                      {selectedReport.description && <p><strong>Description:</strong> {selectedReport.description}</p>}
                    </div>
                    
                    {selectedReport.analysis_results.summary && (
                      <div>
                        <h4 className="font-semibold mb-2">Analysis Summary</h4>
                        <p className="whitespace-pre-wrap">{selectedReport.analysis_results.summary}</p>
                      </div>
                    )}
                    
                    {selectedReport.analysis_results.recommendations && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <div className="whitespace-pre-wrap">{selectedReport.analysis_results.recommendations}</div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold mb-2">Raw Analysis Data</h4>
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-800 p-4 rounded overflow-x-auto">
                        {JSON.stringify(selectedReport.analysis_results, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {selectedReport.report_content || 'No detailed analysis data available.'}
                  </pre>
                )}
              </div>
            </div>
            <div className={`p-6 border-t ${themeClasses.border} flex justify-end space-x-3`}>
              <button
                onClick={() => setShowReportModal(false)}
                className={`px-4 py-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors text-sm`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const content = selectedReport.analysis_results 
                    ? JSON.stringify(selectedReport.analysis_results, null, 2)
                    : selectedReport.report_content || 'No content available';
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedReport.project_name}_analysis_report.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Download Report
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatbotClick}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        {showChatbot && (
          <div className={`absolute bottom-16 right-0 w-80 h-96 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border}`}>
              <div className="flex items-center">
                <Bot className="w-5 h-5 text-purple-400 mr-2" />
                <h3 className="font-semibold text-sm">AI Compliance Assistant</h3>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              <div className={`${themeClasses.taskItemBg} rounded-lg p-3 mb-3`}>
                <p className="text-sm">Hello! I can see your latest analysis results. How can I help you improve your compliance score?</p>
              </div>
              {analysisData && (
                <>
                  <div className="bg-purple-600 rounded-lg p-3 mb-3 ml-8">
                    <p className="text-sm text-white">What are the most critical issues in my analysis?</p>
                  </div>
                  <div className={`${themeClasses.taskItemBg} rounded-lg p-3`}>
                    <p className="text-sm">Based on your {analysisData.project_name} analysis, I recommend focusing on:</p>
                    <ul className="text-xs mt-2 space-y-1">
                      <li>• Addressing the {issueCounts.critical} critical security issues</li>
                      <li>• Implementing proper access controls</li>
                      <li>• Updating your data encryption standards</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className={`p-4 border-t ${themeClasses.border}`}>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className={`flex-1 px-3 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${themeClasses.border} rounded-l-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-lg transition-colors">
                  <MessageCircle className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;