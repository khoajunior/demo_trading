alter table "public"."user_profile" add column "is_deleted" boolean
 not null default 'false';
