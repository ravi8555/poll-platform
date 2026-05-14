// frontend/src/pages/PollDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollService } from '../services/pollService';
import type { Poll } from '../types/types';
import toast from 'react-hot-toast';
import { 
  DocumentDuplicateIcon, 
  ChartBarIcon, 
  TrashIcon,
  PencilIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

export const PollDetailsPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const data = await pollService.getPollById(pollId!);
      setPoll(data);
    } catch (error) {
      toast.error('Failed to load poll');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyShareableLink = () => {
    if (!poll) return;
    const link = `${window.location.origin}/poll/${poll.shareableLink}`;
    navigator.clipboard.writeText(link);
    toast.success('Poll link copied!');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this poll?')) {
      try {
        await pollService.deletePoll(pollId!);
        toast.success('Poll deleted');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete poll');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poll Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{poll.title}</h1>
              {poll.description && (
                <p className="mt-2 text-gray-600">{poll.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyShareableLink}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Share Poll"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              <Link
                to={`/polls/${poll._id}/analytics`}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="View Analytics"
              >
                <ChartBarIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-red-400 hover:text-red-600"
                title="Delete Poll"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Poll Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-500">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{poll.totalResponses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Response Mode</p>
              <p className="text-lg font-semibold text-gray-900">
                {poll.responseMode === 'anonymous' ? 'Anonymous' : 'Authenticated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`text-lg font-semibold ${poll.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {poll.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expires</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(poll.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
          <div className="space-y-6">
            {poll.questions.map((question, qIndex) => (
              <div key={question._id} className="border-b pb-4 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {qIndex + 1}. {question.text}
                  {question.isMandatory && (
                    <span className="ml-2 text-sm text-red-500">(Required)</span>
                  )}
                </h3>
                <div className="mt-2 ml-4">
                  {question.options.map((option, optIndex) => (
                    <div key={option._id} className="flex items-center mt-1">
                      <span className="w-6 text-gray-400">{String.fromCharCode(65 + optIndex)}.</span>
                      <span className="text-gray-600">{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Share Section */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareable Link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/poll/${poll.shareableLink}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyShareableLink}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};