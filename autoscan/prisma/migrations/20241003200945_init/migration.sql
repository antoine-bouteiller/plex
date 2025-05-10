-- CreateTable
CREATE TABLE
    "media" (
        "tmdb_id" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "original_language" TEXT NOT NULL
    );

CREATE UNIQUE INDEX "media_tmdb_id_type_key" ON "media" ("tmdb_id", "type");