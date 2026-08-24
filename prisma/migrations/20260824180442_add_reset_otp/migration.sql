-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetOtp` VARCHAR(191) NULL,
    ADD COLUMN `resetOtpExpires` DATETIME(3) NULL;
