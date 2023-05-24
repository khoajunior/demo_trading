CREATE TABLE "public"."phone_otp" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "phone" text NOT NULL, "code" text, "exp_time" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("phone"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
