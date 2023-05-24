alter table "public"."tournament" add column "is_default" boolean
 not null default 'false';
