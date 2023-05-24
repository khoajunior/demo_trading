alter table "public"."user_tournament" add constraint "user_tournament_tournament_id_user_id_key" unique ("tournament_id", "user_id");
