import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { filter, startDate, endDate } = req.query;

  try {
    let whereCondition = {};

    // Handle date filtering based on the selected filter
    switch (filter) {
      case "today":
        whereCondition = {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
            lte: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
          },
        };
        break;

      case "week":
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay())); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);

        whereCondition = {
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        };
        break;

      case "month":
        const startOfMonth = new Date();
        startOfMonth.setDate(1); // Start of the month
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0); // Last day of the month
        endOfMonth.setHours(23, 59, 59, 999);

        whereCondition = {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        };
        break;

      case "year":
        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // Start of the year
        startOfYear.setHours(0, 0, 0, 0);

        const endOfYear = new Date(new Date().getFullYear(), 11, 31); // End of the year
        endOfYear.setHours(23, 59, 59, 999);

        whereCondition = {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        };
        break;

      case "date":
        if (startDate && endDate) {
          whereCondition = {
            date: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          };
        }
        break;

      default:
        break;
    }

    // Fetch attendance data
    const attendances = await prisma.attendance.findMany({
      where: whereCondition,
      include: {
        child: true,
      },
    });

    // Format data for the chart
    const chartData = attendances.reduce((acc, attendance) => {
      const date = new Date(attendance.date).toLocaleDateString(); // Format date as string
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format expected by the chart
    const formattedData = Object.keys(chartData).map((date) => ({
      date,
      attendance: chartData[date],
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  } finally {
    await prisma.$disconnect(); // Close the Prisma client connection
  }
}