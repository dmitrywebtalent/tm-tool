import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.cardTag.deleteMany();
  await prisma.card.deleteMany();
  await prisma.tag.deleteMany();

  // Status tags
  const statusTodo = await prisma.tag.create({
    data: { name: "To Do", type: "STATUS", color: "#6B7280", position: 0 },
  });
  const statusInProgress = await prisma.tag.create({
    data: { name: "In Progress", type: "STATUS", color: "#3B82F6", position: 1 },
  });
  const statusDone = await prisma.tag.create({
    data: { name: "Done", type: "STATUS", color: "#10B981", position: 2 },
  });

  // Priority tags
  const priorityHigh = await prisma.tag.create({
    data: { name: "High", type: "PRIORITY", color: "#EF4444", position: 0 },
  });
  const priorityMedium = await prisma.tag.create({
    data: { name: "Medium", type: "PRIORITY", color: "#F59E0B", position: 1 },
  });
  const priorityLow = await prisma.tag.create({
    data: { name: "Low", type: "PRIORITY", color: "#22C55E", position: 2 },
  });

  // Category tags
  const categoryPersonal = await prisma.tag.create({
    data: { name: "Personal", type: "CATEGORY", color: "#8B5CF6", position: 0 },
  });
  const categoryJob = await prisma.tag.create({
    data: { name: "Job", type: "CATEGORY", color: "#F97316", position: 1 },
  });

  // Client tags
  const client1 = await prisma.tag.create({
    data: { name: "Acme Corp", type: "CLIENT", color: "#06B6D4", position: 0 },
  });
  const client2 = await prisma.tag.create({
    data: { name: "Internal", type: "CLIENT", color: "#84CC16", position: 1 },
  });

  // Sample cards
  await prisma.card.create({
    data: {
      title: "Design landing page",
      description: "Create the new landing page mockup",
      position: 0,
      dateEnd: new Date("2026-02-20"),
      tags: {
        create: [
          { tagId: statusInProgress.id },
          { tagId: priorityHigh.id },
          { tagId: categoryJob.id },
          { tagId: client1.id },
        ],
      },
    },
  });

  await prisma.card.create({
    data: {
      title: "Buy groceries",
      description: "Milk, eggs, bread, vegetables",
      position: 1,
      tags: {
        create: [
          { tagId: statusTodo.id },
          { tagId: priorityMedium.id },
          { tagId: categoryPersonal.id },
        ],
      },
    },
  });

  await prisma.card.create({
    data: {
      title: "Fix API endpoint",
      description: "The /users endpoint returns 500 on empty query",
      position: 2,
      dateEnd: new Date("2026-02-10"),
      tags: {
        create: [
          { tagId: statusTodo.id },
          { tagId: priorityHigh.id },
          { tagId: categoryJob.id },
          { tagId: client2.id },
        ],
      },
    },
  });

  await prisma.card.create({
    data: {
      title: "Read TypeScript book",
      description: "Finish chapters 5-8",
      position: 3,
      tags: {
        create: [
          { tagId: statusInProgress.id },
          { tagId: priorityLow.id },
          { tagId: categoryPersonal.id },
        ],
      },
    },
  });

  await prisma.card.create({
    data: {
      title: "Deploy staging server",
      description: "Set up CI/CD pipeline and deploy to staging",
      position: 4,
      tags: {
        create: [
          { tagId: statusDone.id },
          { tagId: priorityMedium.id },
          { tagId: categoryJob.id },
          { tagId: client1.id },
        ],
      },
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log(`   - ${await prisma.tag.count()} tags`);
  console.log(`   - ${await prisma.card.count()} cards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

