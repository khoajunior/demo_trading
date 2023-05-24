alter table "public"."demo_account" add column "closed_order_at" timestamptz
 null default now();
