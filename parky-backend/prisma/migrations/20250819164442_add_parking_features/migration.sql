-- CreateTable
CREATE TABLE "ParkingFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parkingSpotId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    CONSTRAINT "ParkingFeature_parkingSpotId_fkey" FOREIGN KEY ("parkingSpotId") REFERENCES "ParkingSpot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParkingDimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parkingSpotId" INTEGER NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "length" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    CONSTRAINT "ParkingDimension_parkingSpotId_fkey" FOREIGN KEY ("parkingSpotId") REFERENCES "ParkingSpot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
