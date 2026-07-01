import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, ChevronDown, AlertCircle } from 'lucide-react';
import { getCurrentUserAsync, storageApi, apiFetch } from '../lib/apiClient';

function ProjectSetupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    projectName: '',
    industry: '',
    description: '',
    files: [] as { name: string; storagePath: string }[]
  });

  const industries = [
    'SaaS',
    'FinTech',
    'HealthTech',
    'E-commerce',
    'EdTech',
    'Gaming',
    'AI/ML',
    'Blockchain',
    'Other'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // FIXED: Handle file selection button click
  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    setUploadError('');
    setBackendError('');

    const user = await getCurrentUserAsync();
    if (!user) {
      setUploadError('User not authenticated. Please log in again.');
      setIsLoading(false);
      return;
    }
    const uploadedFiles: { name: string; storagePath: string }[] = [];

    for (const file of files) {
      try {
        // Upload directly to Supabase Storage
        const result = await storageApi.uploadFile(file);
        uploadedFiles.push({ name: result.fileName, storagePath: result.storagePath });
      } catch (err: any) {
        console.error('File upload error:', err);
        setUploadError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    if (uploadedFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles],
      }));
    }

    setIsLoading(false);
  };

  const handleAnalyzeProject = async () => {
    if (!formData.projectName || !formData.industry) {
      alert('Please fill in project name and industry.');
      return;
    }

    setIsLoading(true);
    setBackendError('');
    setDebugInfo('');

    try {

      // Get current user from Supabase session
      const user = await getCurrentUserAsync();
      if (!user) {
        setBackendError('User not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Prepare data to send to FastAPI backend
      const firstFile = formData.files.length > 0 ? formData.files[0] : null;
      const payload = {
        projectName: formData.projectName,
        industry: formData.industry,
        description: formData.description,
        storagePath: firstFile?.storagePath ?? '',
        fileName: firstFile?.name ?? 'document',
      };

      console.log('Sending payload:', payload);
      setDebugInfo(prev => prev + `\nPayload: ${JSON.stringify(payload, null, 2)}`);

      // Make POST request to FastAPI endpoint with timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await apiFetch('/analyze-project', {
          method: 'POST',
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = response;
        console.log('Backend analysis triggered successfully:', result);
        setDebugInfo(prev => prev + `\nSuccess response: ${JSON.stringify(result, null, 2)}`);

        // Save project info for analysis page
        localStorage.setItem('projectData', JSON.stringify(formData));
        
        // Navigate to analysis page
        navigate('/analysis');

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The backend server may be slow to respond or unavailable.');
        }
        
        // Handle network errors specifically
        if (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError') {
          throw new Error('Unable to connect to the backend server. Please check if the server is running and accessible. If you\'re running locally, make sure your backend is started on the correct port.');
        }
        
        throw fetchError;
      }
      
    } catch (error: any) {
      console.error('Error triggering backend analysis:', error);
      
      // Provide more helpful error messages based on error type
      let userFriendlyMessage = error.message;
      
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        userFriendlyMessage = 'Cannot connect to the analysis server. This could be because:\n\n• The backend server is not running\n• There\'s a network connectivity issue\n• The server URL is incorrect\n\nFor now, you can continue to the analysis page to see a demo of the interface.';
      }
      
      setBackendError(userFriendlyMessage);
      setDebugInfo(prev => prev + `\nError: ${error.message}\nError type: ${error.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to proceed without backend analysis
  const proceedWithoutAnalysis = () => {
    // Save project info for analysis page
    localStorage.setItem('projectData', JSON.stringify(formData));
    
    // Navigate to analysis page with a flag indicating offline mode
    localStorage.setItem('offlineMode', 'true');
    navigate('/analysis');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-2 text-lg font-bold">AICON</span>
            </div>
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
            Tell us about your project
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Provide project details to get personalized compliance recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Project Details</h2>
            <p className="text-gray-400">Help us understand your project to provide tailored compliance guidance</p>
          </div>

          <form className="space-y-8">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., My SaaS Application"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Industry *
              </label>
              <div className="relative">
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Project Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Briefly describe your project, its purpose, and any specific compliance concerns you have..."
              />
            </div>

            {/* File Upload - FIXED */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Upload Project Files (Optional)
              </label>
              
              {uploadError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-400 text-sm">{uploadError}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".js,.ts,.jsx,.tsx,.json,.md,.txt,.yml,.yaml,.env,.config,.pdf,.doc,.docx"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${isLoading ? 'opacity-50' : ''}`}>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isLoading ? 'Uploading files...' : 'Drop files here or click to browse'}
                  </h3>
                  <p className="text-gray-400 mb-4">Upload code repositories, configuration files, or documentation (including PDF files)</p>
                  <button
                    type="button"
                    onClick={handleSelectFilesClick}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isLoading 
                        ? 'bg-gray-700 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    } text-white`}
                  >
                    {isLoading ? 'Uploading...' : 'Select Files'}
                  </button>
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-300">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <span className="text-xs text-green-400 ml-auto">Uploaded</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Backend Error Display */}
            {backendError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-red-400 text-sm whitespace-pre-line">{backendError}</span>
                    {backendError.includes('Cannot connect to the analysis server') && (
                      <div className="mt-3">
                        <button
                          onClick={proceedWithoutAnalysis}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Continue with Demo Mode
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info Display */}
            {debugInfo && (
              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Debug Information:</h4>
                <pre className="text-blue-300 text-xs whitespace-pre-wrap overflow-x-auto">
                  {debugInfo}
                </pre>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleAnalyzeProject}
                disabled={isLoading || !formData.projectName || !formData.industry}
                className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  isLoading || !formData.projectName || !formData.industry
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                } text-white`}
              >
                {isLoading ? 'Processing...' : 'Analyze Project'}
                {!isLoading && formData.projectName && formData.industry && (
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ProjectSetupPage;