/*
Warnings:

- Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.

 */
-- RedefineTables
DROP TABLE "media";

CREATE TABLE
  "media" (
    "tmdb_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE UNIQUE INDEX "media_tmdb_id_type_key" ON "media" ("tmdb_id", "type");