/*
  Warnings:

  - You are about to drop the column `resetOtp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtpExpires` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `resetOtp`,
    DROP COLUMN `resetOtpExpires`;
