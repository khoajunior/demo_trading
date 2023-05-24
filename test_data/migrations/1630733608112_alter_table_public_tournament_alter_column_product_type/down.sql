alter table "public"."tournament" alter column "product_type" drop not null;
ALTER TABLE "public"."tournament" ALTER COLUMN "product_type" drop default;
