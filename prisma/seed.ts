import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.child.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.parent.deleteMany();

  // Create Parents
  const mother = await prisma.parent.create({
    data: {
      name: 'Alice Johnson',
      phone: '123-456-7890',
      role: 'mother',
    },
  });

  const father = await prisma.parent.create({
    data: {
      name: 'Bob Johnson',
      phone: '987-654-3210',
      role: 'father',
    },
  });

  // Create Guardian
  const guardian = await prisma.guardian.create({
    data: {
      name: 'Carol Smith',
      phone: '555-555-5555',
      relationship: 'Aunt',
    },
  });

  // Create Child
  const child = await prisma.child.create({
    data: {
      name: 'David Johnson',
      age: 10,
      grade: '5th',
      motherId: mother.id,
      fatherId: father.id,
      guardianId: guardian.id,
    },
  });

  // Create Attendance (checked in by the mother)
  await prisma.attendance.create({
    data: {
      childId: child.id,
      checkedInBy: mother.name, // Use the mother's name
      relationship: mother.role, // Use the mother's role
      service: '1st service',
    },
  });

  // Create Attendance (checked in by the father)
  await prisma.attendance.create({
    data: {
      childId: child.id,
      checkedInBy: father.name, // Use the father's name
      relationship: father.role, // Use the father's role
      service: '2nd service',
    },
  });

  // Create Attendance (checked in by the guardian)
  await prisma.attendance.create({
    data: {
      childId: child.id,
      checkedInBy: guardian.name, // Use the guardian's name
      relationship: guardian.relationship, // Use the guardian's relationship
      service: 'Evening service',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });