CREATE TABLE "public"."leverage" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "leverage" integer NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
