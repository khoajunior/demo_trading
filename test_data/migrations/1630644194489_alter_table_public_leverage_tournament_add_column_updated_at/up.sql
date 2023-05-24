alter table "public"."leverage_tournament" add column "updated_at" timestamptz
 null default now();
