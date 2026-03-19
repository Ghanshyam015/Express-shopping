import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Title from "../components/ui/title";
import SkeletonLoader from "../components/SkeletonLoader";
import { serverUrl } from "../../config";
import { useReactToPrint } from "react-to-print";
import {
  FaSearch,
  FaFileInvoice,
  FaPrint,
  FaTimes,
  FaEye,
  FaDownload,
} from "react-icons/fa";

const Invoice = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const componentRef = useRef();

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/order/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: selectedOrder ? `Invoice_${selectedOrder._id}` : "Invoice",
  });

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div>
        <Title>Invoices</Title>
        <div className="mt-6">
          <SkeletonLoader type="orders" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title>Invoice Management</Title>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Order ID, Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      INV-{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.userId?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.userId?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ${order.amount.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs inline-flex px-2 py-0.5 rounded-full ${order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewInvoice(order)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 flex items-center gap-1 ml-auto"
                    >
                      <FaFileInvoice /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
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
                    #{selectedOrder._id.slice(-6).toUpperCase()}
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
                      {selectedOrder.address?.firstName ||
                        selectedOrder.userId?.name}
                    </p>
                    <p>{selectedOrder.address?.email}</p>
                    <p>{selectedOrder.address?.street}</p>
                    <p>
                      {selectedOrder.address?.city},{" "}
                      {selectedOrder.address?.state}
                    </p>
                    <p>
                      {selectedOrder.address?.zipcode},{" "}
                      {selectedOrder.address?.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">
                      Invoice Date
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedOrder.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">
                      Order ID
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {selectedOrder._id.toUpperCase()}
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
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <p className="font-medium">{item.name}</p>
                        {item.brand && (
                          <p className="text-xs text-gray-500">{item.brand}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
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
                    <span>${selectedOrder.amount.toFixed(2)}</span>
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
                    <span>${selectedOrder.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-2">
                  Payment Status:{" "}
                  <span
                    className={`font-bold ${selectedOrder.paymentStatus === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                      }`}
                  >
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
