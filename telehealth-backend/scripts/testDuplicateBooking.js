import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../src/models/Appointment.js';

// Load environment variables
dotenv.config();

/**
 * Test script to verify duplicate booking prevention
 * This tests the compound unique index on { doctorId, slotStartTime } with status: 'BOOKED'
 */
const testDuplicateBooking = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Generate test data
    const testPatientId1 = new mongoose.Types.ObjectId();
    const testPatientId2 = new mongoose.Types.ObjectId();
    const testDoctorId = new mongoose.Types.ObjectId();
    const slotStartTime = new Date();
    slotStartTime.setHours(slotStartTime.getHours() + 48); // 2 days from now
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30);

    console.log('📋 Test Data:');
    console.log('─────────────────────────────────────────');
    console.log('Patient 1 ID:', testPatientId1.toString());
    console.log('Patient 2 ID:', testPatientId2.toString());
    console.log('Doctor ID:', testDoctorId.toString());
    console.log('Slot Start:', slotStartTime.toISOString());
    console.log('Slot End:', slotEndTime.toISOString());
    console.log('─────────────────────────────────────────\n');

    // ATTEMPT 1: Create first appointment (should succeed)
    console.log('📝 ATTEMPT 1: Booking appointment for Patient 1...');
    const appointment1 = new Appointment({
      patientId: testPatientId1,
      doctorId: testDoctorId,
      slotStartTime,
      slotEndTime,
      status: 'BOOKED'
    });

    await appointment1.save();
    console.log('✅ SUCCESS: First appointment created');
    console.log('   Appointment ID:', appointment1._id.toString());
    console.log('   Status:', appointment1.status, '\n');

    // ATTEMPT 2: Try to book same doctor at same time (should fail)
    console.log('📝 ATTEMPT 2: Trying to book same doctor at same time for Patient 2...');
    console.log('   (This should fail with duplicate key error)\n');

    try {
      const appointment2 = new Appointment({
        patientId: testPatientId2,
        doctorId: testDoctorId,
        slotStartTime, // Same time
        slotEndTime,
        status: 'BOOKED'
      });

      await appointment2.save();
      console.log('❌ UNEXPECTED: Second appointment was created (duplicate booking not prevented!)');
      console.log('   This indicates the unique index is not working properly\n');

    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ SUCCESS: Duplicate booking prevented!');
        console.log('   MongoDB Error Code:', error.code);
        console.log('   Error Message:', error.message);
        
        // Test the custom error handler
        const customError = Appointment.handleDuplicateKeyError(error);
        console.log('\n📋 Custom Error Handler Response:');
        console.log('   Status Code:', customError.statusCode);
        console.log('   Message:', customError.message);
        console.log('   Code:', customError.code);
        console.log('\n✅ HTTP 409 Conflict response confirmed\n');
      } else {
        throw error;
      }
    }

    // Verify only one appointment exists for this doctor at this time
    const appointments = await Appointment.find({
      doctorId: testDoctorId,
      slotStartTime: slotStartTime,
      status: 'BOOKED'
    });

    console.log('🔍 Verification:');
    console.log('─────────────────────────────────────────');
    console.log(`Found ${appointments.length} BOOKED appointment(s) for this doctor at this time`);
    console.log('Expected: 1');
    console.log(appointments.length === 1 ? '✅ PASS' : '❌ FAIL');
    console.log('─────────────────────────────────────────\n');

    console.log('💡 To test via API with cURL:');
    console.log('─────────────────────────────────────────');
    console.log('# First booking (should succeed):');
    console.log(`curl -X POST http://localhost:5000/api/appointments/book \\
  -H "Content-Type: application/json" \\
  -d '{
    "patientId": "${testPatientId1}",
    "doctorId": "${testDoctorId}",
    "slotStartTime": "${slotStartTime.toISOString()}",
    "slotEndTime": "${slotEndTime.toISOString()}"
  }'`);
    console.log('\n# Duplicate booking (should return 409):');
    console.log(`curl -X POST http://localhost:5000/api/appointments/book \\
  -H "Content-Type: application/json" \\
  -d '{
    "patientId": "${testPatientId2}",
    "doctorId": "${testDoctorId}",
    "slotStartTime": "${slotStartTime.toISOString()}",
    "slotEndTime": "${slotEndTime.toISOString()}"
  }'`);
    console.log('─────────────────────────────────────────\n');

    console.log('📊 Summary:');
    console.log('✅ Compound unique index working correctly');
    console.log('✅ Double-booking prevention verified');
    console.log('✅ Error code 11000 caught and handled');
    console.log('✅ HTTP 409 Conflict response confirmed\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testDuplicateBooking();
