CREATE DATABASE
    `natura_coupons`
    /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */
    /*!80016 DEFAULT ENCRYPTION='N' */
;

CREATE TABLE
    `configs` (
        `id` int NOT NULL AUTO_INCREMENT,
        `type` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
        `description` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
        `value` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
        UNIQUE KEY `id_UNIQUE` (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 100 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    `coupon` (
        `id` int NOT NULL AUTO_INCREMENT,
        `code` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        `uses` int NOT NULL,
        `expired` date DEFAULT NULL,
        `redirects` int NOT NULL DEFAULT '0',
        `created` date NOT NULL,
        `skips` int NOT NULL DEFAULT '0',
        `active` tinyint NOT NULL DEFAULT '1',
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 18 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    `user` (
        `id` int NOT NULL AUTO_INCREMENT,
        `apikey` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `id_UNIQUE` (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    `visit` (
        `id` int NOT NULL AUTO_INCREMENT,
        `date_time` datetime NOT NULL,
        `user_id` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        `user_device` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        `user_browser` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 244 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;