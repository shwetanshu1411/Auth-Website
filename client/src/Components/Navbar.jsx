import { assets } from '../assets/assets';
import {  useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext'; // Corrected import
import axios from 'axios';
import { toast } from 'react-toastify';
function Navbar() {
  const navigate = useNavigate();
  const { UserData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext); // Corrected variable names


  const sendVerificationOtp = async () => {

    try{
      axios.defaults.withCredentials = true;

      const {data}=await axios.post(backendUrl+'/api/auth/send-verify-otp')

      if(data.success){
        navigate('/email-verify')
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }

    }catch(error){
       toast.error(error.message)
    }
  }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />

      {UserData ? (
        <div className="relative group">
          <div className="w-8 h-8 flex justify-center items-center bg-gray-800 text-white rounded-full">
            {UserData.name[0].toUpperCase()}
          </div>
          <div className="absolute hidden group-hover:block top-10 right-0 bg-white text-gray-800 rounded shadow-md">
            <ul className="list-none m-0 p-2 text-sm">
              {!UserData.isAccountVerified && 
                <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">
                  Verify Email
                </li>
              }
              <li
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="Arrow Icon" />
        </button>
      )}
    </div>
  );
}

export default Navbar;
