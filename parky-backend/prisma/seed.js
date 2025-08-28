import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear data in dependency order to satisfy foreign keys
  await prisma.booking.deleteMany();
  await prisma.parkingFeature.deleteMany();
  await prisma.parkingDimension.deleteMany();
  await prisma.parkingSpot.deleteMany();

  // Public spots (view-only, no booking/pricing needed)
  const publicSpots = [
    {
      name: 'VR Mall Parking',
      type: 'public',
      location: 'Downtown, City Center',
      pricePerHour: 0,
      deposit: 0,
      status: 'available',
      totalSlots: 100,
      availableSlots: 45,
      imageUrl: 'vr mall.jpg',
      rating: 4.5,
      distanceKm: 0.5,
      latitude: 13.0827,
      longitude: 80.2707,
    },
    {
      name: 'Spencer Plaza Parking',
      type: 'public',
      location: 'Entertainment District',
      pricePerHour: 0,
      deposit: 0,
      status: 'limited',
      totalSlots: 50,
      availableSlots: 12,
      imageUrl: 'spencer plaza.jpg',
      rating: 4.2,
      distanceKm: 1.2,
      latitude: 13.0649,
      longitude: 80.2600,
    },
    {
      name: 'Express Avenue Parking',
      type: 'public',
      location: 'Westside Mall',
      pricePerHour: 0,
      deposit: 0,
      status: 'full',
      totalSlots: 80,
      availableSlots: 0,
      imageUrl: 'ea.jpg',
      rating: 4.0,
      distanceKm: 2.1,
      latitude: 13.0600,
      longitude: 80.2640,
    },
  ];

  // Private spots (rentable with pricing, deposit, booking)
  const privateSpots = [
    {
      name: 'Apartment Complex Parking',
      type: 'private',
      location: 'Near Nungambakkam High Road, Nungambakkam',
      exactAddress: '22, College Rd, Nungambakkam, Chennai, 600006',
      pricePerHour: 50,
      deposit: 500,
      status: 'available',
      totalSlots: 6,
      availableSlots: 6,
      imageUrl: 'house parking.jpg',
      rating: 4.8,
      distanceKm: 0.8,
      latitude: 13.056899,
      longitude: 80.249808,
    },
    {
      name: 'Residential Parking Spot A',
      type: 'private',
      location: 'Near Luz Corner, Mylapore',
      exactAddress: '12, 2nd Cross St, Mylapore, Chennai, 600004',
      pricePerHour: 80,
      deposit: 750,
      status: 'available',
      totalSlots: 4,
      availableSlots: 4,
      imageUrl: 'house parking1.jpg',
      rating: 4.6,
      distanceKm: 1.5,
      latitude: 13.0316504,
      longitude: 80.270099,
    },
    {
      name: 'Residential Parking Spot B',
      type: 'private',
      location: 'Near Lattice Bridge Road (LB Rd), Adyar',
      exactAddress: '7, 4th Main Rd, Adyar, Chennai, 600020',
      pricePerHour: 30,
      deposit: 300,
      status: 'available',
      totalSlots: 3,
      availableSlots: 3,
      imageUrl: 'house parking2.jpg',
      rating: 4.3,
      distanceKm: 3.2,
      latitude: 13.0012,
      longitude: 80.2565,
    },
    // Additional private seeds
    {
      name: 'Covered Parking - T Nagar',
      type: 'private',
      location: 'Near Pondy Bazaar, T Nagar',
      exactAddress: '14, GN Chetty Rd, T Nagar, Chennai, 600017',
      pricePerHour: 60,
      deposit: 400,
      status: 'available',
      totalSlots: 5,
      availableSlots: 5,
      imageUrl: 'coverspot.png',
      rating: 4.5,
      distanceKm: 2.8,
      latitude: 13.0418,
      longitude: 80.2346,
    },
    {
      name: 'Driveway Spot - Velachery',
      type: 'private',
      location: 'Near Phoenix Marketcity, Velachery',
      exactAddress: '5, 1st Main Rd, Velachery, Chennai, 600042',
      pricePerHour: 45,
      deposit: 300,
      status: 'available',
      totalSlots: 2,
      availableSlots: 2,
      imageUrl: 'drivespot.png',
      rating: 4.1,
      distanceKm: 6.4,
      latitude: 12.9896,
      longitude: 80.2174,
    },
    {
      name: 'Open Slot - Anna Nagar',
      type: 'private',
      location: 'Near 2nd Avenue, Anna Nagar',
      exactAddress: '32, 2nd Ave, Anna Nagar, Chennai, 600040',
      pricePerHour: 70,
      deposit: 600,
      status: 'available',
      totalSlots: 8,
      availableSlots: 8,
      imageUrl: 'spot.png',
      rating: 4.7,
      distanceKm: 5.1,
      latitude: 13.0866,
      longitude: 80.2102,
    },
  ];

  await prisma.parkingSpot.createMany({ data: publicSpots });
  await prisma.parkingSpot.createMany({ data: privateSpots });

  // Fetch actual private spot IDs to attach dimensions/features correctly
  const privs = await prisma.parkingSpot.findMany({
    where: { type: 'private' },
    orderBy: { id: 'asc' },
  });
  const p1 = privs[0]?.id;
  const p2 = privs[1]?.id;
  const p3 = privs[2]?.id;
  const p4 = privs[3]?.id;
  const p5 = privs[4]?.id;
  const p6 = privs[5]?.id;

  if (p1) {
    await prisma.parkingDimension.createMany({
      data: [
        { parkingSpotId: p1, vehicleType: 'Car', length: 5.0, width: 2.5, height: 2.0 },
        ...(p2 ? [{ parkingSpotId: p2, vehicleType: 'SUV', length: 5.5, width: 2.7, height: 2.2 }] : []),
        ...(p3 ? [{ parkingSpotId: p3, vehicleType: 'Bike', length: 2.5, width: 1.0, height: 1.5 }] : []),
        ...(p4 ? [{ parkingSpotId: p4, vehicleType: 'Car', length: 4.8, width: 2.4, height: 2.0 }] : []),
        ...(p5 ? [{ parkingSpotId: p5, vehicleType: 'Bike', length: 2.2, width: 1.0, height: 1.4 }] : []),
        ...(p6 ? [{ parkingSpotId: p6, vehicleType: 'SUV', length: 5.6, width: 2.8, height: 2.2 }] : []),
      ],
    });

    await prisma.parkingFeature.createMany({
      data: [
        { parkingSpotId: p1, type: 'CCTV', icon: 'fa-video' },
        { parkingSpotId: p1, type: 'Lighting', icon: 'fa-lightbulb' },
        ...(p2 ? [{ parkingSpotId: p2, type: 'Wide Area', icon: 'fa-arrows-alt' }] : []),
        ...(p3 ? [{ parkingSpotId: p3, type: 'CCTV', icon: 'fa-video' }] : []),
        ...(p4 ? [{ parkingSpotId: p4, type: 'Covered', icon: 'fa-umbrella' }] : []),
        ...(p5 ? [{ parkingSpotId: p5, type: 'Near Mall', icon: 'fa-shopping-bag' }] : []),
        ...(p6 ? [{ parkingSpotId: p6, type: 'Basement', icon: 'fa-warehouse' }] : []),
      ],
    });
  }

  console.log('Seeded public and private parking spots');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


