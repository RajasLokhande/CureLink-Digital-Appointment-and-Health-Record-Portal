# 🚀 CureLink Backend - Quick Start Guide

## ✅ Setup Complete!

All files have been created and dependencies installed successfully.

## 📋 IMMEDIATE NEXT STEP (REQUIRED)

### Add Your MongoDB Atlas Connection String

1. **Open the `.env` file** in this directory
2. **Replace line 3** with your actual MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/curelink?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://admin:MyPass123@cluster0.xyz.mongodb.net/curelink?retryWrites=true&w=majority
```

⚠️ **The server cannot start without this connection string!**

---

## 🚀 Start the Server

Once you've added your MongoDB connection string:

```bash
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0.xyz.mongodb.net
📊 Database Name: curelink
🚀 Server is running on port 5000
```

---

## 🧪 Run Verification Tests

### Test 1: Book an Appointment
```bash
npm run test:booking
```
✅ Should create appointment successfully

### Test 2: Test Duplicate Prevention
```bash
npm run test:duplicate
```
✅ Should prevent double-booking and return error code 11000

---

## 🌐 Test the API

### Using cURL (Windows PowerShell):

**Book an appointment:**
```powershell
curl -X POST http://localhost:5000/api/appointments/book `
  -H "Content-Type: application/json" `
  -d '{\"patientId\": \"60d5ec49f1b2c8b1f8e4e1a1\", \"doctorId\": \"60d5ec49f1b2c8b1f8e4e1a2\", \"slotStartTime\": \"2026-10-05T10:00:00.000Z\", \"slotEndTime\": \"2026-10-05T10:30:00.000Z\"}'
```

**Try duplicate booking (should fail with 409):**
```powershell
curl -X POST http://localhost:5000/api/appointments/book `
  -H "Content-Type: application/json" `
  -d '{\"patientId\": \"60d5ec49f1b2c8b1f8e4e1a3\", \"doctorId\": \"60d5ec49f1b2c8b1f8e4e1a2\", \"slotStartTime\": \"2026-10-05T10:00:00.000Z\", \"slotEndTime\": \"2026-10-05T10:30:00.000Z\"}'
```

### Using Postman:

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/appointments/book`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "patientId": "60d5ec49f1b2c8b1f8e4e1a1",
  "doctorId": "60d5ec49f1b2c8b1f8e4e1a2",
  "slotStartTime": "2026-10-05T10:00:00.000Z",
  "slotEndTime": "2026-10-05T10:30:00.000Z"
}
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/appointments/book` | Book new appointment |
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/doctor/:doctorId` | Get doctor's appointments |

---

## ✅ Expected Results

### Successful Booking (201):
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": { ... }
}
```

### Duplicate Booking (409):
```json
{
  "success": false,
  "message": "This time slot is already booked for this doctor",
  "code": "SLOT_ALREADY_BOOKED",
  "error": "DUPLICATE_BOOKING"
}
```

---

## 🎯 What Was Implemented

✅ MongoDB Atlas connection with Mongoose  
✅ Express server with CORS and JSON parsing  
✅ POST `/api/appointments/book` endpoint  
✅ Compound unique index on `{ doctorId, slotStartTime }` with `status: 'BOOKED'`  
✅ Double-booking prevention (MongoDB error 11000 → HTTP 409)  
✅ Input validation (required fields, ObjectIds, dates, past dates)  
✅ Error handling (400, 409, 500)  
✅ Two verification scripts  

---

## 📁 Project Structure

```
telehealth-backend/
├── src/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/appointmentController.js  # Booking logic
│   ├── models/Appointment.js     # Schema with unique index
│   ├── routes/appointmentRoutes.js  # API routes
│   └── server.js                 # Express server
├── scripts/
│   ├── testBooking.js            # Test script 1
│   └── testDuplicateBooking.js   # Test script 2
├── .env                          # ⚠️ ADD YOUR MONGODB URI HERE
├── package.json
└── README.md                     # Full documentation
```

---

## 🔧 Troubleshooting

**Error: "Failed to connect to MongoDB"**
- Check `.env` has correct connection string
- Verify MongoDB Atlas cluster is running
- Check network access whitelist in MongoDB Atlas

**Port 5000 already in use**
- Change `PORT=5001` in `.env`

---

## 📖 Full Documentation

See `README.md` for complete documentation including:
- Detailed API documentation
- Database schema details
- Advanced troubleshooting
- Next steps and features to implement

---

## 🎉 Ready to Go!

1. ✅ All files created
2. ✅ Dependencies installed  
3. ⚠️ **ADD MongoDB connection string to `.env`**
4. ✅ Run `npm start`
5. ✅ Test with scripts or API calls
