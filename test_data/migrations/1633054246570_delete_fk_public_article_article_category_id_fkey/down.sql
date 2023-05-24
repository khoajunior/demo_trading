alter table "public"."article"
  add constraint "article_category_id_fkey"
  foreign key ("category_id")
  references "public"."category"
  ("id") on update restrict on delete restrict;
