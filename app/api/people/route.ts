import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const children = await prisma.child.findMany({
      include: {
        mother: true,
        father: true,
        guardian: true,
      },
    });

    const transformedChildren = children.map((child) => {
      const parents = [];
    
      if (child.mother) {
        parents.push({
          name: child.mother.name,
          role: 'Mother',
          phone: child.mother.phone
        });
      }
    
      if (child.father) {
        parents.push({
          name: child.father.name,
          role: 'Father',
          phone: child.father.phone
        });
      }
    
      if (child.guardian) {
        parents.push({
          name: child.guardian.name,
          role: 'Guardian',
          phone: child.guardian.phone,
          relationship: child.guardian.relationship
        });
      }
    
      return {
        id: child.id,
        name: child.name,
        birthday: child.birthday.toISOString(), // Ensure this matches the frontend
        grade: child.grade,
        parents: parents,
      };
    });

    return NextResponse.json(transformedChildren, { status: 200 });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Error fetching children' }, { status: 500 });
  }
}