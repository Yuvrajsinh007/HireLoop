import toast from "react-hot-toast";

// Convenience wrappers around react-hot-toast
export const showSuccess = (msg) => toast.success(msg);
export const showError   = (msg) => toast.error(msg);
export const showLoading = (msg) => toast.loading(msg);
export const showInfo    = (msg) =>
  toast(msg, {
    icon: "ℹ️",
    style: { background: "#EFF6FF", color: "#1D4ED8" },
  });

export const dismissToast = (id) => toast.dismiss(id);

export default toast;