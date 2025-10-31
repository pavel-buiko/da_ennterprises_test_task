/*
  Warnings:

  - You are about to drop the column `userAgent` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Session` DROP COLUMN `userAgent`,
    ADD COLUMN `user_agent` VARCHAR(191) NULL;
