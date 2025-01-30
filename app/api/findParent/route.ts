// api/findParent/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// api/findParent/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        role: parent.role, // This will be 'mother' or 'father'
        phone: parent.phone,
        children: children.map(child => ({
          id: child.id,
          name: child.name,
          age: child.age,
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
        role: guardian.relationship, // This will be the specific relationship
        phone: guardian.phone,
        children: guardian.children.map(child => ({
          id: child.id,
          name: child.name,
          age: child.age,
          grade: child.grade
        }))
      });
    }

    // If no parent or guardian found
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Parent or guardian not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error fetching parent or guardian:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}