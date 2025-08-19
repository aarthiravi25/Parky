import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
	try {
		console.log('Reset starting...');
		// Clear all bookings
		const del = await prisma.booking.deleteMany();
		console.log(`Deleted bookings: ${del.count}`);

		// Reset available slots back to 1 for private parkings
		const upd = await prisma.parkingSpot.updateMany({
			where: { type: 'private' },
			data: { availableSlots: 1, status: 'available' },
		});
		console.log(`Updated private spots: ${upd.count}`);

		console.log('Bookings cleared & slots reset!');
	} catch (e) {
		console.error('Reset failed:', e);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

reset();


