/*
  Warnings:

  - Added the required column `rememberToken` to the `Otp` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `otp` on the `Otp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "rememberToken" TEXT NOT NULL,
DROP COLUMN "otp",
ADD COLUMN     "otp" INTEGER NOT NULL;
