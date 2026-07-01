import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sun,
  Moon,
  Shield,
  Zap,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  TrendingUp,
  Cloud,
  Briefcase,
  Activity,
  Globe,
  Check,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter
} from 'lucide-react';

import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { Faq3 } from '@/components/ui/faq3';

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
    }
  };

  const handleStartFreeTrial = () => {
    navigate('/auth');
  };

  const complianceProblems = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Months of Manual Work",
      description: "Traditional compliance takes 6-12 months of dedicated effort, pulling your team away from building your product.",
      color: "from-red-500/20 to-orange-500/20",
      iconColor: "text-red-400",
      borderColor: "border-red-500/30"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Expensive Consultants",
      description: "Compliance consultants charge $200-500/hour, with total costs often exceeding $100,000 for basic frameworks.",
      color: "from-orange-500/20 to-yellow-500/20",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/30"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Complex Documentation",
      description: "Hundreds of policies, procedures, and controls to create, implement, and maintain across multiple frameworks.",
      color: "from-yellow-500/20 to-amber-500/20",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Constant Changes",
      description: "Regulations evolve constantly. Staying compliant requires continuous monitoring and updates to your program.",
      color: "from-amber-500/20 to-red-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30"
    }
  ];

  const complianceStats = [
    {
      number: "73%",
      description: "of startups delay compliance until it's too late",
      color: "text-pink-400"
    },
    {
      number: "$150K+",
      description: "average cost for traditional SOC 2 compliance",
      color: "text-orange-400"
    },
    {
      number: "8 months",
      description: "typical time to achieve first certification",
      color: "text-yellow-400"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Mapping",
      description: "Visual compliance roadmaps",
      color: "from-purple-500/20 to-blue-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Assistant",
      description: "24/7 compliance guidance",
      color: "from-pink-500/20 to-purple-500/20",
      iconColor: "text-pink-400",
      borderColor: "border-pink-500/30"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Streamlined workflows",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Standards",
      description: "Multi-region compliance",
      color: "from-cyan-500/20 to-teal-500/20",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30"
    }
  ];

  const workflowSteps = [
    {
      number: "1",
      icon: <Cloud className="w-8 h-8" />,
      title: "Connect Your Systems",
      description: "Integrate with AWS, GCP, GitHub, and more",
      features: ["One-click integrations", "Secure API connections", "Real-time data sync"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      number: "2",
      icon: <Activity className="w-8 h-8" />,
      title: "AI Analysis",
      description: "Our AI scans your infrastructure and processes",
      features: ["Deep infrastructure scan", "Policy analysis", "Risk assessment"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400"
    },
    {
      number: "3",
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Get Your Roadmap",
      description: "Receive a personalized compliance roadmap",
      features: ["Custom action items", "Priority scoring", "Timeline planning"],
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-400"
    },
    {
      number: "4",
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor compliance status in real-time",
      features: ["Live dashboards", "Progress tracking", "Automated reporting"],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400"
    }
  ];

  const securityBadges = [
    { name: "SOC 2 Type II", icon: Shield },
    { name: "GDPR Compliant", icon: Shield },
    { name: "ISO 27001", icon: Shield },
    { name: "HIPAA Ready", icon: Shield },
    { name: "PCI DSS", icon: Shield },
    { name: "Zero Trust", icon: Shield }
  ];

  const founders = [
    {
      name: "Anna Sian",
      role: "Co-founder & CEO",
      image: "/CAEF3A74-13C6-4364-AC4F-319D6322E3AA_1_201_a.jpeg",
      linkedin: "https://www.linkedin.com/in/anna-sian-414a06327/"
    },
    {
      name: "Parv Gupta",
      role: "Co-founder & CEO",
      image: "/8AFD4E19-AA8E-48F2-8510-6673C6CA749C_1_201_a.jpeg",
      linkedin: "https://www.linkedin.com/in/parv-gupta-978189335/"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 249,
      yearlyPrice: 2699,
      description: "Perfect for early-stage startups",
      features: [
        "Basic compliance mapping",
        "AI-powered recommendations",
        "Standard integrations",
        "Email support",
        "Basic reporting"
      ]
    },
    {
      name: "Professional",
      monthlyPrice: 399,
      yearlyPrice: 4499,
      description: "For growing companies",
      features: [
        "Advanced compliance mapping",
        "24/7 AI assistant",
        "Premium integrations",
        "Priority support",
        "Advanced analytics",
        "Custom workflows",
        "Team collaboration"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: null,
      yearlyPrice: null,
      description: "Custom solutions for large organizations",
      features: [
        "Enterprise-grade security",
        "Custom integrations",
        "Dedicated support",
        "White-label options",
        "Advanced customization",
        "SLA guarantees"
      ]
    }
  ];

  const testimonials = [
    {
      author: {
        name: "Sarah Chen",
        handle: "@sarahtech",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
      },
      text: "AICON transformed our compliance process from a 12-month nightmare to a 4-week success story. The AI assistant is incredibly intuitive.",
      href: "https://twitter.com/sarahtech"
    },
    {
      author: {
        name: "Michael Rodriguez",
        handle: "@mikedev",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      text: "The AI assistant is like having a compliance expert available 24/7. Game-changing for our startup's growth trajectory.",
      href: "https://twitter.com/mikedev"
    },
    {
      author: {
        name: "Emily Johnson",
        handle: "@emilysec",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
      },
      text: "We achieved SOC 2 certification in record time thanks to AICON's intelligent roadmap and automated documentation.",
      href: "https://twitter.com/emilysec"
    },
    {
      author: {
        name: "David Park",
        handle: "@davidcto",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      text: "The integration capabilities are outstanding. AICON seamlessly connected with our entire tech stack in minutes.",
      href: "https://twitter.com/davidcto"
    }
  ];

  const faqData = {
    heading: "Frequently Asked Questions",
    description: "Everything you need to know about AICON. Can't find what you're looking for? Contact our support team.",
    items: [
      {
        id: "faq-1",
        question: "How quickly can I get compliant with AICON?",
        answer: "Most startups achieve their first certification within 4-8 weeks using AICON, compared to 6-12 months with traditional methods. Our AI-powered roadmap accelerates the entire process."
      },
      {
        id: "faq-2",
        question: "What compliance frameworks does AICON support?",
        answer: "AICON supports SOC 2, GDPR, HIPAA, ISO 27001, PCI DSS, and many other frameworks with continuous updates for new regulations. We're constantly adding support for emerging compliance requirements."
      },
      {
        id: "faq-3",
        question: "Is my data secure with AICON?",
        answer: "Yes, AICON is built with enterprise-grade security, including end-to-end encryption, zero-trust architecture, and SOC 2 Type II certification. Your data security is our top priority."
      },
      {
        id: "faq-4",
        question: "Can AICON integrate with my existing tools?",
        answer: "AICON integrates with 100+ tools including AWS, GCP, Azure, GitHub, Slack, and most popular business applications. Our API-first approach ensures seamless connectivity."
      },
      {
        id: "faq-5",
        question: "Do you offer support during implementation?",
        answer: "Yes, we provide comprehensive support including onboarding assistance, training sessions, and ongoing technical support to ensure successful implementation and adoption."
      }
    ],
    supportHeading: "Still have questions?",
    supportDescription: "Our compliance experts are here to help you navigate any challenges and ensure your success with AICON.",
    supportButtonText: "Contact Support",
    supportButtonUrl: "#contact"
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    border: isDarkMode ? 'border-gray-800' : 'border-gray-200',
    cardBg: isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrollY > 50 
          ? `${themeClasses.bg}/80 backdrop-blur-md border-b ${themeClasses.border}` 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-purple-500/20 ring-offset-2 ring-offset-transparent">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold">AICON</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#features" className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                  Features
                </a>
                <a href="#solutions" className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                  Solutions
                </a>
                <a href="#pricing" className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                  Pricing
                </a>
                <a href="#resources" className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                  Resources
                </a>
                <a href="#contact" className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                  Contact
                </a>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${themeClasses.cardBg} hover:bg-gray-700`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => navigate('/auth')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}
                >
                  Login
                </button>
                <button 
                  onClick={handleStartFreeTrial}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
            
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${themeClasses.cardBg} hover:bg-gray-700`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t ${themeClasses.bg}/95 backdrop-blur-md ${themeClasses.border}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className={`block px-3 py-2 text-base font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                Features
              </a>
              <a href="#solutions" className={`block px-3 py-2 text-base font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                Solutions
              </a>
              <a href="#pricing" className={`block px-3 py-2 text-base font-medium transition-colors ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
                Pricing
              </a>
              <button 
                onClick={handleStartFreeTrial}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-base font-medium transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Grid Background and Floating Elements */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing Circles */}
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-lg"
            animate={{
              y: [0, 15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-40 left-32 w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-lg"
            animate={{
              y: [0, -25, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

          {/* Geometric Shapes */}
          <motion.div
            className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 transform rotate-45"
            animate={{
              rotate: [45, 65, 45],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-32 right-40 w-12 h-12 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 transform rotate-12"
            animate={{
              rotate: [12, 32, 12],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
          <motion.div
            className="absolute top-60 left-40 w-8 h-8 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-lg transform rotate-45"
            animate={{
              rotate: [45, 225, 45],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Govern AI with
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                confidence
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              AI-Powered Compliance & Operations Navigator for startups and tech companies
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button 
                onClick={handleStartFreeTrial}
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center shadow-lg shadow-purple-500/25"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-white px-8 py-4 rounded-xl text-lg font-semibold border border-gray-600 hover:border-gray-500 transition-all bg-black/20 backdrop-blur-sm">
                Book a Free Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance is Broken Section */}
      <section className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Compliance is <span className="text-red-500">Broken</span> for Startups
            </h2>
            <p className={`text-xl max-w-4xl mx-auto ${themeClasses.textSecondary} leading-relaxed`}>
              While you're trying to build and scale your product, compliance becomes a massive roadblock that drains resources and slows growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {complianceProblems.map((problem, index) => (
              <motion.div 
                key={index} 
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${problem.color} border ${problem.borderColor} hover:border-red-500/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className={`${problem.iconColor} mb-4`}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {problem.icon}
                </motion.div>
                <h3 className="text-lg font-semibold mb-3">
                  {problem.title}
                </h3>
                <p className={`leading-relaxed ${themeClasses.textSecondary} text-sm`}>
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-8">
            {complianceStats.map((stat, index) => (
              <motion.div 
                key={index} 
                className={`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${themeClasses.cardBg} border ${themeClasses.border} hover:shadow-xl text-center backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className={`text-5xl lg:text-6xl font-bold mb-4 ${stat.color}`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {stat.number}
                </motion.div>
                <p className={`text-lg ${themeClasses.textSecondary} leading-relaxed`}>
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet AICON Section */}
      <section id="features" className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Meet <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AICON</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              Powerful features designed to simplify compliance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className={`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 group bg-gradient-to-br ${feature.color} border ${feature.borderColor} hover:border-purple-500/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${feature.color} ${feature.iconColor}`}
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${themeClasses.textSecondary}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How AICON Works Section */}
      <section id="solutions" className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              How AICON Works
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              Get compliant in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div 
                key={index} 
                className={`relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${step.bgColor} border border-gray-800 hover:border-purple-500/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute -top-4 left-8">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {step.number}
                  </div>
                </div>
                
                <motion.div 
                  className={`${step.iconColor} mb-6 mt-4`}
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                >
                  {step.icon}
                </motion.div>
                
                <h3 className="text-xl font-semibold mb-4">
                  {step.title}
                </h3>
                <p className={`${themeClasses.textSecondary} mb-6`}>
                  {step.description}
                </p>
                
                <ul className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`text-sm ${themeClasses.textSecondary} flex items-center`}>
                      <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Enterprise Security Section */}
      <section className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Built for <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Enterprise Security</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              AICON meets the highest security standards and compliance requirements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div 
                  key={index} 
                  className={`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${themeClasses.cardBg} border ${themeClasses.border} hover:border-green-500/50 backdrop-blur-sm text-center`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="text-green-400 mb-4 flex justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                  >
                    <Icon className="w-12 h-12" />
                  </motion.div>
                  <h3 className="text-lg font-semibold">
                    {badge.name}
                  </h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Meet the Founders
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              Built by compliance and security experts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div 
                key={index} 
                className={`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${themeClasses.cardBg} border ${themeClasses.border} hover:border-purple-500/50 backdrop-blur-sm text-center`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.img 
                  src={founder.image} 
                  alt={founder.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-purple-500/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <h3 className="text-2xl font-bold mb-2">
                  {founder.name}
                </h3>
                <p className="text-purple-400 font-medium mb-4">
                  {founder.role}
                </p>
                <div className="flex justify-center">
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                    aria-label={`Visit ${founder.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              Choose the plan that fits your compliance needs
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-16">
            <div className={`flex items-center p-1 rounded-xl ${themeClasses.cardBg} border ${themeClasses.border}`}>
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isYearly 
                    ? 'bg-purple-600 text-white' 
                    : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  isYearly 
                    ? 'bg-purple-600 text-white' 
                    : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                }`}
              >
                Yearly <span className="text-green-400 ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index} 
                className={`relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/50' 
                    : `${themeClasses.cardBg} border ${themeClasses.border}`
                } backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`${themeClasses.textSecondary} mb-6`}>{plan.description}</p>
                  
                  {plan.monthlyPrice ? (
                    <div className="mb-6">
                      <span className="text-5xl font-bold">
                        ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                      </span>
                      <span className={`${themeClasses.textSecondary} ml-2`}>
                        /month
                      </span>
                      {isYearly && (
                        <div className="text-sm text-green-400 mt-2">
                          Billed annually (${plan.yearlyPrice}/year)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-3xl font-bold">Custom</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleStartFreeTrial}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : `border ${themeClasses.border} hover:border-purple-500/50 ${themeClasses.text}`
                  }`}
                >
                  {plan.monthlyPrice ? 'Start Free Trial' : 'Contact Sales'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection
        title="What Experts Say"
        description="Trusted by industry leaders and compliance experts worldwide"
        testimonials={testimonials}
        className={themeClasses.bg}
      />

      {/* FAQ Section */}
      <Faq3 {...faqData} />

      {/* Contact Section */}
      <section id="contact" className={`py-32 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${themeClasses.textSecondary}`}>
              Ready to transform your compliance process? Let's talk.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-purple-400 mr-4" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className={themeClasses.textSecondary}>hello@aicon.ai</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-purple-400 mr-4" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className={themeClasses.textSecondary}>+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-purple-400 mr-4" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className={themeClasses.textSecondary}>New Delhi, India</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`p-8 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border}`}
            >
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="First Name"
                    className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} bg-transparent ${themeClasses.text} placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} bg-transparent ${themeClasses.text} placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} bg-transparent ${themeClasses.text} placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <textarea
                  rows={4}
                  placeholder="Message"
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} bg-transparent ${themeClasses.text} placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 ${themeClasses.cardBg} ${themeClasses.text}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-purple-500/20 ring-offset-2 ring-offset-transparent">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className={`ml-3 text-xl font-bold ${themeClasses.text}`}>AICON</span>
              </div>
              <p className={`${themeClasses.textSecondary} leading-relaxed mb-6`}>
                AI-Powered Compliance Platform for startups and tech companies.
              </p>
              <div className="flex space-x-4">
                <a href="#" className={`${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className={`${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}>
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-6 ${themeClasses.text}`}>Quick Links</h3>
              <ul className={`space-y-3 ${themeClasses.textSecondary}`}>
                <li><a href="#features" className={`hover:${themeClasses.text} transition-colors`}>Features</a></li>
                <li><a href="#pricing" className={`hover:${themeClasses.text} transition-colors`}>Pricing</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Documentation</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>API</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-6 ${themeClasses.text}`}>Company</h3>
              <ul className={`space-y-3 ${themeClasses.textSecondary}`}>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>About</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Blog</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Careers</a></li>
                <li><a href="#contact" className={`hover:${themeClasses.text} transition-colors`}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-6 ${themeClasses.text}`}>Legal</h3>
              <ul className={`space-y-3 ${themeClasses.textSecondary}`}>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Privacy Policy</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Terms of Service</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Security</a></li>
                <li><a href="#" className={`hover:${themeClasses.text} transition-colors`}>Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t ${themeClasses.border} mt-12 pt-8 text-center ${themeClasses.textSecondary}`}>
            <p>&copy; 2025 AICON. All rights reserved. | New Delhi, India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;