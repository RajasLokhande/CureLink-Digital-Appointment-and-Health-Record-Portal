# CureLink Telehealth Backend

MERN stack backend for the CureLink telehealth portal with appointment booking system and double-booking prevention.

## Features

- ✅ MongoDB Atlas connection with Mongoose
- ✅ Appointment booking API
- ✅ Double-booking prevention using compound unique index
- ✅ Proper error handling with HTTP 409 for duplicate bookings
- ✅ RESTful API design
- ✅ ES6 modules

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your actual MongoDB Atlas credentials.

### 3. Start the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
```

### Book Appointment
```bash
POST /api/appointments/book
Content-Type: application/json

{
  "patientId": "60d5ec49f1b2c8b1f8e4e1a1",
  "doctorId": "60d5ec49f1b2c8b1f8e4e1a2",
  "slotStartTime": "2026-10-05T10:00:00.000Z",
  "slotEndTime": "2026-10-05T10:30:00.000Z"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointmentId": "...",
    "patientId": "...",
    "doctorId": "...",
    "slotStartTime": "...",
    "slotEndTime": "...",
    "status": "BOOKED",
    "createdAt": "..."
  }
}
```

**Duplicate Booking Response (409):**
```json
{
  "success": false,
  "message": "This time slot is already booked for this doctor",
  "code": "SLOT_ALREADY_BOOKED",
  "error": "DUPLICATE_BOOKING"
}
```

### Get All Appointments
```bash
GET /api/appointments
```

### Get Appointments by Doctor
```bash
GET /api/appointments/doctor/:doctorId
```

## Testing

### Run Verification Scripts

**Test successful booking:**
```bash
npm run test:booking
```

**Test duplicate booking prevention:**
```bash
npm run test:duplicate
```

### Manual Testing with cURL

**1. Book an appointment:**
```bash
curl -X POST http://localhost:5000/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "60d5ec49f1b2c8b1f8e4e1a1",
    "doctorId": "60d5ec49f1b2c8b1f8e4e1a2",
    "slotStartTime": "2026-10-05T10:00:00.000Z",
    "slotEndTime": "2026-10-05T10:30:00.000Z"
  }'
```

**2. Try duplicate booking (should return 409):**
```bash
curl -X POST http://localhost:5000/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "60d5ec49f1b2c8b1f8e4e1a3",
    "doctorId": "60d5ec49f1b2c8b1f8e4e1a2",
    "slotStartTime": "2026-10-05T10:00:00.000Z",
    "slotEndTime": "2026-10-05T10:30:00.000Z"
  }'
```

### Testing with Postman

1. Import the collection or create a new request
2. Set method to POST
3. URL: `http://localhost:5000/api/appointments/book`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "patientId": "60d5ec49f1b2c8b1f8e4e1a1",
  "doctorId": "60d5ec49f1b2c8b1f8e4e1a2",
  "slotStartTime": "2026-10-05T10:00:00.000Z",
  "slotEndTime": "2026-10-05T10:30:00.000Z"
}
```

## Database Schema

### Appointment Model

```javascript
{
  patientId: ObjectId,        // Required
  doctorId: ObjectId,         // Required
  slotStartTime: Date,        // Required
  slotEndTime: Date,          // Required, must be after slotStartTime
  status: String,             // BOOKED | CANCELLED | COMPLETED
  cancellationReason: String, // Optional
  cancelledBy: ObjectId,      // Optional
  reminderSent: Boolean,      // Default: false
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-generated
}
```

### Indexes

- **Compound Unique Index:** `{ doctorId: 1, slotStartTime: 1 }` with partial filter `{ status: 'BOOKED' }`
  - Prevents double-booking for the same doctor at the same time
  - Allows slot reuse after cancellation

## Project Structure

```
telehealth-backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   └── appointmentController.js # Appointment business logic
│   ├── models/
│   │   └── Appointment.js           # Appointment schema
│   ├── routes/
│   │   └── appointmentRoutes.js     # API routes
│   └── server.js                    # Express server setup
├── scripts/
│   ├── testBooking.js               # Test successful booking
│   └── testDuplicateBooking.js      # Test duplicate prevention
├── .env                             # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Error Handling

- **400 Bad Request:** Missing/invalid fields, past dates, invalid ObjectIds
- **409 Conflict:** Duplicate booking (MongoDB error code 11000)
- **500 Internal Server Error:** Database connection issues, unexpected errors

## Next Steps

- [ ] Implement user authentication (JWT)
- [ ] Add authorization middleware
- [ ] Create User model
- [ ] Implement appointment cancellation
- [ ] Add appointment update endpoint
- [ ] Set up appointment reminders
- [ ] Add input sanitization
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Write unit tests (Jest/Mocha)
- [ ] Set up CI/CD pipeline

## License

ISC
