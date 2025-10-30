/*
  Warnings:

  - Added the required column `expiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Session` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `ip` VARCHAR(191) NULL,
    ADD COLUMN `revoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Session_ip_idx` ON `Session`(`ip`);

-- RenameIndex
ALTER TABLE `Session` RENAME INDEX `Session_user_id_fkey` TO `Session_user_id_idx`;
