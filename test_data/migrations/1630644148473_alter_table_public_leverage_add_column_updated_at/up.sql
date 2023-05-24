alter table "public"."leverage" add column "updated_at" timestamptz
 null default now();
