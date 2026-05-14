// // frontend/src/pages/LoginPage.tsx
// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';

// // import { useAuth } from '../context/AuthContext';
// // import toast from 'react-hot-toast'

// // export const  LoginPage : React.FC = ()=>{

// //     const [isLogin , setIsLogin] = useState(true);
// //     const [ email, setEmail] = useState('')
// //     const [password, setPassword] = useState('');
// //   const [name, setName] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const { login, register, oidcLogin} = useAuth();
// //   const navigate = useNavigate();

// //   const handleSubmit = async (e: React.FormEvent)=>{
// //     e.preventDefault();

// //     setLoading(true)

// //     try {
// //       if(isLogin){
// //         await login(email, password);
// //         toast.success('Logged in successfully')
// //         navigate('/dashboard')
// //       }else{
// //         await register(name, email, password)
// //         toast.success('Register Successfully')
// //         navigate('/dashboard')
// //       }
      
// //     } catch (error:any) {
// //       toast.error(error.response?.data?.error || "Authenticate failed")
// //     }finally{
// //       setLoading(false)
// //     }
// //   }

// //   const handleOIDClogin = ()=>{
// //     oidcLogin()
// //   }

// // return (
// //  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

// //   <div className="sm:mx-auto sm:w-full sm:max-w-md">
// //         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
// //           Poll Platform
// //         </h2>
// //         <p className="mt-2 text-center text-sm text-gray-600">
// //             {isLogin ? 'Sign in to your account' : 'Create a account'}
// //         </p>        
// //    </div>

// //   <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
// //         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             { !isLogin && (
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700">Name</label>

// //                 <input type="text" value={name}
// //                 onChange={(e)=> setName(e.target.value)} 
// //                 required
// //                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
// //                 />

// //               </div>
// //             )}

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Email</label>
// //               <input
// //               type='text'
// //               value={email}
// //               onChange={(e)=> setEmail(e.target.value)}
              
// //               required
// //                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              
// //               />

// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Password</label>
// //               <input type='password' 
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               required
// //                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
// //               />
// //             </div> 
// //             <button type='submit'
// //             disabled={loading}
// //             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
// //             >
// //             {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up') }
// //             </button> 

// //           </form>
// //           <div className="mt-6">
// //             <div className="relative">
// //               <div className="absolute inset-0 flex items-center">
// //                 <div className="w-full border-t border-gray-300"></div>
// //               </div>
// //               <div className="relative flex justify-center text-sm">
// //                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
// //               </div>
// //             </div>
// //             <button
// //             onClick={handleOIDClogin} className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
// //             >
// //               Sign in with SSO (OIDC)

// //             </button>
// //           </div> 
// //           <div className="mt-6 text-center">
// //             <button
// //             onClick={()=> setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:text-indigo-500"
// //             >
// //               {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
// //             </button>
// //           </div>










// //         </div>
// //   </div>






// //  </div>
 

// // )





// // }












// // frontend/src/pages/LoginPage.tsx

// import React, { useState, useEffect} from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// export const LoginPage: React.FC = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { user, login, register, oidcLogin } = useAuth();
//   const navigate = useNavigate();

//   // Redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       navigate('/dashboard');
//     }
//   }, [user, navigate]);


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       if (isLogin) {
//         await login(email, password);
//         toast.success('Logged in successfully!');
//       } else {
//         await register(name, email, password);
//         toast.success('Registered successfully!');
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Authentication failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOIDCLogin = () => {
//     oidcLogin();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Poll Platform
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           {isLogin ? 'Sign in to your account' : 'Create a new account'}
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {!isLogin && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//             >
//               {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
//             </button>
//           </form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <button
//               onClick={handleOIDCLogin}
//               className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             >
//               Sign in with SSO (OIDC)
//             </button>
//           </div>

//           <div className="mt-6 text-center">
//             <button
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-sm text-indigo-600 hover:text-indigo-500"
//             >
//               {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, register, oidcLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        await register(name, email, password);
        toast.success('Registered successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOIDCLogin = () => {
    oidcLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Poll Platform
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleOIDCLogin}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign in with SSO (OIDC)
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};