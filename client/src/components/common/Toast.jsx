import { Toaster, toast } from "react-hot-toast";

// The React Component to be rendered in App.jsx
const Toast = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500'
        },
        success: {
          style: { background: '#10B981' } // Emerald green
        },
        error: {
          style: { background: '#EF4444' } // Red
        }
      }}
    />
  );
};

// Utility functions for use across the app
export const showSuccess = (msg) => toast.success(msg);
export const showError   = (msg) => toast.error(msg);
export const showLoading = (msg) => toast.loading(msg);
export const showInfo    = (msg) =>
  toast(msg, {
    icon: "ℹ️",
    style: { background: "#EFF6FF", color: "#1D4ED8" },
  });

export const dismissToast = (id) => toast.dismiss(id);

export default Toast;