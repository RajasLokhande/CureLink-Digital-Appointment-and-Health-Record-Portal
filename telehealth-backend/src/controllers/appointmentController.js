import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments/book
 * @access  Private (requires authentication - to be implemented)
 */
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, slotStartTime, slotEndTime } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !slotStartTime || !slotEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['patientId', 'doctorId', 'slotStartTime', 'slotEndTime']
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patientId or doctorId format'
      });
    }

    // Validate date formats
    const startTime = new Date(slotStartTime);
    const endTime = new Date(slotEndTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for slotStartTime or slotEndTime'
      });
    }

    // Check if slot is in the past
    if (startTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    // Check if end time is after start time (Mongoose validator will also catch this)
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Slot end time must be after slot start time'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      slotStartTime: startTime,
      slotEndTime: endTime,
      status: 'BOOKED'
    });

    // Save appointment
    await appointment.save();

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        slotStartTime: appointment.slotStartTime,
        slotEndTime: appointment.slotEndTime,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });

  } catch (error) {
    // Handle duplicate key error (double-booking attempt)
    if (error.code === 11000) {
      const customError = Appointment.handleDuplicateKeyError(error);
      return res.status(customError.statusCode || 409).json({
        success: false,
        message: customError.message,
        code: customError.code,
        error: 'DUPLICATE_BOOKING'
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Handle other errors
    console.error('Error booking appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while booking appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all appointments (optional - for testing)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ slotStartTime: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get appointments by doctor
 * @route   GET /api/appointments/doctor/:doctorId
 * @access  Private
 */
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctorId format'
      });
    }

    const appointments = await Appointment.find({ doctorId })
      .sort({ slotStartTime: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
