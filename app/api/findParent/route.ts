// app/api/findParent/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { phone } = await request.json();

  try {
    const parent = await prisma.parent.findUnique({
      where: { phone },
      include: { children: true },
    });

    if (parent) {
      return NextResponse.json(parent);
    } else {
      return NextResponse.json({ message: 'No parent found with this phone number' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error finding parent:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}