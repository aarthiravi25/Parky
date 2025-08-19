import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
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
      location: 'Near 123 Main Street, Downtown',
      exactAddress: '123 Main Street, Chennai, 600002',
      pricePerHour: 50,
      deposit: 500,
      status: 'available',
      totalSlots: 1,
      availableSlots: 1,
      imageUrl: 'house parking.jpg',
      rating: 4.8,
      distanceKm: 0.8,
      latitude: 13.0797,
      longitude: 80.2696,
    },
    {
      name: 'Residential Parking Spot A',
      type: 'private',
      location: 'Near 456 Business Ave, Financial District',
      exactAddress: '12, 2nd Cross St, Mylapore, Chennai, 600004',
      pricePerHour: 80,
      deposit: 750,
      status: 'available',
      totalSlots: 1,
      availableSlots: 1,
      imageUrl: 'house parking1.jpg',
      rating: 4.6,
      distanceKm: 1.5,
      latitude: 13.0339,
      longitude: 80.2700,
    },
    {
      name: 'Residential Parking Spot B',
      type: 'private',
      location: 'Near 789 Residential Blvd, Suburbs',
      exactAddress: '7, 4th Main Rd, Adyar, Chennai, 600020',
      pricePerHour: 30,
      deposit: 300,
      status: 'available',
      totalSlots: 1,
      availableSlots: 1,
      imageUrl: 'house parking2.jpg',
      rating: 4.3,
      distanceKm: 3.2,
      latitude: 13.0057,
      longitude: 80.2550,
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

  if (p1) {
    await prisma.parkingDimension.createMany({
      data: [
        { parkingSpotId: p1, vehicleType: 'Car', length: 5.0, width: 2.5, height: 2.0 },
        ...(p2 ? [{ parkingSpotId: p2, vehicleType: 'SUV', length: 5.5, width: 2.7, height: 2.2 }] : []),
        ...(p3 ? [{ parkingSpotId: p3, vehicleType: 'Bike', length: 2.5, width: 1.0, height: 1.5 }] : []),
      ],
    });

    await prisma.parkingFeature.createMany({
      data: [
        { parkingSpotId: p1, type: 'CCTV', icon: 'fa-video' },
        { parkingSpotId: p1, type: 'Lighting', icon: 'fa-lightbulb' },
        ...(p2 ? [{ parkingSpotId: p2, type: 'Wide Area', icon: 'fa-arrows-alt' }] : []),
        ...(p3 ? [{ parkingSpotId: p3, type: 'CCTV', icon: 'fa-video' }] : []),
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


