comment on column "public"."brand_tournament"."brand_id" is E'Many to many relationship for brand and tournament';
alter table "public"."brand_tournament" add constraint "brand_tournament_brand_id_tournament_id_key" unique (tournament_id, brand_id);
alter table "public"."brand_tournament" alter column "brand_id" drop not null;
alter table "public"."brand_tournament" add column "brand_id" int4;
