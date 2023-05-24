alter table "public"."leverage_tournament" add column "created_at" timestamptz
 null default now();
