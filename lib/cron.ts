// lib/cron.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run the cron job daily to mark children as not checked in after 24 hours
cron.schedule('0 0 * * *', async () => {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 24); // Subtract 24 hours from current time

  try {
    const updatedAttendance = await prisma.attendance.updateMany({
      where: {
        date: {
          lt: cutoffTime, // If attendance date is older than 24 hours
        },
        checkedInBy: { not: null }, // Only update those with a check-in
      },
      data: {
        checkedInBy: null, // Mark as not checked in
        service: '', // Clear the service field if needed
      },
    });

    console.log('✅ Automatically checked out children after 24 hours');
  } catch (error) {
    console.error('❌ Error during auto check-out:', error);
  }
});
