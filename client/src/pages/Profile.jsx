import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { addUser, removeUser, resetOrderCount } from "../redux/orebiSlice";
import Container from "../components/Container";
import { FaSignOutAlt, FaUserCircle, FaCog, FaHeart } from "react-icons/fa";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
      return;
    }

    // Fetch fresh user data from server
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const userData = response.data.user;
          // Update Redux store with fresh data
          dispatch(addUser(userData));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, [userInfo, navigate, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(removeUser());
    dispatch(resetOrderCount());
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-4xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userInfo.name}!
                  </h1>
                  <p className="text-gray-600">
                    Manage your account and preferences
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </motion.div>

          {/* User Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {userInfo.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {userInfo.email}
                </p>
                {userInfo.phone && (
                  <p className="text-gray-700">
                    <span className="font-medium">Phone:</span> {userInfo.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Joined:</span>{" "}
                  {userInfo.createdAt
                    ? new Date(userInfo.createdAt).toLocaleDateString()
                    : "-"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Role:</span>{" "}
                  {userInfo.role || "Customer"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaCog /> Account Settings
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                <FaHeart />{" "}
                <a href="/wishlist">Wishlist</a>
              </button>
            </div>
          </motion.div>

          {/* Orders Section (optional, can be expanded) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order History
            </h2>
            <p className="text-gray-600">
              Your recent orders will appear here.
            </p>
            {/* TODO: Integrate order list if available */}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default Profile;
