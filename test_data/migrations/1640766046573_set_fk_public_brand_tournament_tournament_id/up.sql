alter table "public"."brand_tournament"
  add constraint "brand_tournament_tournament_id_fkey"
  foreign key ("tournament_id")
  references "public"."tournament"
  ("id") on update restrict on delete cascade;
