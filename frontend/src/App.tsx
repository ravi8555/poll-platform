// // frontend/src/App.tsx
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import { ProtectedRoute } from './components/auth/ProtectedRoute';
// import { Navbar } from './components/common/Navbar';
// import { HomePage } from './pages/HomePage';
// import { LoginPage } from './pages/LoginPage';
// import { DashboardPage } from './pages/DashboardPage';
// import { CreatePollPage } from './pages/CreatePollPage';
// import { PollDetailsPage } from './pages/PollDetailPage';
// import { AnalyticsPage } from './pages/AnalyticsPage';
// import { PublicPollPage } from './pages/PublicPollPage';
// import { ResultsPage } from './pages/ResultsPage';
// import { ThankYouPage } from './pages/ThankYouPage';

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Toaster position="top-right" />
//         <Navbar />
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/poll/:link" element={<PublicPollPage />} />
//           <Route path="/poll/:link/thank-you" element={<ThankYouPage />} />
//           <Route path="/results/:shareableLink" element={<ResultsPage />} />
          
//           {/* Protected Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/polls/create"
//             element={
//               <ProtectedRoute>
//                 <CreatePollPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/polls/:pollId"
//             element={
//               <ProtectedRoute>
//                 <PollDetailsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/polls/:pollId/analytics"
//             element={
//               <ProtectedRoute>
//                 <AnalyticsPage />
//               </ProtectedRoute>
//             }
//           />
          
//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;










// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Remove Navigate if not needed
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollDetailsPage } from './pages/PollDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublicPollPage } from './pages/PublicPollPage';
import { ResultsPage } from './pages/ResultsPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { PublicResultsPage } from './pages/PublicResultsPage';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          {/* PUBLIC ROUTES - accessible to everyone */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/poll/:link" element={<PublicPollPage />} />
          <Route path="/poll/:link/thank-you" element={<ThankYouPage />} />
          <Route path="/results/:shareableLink" element={<ResultsPage />} />
          <Route path="/results/:shareableLink" element={<PublicResultsPage />} />
          
          {/* PROTECTED ROUTES - require login */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/polls/create" element={
            <ProtectedRoute>
              <CreatePollPage />
            </ProtectedRoute>
          } />
          <Route path="/polls/:pollId" element={
            <ProtectedRoute>
              <PollDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/polls/:pollId/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;