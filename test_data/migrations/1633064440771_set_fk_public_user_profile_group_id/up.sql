alter table "public"."user_profile"
  add constraint "user_profile_group_id_fkey"
  foreign key ("group_id")
  references "public"."group"
  ("id") on update restrict on delete restrict;
