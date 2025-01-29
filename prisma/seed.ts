import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.attendance.deleteMany()
  await prisma.child.deleteMany()
  await prisma.parent.deleteMany()

  // Create Parents with Children
  const parents = [
    {
      name: 'John Smith',
      phone: '1234567890',
      children: [
        { name: 'Emily Smith', age: 8, grade: '3rd Grade' },
        { name: 'Michael Smith', age: 6, grade: '1st Grade' }
      ]
    },
    {
      name: 'Sarah Johnson',
      phone: '9876543210',
      children: [
        { name: 'Emma Johnson', age: 9, grade: '4th Grade' },
        { name: 'Liam Johnson', age: 7, grade: '2nd Grade' }
      ]
    },
    {
      name: 'Maria Rodriguez',
      phone: '5555555555',
      children: [
        { name: 'Sofia Rodriguez', age: 10, grade: '5th Grade' }
      ]
    }
  ]

  // Batch create parents and their children
  for (const parentData of parents) {
    await prisma.parent.create({
      data: {
        name: parentData.name,
        phone: parentData.phone,
        children: {
          create: parentData.children
        }
      }
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })