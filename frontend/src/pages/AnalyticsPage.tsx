
// frontend/src/pages/AnalyticsPage.tsx - Fixed version with proper cleanup
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { analyticsService } from '../services/analyticsService';
import { pollService } from '../services/pollService';
import type { AnalyticsData } from '../types/types';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const AnalyticsPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { user, getWebSocketToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [poll, setPoll] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(false);
  
  // Store callback reference for cleanup
  const responseUpdateRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    if (pollId) {
      fetchAnalytics();
      fetchPoll();
    }
  }, [pollId]);

  useEffect(() => {
    const setupSocket = async () => {
      if (pollId && user) {
        const token = await getWebSocketToken();
        if (token) {
          socketService.connect(token);
          socketService.joinPollRoom(pollId);
          
          // Create the handler function
          const handleResponseUpdate = (data: any) => {
            if (data.pollId === pollId) {
              console.log('Live update - refreshing analytics');
              fetchAnalytics();
              setLastUpdated(new Date());
              setIsLive(true);
              toast.success('New response received!', { duration: 2000 });
              setTimeout(() => setIsLive(false), 3000);
            }
          };
          
          // Store reference for cleanup
          responseUpdateRef.current = handleResponseUpdate;
          
          // Register listener
          socketService.on('response-count-update', handleResponseUpdate);
        }
      }
    };
    
    setupSocket();
    
    return () => {
      // Cleanup: remove the specific listener
      if (responseUpdateRef.current) {
        socketService.off('response-count-update', responseUpdateRef.current);
        responseUpdateRef.current = null;
      }
      if (pollId) {
        socketService.leavePollRoom(pollId);
      }
      socketService.disconnect();
    };
  }, [pollId, user, getWebSocketToken]);

  const fetchPoll = async () => {
    try {
      const data = await pollService.getPollById(pollId!);
      setPoll(data);
    } catch (error) {
      console.error('Failed to fetch poll:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsService.getPollAnalytics(pollId!);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    setPublishing(true);
    try {
      const result = await analyticsService.publishResults(pollId!, !analytics?.poll.isPublished);
      setAnalytics(prev => prev ? {
        ...prev,
        poll: { ...prev.poll, isPublished: result.isPublished }
      } : null);
      toast.success(result.isPublished ? 'Results published!' : 'Results unpublished');
    } catch (error) {
      toast.error('Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await analyticsService.exportAnalyticsCSV(pollId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poll_analytics_${pollId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const getShareableLink = () => {
    if (!poll) return '';
    return `${window.location.origin}/poll/${poll.shareableLink}`;
  };

  const copyShareableLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    toast.success('Poll link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Update Notification */}
        {isLive && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse z-50">
            Live Update! 📊
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">{analytics.poll.title}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isLive && <span className="ml-2 text-green-500 animate-pulse">● Live</span>}
              </p>
              {analytics.poll.description && (
                <p className="mt-1 text-gray-600">{analytics.poll.description}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={copyShareableLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Copy Poll Link
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={handlePublishResults}
                disabled={publishing}
                className={`px-4 py-2 rounded-md text-white ${
                  analytics.poll.isPublished
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                {publishing ? 'Processing...' : (analytics.poll.isPublished ? 'Unpublish Results' : 'Publish Results')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-indigo-600 font-medium">Total Responses</p>
              <p className="text-3xl font-bold text-indigo-900">{analytics.poll.totalResponses}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-green-900">{analytics.summary.completionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Questions</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.questions.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Status</p>
              <p className="text-xl font-bold text-purple-900">
                {analytics.poll.isPublished ? 'Published' : 'Not Published'}
              </p>
            </div>
          </div>
        </div>

        {/* Response Timeline */}
        {analytics.timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="responses" stroke="#3B82F6" name="Responses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Question-wise Analytics */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Question Breakdown</h2>
          
          {analytics.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {qIndex + 1}. {question.text}
                {question.isMandatory && (
                  <span className="ml-2 text-sm text-red-500">(Mandatory)</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {question.totalResponses} responses • {question.responseRate.toFixed(1)}% response rate
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={question.options} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="text" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#3B82F6" name="Votes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Pie Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={question.options}
                        dataKey="votes"
                        nameKey="text"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => {
                          const percentage = ((entry.votes / question.totalResponses) * 100).toFixed(0);
                          return `${entry.name}: ${percentage}%`;
                        }}
                      >
                        {question.options.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Options Table */}
              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Option</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {question.options.map((option) => (
                      <tr key={option.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{option.text}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{option.votes}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                            <span>{option.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


