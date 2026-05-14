// frontend/src/pages/ResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';

interface ResultData {
  poll: {
    id: string;
    title: string;
    description?: string;
    totalResponses: number;
  };
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }>;
    totalResponses: number;
  }>;
}

export const ResultsPage: React.FC = () => {
  const { shareableLink } = useParams<{ shareableLink: string }>();
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareableLink) {
      fetchResults();
    }
  }, [shareableLink]);

  const fetchResults = async () => {
    try {
      const data = await analyticsService.getPublicResults(shareableLink!);
      setResults(data);
    } catch (error: any) {
      console.error('Failed to load results:', error);
      setError(error.response?.data?.error || 'Results not available');
      toast.error('Results not available');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">Results Not Available</p>
            <p className="text-sm mt-1">{error || 'The poll creator has not published results yet.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{results.poll.title}</h1>
          {results.poll.description && (
            <p className="mt-2 text-gray-600">{results.poll.description}</p>
          )}
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Total Responses: {results.poll.totalResponses}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Poll Results</h2>
          
          {results.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {qIndex + 1}. {question.text}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {question.totalResponses} total responses
              </p>
              
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{option.text}</span>
                      <span className="text-gray-500">
                        {option.votes} vote{option.votes !== 1 ? 's' : ''} ({option.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Results published on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Powered by Poll Platform</p>
        </div>
      </div>
    </div>
  );
};