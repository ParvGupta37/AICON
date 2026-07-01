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
  Sun,
  Moon,
  Users,
  Key,
  Plug,
  Target,
  Plus,
  Edit,
  Trash2,
  Copy,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  MoreHorizontal,
  Mail,
  Crown,
  Eye,
  UserCheck,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabaseClients';

function SettingsPage() {
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

  const [activeTab, setActiveTab] = useState('Settings');
  const [activeSettingsTab, setActiveSettingsTab] = useState('Team');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [teamFilter, setTeamFilter] = useState('All');

  // Goals state
  const [goals, setGoals] = useState<{ id: number; title: string; description: string; deadline: string; progress: number; status: string }[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(0);

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Compliance Map', icon: Shield },
    { name: 'Documentation & Reports', icon: FileText },
    { name: 'AI Compliance Assistant', icon: Bot },
    { name: 'Certifications', icon: Award },
    { name: 'Alerts & Updates', icon: AlertTriangle },
    { name: 'Settings', icon: Settings, active: true }
  ];

  const settingsTabs = [
    { name: 'Team', icon: Users },
    { name: 'Integrations', icon: Plug },
    { name: 'Goals', icon: Target }
  ];

  const handleAddGoal = () => {
    if (!newGoalTitle.trim() || !newGoalDeadline) return;
    const newGoal = {
      id: Date.now(),
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      deadline: newGoalDeadline,
      progress: Math.min(100, Math.max(0, newGoalProgress)),
      status: newGoalProgress >= 100 ? 'Completed' : newGoalProgress > 0 ? 'In Progress' : 'Not Started'
    };
    setGoals(prev => [newGoal, ...prev]);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalDeadline('');
    setNewGoalProgress(0);
    setShowAddGoalModal(false);
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleUpdateProgress = (id: number, progress: number) => {
    setGoals(prev => prev.map(g => g.id === id ? {
      ...g,
      progress,
      status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'
    } : g));
  };

  const teamMembers = [
    {
      id: 1,
      name: userDisplayName,
      email: userEmail,
      role: 'Admin',
      status: 'Active',
      avatar: userInitials,
      lastActive: 'Just now',
      joinedDate: new Date().toISOString().split('T')[0]
    }
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

  const handleInviteMember = () => {
    if (inviteEmail && inviteRole) {
      // Add logic to send invite
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('Member');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Suspended':
        return 'bg-red-500 text-white';
      case 'Connected':
        return 'bg-green-500 text-white';
      case 'Not Connected':
        return 'bg-gray-500 text-white';
      case 'Expired':
        return 'bg-red-500 text-white';
      case 'In Progress':
        return 'bg-purple-500 text-white';
      case 'Nearly Complete':
        return 'bg-blue-500 text-white';
      case 'Completed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Member':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'Viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTeamMembers = teamFilter === 'All' 
    ? teamMembers 
    : teamMembers.filter(member => member.status === teamFilter);

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
                      } else if (item.name === 'Certifications') {
                        navigate('/certifications');
                      } else if (item.name === 'Alerts & Updates') {
                        navigate('/alerts-updates');
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
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>Manage your team, integrations, and compliance goals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search settings..."
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
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs"
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

        {/* Settings Content */}
        <main className={`flex-1 p-6 overflow-auto ${themeClasses.bg}`}>
          {/* Settings Tabs */}
          <div className="mb-6">
            <div className={`flex space-x-1 ${themeClasses.cardBg} p-1 rounded-xl border ${themeClasses.border} w-fit`}>
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveSettingsTab(tab.name)}
                    className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSettingsTab === tab.name
                        ? `${themeClasses.activeBg} ${themeClasses.text}`
                        : `${themeClasses.textSecondary} hover:${themeClasses.text} ${themeClasses.hoverBg}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Management Tab */}
          {activeSettingsTab === 'Team' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Team Management Header */}
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Team Management</h2>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>Manage team members and their access levels</p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Member
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Email address"
                      className={`pl-10 pr-4 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder-${themeClasses.textSecondary} focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full text-sm`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                    <select 
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                      className={`${themeClasses.inputBg} border ${themeClasses.border} rounded-lg px-3 py-2 ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-3">
                  {filteredTeamMembers.map((member) => (
                    <div key={member.id} className={`flex items-center justify-between p-4 ${themeClasses.inputBg} rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{member.name}</h3>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className={`text-xs ${themeClasses.textSecondary}`}>{member.email}</p>
                          <p className={`text-xs ${themeClasses.textSecondary}`}>Last active: {member.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(member.role)}`}>
                          {member.role}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                            <Edit className="w-4 h-4" />
                          </button>
                          {member.status === 'Pending' && (
                            <button className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button className={`p-2 text-red-400 hover:text-red-300 transition-colors`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations Tab — Coming Soon */}
          {activeSettingsTab === 'Integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Integrations</h2>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Connect AICON to your existing tools and workflows</p>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Plug className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
                  <p className={`text-sm ${themeClasses.textSecondary} max-w-sm mb-6 leading-relaxed`}>
                    We're building integrations with AWS, GitHub, Slack, Jira, and more. Stay tuned for updates!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['☁️ AWS', '🐙 GitHub', '💬 Slack', '📋 Jira', '☁️ GCP', '☁️ Azure'].map(name => (
                      <span key={name} className={`px-4 py-2 rounded-full text-sm font-medium ${themeClasses.inputBg} border ${themeClasses.border} ${themeClasses.textSecondary}`}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Goals Tab — Dynamic */}
          {activeSettingsTab === 'Goals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Compliance Goals &amp; Deadlines</h2>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>Track your compliance objectives and milestones</p>
                  </div>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </button>
                </div>

                {goals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">No goals yet</h3>
                    <p className={`text-sm ${themeClasses.textSecondary} max-w-xs mb-5`}>
                      Set compliance goals to track your progress and meet deadlines.
                    </p>
                    <button
                      onClick={() => setShowAddGoalModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2 rounded-lg font-medium transition-all flex items-center text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Goal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className={`p-5 ${themeClasses.inputBg} rounded-lg border ${themeClasses.border}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusBadge(goal.status)}`}>
                                {goal.status}
                              </span>
                            </div>
                            {goal.description && (
                              <p className={`text-xs ${themeClasses.textSecondary} mb-3`}>{goal.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className={`w-3.5 h-3.5 ${themeClasses.textSecondary}`} />
                                <span className={`text-xs ${themeClasses.textSecondary}`}>Deadline: {goal.deadline}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className={`w-3.5 h-3.5 ${themeClasses.textSecondary}`} />
                                <span className={`text-xs ${themeClasses.textSecondary}`}>Owner: {userDisplayName}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs ${themeClasses.textSecondary}`}>Progress</span>
                                <span className="text-xs font-semibold">{goal.progress}%</span>
                              </div>
                              <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-1.5 mb-2`}>
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={goal.progress}
                                onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                                className="w-full h-1 accent-purple-500 cursor-pointer"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="ml-4 p-2 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                            title="Delete goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeClasses.modalBg} border ${themeClasses.border} rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl`}
          >
            <h3 className="text-lg font-semibold mb-5">Add Compliance Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Goal Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Achieve SOC 2 Type II by Q4"
                  className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  placeholder="Describe what needs to be done..."
                  rows={3}
                  className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Deadline <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                  className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Initial Progress: {newGoalProgress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newGoalProgress}
                  onChange={(e) => setNewGoalProgress(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-1.5 mt-2`}>
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${newGoalProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowAddGoalModal(false); setNewGoalTitle(''); setNewGoalDescription(''); setNewGoalDeadline(''); setNewGoalProgress(0); }}
                className={`px-4 py-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors text-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoalTitle.trim() || !newGoalDeadline}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-all text-sm"
              >
                Add Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeClasses.modalBg} border ${themeClasses.border} rounded-lg p-6 w-full max-w-md mx-4`}
          >
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder-${themeClasses.textSecondary} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={`w-full px-3 py-2 ${themeClasses.inputBg} border ${themeClasses.border} rounded-lg ${themeClasses.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                >
                  <option>Admin</option>
                  <option>Member</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className={`px-4 py-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors text-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}

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

export default SettingsPage;