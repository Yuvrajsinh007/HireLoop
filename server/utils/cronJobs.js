const cron = require("node-cron");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotificationToUser } = require("../socket/socketHandler");

const initCronJobs = (io) => {
  // Run every 5 minutes to check for scheduled announcements
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      
      // Find announcements scheduled for now or in the past that are still in "SCHEDULED" state
      const dueAnnouncements = await Announcement.find({
        status: "SCHEDULED",
        scheduledFor: { $lte: now }
      });

      if (dueAnnouncements.length === 0) return;

      for (const announcement of dueAnnouncements) {
        // Build audience filter based on target
        const userFilter = { institution: announcement.institution, role: "member", isActive: true };
        
        if (announcement.target === "PROGRAM" && announcement.program) {
           // Would require joining MemberProfile if strict program filtering is needed via Cron
           // Kept simple for platform notifications
        }

        const users = await User.find(userFilter).select("_id");
        
        // Prepare bulk notifications
        const notifications = users.map(user => ({
          recipient: user._id,
          institution: announcement.institution,
          type: "announcement",
          title: announcement.title,
          message: announcement.message,
          link: `/dashboard`
        }));

        if (notifications.length > 0) {
          const inserted = await Notification.insertMany(notifications);
          
          // Emit socket events
          if (io) {
            inserted.forEach(notif => {
              sendNotificationToUser(io, notif.recipient.toString(), {
                _id: notif._id,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                createdAt: notif.createdAt
              });
            });
          }
        }

        // Mark announcement as sent
        announcement.status = "SENT";
        announcement.sentAt = now;
        announcement.stats = { targeted: users.length, notified: users.length };
        await announcement.save();
      }
    } catch (error) {
      console.error("[Cron] Error processing scheduled announcements:", error);
    }
  });
  
  console.log("Cron jobs initialized.");
};

module.exports = { initCronJobs };