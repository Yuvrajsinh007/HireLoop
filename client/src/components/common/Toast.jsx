import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        top: 88,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#334155",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
          fontSize: "14px",
          fontWeight: "600",
          maxWidth: "420px",
        },
        success: {
          icon: <CheckCircle2 size={19} className="text-emerald-600" />,
          style: {
            borderLeft: "4px solid #10B981",
          },
        },
        error: {
          icon: <XCircle size={19} className="text-rose-600" />,
          style: {
            borderLeft: "4px solid #F43F5E",
          },
        },
        loading: {
          style: {
            borderLeft: "4px solid #8B5CF6",
          },
        },
      }}
    />
  );
};

export const showSuccess = (message) => toast.success(message);

export const showError = (message) => toast.error(message);

export const showLoading = (message) => toast.loading(message);

export const showInfo = (message) =>
  toast(message, {
    icon: <Info size={19} className="text-violet-600" />,
    style: {
      background: "#F5F3FF",
      color: "#5B21B6",
      border: "1px solid #DDD6FE",
      borderLeft: "4px solid #8B5CF6",
      borderRadius: "14px",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.1)",
      fontWeight: "600",
    },
  });

export const showWarning = (message) =>
  toast(message, {
    icon: <CircleAlert size={19} className="text-amber-600" />,
    style: {
      background: "#FFFBEB",
      color: "#92400E",
      border: "1px solid #FDE68A",
      borderLeft: "4px solid #F59E0B",
      borderRadius: "14px",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.1)",
      fontWeight: "600",
    },
  });

export const dismissToast = (id) => toast.dismiss(id);

export default Toast;