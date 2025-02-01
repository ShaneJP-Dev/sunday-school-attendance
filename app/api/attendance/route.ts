import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch attendance records
export async function GET() {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        child: {
          select: {
            name: true,
            mother: { select: { name: true } },
            father: { select: { name: true } },
            guardian: { select: { name: true } },
          },
        },
      },
      orderBy: {
        date: 'desc', // Most recent first
      },
    });

    const formattedRecords = attendanceRecords.map((record) => {
      let parentName = 'Unknown';

      if (record.child?.mother?.name) {
        parentName = `${record.child.mother.name} (Mother)`;
      } else if (record.child?.father?.name) {
        parentName = `${record.child.father.name} (Father)`;
      } else if (record.child?.guardian?.name) {
        parentName = `${record.child.guardian.name} (Guardian)`;
      }

      return {
        id: record.id,
        childName: record.child?.name || 'Unknown',
        parentName,
        checkedInBy: record.checkedInBy,
        checkInTime: record.date.toISOString(),
        service: record.service,
        relationship: record.relationship,
      };
    });

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch attendance records',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
}



// POST - Save new attendance record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔹 Received request body:', body);

    if (!Array.isArray(body)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format. Expected an array.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate each record
    for (const record of body) {
      if (!record.childId || !record.checkedInBy || !record.checkInTime || !record.service) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Missing required fields',
            details: 'Each record must include childId, checkedInBy, checkInTime, and service',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create attendance records in a transaction
    const attendanceRecords = await prisma.$transaction(
      body.map((record) =>
        prisma.attendance.create({
          data: {
            childId: record.childId,
            checkedInBy: record.checkedInBy,
            date: new Date(record.checkInTime),
            service: record.service,
            relationship: record.relationship || 'unknown', // Ensure relationship is included
          },
        })
      )
    );

    console.log('✅ Created attendance records:', attendanceRecords);

    return NextResponse.json({
      success: true,
      message: 'Attendance records created successfully',
      count: attendanceRecords.length,
      records: attendanceRecords,
    });
  } catch (error) {
    console.error('❌ Error in API route:', error);

    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Foreign key constraint failed')) {
        errorMessage = 'Invalid child ID provided';
        statusCode = 400;
      }
    }

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Internal Server Error', 
        details: errorMessage 
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
}