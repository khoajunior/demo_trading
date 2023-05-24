CREATE TABLE "public"."session" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "session" text NOT NULL, "machine_user_id" uuid NOT NULL, "created_at" timestamptz NOT NULL, "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("machine_user_id") REFERENCES "public"."machine_user"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
