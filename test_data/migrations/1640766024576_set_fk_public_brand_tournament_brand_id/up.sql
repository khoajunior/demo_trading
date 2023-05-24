alter table "public"."brand_tournament"
  add constraint "brand_tournament_brand_id_fkey"
  foreign key ("brand_id")
  references "public"."brand"
  ("id") on update restrict on delete cascade;
