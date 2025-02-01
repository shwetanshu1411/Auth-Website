import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios"; // Added axios import
import { toast } from "react-toastify"; // Ensure toast is properly imported

// Create the AppContext
export const AppContext = createContext();

// Create the AppContextProvider component
export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true; // Added axios defaults

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [UserData, setUserData] = useState(null);

    // Run the authentication check on component mount
  useEffect(() => {
    getAuthState();
  }, []);
  

  // Function to fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user data.");
    }
  };

  // Function to check authentication state
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch auth state.");
    }
  };

  // Context value to be provided to consumers
  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    UserData,
    setUserData,
    getUserData,
  };

  AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
