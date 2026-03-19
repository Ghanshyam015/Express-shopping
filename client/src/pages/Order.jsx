import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../components/Container";
import PriceFormat from "../components/PriceFormat";
import { addToCart, setOrderCount } from "../redux/orebiSlice";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import {
  FaShoppingBag,
  FaEye,
  FaCreditCard,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaShoppingCart,
  FaFileInvoice,
  FaPrint,
} from "react-icons/fa";

const Order = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  const cartProducts = useSelector((state) => state.orebiReducer.products);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    order: null,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // Invoice state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: selectedInvoiceOrder ? `Invoice_${selectedInvoiceOrder._id}` : "Invoice",
  });

  const handleViewInvoice = (order, e) => {
    e.stopPropagation();
    setSelectedInvoiceOrder(order);
    setShowInvoiceModal(true);
  };

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/order/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        // Update order count in Redux
        dispatch(setOrderCount(data.orders.length));
      } else {
        setError(data.message || "Failed to fetch orders");
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
      return;
    }
    fetchUserOrders();
  }, [userInfo, navigate, fetchUserOrders]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);



  const handleAddOrderToCart = async (order, e) => {
    e.stopPropagation(); // Prevent modal from opening

    // Open confirmation modal
    setConfirmModal({
      isOpen: true,
      order: order,
    });
  };

  const confirmAddToCart = async () => {
    const order = confirmModal.order;

    try {
      let addedCount = 0;
      let updatedCount = 0;

      // Add each item to cart
      order.items.forEach((item) => {
        const existingCartItem = cartProducts.find(
          (cartItem) => cartItem._id === (item.productId || item._id)
        );

        const cartItem = {
          _id: item.productId || item._id, // Handle both productId and _id
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          // Add additional fields that might be needed for cart functionality
          description: item.description,
          category: item.category,
          brand: item.brand,
        };

        if (existingCartItem) {
          updatedCount++;
        } else {
          addedCount++;
        }

        dispatch(addToCart(cartItem));
      });

      // Create more descriptive success message
      let message = "";
      if (addedCount > 0 && updatedCount > 0) {
        message = `${addedCount} new item${addedCount !== 1 ? "s" : ""
          } added and ${updatedCount} existing item${updatedCount !== 1 ? "s" : ""
          } updated in cart!`;
      } else if (addedCount > 0) {
        message = `${addedCount} item${addedCount !== 1 ? "s" : ""
          } added to cart!`;
      } else {
        message = `${updatedCount} item${updatedCount !== 1 ? "s" : ""
          } updated in cart!`;
      }

      toast.success(message, {
        duration: 4000,
        icon: "🛒",
      });

      // Show additional toast with option to view cart
      setTimeout(() => {
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <span>View your updated cart?</span>
              <button
                onClick={() => {
                  navigate("/cart");
                  toast.dismiss(t.id);
                }}
                className="bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
              >
                View Cart
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: 6000,
            icon: "👀",
          }
        );
      }, 1000);

      setConfirmModal({ isOpen: false, order: null });
    } catch (error) {
      console.error("Error adding items to cart:", error);
      toast.error("Failed to add items to cart");
      setConfirmModal({ isOpen: false, order: null });
    }
  };

  const cancelAddToCart = () => {
    setConfirmModal({ isOpen: false, order: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="w-4 h-4" />;
      case "confirmed":
        return <FaCheckCircle className="w-4 h-4" />;
      case "shipped":
        return <FaTruck className="w-4 h-4" />;
      case "delivered":
        return <FaBox className="w-4 h-4" />;
      case "cancelled":
        return <FaTimes className="w-4 h-4" />;
      default:
        return <FaClock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaTimes className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Orders
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUserOrders}
              className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <Container className="py-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaShoppingBag className="w-8 h-8" />
              My Orders
            </h1>
            <nav className="flex text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Orders</span>
            </nav>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {orders.length === 0 ? (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <FaShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-8">
                You haven&apos;t placed any orders yet. Start shopping to see
                your orders here!
              </p>
              <Link to="/shop">
                <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
                  Start Shopping
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </p>
              <button
                onClick={fetchUserOrders}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Refresh
              </button>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("_id")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Order ID
                          {sortConfig.key === "_id" ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("date")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Date
                          {sortConfig.key === "date" ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("amount")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Total
                          {sortConfig.key === "amount" ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Status
                          {sortConfig.key === "status" ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedOrders.map((order) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => openOrderModal(order)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex -space-x-2 mr-3">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div
                                  key={index}
                                  className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white overflow-hidden"
                                >
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    +{order.items.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {order.items[0]?.name}
                                {order.items.length > 1 &&
                                  `, +${order.items.length - 1} more`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            <PriceFormat amount={order.amount} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentMethod === "cod" ? (
                              <FaMoneyBillWave className="w-3 h-3" />
                            ) : (
                              <FaCreditCard className="w-3 h-3" />
                            )}
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleViewInvoice(order, e)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                              title="View Invoice"
                            >
                              <FaFileInvoice className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrderModal(order);
                              }}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleAddOrderToCart(order, e)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Add to Cart"
                            >
                              <FaShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* Add to Cart Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && confirmModal.order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={cancelAddToCart}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                    <FaShoppingCart className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Add Order to Cart
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to move all items from order{" "}
                    <span className="font-semibold">
                      #{confirmModal.order._id.slice(-8).toUpperCase()}
                    </span>{" "}
                    to your cart? This will add{" "}
                    {confirmModal.order.items.length} item
                    {confirmModal.order.items.length !== 1 ? "s" : ""} to your
                    cart.
                  </p>

                  {/* Order Items Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-6 max-h-40 overflow-y-auto">
                    <div className="text-xs text-gray-500 mb-2 flex justify-between font-medium">
                      <span>Items to add:</span>
                      <span>Qty × Price</span>
                    </div>
                    {confirmModal.order.items.map((item, index) => {
                      const isInCart = cartProducts.find(
                        (cartItem) =>
                          cartItem._id === (item.productId || item._id)
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm py-1 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 object-cover rounded mr-2 flex-shrink-0"
                              />
                            )}
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-gray-700 truncate">
                                {item.name}
                              </span>
                              {isInCart && (
                                <span className="text-xs text-blue-600">
                                  Already in cart (qty: {isInCart.quantity}) -
                                  will be updated
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-500 ml-2 flex items-center gap-2">
                            <span className="text-xs">x{item.quantity}</span>
                            <span className="text-xs">×</span>
                            <PriceFormat amount={item.price} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-gray-300">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Value:</span>
                        <PriceFormat amount={confirmModal.order.amount} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelAddToCart}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAddToCart}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoice Modal */}
        {showInvoiceModal && selectedInvoiceOrder && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4 print:p-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:shadow-none print:rounded-none">
              {/* Modal Actions */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
                <h3 className="text-lg font-bold text-gray-900">
                  Invoice Preview
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="p-8 print:p-8" ref={componentRef}>
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      INVOICE
                    </h1>
                    <p className="text-gray-600">
                      #{selectedInvoiceOrder._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Express Shopping
                    </h2>
                    <p className="text-sm text-gray-500">
                      123 Commerce St, Tech City
                    </p>
                    <p className="text-sm text-gray-500">
                      support@expressshopping.com
                    </p>
                  </div>
                </div>

                {/* Bill To / Date */}
                <div className="flex justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                      Bill To
                    </h3>
                    <div className="text-gray-900">
                      <p className="font-bold">
                        {selectedInvoiceOrder.address?.firstName ||
                          selectedInvoiceOrder.userId?.name}
                      </p>
                      <p>{selectedInvoiceOrder.address?.email}</p>
                      <p>{selectedInvoiceOrder.address?.street}</p>
                      <p>
                        {selectedInvoiceOrder.address?.city},{" "}
                        {selectedInvoiceOrder.address?.state}
                      </p>
                      <p>
                        {selectedInvoiceOrder.address?.zipcode},{" "}
                        {selectedInvoiceOrder.address?.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">
                        Invoice Date
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedInvoiceOrder.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">
                        Order ID
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {selectedInvoiceOrder._id.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase">
                        Item Description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoiceOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <p className="font-medium">{item.name}</p>
                          {item.brand && (
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          <PriceFormat amount={item.price} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                          <PriceFormat amount={item.price * item.quantity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end border-t border-gray-200 pt-8">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        <PriceFormat amount={selectedInvoiceOrder.amount} />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (0%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                      <span>Total</span>
                      <span>
                        <PriceFormat amount={selectedInvoiceOrder.amount} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                  <p>Thank you for your business!</p>
                  <p className="mt-2">
                    Payment Status:{" "}
                    <span
                      className={`font-bold ${selectedInvoiceOrder.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                        }`}
                    >
                      {selectedInvoiceOrder.paymentStatus.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Order;
