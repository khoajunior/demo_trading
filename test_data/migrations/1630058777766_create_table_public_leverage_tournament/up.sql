CREATE TABLE "public"."leverage_tournament" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "tournament_id" uuid NOT NULL, "leverage_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("leverage_id") REFERENCES "public"."leverage"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
