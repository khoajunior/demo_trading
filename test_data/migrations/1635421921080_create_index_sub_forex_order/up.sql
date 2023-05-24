CREATE  INDEX "sub_forex_order" on
  "public"."demo_history_forex" using btree ("tournament_id", "user_id", "status");
