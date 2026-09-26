import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true
    },
    slotStartTime: {
      type: Date,
      required: [true, 'Slot start time is required'],
      index: true
    },
    slotEndTime: {
      type: Date,
      required: [true, 'Slot end time is required'],
      validate: {
        validator: function(value) {
          return value > this.slotStartTime;
        },
        message: 'Slot end time must be after slot start time'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['BOOKED', 'CANCELLED', 'COMPLETED'],
        message: '{VALUE} is not a valid appointment status'
      },
      default: 'BOOKED',
      required: true,
      index: true
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reminderSent: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound partial unique index to prevent double-booking while allowing slot reuse after cancellation
appointmentSchema.index(
  { doctorId: 1, slotStartTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'BOOKED' },
    name: 'unique_booked_slot'
  }
);

// Additional indexes for common query patterns
appointmentSchema.index({ patientId: 1, status: 1, slotStartTime: 1 });
appointmentSchema.index({ doctorId: 1, status: 1, slotStartTime: 1 });
appointmentSchema.index({ reminderSent: 1, status: 1, slotStartTime: 1 });

// Virtual for appointment duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  if (this.slotStartTime && this.slotEndTime) {
    return Math.round((this.slotEndTime - this.slotStartTime) / (1000 * 60));
  }
  return null;
});

// Pre-save validation to ensure cancellation fields consistency
appointmentSchema.pre('save', function(next) {
  if (this.status === 'CANCELLED') {
    if (!this.cancellationReason) {
      return next(new Error('Cancellation reason is required when status is CANCELLED'));
    }
    if (!this.cancelledBy) {
      return next(new Error('CancelledBy is required when status is CANCELLED'));
    }
  }
  next();
});

// Static method to handle duplicate key errors
appointmentSchema.statics.handleDuplicateKeyError = function(error) {
  if (error.code === 11000 && error.keyPattern?.doctorId && error.keyPattern?.slotStartTime) {
    const customError = new Error('This time slot is already booked for this doctor');
    customError.statusCode = 409;
    customError.code = 'SLOT_ALREADY_BOOKED';
    return customError;
  }
  return error;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;