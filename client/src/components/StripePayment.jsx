import { useState } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { FaCreditCard, FaLock, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

// ✅ Stripe init (Vite env)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ================= CHECKOUT FORM =================
const CheckoutForm = ({ orderId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe not loaded");
      return;
    }

    if (isProcessing) return; // ✅ prevent double click

    setIsProcessing(true);
    setCardError(null);

    try {
      // ✅ Create PaymentIntent from backend
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8000/api/payment/stripe/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Failed to create payment");
      }

      // ✅ Confirm Card Payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setCardError(result.error.message);
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      console.error(err);
      setCardError("Payment failed. Try again.");
      toast.error("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: "18px",
        color: "#ffffff",
        fontWeight: "500",
        fontFamily: "'Courier New', monospace",
        "::placeholder": { color: "#ffffff80" },
        transition: "border 0.2s",
      },
      invalid: { color: "#ff6b6b", borderColor: "#ff6b6b" },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ================= CARD UI ================= */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Card Information
        </label>

        <div className="relative w-full max-w-sm mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl" />

            {/* CHIP */}
            <div className="relative mb-8">
              <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
            </div>

            {/* CARD NUMBER */}
            <div className="relative mb-6">
              <div className="text-white text-xs mb-2 opacity-80">
                CARD NUMBER
              </div>
              <div className={`bg-white/20 rounded-lg p-3 border transition-all ${cardError ? 'border-red-500 ring-2 ring-red-400' : 'border-white/30'}`}>
                <CardElement
                  options={cardStyle}
                  onChange={(e) =>
                    setCardError(e.error ? e.error.message : null)
                  }
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between text-white text-sm">
              <span>YOUR NAME</span>
              <span>MM/YY</span>
            </div>

            {/* BRAND */}
            <div className="absolute top-4 right-4">
              <FaCreditCard className="text-white/80 w-6 h-6" />
            </div>
          </div>
        </div>

        {cardError && (
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg shadow-sm animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
              <span className="font-medium">{cardError}</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= AMOUNT ================= */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-700">Amount</span>
          <span className="font-bold">${amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <FaLock />
          Secured by Stripe
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaCreditCard />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ================= MAIN COMPONENT =================
const StripePayment = ({ orderId, amount, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaCreditCard className="text-blue-600 w-6 h-6" />
          <h3 className="text-xl font-semibold">Pay with Card</h3>
        </div>

        <CheckoutForm
          orderId={orderId}
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </div>
    </Elements>
  );
};

// ================= PROPS =================
StripePayment.propTypes = {
  orderId: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

CheckoutForm.propTypes = StripePayment.propTypes;

export default StripePayment;
