import express from 'express';
import Booking from '../models/Booking.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let bookings;
    if (req.userRole === 'admin') {
      bookings = await Booking.find().populate('userId', 'name email').populate('workoutId', 'name');
    } else {
      bookings = await Booking.find({ userId: req.userId }).populate('workoutId', 'name');
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, authorize(['member', 'admin']), async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.userId });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.userRole !== 'admin' && booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;