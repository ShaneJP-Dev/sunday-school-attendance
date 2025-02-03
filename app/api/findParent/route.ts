import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

const cache = new Map();

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

    // Check cache first
    if (cache.has(phone)) {
      return NextResponse.json(cache.get(phone));
    }

    const [parent, guardian] = await Promise.all([
      prisma.parent.findUnique({
        where: { phone },
        include: {
          childrenAsMother: {
            select: {
              id: true,
              name: true,
              birthday: true,
              grade: true
            }
          },
          childrenAsFather: {
            select: {
              id: true,
              name: true,
              birthday: true,
              grade: true
            }
          }
        }
      }),
      prisma.guardian.findUnique({
        where: { phone },
        include: {
          children: {
            select: {
              id: true,
              name: true,
              birthday: true,
              grade: true
            }
          }
        }
      })
    ]);

    let response;
    if (parent) {
      const children = [...parent.childrenAsMother, ...parent.childrenAsFather];
      response = { 
        success: true, 
        name: parent.name,
        role: parent.role,
        phone: parent.phone,
        children
      };
    } else if (guardian) {
      response = { 
        success: true, 
        name: guardian.name,
        role: guardian.relationship,
        phone: guardian.phone,
        children: guardian.children
      };
    } else {
      response = { success: false, error: 'Parent or guardian not found' };
    }

    // Cache the response
    cache.set(phone, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching parent or guardian:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}