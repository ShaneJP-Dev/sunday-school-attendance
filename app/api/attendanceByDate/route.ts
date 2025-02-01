import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const selectedDate = searchParams.get('date');

  if (!selectedDate) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const records = await prisma.attendance.findMany({
      where: { date: { gte: new Date(selectedDate), lt: new Date(selectedDate + 'T23:59:59') } },
      include: { child: { select: { name: true } } },
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
