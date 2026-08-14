-- Schéma better-auth : utilisateurs, sessions, comptes, jetons de vérification.
--
-- Écrit à la main plutôt que généré par `better-auth generate`, qui exige une
-- base joignable — la CI n'en a pas, et ce fichier doit être lisible en relecture
-- comme n'importe quel autre artefact du dépôt.
--
-- Deux champs sortent du schéma standard : `github_id` et `github_login`,
-- recopiés depuis le profil GitHub par `mapProfileToUser`. C'est `github_id` qui
-- porte l'autorisation (voir `src/lib/admin/access.ts`) ; `github_login` n'est là
-- que pour l'affichage.
--
-- À appliquer une fois sur la base Neon :
--   psql "$DATABASE_URL" -f migrations/0001_better_auth.sql

CREATE TABLE IF NOT EXISTS "user" (
  "id"             TEXT PRIMARY KEY,
  "name"           TEXT NOT NULL,
  "email"          TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image"          TEXT,
  "github_id"      TEXT,
  "github_login"   TEXT,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- l'espace n'a qu'un utilisateur légitime, mais l'unicité empêche qu'un second
-- compte partage le même identifiant GitHub
CREATE UNIQUE INDEX IF NOT EXISTS "user_github_id_key"
  ON "user" ("github_id")
  WHERE "github_id" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "session" (
  "id"         TEXT PRIMARY KEY,
  "user_id"    TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "token"      TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- la révocation supprime par utilisateur, la vérification lit par jeton
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");
CREATE INDEX IF NOT EXISTS "session_expires_at_idx" ON "session" ("expires_at");

CREATE TABLE IF NOT EXISTS "account" (
  "id"                       TEXT PRIMARY KEY,
  "user_id"                  TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "account_id"               TEXT NOT NULL,
  "provider_id"              TEXT NOT NULL,
  "access_token"             TEXT,
  "refresh_token"            TEXT,
  "access_token_expires_at"  TIMESTAMPTZ,
  "refresh_token_expires_at" TIMESTAMPTZ,
  "scope"                    TEXT,
  "id_token"                 TEXT,
  "password"                 TEXT,
  "created_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- un même compte GitHub ne peut pas être rattaché deux fois : c'est la
-- contrainte qui rend `accountLinking: false` effective côté base
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_key"
  ON "account" ("provider_id", "account_id");
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("user_id");

CREATE TABLE IF NOT EXISTS "verification" (
  "id"         TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value"      TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx"
  ON "verification" ("identifier");
