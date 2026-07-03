import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (e) {
      console.log("Error fetching notifications:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Poll fallback every 15 seconds to ensure robust sync
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    // Supabase Realtime — noti aate hi auto update
    const userId = user.user_id || user.id;
    const channel = supabase
      .channel(`notifications_${Math.random().toString(36).substring(2, 10)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Add manually to our notifications state on receiving insert
          const newNotif = {
            notif_id: payload.new.notif_id,
            user_id: payload.new.user_id,
            type: payload.new.type,
            message: payload.new.message,
            read: payload.new.read || false,
            created_at: payload.new.created_at || new Date().toISOString(),
          };

          setNotifications((prev) => {
            // Avoid duplicate in state in case polling also fetched it
            if (prev.some((n) => n.notif_id === newNotif.notif_id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.log("Error marking all read:", e);
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notif_id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.log("Error marking notification read:", e);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-t-[20px] rounded-bl-[20px] rounded-br-sm bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center relative shadow-sm hover:bg-[var(--bg-elevated)] transition-colors focus:outline-none group"
        data-testid="notification-bell-btn"
      >
        <Bell size={18} className="text-[var(--text-secondary)] group-hover:animate-[jiggle_0.4s_ease-in-out]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--violet)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-[var(--bg-card)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Slide-over Content */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-3 w-[360px] max-h-[480px] bg-[var(--bg-card)] border border-[var(--border-default)] shadow-[0_10px_40px_rgba(0,0,0,0.3)] rounded-2xl z-[250] flex flex-col overflow-hidden select-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 px-5 border-b border-[var(--border-default)] bg-[var(--bg-card)]">
                <h3 className="text-[var(--text-primary)] font-bold text-[15px]">Notifications</h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button className="text-[var(--text-primary)] hover:text-[var(--violet)]">All</button>
                  <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Unread</button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[var(--violet)] ml-2"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-default)] bg-[var(--bg-card)]">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--text-tertiary)] py-12">
                    <span className="text-sm font-medium">No notifications yet</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.notif_id}
                      notification={n}
                      onRead={markOneRead}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
