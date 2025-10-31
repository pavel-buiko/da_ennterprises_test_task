/*
  Warnings:

  - You are about to drop the column `originalName` on the `FileRecord` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `FileRecord` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - Added the required column `original_name` to the `FileRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FileRecord` DROP COLUMN `originalName`,
    DROP COLUMN `uploadedAt`,
    ADD COLUMN `original_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expires_at` DATETIME(3) NOT NULL;
