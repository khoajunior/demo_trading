alter table "public"."tournament"
  add constraint "tournament_group_id_fkey"
  foreign key (group_id)
  references "public"."brand"
  (id) on update restrict on delete restrict;
alter table "public"."tournament" alter column "group_id" drop not null;
alter table "public"."tournament" add column "group_id" uuid;
