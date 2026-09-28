/*
  Warnings:

  - You are about to drop the column `positionX` on the `WidgetInstance` table. All the data in the column will be lost.
  - You are about to drop the column `positionY` on the `WidgetInstance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `WidgetInstance` DROP COLUMN `positionX`,
    DROP COLUMN `positionY`,
    ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;
