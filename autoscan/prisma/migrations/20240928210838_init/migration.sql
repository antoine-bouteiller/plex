-- CreateTable
CREATE TABLE "processed_media" (
    "plex_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "processed_media_tmdb_id_fkey" FOREIGN KEY ("tmdb_id") REFERENCES "media" ("tmdb_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media" (
    "tmdb_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
