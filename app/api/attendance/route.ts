import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Validate the data before attempting to create records
        for (const record of body) {
            if (!record.childId || !record.parentName || !record.checkInTime) {
                return new NextResponse(
                    JSON.stringify({
                        success: false,
                        error: 'Missing required fields',
                        details: 'Each record must include childId, parentName, and checkInTime'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        }

        // Create attendance records in the database
        const attendanceRecords = await prisma.$transaction(
            body.map((record) => 
                prisma.attendance.create({
                    data: {
                        childId: record.childId,
                        parentName: record.parentName,
                        date: new Date(record.checkInTime),
                    },
                })
            )
        );

        console.log('✅ Created attendance records:', attendanceRecords);

        return new NextResponse(
            JSON.stringify({
                success: true,
                message: 'Attendance records created successfully',
                count: attendanceRecords.length,
                records: attendanceRecords
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('❌ Error in API route:', error);
        
        let errorMessage = 'An unexpected error occurred';
        let statusCode = 500;

        // Handle Prisma-specific errors
        if (error instanceof Error) {
            errorMessage = error.message;
            
            // Handle specific Prisma errors
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
            {
                status: statusCode,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } finally {
        await prisma.$disconnect();
    }
}