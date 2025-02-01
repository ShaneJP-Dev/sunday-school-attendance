import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.child.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.parent.deleteMany();

  // Create Parents with birthdays
  const mother = await prisma.parent.create({
    data: {
      name: 'Alice Johnson',
      phone: '1234567890', // No spaces or dashes
      role: 'mother',
    },
  });

  const father = await prisma.parent.create({
    data: {
      name: 'Bob Johnson',
      phone: '9876543210', // No spaces or dashes
      role: 'father',
    },
  });

  // Create Guardian with birthday
  const guardian = await prisma.guardian.create({
    data: {
      name: 'Carol Smith',
      phone: '5555555555', // No spaces or dashes
      relationship: 'Aunt',
    },
  });

  // Create Child with birthday
  const child = await prisma.child.create({
    data: {
      name: 'David Johnson',
      birthday: new Date('2013-05-15'), // Example birthday
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