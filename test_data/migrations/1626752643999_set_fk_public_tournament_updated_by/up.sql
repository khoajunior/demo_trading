alter table "public"."tournament"
  add constraint "tournament_updated_by_fkey"
  foreign key ("updated_by")
  references "public"."user_profile"
  ("id") on update restrict on delete restrict;
