SET check_function_bodies = false;
CREATE FUNCTION public.article_liked(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
  );
$$;
CREATE TABLE public.demo_account (
    user_id uuid NOT NULL,
    balance double precision DEFAULT 10000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    rank integer,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tournament_id uuid NOT NULL,
    reward_id uuid
);
CREATE FUNCTION public.article_liked_by_user(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.demo_account(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
  );
$$;
CREATE FUNCTION public.demo_account_120(user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.id = user_id
);
$$;
CREATE FUNCTION public.demo_account_120(demo_account_row public.demo_account, user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.id = demo_account_row.id and demo_account_row.user_id = user_id
);
$$;
CREATE FUNCTION public.demo_account_121(demo_account_row public.demo_account, user_uuid uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.id = demo_account_row.id and demo_account_row.user_id = user_uuid and a.user_id = user_uuid
);
$$;
CREATE FUNCTION public.demo_account_123(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = uuid('9bef7b94-f10a-4f08-84d7-f2162bec9bdb')
);
$$;
CREATE FUNCTION public.demo_account_156(article_row public.demo_account, hasura_session uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = hasura_session
);
$$;
CREATE FUNCTION public.demo_account_157(article_row public.demo_account, user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = user_id
);
$$;
CREATE FUNCTION public.demo_account_158(article_row public.demo_account, user_id text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = uuid(user_id)
);
$$;
CREATE FUNCTION public.demo_account_159(article_row public.demo_account, user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = user_id
);
$$;
CREATE FUNCTION public.demo_account_is_joined() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS(
       SELECT * FROM demo_account where demo_account.user_id = '30239d5b-65d1-4aaf-acaa-59352cba869d'
    )
$$;
CREATE FUNCTION public.demo_account_is_joined(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.demo_account_joined(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.demo_account_joined12(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.demo_account_joined15(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
)
$$;
CREATE FUNCTION public.demo_account_joined16(article_row public.demo_account, hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT *
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
)
$$;
CREATE FUNCTION public.demo_account_joined17(article_row public.demo_account, hasura_session json) RETURNS SETOF boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.demo_account_joined18(article_row public.demo_account, hasura_session json) RETURNS SETOF boolean
    LANGUAGE sql STABLE
    AS $$
SELECT EXISTS (
    SELECT 1
    FROM user_profile A
    WHERE A.id = (hasura_session ->> 'x-hasura-user-id')::uuid AND A.id = article_row.user_id
);
$$;
CREATE FUNCTION public.is_joined(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS(
       SELECT * FROM demo_account
         WHERE demo_account.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
    )
$$;
CREATE FUNCTION public.is_jointed(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
  );
$$;
CREATE FUNCTION public.is_jointed23(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
  );
$$;
CREATE FUNCTION public.lala123(hasura_session json) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM demo_account A
    WHERE A.user_id = (hasura_session ->> 'x-hasura-user-id')::uuid
  );
$$;
CREATE FUNCTION public.total_margin(demo_account_row public.demo_account) RETURNS double precision
    LANGUAGE sql STABLE
    AS $$
  SELECT sum(margin)
    FROM demo_history_forex as df
    WHERE demo_account_row.user_id = df.user_id and df.tournament_id = demo_account_row.tournament_id and df.status = 3
    group by df.tournament_id, df.user_id
$$;
CREATE TABLE public.demo_history_forex (
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    asset text NOT NULL,
    quantity double precision DEFAULT 0 NOT NULL,
    open_price double precision DEFAULT 0 NOT NULL,
    close_price double precision,
    leverage double precision DEFAULT 100,
    swap double precision DEFAULT 0,
    take_profit double precision DEFAULT 0,
    stop_loss double precision DEFAULT 0,
    gross_profit_loss double precision DEFAULT 0,
    net_profit_loss double precision DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    user_id uuid NOT NULL,
    pending_price double precision,
    dividends double precision DEFAULT 0,
    type integer NOT NULL,
    margin double precision,
    status integer DEFAULT 1 NOT NULL,
    transaction_type integer,
    fn_net_profit_loss double precision,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tournament_id uuid NOT NULL,
    count_id integer NOT NULL
);
CREATE FUNCTION public.total_profit_loss(demo_account_row public.demo_account) RETURNS SETOF public.demo_history_forex
    LANGUAGE sql STABLE
    AS $$
  SELECT *
    FROM demo_history_forex as df
    WHERE demo_account_row.user_id = df.user_id and df.tournament_id = demo_account_row.tournament_id and df.status = 3
$$;
CREATE FUNCTION public.user_profile_avatar() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles/'
$$;
CREATE FUNCTION public.user_profile_avatar(user_profile_row public.demo_history_forex) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles/' || user_profile_row.id || '.jpg'
$$;
CREATE TABLE public.user_profile (
    id uuid NOT NULL,
    email text NOT NULL,
    name text,
    username text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    role text DEFAULT 'user'::text,
    code text,
    exp_time timestamp with time zone,
    ticket integer DEFAULT 0 NOT NULL,
    avatar text
);
CREATE FUNCTION public.user_profile_avatar(user_profile_row public.user_profile) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles/' || user_profile_row.id || '.jpg'
$$;
CREATE FUNCTION public.user_profile_avatar1(user_profile_row public.demo_history_forex) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles/' || user_profile_row.id || '.jpg'
$$;
CREATE FUNCTION public.user_profile_avatar12() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles.jpg'
$$;
CREATE FUNCTION public.user_profile_avatar23232() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'https://sale-management-bucket.s3-ap-southeast-1.amazonaws.com/profiles/'
$$;
CREATE TABLE public.article (
    title text NOT NULL,
    content text NOT NULL,
    author text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    slug text,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL
);
CREATE TABLE public.asset (
    name text NOT NULL,
    scale_percent integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    swap_id uuid
);
CREATE TABLE public.category (
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
CREATE TABLE public.demo_history_binary (
    user_id uuid NOT NULL,
    open_price double precision NOT NULL,
    close_price double precision,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_checked boolean DEFAULT false NOT NULL,
    investment double precision NOT NULL,
    asset text NOT NULL,
    percent_profit_loss double precision,
    total_profit_loss double precision,
    equity double precision DEFAULT 0,
    type integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tournament_id uuid
);
CREATE SEQUENCE public.demo_history_forex_count_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.demo_history_forex_count_id_seq OWNED BY public.demo_history_forex.count_id;
CREATE TABLE public.reward (
    name text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    picture text,
    amount integer DEFAULT 1,
    tournament_id uuid,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level integer NOT NULL
);
CREATE TABLE public.stock_price (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    asset text NOT NULL,
    ts double precision NOT NULL,
    ask double precision NOT NULL,
    bid double precision NOT NULL,
    mid double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.swap (
    weekday text NOT NULL,
    start_trading_time time with time zone,
    end_trading_time time with time zone,
    funding_time time with time zone,
    buy_fee double precision DEFAULT 0,
    sell_fee double precision DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
CREATE TABLE public.tournament (
    name text NOT NULL,
    organizer text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    total_reward double precision,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
CREATE TABLE public.user_tournament (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tournament_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.demo_history_forex ALTER COLUMN count_id SET DEFAULT nextval('public.demo_history_forex_count_id_seq'::regclass);
ALTER TABLE ONLY public.article
    ADD CONSTRAINT article_id_key UNIQUE (id);
ALTER TABLE ONLY public.article
    ADD CONSTRAINT article_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_id_key UNIQUE (id);
ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_name_key UNIQUE (name);
ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_id_key UNIQUE (id);
ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.demo_history_binary
    ADD CONSTRAINT demo_account_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.demo_account
    ADD CONSTRAINT demo_account_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.demo_account
    ADD CONSTRAINT demo_account_tournament_id_user_id_key UNIQUE (tournament_id, user_id);
ALTER TABLE ONLY public.demo_history_forex
    ADD CONSTRAINT demo_history_forex_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reward
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.stock_price
    ADD CONSTRAINT stock_price_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tournament
    ADD CONSTRAINT tournaments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_code_key UNIQUE (code);
ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_email_key UNIQUE (email);
ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_username_key UNIQUE (username);
ALTER TABLE ONLY public.user_tournament
    ADD CONSTRAINT user_tournament_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_tournament
    ADD CONSTRAINT user_tournament_user_id_tournament_id_key UNIQUE (user_id, tournament_id);
ALTER TABLE ONLY public.article
    ADD CONSTRAINT article_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_binary
    ADD CONSTRAINT demo_account_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_account
    ADD CONSTRAINT demo_account_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.reward(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_account
    ADD CONSTRAINT demo_account_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_account
    ADD CONSTRAINT demo_account_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_binary
    ADD CONSTRAINT demo_history_binary_asset_fkey FOREIGN KEY (asset) REFERENCES public.asset(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_binary
    ADD CONSTRAINT demo_history_binary_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_forex
    ADD CONSTRAINT demo_history_forex_asset_fkey FOREIGN KEY (asset) REFERENCES public.asset(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_forex
    ADD CONSTRAINT demo_history_forex_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.demo_history_forex
    ADD CONSTRAINT demo_history_forex_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.reward
    ADD CONSTRAINT reward_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_tournament
    ADD CONSTRAINT user_tournament_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_tournament
    ADD CONSTRAINT user_tournament_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
