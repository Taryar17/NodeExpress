import { PrismaClient, Prisma } from "../src/generated/prisma";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// const userData: Prisma.UserCreateInput[] = [
//   {
//     phone: "234234433",
//     password: "",
//     email: "user1@gmail.com",
//     randToken: "saeaee9232caesx",
//   },
//   {
//     phone: "234234435",
//     password: "",
//     email: "user2@gmail.com",
//     randToken: "saeaee9232caesx",
//   },
//   {
//     phone: "234234436",
//     password: "",
//     email: "user3@gmail.com",
//     randToken: "saeaee9232caesx",
//   },
//   {
//     phone: "234234437",
//     password: "",
//     email: "user4@gmail.com",
//     randToken: "saeaee9232caesx",
//   },
//   {
//     phone: "234234438",
//     password: "",
//     email: "user5@gmail.com",
//     randToken: "saeaee9232caesx",
//   },
// ];

export function createRandomUser() {
  return {
    email: faker.internet.email(),
    password: "",
    phone: faker.phone.number({ style: "international" }),
    randToken: faker.internet.jwt(),
  };
}
export const userData = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("12345678", salt);
  console.log("Seeding started...");

  for (const user of userData) {
    user.password = hashedPassword; // Set the hashed password for each user
    await prisma.user.create({
      data: user,
    });
  }
  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
