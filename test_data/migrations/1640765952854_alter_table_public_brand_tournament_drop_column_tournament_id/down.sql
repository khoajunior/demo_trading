comment on column "public"."brand_tournament"."tournament_id" is E'Many to many relationship for brand and tournament';
alter table "public"."brand_tournament" alter column "tournament_id" drop not null;
alter table "public"."brand_tournament" add column "tournament_id" int4;
