/*
  Warnings:

  - Added the required column `latitude` to the `ParkingSpot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `ParkingSpot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParkingSpot" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "exactAddress" TEXT
);
INSERT INTO "new_ParkingSpot" ("availableSlots", "createdAt", "deposit", "distanceKm", "id", "imageUrl", "location", "name", "pricePerHour", "rating", "status", "totalSlots", "type") SELECT "availableSlots", "createdAt", "deposit", "distanceKm", "id", "imageUrl", "location", "name", "pricePerHour", "rating", "status", "totalSlots", "type" FROM "ParkingSpot";
DROP TABLE "ParkingSpot";
ALTER TABLE "new_ParkingSpot" RENAME TO "ParkingSpot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
