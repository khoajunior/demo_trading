alter table "public"."tournament" alter column "frequency" drop not null;
alter table "public"."tournament" add column "frequency" text;
