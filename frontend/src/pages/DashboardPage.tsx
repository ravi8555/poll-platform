// // frontend/src/pages/DashboardPage.tsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { pollService } from '../services/pollService';
// import type { Poll } from '../types/types.js';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { socketService } from '../services/socketService';


// export const DashboardPage: React.FC = () => {
//   const { logout, user, getWebSocketToken } = useAuth();
//   const [polls, setPolls] = useState<Poll[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [liveUpdates, setLiveUpdates] = useState<Record<string, boolean>>({});
//   const navigate = useNavigate();
  

//   useEffect(() => {
//     fetchPolls();
//   }, []);

//   // Setup WebSocket connection
//   useEffect(() => {
//     const setupSocket = async () => {
//       if (user) {
//         const token = await getWebSocketToken();
//         if (token) {
//           socketService.connect(token);
          
//           // Join all poll rooms to receive live updates
//           polls.forEach(poll => {
//             socketService.joinPollRoom(poll._id);
//           });
          
//           // Listen for live response updates
//           const handleResponseUpdate = (data: any) => {
//             console.log('Live update received:', data);
//             setPolls(prevPolls => 
//               prevPolls.map(poll => 
//                 poll._id === data.pollId 
//                   ? { ...poll, totalResponses: data.count }
//                   : poll
//               )
//             );
//             // Show live indicator
//             setLiveUpdates(prev => ({ ...prev, [data.pollId]: true }));
//             setTimeout(() => {
//               setLiveUpdates(prev => ({ ...prev, [data.pollId]: false }));
//             }, 3000);
//           };
          
//           socketService.on('response-count-update', handleResponseUpdate);
//         }
//       }
//     };
    
//     setupSocket();
    
//     return () => {
//       socketService.disconnect();
//     };
//   }, [user, polls.length]);

//   const fetchPolls = async () => {
//     try {
//       const data = await pollService.getMyPolls();
//       setPolls(data.polls);
//     } catch (error) {
//       toast.error('Failed to load polls');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (confirm('Are you sure you want to delete this poll?')) {
//       try {
//         await pollService.deletePoll(id);
//         toast.success('Poll deleted');
//         fetchPolls();
//       } catch (error) {
//         toast.error('Failed to delete poll');
//       }
//     }
//   };

//   const copyLink = (link: string) => {
//     const fullLink = `${window.location.origin}/poll/${link}`;
//     navigator.clipboard.writeText(fullLink);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   if (loading) {
//     return <div className="text-center py-12">Loading...</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">My Polls</h1>
//         <div className="flex space-x-3">
//           <Link
//             to="/polls/create"
//             className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//           >
//             Create New Poll
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {polls.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <p className="text-gray-600">No polls yet. Create your first poll!</p>
//         </div>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {polls.map((poll) => (
//             <div key={poll._id} className="bg-white rounded-lg shadow-md p-6">
//               <div className="flex justify-between items-start">
//                 <h3 className="text-xl font-semibold mb-2">{poll.title}</h3>
//                 {liveUpdates[poll._id] && (
//                   <span className="flex items-center space-x-1">
//                     <span className="relative flex h-3 w-3">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                       <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
//                     </span>
//                     <span className="text-xs text-green-600 animate-pulse">Live</span>
//                   </span>
//                 )}
//               </div>
//               <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                 {poll.description || 'No description'}
//               </p>
              
//               <div className="space-y-2 text-sm">
//                 <p className="text-gray-500">
//                   Responses: <span className="font-semibold">{poll.totalResponses}</span>
//                 </p>
//                 <p className="text-gray-500">
//                   Expires: {new Date(poll.expiryDate).toLocaleDateString()}
//                 </p>
//                 <p className="text-gray-500">
//                   Status: {poll.isActive ? 'Active' : 'Inactive'}
//                 </p>
//                 <p className="text-gray-500">
//                   Type: {poll.responseMode === 'anonymous' ? 'Anonymous' : 'Authenticated'}
//                 </p>
//               </div>
              
//               <div className="mt-4 flex space-x-2">
//                 <button
//                   onClick={() => copyLink(poll.shareableLink)}
//                   className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
//                 >
//                   Share
//                 </button>
                
//                 <Link
//                   to={`/polls/${poll._id}/analytics`}
//                   className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm text-center hover:bg-indigo-200"
//                 >
//                   Analytics
//                 </Link>
                
//                 <button
//                   onClick={() => handleDelete(poll._id)}
//                   className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { pollService } from '../services/pollService';
import type { Poll } from '../types/types.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';

export const DashboardPage: React.FC = () => {
  const { logout, user, getWebSocketToken } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdates, setLiveUpdates] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  // Create the ref here
  const responseUpdateRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const setupSocket = async () => {
      if (user && polls.length > 0) {
        const token = await getWebSocketToken();
        if (token) {
          // Connect socket
          socketService.connect(token);
          
          // Join all poll rooms
          polls.forEach(poll => {
            socketService.joinPollRoom(poll._id);
          });
          
          // Create the handler function
          const handleResponseUpdate = (data: any) => {
            console.log('Dashboard: Live update received:', data);
            setPolls(prevPolls => 
              prevPolls.map(poll => 
                poll._id === data.pollId 
                  ? { ...poll, totalResponses: data.count }
                  : poll
              )
            );
            // Show live indicator
            setLiveUpdates(prev => ({ ...prev, [data.pollId]: true }));
            setTimeout(() => {
              setLiveUpdates(prev => ({ ...prev, [data.pollId]: false }));
            }, 3000);
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
      if (responseUpdateRef.current) {
        socketService.off('response-count-update', responseUpdateRef.current);
        responseUpdateRef.current = null;
      }
    };
  }, [user, polls.length, getWebSocketToken]);

  const fetchPolls = async () => {
    try {
      const data = await pollService.getMyPolls();
      setPolls(data.polls);
    } catch (error) {
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      try {
        await pollService.deletePoll(id);
        toast.success('Poll deleted');
        fetchPolls();
      } catch (error) {
        toast.error('Failed to delete poll');
      }
    }
  };

  const copyLink = (link: string) => {
    const fullLink = `${window.location.origin}/poll/${link}`;
    navigator.clipboard.writeText(fullLink);
    toast.success('Link copied to clipboard!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Polls</h1>
        <div className="flex space-x-3">
          <Link
            to="/polls/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Poll
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No polls yet. Create your first poll!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <div key={poll._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold mb-2">{poll.title}</h3>
                {liveUpdates[poll._id] && (
                  <span className="flex items-center space-x-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-600 animate-pulse">Live</span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {poll.description || 'No description'}
              </p>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-500">
                  Responses: <span className="font-semibold">{poll.totalResponses}</span>
                </p>
                <p className="text-gray-500">
                  Expires: {new Date(poll.expiryDate).toLocaleDateString()}
                </p>
                <p className="text-gray-500">
                  Status: {poll.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-gray-500">
                  Type: {poll.responseMode === 'anonymous' ? 'Anonymous' : 'Authenticated'}
                </p>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => copyLink(poll.shareableLink)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                >
                  Share
                </button>
                
                <Link
                  to={`/polls/${poll._id}/analytics`}
                  className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm text-center hover:bg-indigo-200"
                >
                  Analytics
                </Link>
                
                <button
                  onClick={() => handleDelete(poll._id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};