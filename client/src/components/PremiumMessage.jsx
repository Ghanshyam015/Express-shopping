import { motion } from "framer-motion";
import { FaStar, FaGift, FaCode, FaRocket, FaLock } from "react-icons/fa";
import { MdSecurity, MdSupportAgent } from "react-icons/md";

const PremiumMessage = ({
  title = "Premium Features",
  description = "This functionality is available in the premium version.",
  showFeatures = true,
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Focus */}


      {showFeatures && (
        <>
          {/* What You Get - Highlight Premium Value */}
          <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto text-center"
              >


                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/30">
                    <FaCode className="text-4xl text-amber-400 mb-6 mx-auto" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Complete Source Code
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Frontend React components, backend Node.js API, database
                      models, and authentication system
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
                    <MdSecurity className="text-4xl text-blue-400 mb-6 mx-auto" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Admin Dashboard
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Manage all features, users, and system settings with a
                      professional admin interface
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30">
                    <FaRocket className="text-4xl text-green-400 mb-6 mx-auto" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Advanced Features
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Real-time functionality, notifications, file handling, and
                      email integration
                    </p>
                  </div>
                </div>


              </motion.div>
            </div>
          </section>

        </>
      )}
    </div>
  );
};

export default PremiumMessage;
