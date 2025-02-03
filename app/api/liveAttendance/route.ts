import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();

  try {
    const liveAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      include: {
        child: true,
      },
    });
    res.status(200).json(liveAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live attendance' });
  }
}