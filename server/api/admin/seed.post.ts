import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export default defineEventHandler(async () => {
  // Clear the existing data to provide a clean state slate for testing
  await prisma.payoutState.deleteMany({})
  await prisma.reservation.deleteMany({})

  const statuses = ['verified', 'verified', 'verified', 'canceled', 'no_show', 'disputed'] // Bias toward verified
  let reservationsData = []

  const creators = ['cr_1', 'cr_2', 'cr_3', 'cr_4', 'cr_5']
  const restaurants = ['rest_1', 'rest_2', 'rest_3']
  const startDate = new Date('2026-03-01T00:00:00Z')
  const endDate = new Date('2026-04-01T00:00:00Z')

  for (let i = 0; i < 500; i++) {
    reservationsData.push({
      diningAt: randomDate(startDate, endDate),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      verifiedCovers: randomInteger(1, 6),
      perCoverRate: randomInteger(200, 1500), // $2.00 to $15.00
      creatorId: creators[Math.floor(Math.random() * creators.length)],
      restaurantId: restaurants[Math.floor(Math.random() * restaurants.length)]
    })
  }

  // Insert all the fake transactions
  await prisma.reservation.createMany({
    data: reservationsData
  })

  // We'll delegate the complex calculation of payout thresholds parsing to our core module later.

  return { message: "Successfully generated 500 procedural mock reservations!" }
})
