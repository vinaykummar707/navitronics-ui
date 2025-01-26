import React, { useState } from "react";
import axios from "../config/axios";
import Bus from '../../Assests/BusImage.png'; 
import BackgroundImage from '../../Assests/BackGround.png'; 
import Logo from '../../Assests/Navitronix.png'; 
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const user  = useAuthStore((state) => state.user);
  const navigate = useNavigate();



  const handleLogin = async (e) => {
    e.preventDefault();
  
   
    const params = new URLSearchParams();
    params.append('userName', userId);
    params.append('password', password);
  
  
    const url = `/authentication/login?${params.toString()}`;
 
    try {
      const response = await axios.post(url); 
  
      // Handle successful response
      console.log('Login successful:', response.data);
  
      // Save the response data to local storage
      // const { userId, token, refreshToken, organizationId, userRole } = response.data;
      
      // localStorage.setItem('userId', userId);
      // localStorage.setItem('token', token);
      // localStorage.setItem('refreshToken', refreshToken);
      // localStorage.setItem('organizationId', organizationId);
      // localStorage.setItem('userRole', userRole);
  
      console.log(response.data)
      login(response.data); // Set the user as authenticated
     // Navigate based on user role
    //  if (user.userRole === 'organization_admin') {
    //   navigate('/home/organizations');
    // } else if (user.userRole === 'area_admin') {
    //   navigate('/home/areas');
    // } else if (user.userRole === 'depot_admin') {
    //   navigate('/home/depots');
    // } else {
      navigate('/home'); // Default navigation if role is not recognized
    // }
  
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');  
    }
  };
  

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: `url(/assets/BackGround.png)`, 
        backgroundSize: 'cover',  
        backgroundPosition: 'center', 
      }}
    >
      <div className="absolute top-10 left-10">
        <img src='/assets/Navitronix.png' alt="Logo" className="h-36" />
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl">
        <div className="w-1/2">
          <img
            src='/assets/BusImage.png'
            alt="Our Vision"
            className="h-full w-full object-cover "
          />
        </div>

        <div
          className="rounded-[30px] shadow-2xl p-8 w-[400px] h-[500px] relative bg-white bg-opacity-75"
        >
          <h1 className="text-custom-blue-dark text-2xl font-bold mb-10 ml-8 mt-10">
            Login
          </h1>

       
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="bg-custom-blue-dark text-white placeholder-white px-4 py-3 w-full rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="mb-6 relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-custom-blue-dark text-white placeholder-white px-4 py-3 w-full rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex justify-end mb-6">
              <a
                href="/ForgotPassword"
                className="text-gray-600 hover:underline hover:text-purple-900"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="bg-white text-custom-blue-dark font-bold w-full px-36 py-2 rounded-lg shadow-md hover:bg-custom-blue-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Login
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/ForgotUserId" className="text-gray-600 hover:underline">
              Forgot User ID
            </a>
          </div>
          <div className="text-center mt-4">
            <a href="/ForgotAdminUserId" className="text-gray-600 hover:underline">
              Forgot Admin-User-ID
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
