import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to batch insert records
async function batchInsert<T>(items: (() => Promise<T>)[], batchSize: number) {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.all(items.slice(i, i + batchSize).map(fn => fn()));
    console.log(`Inserted batch ${i / batchSize + 1}`);
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay to avoid overloading
  }
}

async function main() {
  console.log('Seeding database...');

  // ✅ Create Parents (Mother & Father)
  const parentData = Array.from({ length: 100 }).map(() => () =>
    prisma.parent.create({
      data: {
        name: faker.person.fullName(),
        phone: faker.string.numeric(10),
        role: faker.helpers.arrayElement(['mother', 'father']),
      }
    })
  );
  await batchInsert(parentData, 25);
  console.log("✅ Parents inserted");

  // ✅ Create Guardians
  const guardianData = Array.from({ length: 50 }).map(() => () =>
    prisma.guardian.create({
      data: {
        name: faker.person.fullName(),
        phone: faker.string.numeric(10),
        relationship: faker.helpers.arrayElement(['Uncle', 'Aunt', 'Grandparent', 'Sibling']),
      }
    })
  );
  await batchInsert(guardianData, 25);
  console.log("✅ Guardians inserted");

  // ✅ Fetch parents & guardians to assign to children
  const parents = await prisma.parent.findMany();
  const guardians = await prisma.guardian.findMany();

  // ✅ Create Children with relationships
  const childData = Array.from({ length: 200 }).map(() => () => {
    const hasGuardian = faker.datatype.boolean();
    return prisma.child.create({
      data: {
        name: faker.person.fullName(),
        birthday: faker.date.birthdate({ min: 4, max: 12, mode: 'age' }),
        grade: faker.helpers.arrayElement(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']),
        motherId: !hasGuardian && faker.datatype.boolean() ? faker.helpers.arrayElement(parents.filter(p => p.role === 'mother')).id : null,
        fatherId: !hasGuardian && faker.datatype.boolean() ? faker.helpers.arrayElement(parents.filter(p => p.role === 'father')).id : null,
        guardianId: hasGuardian ? faker.helpers.arrayElement(guardians).id : null,
      }
    });
  });
  await batchInsert(childData, 50);
  console.log("✅ Children inserted");

  // ✅ Fetch children for attendance
  const children = await prisma.child.findMany();

  // ✅ Create Attendance records
  const attendanceData = children.flatMap((child) =>
    Array.from({ length: 5 }).map(() => () => 
      prisma.attendance.create({
        data: {
          childId: child.id,
          date: faker.date.recent({ days: 25 }),
          checkedInBy: faker.person.fullName(),
          relationship: faker.helpers.arrayElement(['Mother', 'Father', 'Guardian']),
          service: faker.helpers.arrayElement(['1st Service', '2nd Service', 'Evening Service']),
        }
      })
    )
  );
  await batchInsert(attendanceData, 100);
  console.log("✅ Attendance records inserted");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
