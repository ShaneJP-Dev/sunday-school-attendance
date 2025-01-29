import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function findParentByPhone(phone: string) {
  try {
    const parent = await prisma.parent.findUnique({
      where: { phone },
      include: {
        children: true
      }
    })
    return parent
  } catch (error) {
    console.error('Error finding parent:', error)
    return null
  }
}

export async function createAttendanceRecord(childId: number) {
  try {
    const attendance = await prisma.attendance.create({
      data: {
        childId: childId
      }
    })
    return attendance
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return null
  }
}