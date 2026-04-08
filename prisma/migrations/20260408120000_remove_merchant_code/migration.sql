-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cashbackPercent" REAL NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Merchant" ("id", "name", "cashbackPercent", "createdAt", "updatedAt")
SELECT "id", "name", "cashbackPercent", "createdAt", "updatedAt" FROM "Merchant";

DROP TABLE "Merchant";
ALTER TABLE "new_Merchant" RENAME TO "Merchant";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
