import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../src/models/Appointment.js';

// Load environment variables
dotenv.config();

/**
 * Test script to create a sample appointment
 * This verifies that the MongoDB connection works and data is persisted
 */
const testBooking = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Generate test data
    const testPatientId = new mongoose.Types.ObjectId();
    const testDoctorId = new mongoose.Types.ObjectId();
    const slotStartTime = new Date();
    slotStartTime.setHours(slotStartTime.getHours() + 24); // Tomorrow, same time
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30); // 30-minute appointment

    console.log('📋 Test Appointment Data:');
    console.log('─────────────────────────────────────────');
    console.log('Patient ID:', testPatientId.toString());
    console.log('Doctor ID:', testDoctorId.toString());
    console.log('Slot Start:', slotStartTime.toISOString());
    console.log('Slot End:', slotEndTime.toISOString());
    console.log('─────────────────────────────────────────\n');

    // Create appointment
    console.log('🔄 Creating appointment...');
    const appointment = new Appointment({
      patientId: testPatientId,
      doctorId: testDoctorId,
      slotStartTime,
      slotEndTime,
      status: 'BOOKED'
    });

    await appointment.save();
    
    console.log('✅ Appointment created successfully!\n');
    console.log('📊 Saved Appointment Details:');
    console.log('─────────────────────────────────────────');
    console.log('Appointment ID:', appointment._id.toString());
    console.log('Status:', appointment.status);
    console.log('Duration:', appointment.durationMinutes, 'minutes');
    console.log('Created At:', appointment.createdAt.toISOString());
    console.log('─────────────────────────────────────────\n');

    // Verify it's in the database
    console.log('🔍 Verifying appointment in database...');
    const found = await Appointment.findById(appointment._id);
    
    if (found) {
      console.log('✅ Appointment verified in MongoDB Atlas!');
      console.log('✅ Data persistence confirmed\n');
    } else {
      console.log('❌ Appointment not found in database');
    }

    // Show all appointments count
    const count = await Appointment.countDocuments();
    console.log(`📈 Total appointments in database: ${count}\n`);

    console.log('💡 To test with cURL, use this command:');
    console.log('─────────────────────────────────────────');
    console.log(`curl -X POST http://localhost:5000/api/appointments/book \\
  -H "Content-Type: application/json" \\
  -d '{
    "patientId": "${testPatientId}",
    "doctorId": "${testDoctorId}",
    "slotStartTime": "${slotStartTime.toISOString()}",
    "slotEndTime": "${slotEndTime.toISOString()}"
  }'`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testBooking();
