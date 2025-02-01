import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // First, check for parent
    const parent = await prisma.parent.findUnique({
      where: { phone },
      include: {
        childrenAsMother: true,
        childrenAsFather: true
      }
    });

    if (parent) {
      const children = [
        ...parent.childrenAsMother,
        ...parent.childrenAsFather
      ];

      return NextResponse.json({ 
        success: true, 
        name: parent.name,
        role: parent.role,
        phone: parent.phone,
        children: children.map(child => ({
          id: child.id,
          name: child.name,
          birthday: child.birthday, 
          grade: child.grade
        }))
      });
    }

    // If no parent found, check for guardian
    const guardian = await prisma.guardian.findUnique({
      where: { phone },
      include: {
        children: true
      }
    });

    if (guardian) {
      return NextResponse.json({ 
        success: true, 
        name: guardian.name,
        role: guardian.relationship,
        phone: guardian.phone,
        children: guardian.children.map(child => ({
          id: child.id,
          name: child.name,
          birthday: child.birthday,
          grade: child.grade
        }))
      });
    }

    // If no parent or guardian found
    return NextResponse.json(
      { success: false, error: 'Parent or guardian not found' },
      { status: 404 }
    );
  } catch (error) {
    // Comprehensive error handling
    console.error('❌ Error fetching parent or guardian:', error);
    
    // Ensure error is an object with a message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';

    const errorDetails = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : { message: 'No error details available' };

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { 
        status: 500
      }
    );
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}