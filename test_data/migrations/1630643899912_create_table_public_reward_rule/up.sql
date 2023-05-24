CREATE TABLE "public"."reward_rule" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "format_name" text NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
