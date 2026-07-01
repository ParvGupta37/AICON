import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Filter,
  Calendar,
  Download,
  Eye,
  MessageCircle,
  X,
  ChevronDown,
  Sun,
  Moon,
  Loader2,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { getCurrentUser, storageApi, apiFetch } from '../lib/apiClient';

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

function DocumentationReportsPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userDisplayName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'user@example.com';
  const [activeTab, setActiveTab] = useState('Documentation & Reports');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('All Types');

  // Reports state
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload/Processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Modal state
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText, active: true },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings }
  ];

  const documentTypes = ['All Types', 'GDPR', 'SOC 2', 'HIPAA', 'PCI DSS', 'General'];

  const notifications = [
    { id: 1, title: 'New compliance requirement', message: 'SOC 2 Type II audit scheduled for next month', time: '2 hours ago', type: 'info' },
    { id: 2, title: 'Security alert', message: 'Unusual login activity detected', time: '4 hours ago', type: 'warning' },
    { id: 3, title: 'Task completed', message: 'Data encryption policy has been updated', time: '1 day ago', type: 'success' }
  ];

  // Fetch user's reports from backend
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      if (!user) {
        setError('You must be logged in to view documentation.');
        setLoading(false);
        return;
      }
      const data = await apiFetch('/reports');
      setReports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents.');
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

  const handleChatbotClick = () => {
    setShowChatbot(!showChatbot);
  };

  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload a document and trigger backend analysis
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const user = getCurrentUser();
    if (!user) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading file...');

    try {
      for (const file of files) {
        // Step 1: Upload the file
        setUploadStatus(`Uploading ${file.name}...`);
        const uploadResult = await storageApi.uploadFile(file);

        // Step 2: Trigger AI Analysis
        setUploadStatus(`Analyzing compliance in ${file.name}...`);
        const cleanedName = file.name.replace(/\.[^/.]+$/, ""); // strip extension for project name
        
        await apiFetch('/analyze-project', {
          method: 'POST',
          body: JSON.stringify({
            projectName: cleanedName,
            industry: 'SaaS', // default fallback
            description: `Uploaded from Document Manager on ${new Date().toLocaleDateString()}`,
            filePath: uploadResult.stored_path,
            user_id: user.id
          })
        });
      }

      setUploadStatus('Analysis complete!');
      // Refresh reports list
      await fetchReports();
    } catch (err: any) {
      console.error(err);
      alert(`Error during document upload/analysis: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download the AI Report content
  const handleDownloadDocument = (doc: ComplianceReport) => {
    const blob = new Blob([doc.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.project_name.replace(/\s+/g, '_')}_Compliance_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete a report
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      // In SQLite, deleting the report is simple. Let's send a DELETE or since we don't have a delete report endpoint, we can ignore delete or hide it.
      // Wait, there is delete-file in storageApi but not delete-report. We'll just hide the delete option or support it if needed.
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (score: number | null) => {
    if (score == null) return 'bg-gray-500 text-white';
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (score: number | null) => {
    if (score == null) return 'Pending';
    if (score >= 80) return 'Verified';
    if (score >= 50) return 'Needs Review';
    return 'Action Required';
  };

  // Filtered documents
  const filteredReports = reports.filter(doc => {
    const matchesSearch = doc.project_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.file_name && doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedDocumentType === 'All Types') return matchesSearch;
    
    // Filter by framework or industry keyword matches
    const searchType = selectedDocumentType.toLowerCase();
    const matchesType = doc.report.toLowerCase().includes(searchType) || 
                        doc.project_name.toLowerCase().includes(searchType) ||
                        doc.industry.toLowerCase().includes(searchType);
    return matchesSearch && matchesType;
  });

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
                      if (item.name === 'Dashboard') navigate('/dashboard');
                      else if (item.name === 'Compliance Map') navigate('/compliance-map');
                      else if (item.name === 'AI Compliance Assistant') navigate('/ai-assistant');
                      else if (item.name === 'Certifications') navigate('/certifications');
                      else if (item.name === 'Alerts & Updates') navigate('/alerts-updates');
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
              <h1 className="text-lg font-semibold">Documentation & Reports</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Manage compliance documents and view reports</p>
            </div>
            <div className="flex items-center space-x-4">
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

        {/* Documentation & Reports Content */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>
          {/* Upload Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3">
                <Upload className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Upload & Analyze New Documents</h2>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Upload compliance files for instant AI readiness scanning</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-800 hover:border-purple-500/40' : 'border-gray-300 hover:border-purple-500/50'} rounded-lg p-8 text-center transition-colors relative overflow-hidden`}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".js,.ts,.jsx,.tsx,.json,.md,.txt,.yml,.yaml,.env,.config,.pdf,.doc,.docx"
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="py-6 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                  <h3 className="text-base font-semibold mb-2">{uploadStatus}</h3>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>Please keep this tab open. Analyzing compliance policy rules...</p>
                </div>
              ) : (
                <>
                  <Upload className={`w-8 h-8 ${themeClasses.textSecondary} mx-auto mb-3 cursor-pointer`} onClick={handleSelectFilesClick} />
                  <h3 className="text-base font-semibold mb-2">Drop compliance documents here</h3>
                  <p className={`${themeClasses.textSecondary} mb-4 text-sm`}>Supports PDF, DOCX, TXT, MD, JSON configurations up to 10MB</p>
                  <button 
                    onClick={handleSelectFilesClick}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium transition-all text-sm"
                  >
                    Choose Files
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Documents List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}
          >
            {/* Documents Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <h2 className="text-base font-semibold">Compliance Documents ({reports.length})</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files/projects..."
                    className={`pl-10 pr-4 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48 sm:w-60 text-sm`}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  <select 
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className={`${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-2 py-1.5 ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={fetchReports}
                  className={`p-2 rounded-lg ${themeClasses.inputBg} ${themeClasses.hoverBg} border ${themeClasses.border} transition-colors`}
                  title="Refresh List"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Documents List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mr-3" />
                <span>Loading compliance database...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg border-gray-800">
                <FileText className={`w-12 h-12 ${themeClasses.textSecondary} mx-auto mb-3`} />
                <p className={`${themeClasses.textSecondary} text-sm`}>
                  {searchQuery ? `No files found matching "${searchQuery}"` : 'No compliance reports found. Upload a file above to get started!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((doc) => {
                  const maxScore = Math.max(doc.soc2_score || 0, doc.gdpr_score || 0, doc.hipaa_score || 0, doc.pci_score || 0);
                  return (
                    <div key={doc.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 ${themeClasses.taskItemBg} rounded-lg border ${themeClasses.border} transition-colors gap-3`}>
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <FileText className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{doc.project_name}</h3>
                          <p className={`text-xs ${themeClasses.textSecondary} truncate`}>
                            File: {doc.file_name} • Industry: {doc.industry} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(maxScore)} flex-shrink-0`}>
                          {getStatusText(maxScore)} ({maxScore}%)
                        </span>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => setSelectedReport(doc)}
                            className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-purple-500/10 rounded-lg transition-colors`}
                            title="View Report Analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-purple-500/10 rounded-lg transition-colors`}
                            title="Download Report Text"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Audit Detail Modal Overlay */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${themeClasses.border} flex items-center justify-between`}>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileCheck2 className="w-5 h-5 text-purple-400" />
                    <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">{selectedReport.industry} VERTICAL</span>
                  </div>
                  <h3 className="text-xl font-bold truncate">{selectedReport.project_name}</h3>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>File: {selectedReport.file_name} • Generated {new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-gray-800/80 rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
                
                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'SOC 2 Score', val: selectedReport.soc2_score },
                    { label: 'GDPR Score', val: selectedReport.gdpr_score },
                    { label: 'HIPAA Score', val: selectedReport.hipaa_score },
                    { label: 'PCI DSS Score', val: selectedReport.pci_score },
                  ].map(score => (
                    <div key={score.label} className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.taskItemBg} text-center`}>
                      <span className={`text-xs ${themeClasses.textSecondary} block mb-1`}>{score.label}</span>
                      <span className={`text-2xl font-black ${score.val && score.val >= 80 ? 'text-green-400' : score.val && score.val >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score.val != null ? `${score.val}%` : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Issue counts summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-center">
                    <span className="text-xs text-red-400 block mb-1">Critical Issues</span>
                    <span className="text-2xl font-black text-red-500">{selectedReport.critical_issues ?? 0}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/10 text-center">
                    <span className="text-xs text-yellow-400 block mb-1">Moderate Issues</span>
                    <span className="text-2xl font-black text-yellow-500">{selectedReport.moderate_issues ?? 0}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/10 text-center">
                    <span className="text-xs text-blue-400 block mb-1">Low Issues</span>
                    <span className="text-2xl font-black text-blue-500">{selectedReport.low_issues ?? 0}</span>
                  </div>
                </div>

                {/* Recommendations */}
                {selectedReport.recommendations && (
                  <div className={`p-5 rounded-xl border ${themeClasses.border} ${themeClasses.taskItemBg}`}>
                    <h4 className="font-bold text-sm text-purple-400 mb-3 flex items-center">
                      <Bot className="w-4 h-4 mr-2" /> AI RECOMMENDATIONS & TASK LIST
                    </h4>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{selectedReport.recommendations}</p>
                  </div>
                )}

                {/* Audit Report Summary */}
                <div>
                  <h4 className="font-bold text-sm text-gray-300 mb-3 uppercase tracking-wider">Audit Report Summary</h4>
                  <div className={`p-5 rounded-xl border ${themeClasses.border} bg-[#050505] overflow-x-auto`}>
                    <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap text-gray-300">
                      {selectedReport.report || 'No detailed analysis report text available.'}
                    </pre>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className={`p-6 border-t ${themeClasses.border} flex justify-end space-x-3 bg-black/40`}>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className={`px-4 py-2 text-sm font-medium ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDownloadDocument(selectedReport)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Report</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close notification dropdowns */}
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

export default DocumentationReportsPage;