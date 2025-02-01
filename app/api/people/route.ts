// api/people/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { parents, children } = await req.json();

    // Validate input
    if (!parents?.length || !children?.length) {
      return NextResponse.json({ 
        error: 'At least one parent and one child are required' 
      }, { status: 400 });
    }

    // First, create all parents and guardians
    const createdParents = await Promise.all(
      parents.map(async (parent: any) => {
        if (parent.type === 'guardian') {
          const guardianRecord = await prisma.guardian.create({
            data: {
              name: parent.name,
              phone: parent.phone,
              relationship: 'Guardian'
            }
          });
          return { type: 'guardian', id: guardianRecord.id };
        } else {
          // For mother/father, use the Parent model
          const parentRecord = await prisma.parent.create({
            data: {
              name: parent.name,
              phone: parent.phone,
              role: parent.type // 'mother' or 'father'
            }
          });
          return { type: parent.type, id: parentRecord.id };
        }
      })
    );

    // Then create all children with their parent relationships
    const createdChildren = await Promise.all(
      children.map(async (child: any) => {
        // Find the IDs for each parent type
        const motherId = createdParents.find(p => p.type === 'mother')?.id;
        const fatherId = createdParents.find(p => p.type === 'father')?.id;
        const guardianId = createdParents.find(p => p.type === 'guardian')?.id;

        return await prisma.child.create({
          data: {
            name: child.name,
            birthday: new Date(child.birthday),
            grade: child.grade,
            motherId: motherId || undefined,
            fatherId: fatherId || undefined,
            guardianId: guardianId || undefined
          },
          include: {
            mother: true,
            father: true,
            guardian: true
          }
        });
      })
    );

    return NextResponse.json({ 
      message: 'Family created successfully',
      data: createdChildren 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating family:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ 
        error: 'A parent/guardian with this phone number already exists',
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error creating family records',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for fetching all children with their parents
export async function GET() {
  try {
    const children = await prisma.child.findMany({
      include: {
        mother: true,
        father: true,
        guardian: true,
      },
    });

    // Transform the data to include parent roles
    const transformedChildren = children.map(child => {
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
    
      // Calculate age
      const birthDate = new Date(child.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
                  (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    
      return {
        id: child.id,
        name: child.name,
        age: age, // Send age instead of birthday
        grade: child.grade,
        parents: parents,
        createdAt: child.createdAt.toISOString(),
        updatedAt: child.updatedAt.toISOString()
      };
    });

    return NextResponse.json(transformedChildren, { status: 200 });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Error fetching children' }, { status: 500 });
  }
}

// PATCH endpoint for updating child details
export async function PATCH(req: Request) {
  try {
    const { 
      id,
      name,
      birthday,
      grade,
      motherId,
      fatherId,
      guardianId
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing child ID' }, { status: 400 });
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        name,
        birthday: birthday ? new Date(birthday) : undefined,
        grade,
        motherId: motherId || null,
        fatherId: fatherId || null,
        guardianId: guardianId || null,
      },
      include: {
        mother: true,
        father: true,
        guardian: true,
      }
    });

    return NextResponse.json(updatedChild, { status: 200 });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Error updating child' }, { status: 500 });
  }
}

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
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Error deleting child' }, { status: 500 });
  }
}