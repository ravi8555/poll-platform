// frontend/src/pages/PublicResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { socketService } from '../services/socketService';

export const PublicResultsPage: React.FC = () => {
  const { shareableLink } = useParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (shareableLink) {
    fetchResults();
  }
}, [shareableLink]);

//  useEffect(() => {
//   const setupSocket = async () => {
//     if (!results?.poll?._id) return;

//     await socketService.connect();

//     socketService.joinPollRoom(results.poll._id);

//     const handleUpdate = async (data: any) => {
//       if (data.pollId === results.poll._id) {
//         await fetchResults();
//       }
//     };

//     socketService.on('response-count-update', handleUpdate);

//     return () => {
//       socketService.off('response-count-update', handleUpdate);
//       socketService.leavePollRoom(results.poll._id);
//     };
//   };

//   setupSocket();
// }, [results?.poll?._id]);

useEffect(() => {
  const setupSocket = async () => {
    if (!results?.poll?.id) return;

    await socketService.connect();

    socketService.joinPollRoom(results.poll.id);

    const handleUpdate = async (data: any) => {
      if (data.pollId === results.poll.id) {
        await fetchResults();
      }
    };

    socketService.on('response-count-update', handleUpdate);

    return () => {
      socketService.off('response-count-update', handleUpdate);
      socketService.leavePollRoom(results.poll.id);
    };
  };

  setupSocket();
}, [results?.poll?.id]);


  const fetchResults = async () => {
    try {
      const data = await analyticsService.getPublicResults(shareableLink!);
      setResults(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Results not available');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading results...</div>;
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Results have not been published yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{results.poll.title}</h1>
      <p className="text-gray-600 mb-6">Total Responses: {results.poll.totalResponses}</p>
      
      {results.questions.map((question: any, idx: number) => (
        <div key={idx} className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="font-semibold mb-3">{question.text}</h3>
          {question.options.map((option: any) => (
            <div key={option.id} className="mb-2">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span>{option.votes} votes ({option.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${option.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};