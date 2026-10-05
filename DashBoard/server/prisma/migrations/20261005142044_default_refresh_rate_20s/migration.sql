-- AlterTable
ALTER TABLE `WidgetDefinition` MODIFY `defaultRefreshRate` INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE `WidgetInstance` MODIFY `refreshRateSeconds` INTEGER NOT NULL DEFAULT 20;
UPDATE `WidgetDefinition` SET `defaultRefreshRate` = 20 WHERE `defaultRefreshRate` = 300;
UPDATE `WidgetInstance` SET `refreshRateSeconds` = 20 WHERE `refreshRateSeconds` = 300;