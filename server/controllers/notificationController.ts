import { Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userNotifs = db.notifications.filter(n => n.userId === req.user?._id);
    return res.json({
      success: true,
      notifications: userNotifs,
      unreadCount: userNotifs.filter(n => !n.isRead).length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const notif = db.notifications.find(n => n._id === id && n.userId === req.user?._id);

    if (notif) {
      notif.isRead = true;
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    db.notifications.forEach(n => {
      if (n.userId === req.user?._id) {
        n.isRead = true;
      }
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
