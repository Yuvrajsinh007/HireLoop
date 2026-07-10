import React from 'react';

const NotificationItem = ({ notification, onRead }) => {
  return (
    <div 
      onClick={() => onRead(notification._id)}
      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-indigo-50/50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-semibold text-slate-800">{notification.title}</h4>
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1"></span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
      <span className="text-[10px] text-slate-400 mt-2 block">
        {new Date(notification.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
};

export default NotificationItem;