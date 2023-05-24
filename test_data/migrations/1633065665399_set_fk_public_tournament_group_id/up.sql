alter table "public"."tournament"
  add constraint "tournament_group_id_fkey"
  foreign key ("group_id")
  references "public"."group"
  ("id") on update restrict on delete restrict;
