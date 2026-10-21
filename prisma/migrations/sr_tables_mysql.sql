-- Tabelas Sol do Recreio (prefixo sr_) no MySQL Hostinger
CREATE TABLE IF NOT EXISTS `sr_Merchant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cashbackPercent` DOUBLE NOT NULL DEFAULT 5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
    `merchantId` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `cashbackBalance` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `sr_User_email_key`(`email`),
    INDEX `sr_User_merchantId_idx`(`merchantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    INDEX `sr_Account_userId_idx`(`userId`),
    UNIQUE INDEX `sr_Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_Purchase` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `cashbackPercent` DOUBLE NOT NULL,
    `cashbackAmount` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `sr_Purchase_userId_idx`(`userId`),
    INDEX `sr_Purchase_merchantId_idx`(`merchantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `sr_Promotion_merchantId_idx`(`merchantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `sr_Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sr_CashbackRedemption` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `sr_CashbackRedemption_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sr_User` ADD CONSTRAINT `sr_User_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `sr_Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_Account` ADD CONSTRAINT `sr_Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sr_User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_Purchase` ADD CONSTRAINT `sr_Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sr_User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_Purchase` ADD CONSTRAINT `sr_Purchase_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `sr_Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_Promotion` ADD CONSTRAINT `sr_Promotion_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `sr_Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_Notification` ADD CONSTRAINT `sr_Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sr_User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sr_CashbackRedemption` ADD CONSTRAINT `sr_CashbackRedemption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sr_User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
