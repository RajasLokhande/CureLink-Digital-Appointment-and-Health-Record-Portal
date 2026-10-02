import express from 'express';
import {
  bookAppointment,
  getAllAppointments,
  getAppointmentsByDoctor
} from '../controllers/appointmentController.js';

const router = express.Router();

/**
 * @route   POST /api/appointments/book
 * @desc    Book a new appointment
 * @access  Private (authentication middleware to be added later)
 */
router.post('/book', bookAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Private
 */
router.get('/', getAllAppointments);

/**
 * @route   GET /api/appointments/doctor/:doctorId
 * @desc    Get appointments by doctor ID
 * @access  Private
 */
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

export default router;
