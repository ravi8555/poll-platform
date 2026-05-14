// frontend/src/pages/PublicPollPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService } from '../services/pollService';
import { responseService } from '../services/responseService';
import type { Poll } from '../types/types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const PublicPollPage: React.FC = () => {
  const { link } = useParams<{ link: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (link) {
      fetchPoll();
    }
  }, [link]);

  const fetchPoll = async () => {
    try {
      console.log('Fetching poll with link:', link);
      const data = await pollService.getPollByLink(link!);
      console.log('Poll data:', data);
      setPoll(data);
    } catch (error: any) {
      console.error('Failed to fetch poll:', error);
      // Don't redirect, just show error message
      toast.error(error.response?.data?.error || 'Poll not found or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poll) return;
    
    // Check mandatory questions
    const mandatoryQuestions = poll.questions.filter(q => q.isMandatory);
    const missingMandatory = mandatoryQuestions.filter(q => !answers[q._id]);
    
    if (missingMandatory.length > 0) {
      toast.error('Please answer all mandatory questions');
      return;
    }
    
    // Check if authentication required
    if (poll.responseMode === 'authenticated' && !user) {
      setShowLoginModal(true);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));
      
      await responseService.submitResponse({
        pollLink: link!,
        answers: formattedAnswers
      });
      
      toast.success('Response submitted successfully!');
      navigate(`/poll/${link}/thank-you`);
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast.error(error.response?.data?.error || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await login(loginEmail, loginPassword);
      toast.success('Logged in successfully!');
      
      // After login, submit the response
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));
      
      await responseService.submitResponse({
        pollLink: link!,
        answers: formattedAnswers
      });
      
      toast.success('Response submitted successfully!');
      setShowLoginModal(false);
      navigate(`/poll/${link}/thank-you`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h2 className="text-xl font-bold">Poll Not Found</h2>
            <p className="mt-2">This poll may have expired or doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(poll.expiryDate) < new Date();

  if (isExpired || !poll.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            <h2 className="text-xl font-bold">Poll Expired</h2>
            <p className="mt-2">This poll is no longer accepting responses.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{poll.title}</h1>
          {poll.description && <p className="mt-2 text-gray-600">{poll.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {poll.questions.map((question, qIndex) => (
            <div key={question._id} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {qIndex + 1}. {question.text}
                {question.isMandatory && <span className="ml-2 text-red-500 text-sm">*</span>}
              </h3>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label key={option._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={question._id}
                      value={option._id}
                      checked={answers[question._id] === option._id}
                      onChange={() => handleAnswerChange(question._id, option._id)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-3 text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-600 mb-4">This poll requires authentication. Please login to submit.</p>
              <form onSubmit={handleLoginAndSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  required
                />
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Login & Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};