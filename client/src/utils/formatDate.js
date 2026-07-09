/**
 * Format date to readable string
 * e.g. "12 Jan 2025"
 */
export const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  
  /**
   * Format date with time
   * e.g. "12 Jan 2025, 10:30 AM"
   */
  export const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  /**
   * Relative time
   * e.g. "2 hours ago", "3 days ago"
   */
  export const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year",   seconds: 31536000 },
      { label: "month",  seconds: 2592000  },
      { label: "week",   seconds: 604800   },
      { label: "day",    seconds: 86400    },
      { label: "hour",   seconds: 3600     },
      { label: "minute", seconds: 60       },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };
  
  /**
   * Format CTC
   * e.g. 12.5 → "12.5 LPA"
   */
  export const formatCTC = (ctc) => {
    if (!ctc) return "Not disclosed";
    return `${ctc} LPA`;
  };
  
  /**
   * Get current academic year
   * e.g. "2024-25"
   */
  export const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    // Academic year starts in July
    if (month >= 6) return `${year}-${String(year + 1).slice(2)}`;
    return `${year - 1}-${String(year).slice(2)}`;
  };