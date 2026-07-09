import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    try {
      setLoading(true);
      await forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md card fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-sm text-gray-500 mt-1">We'll send a reset link to your email</p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📧</div>
            <p className="text-gray-700 font-medium">Reset link sent!</p>
            <p className="text-sm text-gray-500 mt-1">Check your inbox and follow the instructions.</p>
            <Link to="/login" className="btn-primary mt-4 inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@charusat.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;