alter table "public"."user_profile" drop constraint "user_profile_group_id_fkey",
  add constraint "user_profile_group_id_fkey"
  foreign key ("group_id")
  references "public"."group"
  ("id") on update restrict on delete restrict;
