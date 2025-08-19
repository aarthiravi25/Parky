// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---- Signup API ----
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if email/phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or Phone already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to DB
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        provider: "email",
      },
    });

    res.status(201).json({ message: "Signup successful", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- Health/Root endpoints ----
app.get('/', (req, res) => {
  res.send('Parky API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---- Login API ----
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, name: user.fullName }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- Auth middleware ----
function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id || payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ---- List parking spots (filter by type=public|private) ----
app.get('/api/parking', async (req, res) => {
  try {
    const type = req.query.type;
    const where = type ? { type: String(type) } : {};
    const spots = await prisma.parkingSpot.findMany({ where, orderBy: { id: 'asc' } });
    res.json(spots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Spot details: dimensions & features ----
app.get('/api/parking/:id/details', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const dimensions = await prisma.parkingDimension.findMany({ where: { parkingSpotId: id } });
    const features = await prisma.parkingFeature.findMany({ where: { parkingSpotId: id } });
    return res.json({ dimensions, features });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch parking details' });
  }
});

// ---- Alternative endpoint for parking-spots (same functionality) ----
app.get('/api/parking-spots', async (req, res) => {
  try {
    const type = req.query.type;
    const where = type ? { type: String(type) } : {};
    const spots = await prisma.parkingSpot.findMany({ where, orderBy: { id: 'asc' } });
    res.json(spots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Helpers ----
function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ---- Create booking (requires auth) ----
app.post('/api/bookings', authRequired, async (req, res) => {
  try {
    const { parkingSpotId, bookingDate, hours, licensePlate, vehicleModel } = req.body;
    const spotId = Number(parkingSpotId);
    if (!spotId || !bookingDate || !licensePlate || !vehicleModel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const spot = await prisma.parkingSpot.findUnique({ where: { id: spotId } });
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    if (spot.availableSlots <= 0) {
      return res.status(400).json({ message: 'No slots available for this spot' });
    }

    const hrs = Number(hours) || 1;
    const totalPrice = (spot.pricePerHour || 0) * hrs + (spot.deposit || 0);
    const pinCode = genPin();

    const booking = await prisma.$transaction(async (tx) => {
      await tx.parkingSpot.update({
        where: { id: spot.id },
        data: {
          availableSlots: { decrement: 1 },
          status: spot.availableSlots - 1 <= 0 ? 'full' : spot.status,
        },
      });

      return tx.booking.create({
        data: {
          userId: Number(req.user.id),
          parkingSpotId: spot.id,
          licensePlate,
          vehicleModel,
          bookingDate: new Date(bookingDate),
          hours: hrs,
          totalPrice,
          pinCode,
          status: 'active',
        },
      });
    });

    res.status(201).json({ message: 'Booking created', bookingId: booking.id, pinCode, totalPrice });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Get user's booking history ----
app.get('/api/bookings/user/:userId', authRequired, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    // Ensure user can only access their own bookings
    if (userId !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        parkingSpot: {
          select: {
            name: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      parkingName: booking.parkingSpot.name,
      location: booking.parkingSpot.location,
      date: booking.bookingDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      hours: booking.hours,
      timeSlot: `${booking.hours} hour${booking.hours > 1 ? 's' : ''}`,
      vehicleModel: booking.vehicleModel,
      licensePlate: booking.licensePlate,
      totalPrice: booking.totalPrice,
      pin: booking.pinCode,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      bookingDate: booking.bookingDate.toISOString()
    }));

    res.json(transformedBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Legacy endpoint for backward compatibility (by username)
app.get('/api/bookings/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    
    // Find user by name first
    const user = await prisma.user.findFirst({
      where: { fullName: userName }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        parkingSpot: {
          select: {
            name: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      parkingName: booking.parkingSpot.name,
      location: booking.parkingSpot.location,
      date: booking.bookingDate.toISOString().split('T')[0],
      hours: booking.hours,
      timeSlot: `${booking.hours} hour${booking.hours > 1 ? 's' : ''}`,
      vehicleModel: booking.vehicleModel,
      licensePlate: booking.licensePlate,
      totalPrice: booking.totalPrice,
      pin: booking.pinCode,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      bookingDate: booking.bookingDate.toISOString()
    }));

    res.json(transformedBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Start server
app.listen(5000, () => {
  console.log('API running on http://localhost:5000');
});
