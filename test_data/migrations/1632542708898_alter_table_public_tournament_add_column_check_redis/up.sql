alter table "public"."tournament" add column "check_redis" boolean
 not null default 'false';
