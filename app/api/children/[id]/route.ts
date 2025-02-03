import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ParentInput {
  name: string;
  phone: string;
  role: 'Mother' | 'Father' | 'Guardian';
  relationship?: string;
}

interface UpdateChildInput {
  name: string;
  birthday: string;
  grade: string;
  parents: ParentInput[];
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { id } = params;
    const childId = parseInt(id);

    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    const body = await request.json() as UpdateChildInput;
    const { name, birthday, grade, parents } = body;

    // Start a transaction to handle all updates
    const updatedChild = await prisma.$transaction(async (tx) => {
      // First, get the existing child data
      const existingChild = await tx.child.findUnique({
        where: { id: childId },
        include: {
          mother: true,
          father: true,
          guardian: true,
        },
      });

      if (!existingChild) {
        throw new Error('Child not found');
      }

      // Handle parents (mother and father)
      const motherData = parents.find((p: ParentInput) => p.role === 'Mother');
      const fatherData = parents.find((p: ParentInput) => p.role === 'Father');
      const guardianData = parents.find((p: ParentInput) => p.role === 'Guardian');

      // Handle mother
      let motherId = existingChild.motherId;
      if (motherData) {
        const mother = await tx.parent.upsert({
          where: {
            phone: motherData.phone,
          },
          create: {
            name: motherData.name,
            phone: motherData.phone,
            role: 'mother',
          },
          update: {
            name: motherData.name,
          },
        });
        motherId = mother.id;
      } else {
        motherId = null;
      }

      // Handle father
      let fatherId = existingChild.fatherId;
      if (fatherData) {
        const father = await tx.parent.upsert({
          where: {
            phone: fatherData.phone,
          },
          create: {
            name: fatherData.name,
            phone: fatherData.phone,
            role: 'father',
          },
          update: {
            name: fatherData.name,
          },
        });
        fatherId = father.id;
      } else {
        fatherId = null;
      }

      // Handle guardian
      let guardianId = existingChild.guardianId;
      if (guardianData) {
        const guardian = await tx.guardian.upsert({
          where: {
            phone: guardianData.phone,
          },
          create: {
            name: guardianData.name,
            phone: guardianData.phone,
            relationship: guardianData.relationship || '',
          },
          update: {
            name: guardianData.name,
            relationship: guardianData.relationship || '',
          },
        });
        guardianId = guardian.id;
      } else {
        guardianId = null;
      }

      // Update the child with all the new information
      const updatedChild = await tx.child.update({
        where: { id: childId },
        data: {
          name,
          birthday: new Date(birthday),
          grade,
          motherId,
          fatherId,
          guardianId,
        },
        include: {
          mother: true,
          father: true,
          guardian: true,
        },
      });

      return updatedChild;
    });

    // Transform the response to match the expected format
    const transformedResponse = {
      id: updatedChild.id,
      name: updatedChild.name,
      birthday: updatedChild.birthday.toISOString(),
      grade: updatedChild.grade,
      parents: [
        ...(updatedChild.mother ? [{
          name: updatedChild.mother.name,
          role: 'Mother' as const,
          phone: updatedChild.mother.phone,
        }] : []),
        ...(updatedChild.father ? [{
          name: updatedChild.father.name,
          role: 'Father' as const,
          phone: updatedChild.father.phone,
        }] : []),
        ...(updatedChild.guardian ? [{
          name: updatedChild.guardian.name,
          role: 'Guardian' as const,
          phone: updatedChild.guardian.phone,
          relationship: updatedChild.guardian.relationship,
        }] : []),
      ],
    };

    return NextResponse.json({ 
      success: true, 
      data: transformedResponse 
    });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error updating child information'
      },
      { status: 500 }
    );
  }
}