import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'today';

  let startDate = new Date();
  let interval: 'hour' | 'day' | 'week' | 'month' = 'hour';
  
  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      interval = 'hour';
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      interval = 'day';
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      interval = 'day';
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      interval = 'month';
      break;
  }

  try {
    let grouping;
    if (interval === 'hour') {
      grouping = {
        _count: true,
        hour: true
      };
    } else if (interval === 'day') {
      grouping = {
        _count: true,
        date: true
      };
    } else {
      grouping = {
        _count: true,
        month: true
      };
    }

    const stats = await prisma.attendance.groupBy({
      by: ['service'],
      _count: { service: true },
      where: { 
        date: { 
          gte: startDate 
        } 
      },
      orderBy: {
        service: 'asc'
      }
    });

    // Transform data for the chart
    const formattedStats = stats.map(stat => ({
      service: stat.service,
      count: stat._count.service
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}