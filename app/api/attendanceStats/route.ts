import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { startDate, endDate } = req.query;

  const prisma = new PrismaClient();

  // Ensure startDate and endDate are valid Date objects
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  // Check if the dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const stats = await prisma.attendance.groupBy({
      by: ['date'],
      _count: {
        id: true,
      },
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
}