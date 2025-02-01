import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add index to the date field in your schema.prisma:
// @@index([date])

export async function GET() {
  const thirtyMinutesAgo = new Date();
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

  try {
    const liveRecords = await prisma.attendance.findMany({
      where: { 
        date: { 
          gte: thirtyMinutesAgo 
        } 
      },
      select: {  // Only select the fields we need
        id: true,
        date: true,
        child: {
          select: {
            name: true
          }
        }
      },
      take: 50, // Limit the number of records
      orderBy: { 
        date: 'desc' 
      },
    });

    return NextResponse.json(liveRecords);
  } catch (error) {
    console.error('Live attendance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch live data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}