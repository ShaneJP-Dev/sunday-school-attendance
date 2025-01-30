import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all children with their parents
export async function GET() {
  try {
    const children = await prisma.child.findMany({
      include: {
        parent: true,
      },
    });
    return NextResponse.json(children, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching children' }, { status: 500 });
  }
}

// POST - Create a new child
export async function POST(req: Request) {
  try {
    const { name, age, grade, parentId } = await req.json();

    if (!name || !age || !grade || !parentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newChild = await prisma.child.create({
      data: {
        name,
        age,
        grade,
        parentId,
      },
    });

    return NextResponse.json(newChild, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating child' }, { status: 500 });
  }
}

// PATCH - Update child details
export async function PATCH(req: Request) {
  try {
    const { id, name, age, grade, parentId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing child ID' }, { status: 400 });
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: { name, age, grade, parentId },
    });

    return NextResponse.json(updatedChild, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating child' }, { status: 500 });
  }
}

// DELETE - Remove a child
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing child ID' }, { status: 400 });
    }

    await prisma.child.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Child deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting child' }, { status: 500 });
  }
}
