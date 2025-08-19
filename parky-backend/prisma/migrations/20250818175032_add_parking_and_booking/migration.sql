-- CreateTable
CREATE TABLE "ParkingSpot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'private',
    "location" TEXT NOT NULL,
    "pricePerHour" REAL NOT NULL,
    "deposit" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'available',
    "totalSlots" INTEGER NOT NULL,
    "availableSlots" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "rating" REAL DEFAULT 4.0,
    "distanceKm" REAL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "parkingSpotId" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "hours" INTEGER NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "totalPrice" REAL NOT NULL,
    "pinCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_parkingSpotId_fkey" FOREIGN KEY ("parkingSpotId") REFERENCES "ParkingSpot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
