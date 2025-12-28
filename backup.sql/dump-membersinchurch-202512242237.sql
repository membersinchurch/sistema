--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-12-24 22:37:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16389)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    token_recuperacao text,
    token_expira bigint,
    reset_token text,
    reset_token_expiration timestamp without time zone,
    nome_igreja character varying(255)
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 217
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: avisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avisos (
    id integer NOT NULL,
    admin_id integer,
    texto text NOT NULL,
    concluido boolean DEFAULT false
);


ALTER TABLE public.avisos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16399)
-- Name: avisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.avisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avisos_id_seq OWNER TO postgres;

--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 219
-- Name: avisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.avisos_id_seq OWNED BY public.avisos.id;


--
-- TOC entry 242 (class 1259 OID 41176)
-- Name: batismos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batismos (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100),
    telefone character varying(20),
    data_batismo date NOT NULL,
    admin_id integer NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.batismos OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 41175)
-- Name: batismos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batismos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batismos_id_seq OWNER TO postgres;

--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 241
-- Name: batismos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batismos_id_seq OWNED BY public.batismos.id;


--
-- TOC entry 222 (class 1259 OID 16415)
-- Name: entradas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entradas (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    tipo text NOT NULL,
    valor numeric NOT NULL,
    descricao text,
    data date NOT NULL,
    CONSTRAINT entradas_tipo_check CHECK ((tipo = ANY (ARRAY['Dízimo'::text, 'Oferta'::text])))
);


ALTER TABLE public.entradas OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16414)
-- Name: entradas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entradas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entradas_id_seq OWNER TO postgres;

--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 221
-- Name: entradas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entradas_id_seq OWNED BY public.entradas.id;


--
-- TOC entry 224 (class 1259 OID 16430)
-- Name: eventos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eventos (
    id integer NOT NULL,
    admin_id integer,
    titulo text NOT NULL,
    descricao text,
    local text,
    data_inicio date NOT NULL,
    data_fim date,
    usuario_id integer,
    categoria text
);


ALTER TABLE public.eventos OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16429)
-- Name: eventos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eventos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eventos_id_seq OWNER TO postgres;

--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 223
-- Name: eventos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eventos_id_seq OWNED BY public.eventos.id;


--
-- TOC entry 226 (class 1259 OID 16444)
-- Name: financeiro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financeiro (
    id integer NOT NULL,
    tipo text NOT NULL,
    categoria text NOT NULL,
    valor numeric NOT NULL,
    descricao text,
    data date NOT NULL,
    nota_fiscal text,
    admin_id integer,
    forma_pagamento text,
    CONSTRAINT financeiro_categoria_check CHECK ((categoria = ANY (ARRAY['Dízimo'::text, 'Oferta'::text, 'Despesa'::text]))),
    CONSTRAINT financeiro_tipo_check CHECK ((tipo = ANY (ARRAY['Entrada'::text, 'Saída'::text])))
);


ALTER TABLE public.financeiro OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16443)
-- Name: financeiro_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financeiro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financeiro_id_seq OWNER TO postgres;

--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 225
-- Name: financeiro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financeiro_id_seq OWNED BY public.financeiro.id;


--
-- TOC entry 228 (class 1259 OID 16460)
-- Name: lancamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lancamentos (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    tipo text NOT NULL,
    valor numeric NOT NULL,
    descricao text,
    categoria text NOT NULL,
    data date NOT NULL,
    forma_pagamento text
);


ALTER TABLE public.lancamentos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16459)
-- Name: lancamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lancamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lancamentos_id_seq OWNER TO postgres;

--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 227
-- Name: lancamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lancamentos_id_seq OWNED BY public.lancamentos.id;


--
-- TOC entry 230 (class 1259 OID 16474)
-- Name: membros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membros (
    id integer NOT NULL,
    nome text NOT NULL,
    data_nascimento date,
    telefone text,
    email text,
    bairro text,
    cidade text,
    foto text,
    endereco text,
    funcao text,
    sexo text,
    ministerio_id integer,
    ministerio text,
    admin_id integer
);


ALTER TABLE public.membros OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16473)
-- Name: membros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membros_id_seq OWNER TO postgres;

--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 229
-- Name: membros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membros_id_seq OWNED BY public.membros.id;


--
-- TOC entry 232 (class 1259 OID 16488)
-- Name: ministerios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ministerios (
    id integer NOT NULL,
    nome text NOT NULL,
    descricao text,
    admin_id integer
);


ALTER TABLE public.ministerios OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16487)
-- Name: ministerios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ministerios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ministerios_id_seq OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 231
-- Name: ministerios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ministerios_id_seq OWNED BY public.ministerios.id;


--
-- TOC entry 244 (class 1259 OID 57590)
-- Name: musicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.musicas (
    id integer NOT NULL,
    igreja_id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    link_video text,
    link_cifra text,
    criado_por integer NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.musicas OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 57589)
-- Name: musicas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.musicas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.musicas_id_seq OWNER TO postgres;

--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 243
-- Name: musicas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.musicas_id_seq OWNED BY public.musicas.id;


--
-- TOC entry 234 (class 1259 OID 16502)
-- Name: password_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_tokens (
    id integer NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    tipo_usuario text
);


ALTER TABLE public.password_tokens OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16501)
-- Name: password_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 233
-- Name: password_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_tokens_id_seq OWNED BY public.password_tokens.id;


--
-- TOC entry 236 (class 1259 OID 16511)
-- Name: saidas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saidas (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    valor numeric NOT NULL,
    descricao text NOT NULL,
    data date NOT NULL,
    nota_fiscal text
);


ALTER TABLE public.saidas OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16510)
-- Name: saidas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saidas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saidas_id_seq OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 235
-- Name: saidas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saidas_id_seq OWNED BY public.saidas.id;


--
-- TOC entry 248 (class 1259 OID 57610)
-- Name: setlist_musicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setlist_musicas (
    id integer NOT NULL,
    setlist_id integer NOT NULL,
    musica_id integer NOT NULL,
    funcao character varying(50),
    ordem integer,
    CONSTRAINT setlist_musicas_funcao_check CHECK (((funcao)::text = ANY ((ARRAY['abertura'::character varying, 'ofertorio'::character varying, 'final'::character varying])::text[])))
);


ALTER TABLE public.setlist_musicas OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 57609)
-- Name: setlist_musicas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setlist_musicas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setlist_musicas_id_seq OWNER TO postgres;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 247
-- Name: setlist_musicas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setlist_musicas_id_seq OWNED BY public.setlist_musicas.id;


--
-- TOC entry 246 (class 1259 OID 57600)
-- Name: setlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setlists (
    id integer NOT NULL,
    igreja_id integer NOT NULL,
    data_culto date NOT NULL,
    ministro character varying(255),
    vocais text,
    criado_por integer NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.setlists OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 57599)
-- Name: setlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setlists_id_seq OWNER TO postgres;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 245
-- Name: setlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setlists_id_seq OWNED BY public.setlists.id;


--
-- TOC entry 238 (class 1259 OID 16525)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    telefone text,
    data_nascimento date,
    senha text,
    token_recuperacao text,
    token_expira bigint,
    reset_token text,
    reset_token_expiration timestamp without time zone,
    admin_id integer,
    nome_igreja character varying(255)
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16524)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 237
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 240 (class 1259 OID 16539)
-- Name: visitantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitantes (
    id integer NOT NULL,
    nome text NOT NULL,
    whatsapp text NOT NULL,
    observacao text DEFAULT false,
    data_visita date DEFAULT CURRENT_DATE,
    admin_id integer NOT NULL,
    acoes text
);


ALTER TABLE public.visitantes OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16538)
-- Name: visitantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visitantes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitantes_id_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 239
-- Name: visitantes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visitantes_id_seq OWNED BY public.visitantes.id;


--
-- TOC entry 4716 (class 2604 OID 16600)
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 16601)
-- Name: avisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avisos ALTER COLUMN id SET DEFAULT nextval('public.avisos_id_seq'::regclass);


--
-- TOC entry 4731 (class 2604 OID 41179)
-- Name: batismos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batismos ALTER COLUMN id SET DEFAULT nextval('public.batismos_id_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 16602)
-- Name: entradas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas ALTER COLUMN id SET DEFAULT nextval('public.entradas_id_seq'::regclass);


--
-- TOC entry 4720 (class 2604 OID 16603)
-- Name: eventos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos ALTER COLUMN id SET DEFAULT nextval('public.eventos_id_seq'::regclass);


--
-- TOC entry 4721 (class 2604 OID 16604)
-- Name: financeiro id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro ALTER COLUMN id SET DEFAULT nextval('public.financeiro_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 16605)
-- Name: lancamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos ALTER COLUMN id SET DEFAULT nextval('public.lancamentos_id_seq'::regclass);


--
-- TOC entry 4723 (class 2604 OID 16606)
-- Name: membros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros ALTER COLUMN id SET DEFAULT nextval('public.membros_id_seq'::regclass);


--
-- TOC entry 4724 (class 2604 OID 16607)
-- Name: ministerios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ministerios ALTER COLUMN id SET DEFAULT nextval('public.ministerios_id_seq'::regclass);


--
-- TOC entry 4733 (class 2604 OID 57593)
-- Name: musicas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.musicas ALTER COLUMN id SET DEFAULT nextval('public.musicas_id_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 16608)
-- Name: password_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_tokens_id_seq'::regclass);


--
-- TOC entry 4726 (class 2604 OID 16609)
-- Name: saidas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saidas ALTER COLUMN id SET DEFAULT nextval('public.saidas_id_seq'::regclass);


--
-- TOC entry 4737 (class 2604 OID 57613)
-- Name: setlist_musicas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlist_musicas ALTER COLUMN id SET DEFAULT nextval('public.setlist_musicas_id_seq'::regclass);


--
-- TOC entry 4735 (class 2604 OID 57603)
-- Name: setlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlists ALTER COLUMN id SET DEFAULT nextval('public.setlists_id_seq'::regclass);


--
-- TOC entry 4727 (class 2604 OID 16610)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 16611)
-- Name: visitantes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitantes ALTER COLUMN id SET DEFAULT nextval('public.visitantes_id_seq'::regclass);


--
-- TOC entry 4934 (class 0 OID 16389)
-- Dependencies: 218
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, nome, email, senha, token_recuperacao, token_expira, reset_token, reset_token_expiration, nome_igreja) FROM stdin;
1	Admin Teste	admin@igreja.com	$2b$10$0jHod3q2aZHQJzEfjhUCKu1DICMYBzArL3mHuWCIq8UXhgW.x0tlm	\N	\N	\N	\N	\N
3	Rubens Santos	rubenssantos@gmail.com	$2b$10$0jHod3q2aZHQJzEfjhUCKu1DICMYBzArL3mHuWCIq8UXhgW.x0tlm	\N	\N	\N	\N	\N
2	Paulo Sérgio	paulosergio.suporte@yahoo.com.br	$2b$10$IykZqNGJb9PkEvYd.DEZuOw7Z4X3arli33jTrJkGGWmXECqC6ir76	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4936 (class 0 OID 16400)
-- Dependencies: 220
-- Data for Name: avisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avisos (id, admin_id, texto, concluido) FROM stdin;
4	1	Oração por Aline	f
3	2	Semana de oração	t
2	2	ensaios	t
\.


--
-- TOC entry 4958 (class 0 OID 41176)
-- Dependencies: 242
-- Data for Name: batismos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batismos (id, nome, email, telefone, data_batismo, admin_id, criado_em) FROM stdin;
\.


--
-- TOC entry 4938 (class 0 OID 16415)
-- Dependencies: 222
-- Data for Name: entradas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entradas (id, admin_id, tipo, valor, descricao, data) FROM stdin;
\.


--
-- TOC entry 4940 (class 0 OID 16430)
-- Dependencies: 224
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos (id, admin_id, titulo, descricao, local, data_inicio, data_fim, usuario_id, categoria) FROM stdin;
5	\N	Futebol membros	fytebol	Salão da Igreja	2025-06-11	2025-06-11	\N	\N
6	\N	Futebol membros	futebol	Salão da Igreja	2025-06-24	2025-06-24	\N	\N
7	\N	Futebol membros	futebol	Salão da Igreja	2025-06-11	2025-06-11	\N	\N
8	\N	Futebol membros	futebol	Salão da Igreja	2025-06-10	2025-06-10	\N	\N
9	\N	Jantar de Casais	jantar	Salão da Igreja	2025-06-10	2025-07-10	\N	\N
10	\N	Reuniao Jovens	este	Salão da Igreja	2025-06-10	2025-06-10	\N	\N
15	1	Jantar de Casais	jantar	Salão da Igreja	2025-06-07	2025-06-07	\N	\N
22	1	Futebol membros	jhkgiui	jnjkbvcouy	2025-06-10	2025-06-10	\N	\N
23	1	ceia	knjkb	kjklkçkjknjl	2025-06-25	\N	\N	\N
30	1	Jantar de Casais	knklnlk	kknljknkjn	2025-06-12	2025-06-12	\N	\N
34	2	Reuniao Jovens	bkjbjkbjk	bhkbhkbkj	2025-06-21	2025-06-21	\N	\N
32	2	ceia	jhvjh	jhvv  bn	2025-06-15	\N	\N	\N
\.


--
-- TOC entry 4942 (class 0 OID 16444)
-- Dependencies: 226
-- Data for Name: financeiro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financeiro (id, tipo, categoria, valor, descricao, data, nota_fiscal, admin_id, forma_pagamento) FROM stdin;
1	Entrada	Dízimo	100.0	\N	2025-05-12	\N	2	dinheiro
2	Entrada	Dízimo	200.0	\N	2025-05-24	\N	2	dinheiro
3	Entrada	Dízimo	100.0	\N	2025-05-25	\N	2	dinheiro
4	Entrada	Dízimo	200.0	\N	2025-05-24	\N	2	dinheiro
5	Entrada	Dízimo	250.0	\N	2025-05-15	\N	2	dinheiro
6	Entrada	Dízimo	150.0	\N	2025-05-12	\N	2	dinheiro
\.


--
-- TOC entry 4944 (class 0 OID 16460)
-- Dependencies: 228
-- Data for Name: lancamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lancamentos (id, admin_id, tipo, valor, descricao, categoria, data, forma_pagamento) FROM stdin;
1	2	Entrada	254.0	\N	oferta	2025-05-25	\N
2	2	Entrada	260.0	\N	Dízimo	2025-05-25	\N
3	2	Entrada	471.0	\N	Dízimo	2025-05-25	pix
4	2	Saída	200.0	\N	Outro	2025-05-25	dinheiro
5	2	Saída	200.0	\N	Outro	2025-05-26	dinheiro
6	2	Entrada	225.0	\N	Oferta	2025-05-26	cartao
7	2	Entrada	270.0	\N	Dízimo	2025-05-27	dinheiro
8	2	Entrada	2540.0	\N	Dízimo	2025-05-28	dinheiro
9	2	Entrada	1528.0	\N	Dízimo	2025-05-28	dinheiro
10	2	Entrada	1725.0	\N	Dízimo	2025-05-28	dinheiro
11	2	Entrada	1749.0	\N	Dízimo	2025-05-28	dinheiro
12	2	Entrada	1241.0	\N	Dízimo	2025-05-28	dinheiro
13	2	Entrada	1298.0	\N	Dízimo	2025-05-28	dinheiro
14	2	Entrada	1412.0	olá	Dízimo	2025-05-28	dinheiro
15	2	Entrada	1785.0	\N	Dízimo	2028-05-25	dinheiro
16	1	Entrada	720.0	\N	Dízimo	2025-06-01	dinheiro
17	1	Entrada	1754.0	\N	Doação	2025-06-01	pix
18	1	Saída	263.0	\N	Dízimo	2025-06-01	transferencia
19	2	Entrada	1500		Dízimo	2025-06-08	dinheiro
20	2	Saída	258		Dízimo	2025-06-08	dinheiro
\.


--
-- TOC entry 4946 (class 0 OID 16474)
-- Dependencies: 230
-- Data for Name: membros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membros (id, nome, data_nascimento, telefone, email, bairro, cidade, foto, endereco, funcao, sexo, ministerio_id, ministerio, admin_id) FROM stdin;
9	Ricardo Mota	1979-06-05	51977458124	ricardomota@gmail.com	\N	\N	/uploads/foto-1749095590817.jpeg	\N	\N	Masculino	10	\N	2
6	Vera Lucia	1977-06-07	51965441417	paulosergio.suporte@yahoo.com.br	\N	\N	/uploads/foto-1749098218554.jpeg	\N	\N	Feminino	3	12	2
1	PAULO SERGIO DA SILVA RAPOSO	2003-12-10	51991603138	paulosergio.suporte@yahoo.com.br	\N	\N	/uploads/foto-1749098165124.jpg	\N	\N	Masculino	8	13	2
10	Mariana Pires	2004-06-18	51984474521	marianapires@gmail.com	\N	\N	/uploads/foto-1749097733181.jpeg	\N	\N	Feminino	9	\N	2
29	Marcelino Maia	1977-02-14	51965541976	marcelinomaia@gmail.com	\N	\N	/uploads/foto_1749514640585.png	\N	\N	Masculino	\N	\N	\N
30	Marcelino Maia	1977-02-14	51987745412	marcelinomaia@gmail.com	\N	\N	/uploads/foto-1749514885623.jpg	\N	\N	Masculino	\N	\N	\N
31	Marcelino Maia	1977-04-12	51991603139	marcelinomaia@gmail.com	\N	\N	/uploads/foto-1749515028211.jpg	\N	\N	Masculino	\N	\N	\N
32	Marcelino Maia	1977-02-10	51991603139	marcelinomaia@gmail.com	\N	\N	/uploads/foto-1749515173187.jpg	\N	\N	Masculino	\N	\N	\N
4	Pedro Lima	2007-02-14	51985524140	admin@igreja.com	\N	\N	/uploads/foto-1749097827682.jpeg	\N	\N	Masculino	10		2
33	Marcelino Maia	1977-03-09	51998221415	marcelinomaia@gmail.com	\N	\N	/uploads/foto-1749518854524.jpeg	\N	\N	Masculino	2	\N	\N
11	Lauro	2014-02-20	51977445178	paulo.opensource@gmail.com	\N	\N	/uploads/foto-1749136212852.jpeg	\N	\N	Masculino	\N	\N	2
5	Renata Pereira	2001-06-06	51987745155	alinetraposo@gmail.com	\N	\N	/uploads/foto-1749097379577.jpeg	\N	\N	Feminino	10	15	2
34	Mirela Santos	2003-07-10	51988547125	mirelasantos@gmail.com	\N	\N	/uploads/foto-1749520847383.jpeg	\N	\N	Feminino	5	\N	\N
24	Alex Barbosa	2002-03-25	51983352147	alexbarbosa@gmail.com	\N	\N	/uploads/foto-1749176864060.jpeg	\N	\N	Masculino	8	\N	2
12	Marizete Lima	1978-04-25	51977453197	marizetelima@gmail.com	\N	\N	/uploads/foto-1749176949050.jpeg	\N	\N	Feminino	9	\N	2
21	Fernanda Maria	1999-04-16	51974451397	fernandamaria@gmail.com	\N	\N	/uploads/foto-1749177023527.jpeg	\N	\N	Feminino	6	7	2
16	Valeria Rocha	1988-12-07	5196314125	valeriarocha@gmail.com	\N	\N	/uploads/foto-1749177116631.jpeg	\N	\N	Feminino	4	\N	2
2	Maria Joana	2000-12-10	519916031390	mariajoana@gmail.com	\N	\N	/uploads/foto-1749098103429.jpeg	\N	\N	Feminino	9	7	2
13	Emerson Castro	2005-06-14	\N	\N	\N	\N	/uploads/foto-1749177182584.jpeg	\N	\N	Feminino	\N	\N	2
8	Marcele Dias	2001-01-02	51987745325	montebrick.rs@gmail.com	\N	\N	/uploads/foto-1749097537221.jpeg	\N	\N	Feminino	8	\N	2
3	Marcelo Moreira	\N	51991603139	paulo.opensource@gmail.com	\N	\N	/uploads/foto-1749095352349.png	\N	\N	Masculino	8		2
25	Lucas Lima	2006-12-15	5198663471	lucaslima@gmail.com	\N	\N	/uploads/foto-1749209661194.jpeg	\N	\N	Masculino	2	\N	2
26	Emilia Morena	1995-01-15	51976636524	emiliamorena@gmail.com	\N	\N	/uploads/foto-1749210065495.jpeg	\N	\N	Feminino	9	\N	2
35	filip	2005-10-10	519999999	hihlipr@gmai.com	\N	\N	/uploads/foto-1749521048035.jpeg	\N	\N	Masculino	7	\N	\N
36	Mariele Cardoso	1993-06-28	51966584178	marielecardoso@gmail.com	\N	\N	/uploads/foto-1749521502035.jpeg	\N	\N	Feminino	2	\N	2
28	Plinio Mendes	1978-06-09	51996634158	paulosergio.suporte@yahoo.com.br	\N	\N	/uploads/foto-1749265767709.jpeg	\N	\N	Masculino	4	\N	2
37	Paula Lavine	1990-06-27	51987712145	paulafit.lavine@gmail.com	\N	\N	/uploads/foto-1749651361839.jpeg	\N	\N	Feminino	10	\N	2
38	Paulo Sérgio da SIlva Raposo	1979-10-22	51991603139	paulosergio.suporte@yahoo.com.br	\N	\N	/uploads/foto-1749751986439.jpg	\N	\N	Masculino	11	\N	3
39	Aline Neves Tavares Raposo	1981-09-25	51998945319	alinetraposo@gmail.com	\N	\N	/uploads/foto-1749752085155.jpg	\N	\N	Feminino	11	\N	3
40	Maria Clara Tavares Raposo	2007-02-12	51999620128	tavaresraposoclara@gmail.com	\N	\N	/uploads/foto-1749752202091.jpg	\N	\N	Feminino	15	\N	3
41	Maria Luiza Tavares Raposo	2008-08-20	51995270708	marialuizatavaresraposo@gmail.com	\N	\N	/uploads/foto-1749752548412.jpg	\N	\N	Feminino	15	\N	3
42	Maria Alice Tavares Raposo	2020-04-13	51991603139	paulosergio.suporte@yahoo.com.br	\N	\N	/uploads/foto-1749752769993.jpg	\N	\N	Feminino	14	\N	3
\.


--
-- TOC entry 4948 (class 0 OID 16488)
-- Dependencies: 232
-- Data for Name: ministerios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ministerios (id, nome, descricao, admin_id) FROM stdin;
1	Pastoral	\N	2
2	Louvor	\N	2
3	Intercessão	\N	2
4	Diaconia	\N	2
5	Infantil	\N	2
6	Acolhimento	\N	2
7	Dança	\N	2
8	Homens	\N	2
9	Mulheres	\N	2
10	Mídia	\N	2
21	Evangelismo	\N	1
12	Louvor	\N	3
11	Pastoral	\N	3
15	Jovens	\N	3
14	Infantil	\N	3
13	Diaconia	\N	3
18	Mulheres	\N	3
17	Homens	\N	3
16	Interseção	\N	3
\.


--
-- TOC entry 4960 (class 0 OID 57590)
-- Dependencies: 244
-- Data for Name: musicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.musicas (id, igreja_id, titulo, link_video, link_cifra, criado_por, data_criacao) FROM stdin;
\.


--
-- TOC entry 4950 (class 0 OID 16502)
-- Dependencies: 234
-- Data for Name: password_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_tokens (id, email, token, expires_at, tipo_usuario) FROM stdin;
1	paulo.opensource@gmail.com	5d4b4dc7b6fe40e8cc11fd55e6044bab3befbcce	2025-06-03 22:07:49.9	\N
3	paulosergio.suporte@yahoo.com.br	3d3442a47f8b00eb002bbf63fc9534f23cfe5d30	2025-06-10 03:53:30.122	\N
5	paulo.opensource@gmail.com	a2c9ecaa2d888c7ad685d724cfcd73560a20f1e0	2025-06-10 04:35:34.809	usuarios
7	paulosergio.suporte@yahoo.com.br	1c36809b2d972722bb6a9d1d2cda265611140948	2025-06-10 04:52:30.143	admins
10	paulosergio.suporte@yahoo.com.br	a24a26b13a2cb13cb918d10434386466335d849e	2025-06-10 05:01:11.054	admins
11	paulosergio.suporte@yahoo.com.br	6eee75ac685a54419d3f337bc258da45ec407106	2025-12-24 18:08:24.779	admins
\.


--
-- TOC entry 4952 (class 0 OID 16511)
-- Dependencies: 236
-- Data for Name: saidas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saidas (id, admin_id, valor, descricao, data, nota_fiscal) FROM stdin;
\.


--
-- TOC entry 4964 (class 0 OID 57610)
-- Dependencies: 248
-- Data for Name: setlist_musicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setlist_musicas (id, setlist_id, musica_id, funcao, ordem) FROM stdin;
\.


--
-- TOC entry 4962 (class 0 OID 57600)
-- Dependencies: 246
-- Data for Name: setlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setlists (id, igreja_id, data_culto, ministro, vocais, criado_por, data_criacao) FROM stdin;
\.


--
-- TOC entry 4954 (class 0 OID 16525)
-- Dependencies: 238
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, telefone, data_nascimento, senha, token_recuperacao, token_expira, reset_token, reset_token_expiration, admin_id, nome_igreja) FROM stdin;
\.


--
-- TOC entry 4956 (class 0 OID 16539)
-- Dependencies: 240
-- Data for Name: visitantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitantes (id, nome, whatsapp, observacao, data_visita, admin_id, acoes) FROM stdin;
2	Pedro Lima	51999815472	jbjkbkjjk	2025-06-10	2	\N
4	Maria Joana	51977454126	prima do paulo	2025-06-10	2	\N
\.


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 217
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 219
-- Name: avisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.avisos_id_seq', 14, true);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 241
-- Name: batismos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batismos_id_seq', 1, false);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 221
-- Name: entradas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entradas_id_seq', 1, false);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 223
-- Name: eventos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eventos_id_seq', 34, true);


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 225
-- Name: financeiro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financeiro_id_seq', 1, false);


--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 227
-- Name: lancamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lancamentos_id_seq', 6, true);


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 229
-- Name: membros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membros_id_seq', 42, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 231
-- Name: ministerios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ministerios_id_seq', 1, false);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 243
-- Name: musicas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.musicas_id_seq', 1, false);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 233
-- Name: password_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_tokens_id_seq', 11, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 235
-- Name: saidas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saidas_id_seq', 1, false);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 247
-- Name: setlist_musicas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setlist_musicas_id_seq', 1, false);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 245
-- Name: setlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setlists_id_seq', 1, false);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 237
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 6, true);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 239
-- Name: visitantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitantes_id_seq', 4, true);


--
-- TOC entry 4743 (class 2606 OID 16398)
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- TOC entry 4745 (class 2606 OID 16396)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 16408)
-- Name: avisos avisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avisos
    ADD CONSTRAINT avisos_pkey PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 41182)
-- Name: batismos batismos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batismos
    ADD CONSTRAINT batismos_pkey PRIMARY KEY (id);


--
-- TOC entry 4749 (class 2606 OID 16423)
-- Name: entradas entradas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas
    ADD CONSTRAINT entradas_pkey PRIMARY KEY (id);


--
-- TOC entry 4751 (class 2606 OID 16437)
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- TOC entry 4753 (class 2606 OID 16453)
-- Name: financeiro financeiro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_pkey PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 16467)
-- Name: lancamentos lancamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 16481)
-- Name: membros membros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_pkey PRIMARY KEY (id);


--
-- TOC entry 4759 (class 2606 OID 16495)
-- Name: ministerios ministerios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ministerios
    ADD CONSTRAINT ministerios_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 57598)
-- Name: musicas musicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.musicas
    ADD CONSTRAINT musicas_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 16509)
-- Name: password_tokens password_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_tokens
    ADD CONSTRAINT password_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 16518)
-- Name: saidas saidas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saidas
    ADD CONSTRAINT saidas_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 57616)
-- Name: setlist_musicas setlist_musicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlist_musicas
    ADD CONSTRAINT setlist_musicas_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 57608)
-- Name: setlists setlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlists
    ADD CONSTRAINT setlists_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 16532)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 16548)
-- Name: visitantes visitantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitantes
    ADD CONSTRAINT visitantes_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 16409)
-- Name: avisos avisos_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avisos
    ADD CONSTRAINT avisos_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4777 (class 2606 OID 16424)
-- Name: entradas entradas_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas
    ADD CONSTRAINT entradas_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4778 (class 2606 OID 16438)
-- Name: eventos eventos_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4779 (class 2606 OID 16454)
-- Name: financeiro financeiro_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4780 (class 2606 OID 16468)
-- Name: lancamentos lancamentos_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4781 (class 2606 OID 16482)
-- Name: membros membros_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4782 (class 2606 OID 16496)
-- Name: ministerios ministerios_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ministerios
    ADD CONSTRAINT ministerios_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4783 (class 2606 OID 16519)
-- Name: saidas saidas_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saidas
    ADD CONSTRAINT saidas_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4786 (class 2606 OID 57622)
-- Name: setlist_musicas setlist_musicas_musica_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlist_musicas
    ADD CONSTRAINT setlist_musicas_musica_id_fkey FOREIGN KEY (musica_id) REFERENCES public.musicas(id) ON DELETE CASCADE;


--
-- TOC entry 4787 (class 2606 OID 57617)
-- Name: setlist_musicas setlist_musicas_setlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setlist_musicas
    ADD CONSTRAINT setlist_musicas_setlist_id_fkey FOREIGN KEY (setlist_id) REFERENCES public.setlists(id) ON DELETE CASCADE;


--
-- TOC entry 4784 (class 2606 OID 16533)
-- Name: usuarios usuarios_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- TOC entry 4785 (class 2606 OID 16549)
-- Name: visitantes visitantes_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitantes
    ADD CONSTRAINT visitantes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


-- Completed on 2025-12-24 22:37:44

--
-- PostgreSQL database dump complete
--

