import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

function AnalysisPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    {
      id: 1,
      title: "Scanning project files",
      description: "Analyzing your codebase and configuration files",
      status: "pending"
    },
    {
      id: 2,
      title: "Analyzing security configurations",
      description: "Reviewing security settings and access controls",
      status: "pending"
    },
    {
      id: 3,
      title: "Checking data handling practices",
      description: "Evaluating data processing and storage methods",
      status: "pending"
    },
    {
      id: 4,
      title: "Evaluating cloud infrastructure",
      description: "Assessing cloud security and compliance posture",
      status: "pending"
    },
    {
      id: 5,
      title: "Generating compliance report",
      description: "Creating personalized recommendations",
      status: "pending"
    }
  ];

  const [steps, setSteps] = useState(analysisSteps);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // FIXED: Sequential step completion logic
    const newSteps = [...steps];
    
    // Calculate which step should be active based on progress
    const progressPerStep = 100 / 5; // 20% per step
    const activeStepIndex = Math.floor(progress / progressPerStep);
    
    // Mark all previous steps as completed
    for (let i = 0; i < activeStepIndex && i < 5; i++) {
      if (newSteps[i].status !== 'completed') {
        newSteps[i].status = 'completed';
      }
    }
    
    // Set current step as in-progress (only if not completed and progress < 100)
    if (activeStepIndex < 5 && progress < 100) {
      if (newSteps[activeStepIndex].status !== 'completed') {
        newSteps[activeStepIndex].status = 'in-progress';
      }
      setCurrentStep(activeStepIndex);
    }
    
    // Mark all steps as completed when progress reaches 100%
    if (progress >= 100) {
      for (let i = 0; i < 5; i++) {
        newSteps[i].status = 'completed';
      }
      setCurrentStep(5);
    }

    setSteps(newSteps);
  }, [progress]); // FIXED: Removed currentStep dependency to prevent infinite loops

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, navigate]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <Clock className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-2 text-lg font-bold">AICON</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Analyzing Your Project
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our AI is scanning your project to identify compliance requirements and potential issues
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Analysis Progress</h2>
            <p className="text-gray-400">Please wait while we analyze your project files and generate recommendations</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Progress</span>
              <span className="text-sm font-medium text-purple-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    step.status === "completed"
                      ? "bg-green-500/10 border-green-500/30"
                      : step.status === "in-progress"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-gray-800/50 border-gray-700"
                  }`}
                >
                  <div className="mr-4">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                  {step.status === "in-progress" && (
                    <div className="ml-4">
                      <motion.div
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  )}
                  {step.status === "completed" && (
                    <span className="ml-4 text-sm text-green-400 font-medium">Completed</span>
                  )}
                  {step.status === "in-progress" && (
                    <span className="ml-4 text-sm text-blue-400 font-medium">In progress...</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {progress >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">Analysis Complete!</h3>
              <p className="text-gray-400 mb-4">
                Your project has been analyzed successfully. Redirecting to your dashboard...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                View Detailed Report
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AnalysisPage;