alter table "public"."user_profile"
  add constraint "user_profile_created_by_fkey"
  foreign key ("created_by")
  references "public"."user_profile"
  ("id") on update restrict on delete restrict;
