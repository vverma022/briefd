// One-off: reset a user's onboarding so they can redo the selection flow.
// Clears their watched senders and the onboardingCompletedAt flag, but KEEPS
// the user + Google account so no Gmail reconnect is needed.
//
// Usage: node --env-file=.env scripts/reset-user.mjs <email | --all>
import { PrismaClient } from "@prisma/client"

const arg = process.argv[2]
if (!arg) {
  console.error(
    "Usage: node --env-file=.env scripts/reset-user.mjs <email | --all>"
  )
  process.exit(1)
}

const all = arg === "--all" || arg === "all"
const prisma = new PrismaClient()

try {
  const users = all
    ? await prisma.user.findMany({ select: { id: true, email: true } })
    : await prisma.user.findMany({
        where: { email: arg },
        select: { id: true, email: true },
      })

  if (users.length === 0) {
    console.error(all ? "No users found." : `No user found for ${arg}`)
    process.exit(1)
  }

  let totalSenders = 0
  for (const user of users) {
    const deleted = await prisma.watchedSender.deleteMany({
      where: { userId: user.id },
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompletedAt: null },
    })
    totalSenders += deleted.count
    console.log(
      `Reset ${user.email ?? user.id}: removed ${deleted.count} watched sender(s).`
    )
  }

  console.log(
    `Done. Reset ${users.length} user(s); removed ${totalSenders} watched sender(s) total.`
  )
} finally {
  await prisma.$disconnect()
}
