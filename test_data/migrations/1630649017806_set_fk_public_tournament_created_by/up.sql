alter table "public"."tournament"
  add constraint "tournament_created_by_fkey"
  foreign key ("created_by")
  references "public"."user_profile"
  ("id") on update restrict on delete restrict;
