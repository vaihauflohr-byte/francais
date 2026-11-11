-- =====================================================================
--  Français au collège (francais.ka-ilei.com) — base de données
--  Tout est dans le schéma « fr » : rien de commun avec les tables du site SI (schéma public).
--  À coller en entier dans Supabase > SQL Editor > Run. Rejouable sans risque.
--  Après la 1re installation : Project Settings > Data API > Exposed schemas : ajouter « fr ».
--
--  Sécurité : aucune table n'est lisible avec la clé publique. Les élèves passent UNIQUEMENT par
--  les fonctions (jeton de session). Les profs sont des comptes Supabase Auth inscrits dans fr.profs.
--  Données d'élève gardées : prénom (et initiale si besoin), classe, code haché, résultats. Rien d'autre.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;
create schema if not exists fr;
grant usage on schema fr to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table if not exists fr.classes (
  id      text primary key,                      -- identifiant court : '6e1', '4e-autea'…
  nom     text not null,                         -- affiché : '6e 1', '4e AUTEA'…
  niveau  text not null check (niveau in ('6e','5e','4e','3e')),
  ordre   int  not null default 0,
  active  boolean not null default true
);
insert into fr.classes (id, nom, niveau, ordre) values
  ('6e1', '6e 1', '6e', 1),
  ('5e3', '5e 3', '5e', 2),
  ('4e-autea', '4e AUTEA', '4e', 3),
  ('4e-omuri', '4e OMURI', '4e', 4),
  ('3e-rangiroa', '3e RANGIROA', '3e', 5)
on conflict (id) do nothing;

create table if not exists fr.eleves (
  id            uuid primary key default gen_random_uuid(),
  classe        text not null references fr.classes on update cascade,
  prenom        text not null check (length(trim(prenom)) between 1 and 40),
  pin_hash      text not null,
  actif         boolean not null default true,
  echecs        int not null default 0,
  bloque_jusqua timestamptz,
  cree_le       timestamptz not null default now()
);
create index if not exists fr_eleves_classe on fr.eleves (classe);

create table if not exists fr.jetons (
  jeton     uuid primary key default gen_random_uuid(),
  eleve_id  uuid not null references fr.eleves on delete cascade,
  expire_le timestamptz not null default now() + interval '180 days'
);
create index if not exists fr_jetons_eleve on fr.jetons (eleve_id);

-- Une série, une rédaction ou une lecture terminée = 1 ligne, pour toujours.
create table if not exists fr.resultats (
  id        bigserial primary key,
  eleve_id  uuid not null references fr.eleves on delete cascade,
  classe    text not null,
  notion    text not null,
  titre     text,
  type      text not null default 'serie' check (type in ('serie','ecrit','lecture','dictee','revision')),
  score     numeric not null,
  score_max numeric not null,
  duree_s   int,
  details   jsonb,
  fait_le   timestamptz not null default now(),   -- fin sur l'appareil (file d'attente hors ligne)
  recu_le   timestamptz not null default now()    -- réception par le serveur
);
create index if not exists fr_resultats_eleve on fr.resultats (eleve_id, fait_le desc);
create index if not exists fr_resultats_classe on fr.resultats (classe, notion);

-- Notions ouvertes ou fermées par la prof, classe par classe (sans ligne : réglage par défaut du site).
create table if not exists fr.ouvertures (
  classe  text not null references fr.classes on update cascade on delete cascade,
  notion  text not null,
  ouverte boolean not null,
  maj_le  timestamptz not null default now(),
  primary key (classe, notion)
);

create table if not exists fr.profs (
  user_id uuid primary key references auth.users on delete cascade,
  nom     text
);
-- Les profs déjà inscrits sur le site SI (même projet) ont aussi accès ici ; on peut en retirer ensuite.
do $$ begin
  if to_regclass('public.profs') is not null then
    insert into fr.profs (user_id, nom) select user_id, nom from public.profs on conflict (user_id) do nothing;
  end if;
end $$;

-- Nombre de vérifications par l'IA, par élève et par jour (heure de Tahiti) : borne le coût.
create table if not exists fr.ia_appels (
  eleve_id uuid not null references fr.eleves on delete cascade,
  jour     date not null default (now() at time zone 'Pacific/Tahiti')::date,
  n        int  not null default 0,
  primary key (eleve_id, jour)
);

-- ---------------------------------------------------------------------
-- Sécurité
-- ---------------------------------------------------------------------
alter table fr.classes    enable row level security;
alter table fr.eleves     enable row level security;
alter table fr.jetons     enable row level security;
alter table fr.resultats  enable row level security;
alter table fr.ouvertures enable row level security;
alter table fr.profs      enable row level security;
alter table fr.ia_appels  enable row level security;

create or replace function fr.is_prof() returns boolean
language sql stable security definer set search_path = fr, public as $$
  select exists (select 1 from fr.profs where user_id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array['classes','eleves','resultats','ouvertures','profs','ia_appels'] loop
    execute format('drop policy if exists prof_lit on fr.%I', t);
    execute format('create policy prof_lit on fr.%I for select to authenticated using (fr.is_prof())', t);
  end loop;
end $$;
drop policy if exists prof_modifie on fr.eleves;
create policy prof_modifie on fr.eleves for update to authenticated using (fr.is_prof()) with check (fr.is_prof());
drop policy if exists prof_supprime on fr.eleves;
create policy prof_supprime on fr.eleves for delete to authenticated using (fr.is_prof());
drop policy if exists prof_supprime on fr.resultats;
create policy prof_supprime on fr.resultats for delete to authenticated using (fr.is_prof());
drop policy if exists prof_ajoute on fr.classes;
create policy prof_ajoute on fr.classes for insert to authenticated with check (fr.is_prof());
drop policy if exists prof_modifie on fr.classes;
create policy prof_modifie on fr.classes for update to authenticated using (fr.is_prof()) with check (fr.is_prof());

revoke all on all tables in schema fr from anon, authenticated;
grant select on fr.classes, fr.eleves, fr.resultats, fr.ouvertures, fr.profs, fr.ia_appels to authenticated;
grant update (actif, prenom, classe) on fr.eleves to authenticated;
grant delete on fr.eleves, fr.resultats to authenticated;
grant insert, update on fr.classes to authenticated;
grant usage, select on all sequences in schema fr to authenticated;

-- ---------------------------------------------------------------------
-- Outils (non exposés)
-- ---------------------------------------------------------------------
create or replace function fr._aujourdhui() returns date
language sql stable as $$ select (now() at time zone 'Pacific/Tahiti')::date $$;

-- prénom comparé sans majuscules, sans accents, sans espaces en trop
create or replace function fr._cle(p text) returns text
language sql stable set search_path = fr, extensions, public as $$
  select lower(unaccent(regexp_replace(trim(coalesce(p, '')), '\s+', ' ', 'g')))
$$;

create or replace function fr._eleve(p_jeton uuid) returns uuid
language plpgsql stable security definer set search_path = fr, public as $$
declare v uuid;
begin
  select eleve_id into v from fr.jetons where jeton = p_jeton and expire_le > now();
  if v is null then raise exception 'SESSION_EXPIREE'; end if;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- API publique et élève (clé publique)
-- ---------------------------------------------------------------------
-- Liste des classes pour l'écran de connexion (aucun nom d'élève).
create or replace function fr.classes_liste()
returns json language sql stable security definer set search_path = fr, public as $$
  select coalesce(json_agg(json_build_object('id', id, 'nom', nom, 'niveau', niveau) order by ordre, nom), '[]'::json)
  from fr.classes where active;
$$;

create or replace function fr.connexion(p_classe text, p_prenom text, p_pin text)
returns json language plpgsql security definer set search_path = fr, public, extensions as $$
declare e fr.eleves; j uuid; c fr.classes;
begin
  select * into c from fr.classes where id = p_classe and active;
  if not found then return json_build_object('ok', false, 'erreur', 'CLASSE'); end if;
  select * into e from fr.eleves where classe = p_classe and fr._cle(prenom) = fr._cle(p_prenom) and actif limit 1;
  if not found then return json_build_object('ok', false, 'erreur', 'IDENTIFIANTS'); end if;
  if e.bloque_jusqua is not null and e.bloque_jusqua > now() then
    return json_build_object('ok', false, 'erreur', 'BLOQUE');
  end if;
  if e.pin_hash <> crypt(trim(p_pin), e.pin_hash) then
    update fr.eleves set echecs = echecs + 1,
      bloque_jusqua = case when echecs + 1 >= 5 then now() + interval '10 minutes' end
    where id = e.id;
    return json_build_object('ok', false, 'erreur', 'IDENTIFIANTS');
  end if;
  update fr.eleves set echecs = 0, bloque_jusqua = null where id = e.id;
  delete from fr.jetons where eleve_id = e.id and expire_le < now();
  insert into fr.jetons (eleve_id) values (e.id) returning jeton into j;
  return json_build_object('ok', true, 'jeton', j, 'prenom', e.prenom, 'classe', c.id, 'classe_nom', c.nom, 'niveau', c.niveau);
end $$;

create or replace function fr.deconnexion(p_jeton uuid)
returns void language sql security definer set search_path = fr, public as $$
  delete from fr.jetons where jeton = p_jeton;
$$;

create or replace function fr.enregistrer(
  p_jeton uuid, p_notion text, p_titre text, p_type text,
  p_score numeric, p_score_max numeric, p_duree_s int, p_details jsonb, p_fait_le timestamptz default null)
returns bigint language plpgsql security definer set search_path = fr, public as $$
declare v uuid := fr._eleve(p_jeton); k text; i bigint;
begin
  if p_score_max is null or p_score_max <= 0 or p_score is null or p_score < 0 or p_score > p_score_max then
    raise exception 'SCORE_INVALIDE';
  end if;
  if pg_column_size(p_details) > 60000 then raise exception 'DETAILS_TROP_LONGS'; end if;
  select classe into k from fr.eleves where id = v;
  insert into fr.resultats (eleve_id, classe, notion, titre, type, score, score_max, duree_s, details, fait_le)
  values (v, k, left(p_notion, 80), left(p_titre, 200), coalesce(p_type, 'serie'), p_score, p_score_max,
          greatest(0, least(coalesce(p_duree_s, 0), 86400)), p_details, coalesce(least(p_fait_le, now()), now()))
  returning id into i;
  return i;
end $$;

create or replace function fr.mon_etat(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = fr, public as $$
declare v uuid := fr._eleve(p_jeton); e fr.eleves; c fr.classes;
begin
  select * into e from fr.eleves where id = v;
  select * into c from fr.classes where id = e.classe;
  return json_build_object(
    'eleve', json_build_object('prenom', e.prenom, 'classe', c.id, 'classe_nom', c.nom, 'niveau', c.niveau, 'actif', e.actif),
    'aujourdhui', fr._aujourdhui(),
    'ouvertures', coalesce((select json_object_agg(notion, ouverte) from fr.ouvertures where classe = c.id), '{}'::json),
    'historique', coalesce((
      select json_agg(x) from (
        select notion, titre, type, score, score_max, fait_le from fr.resultats
        where eleve_id = v order by fait_le desc limit 400) x), '[]'::json)
  );
end $$;

-- ---------------------------------------------------------------------
-- API prof (compte connecté inscrit dans fr.profs)
-- ---------------------------------------------------------------------
create or replace function fr.creer_eleve(p_classe text, p_prenom text, p_pin text)
returns uuid language plpgsql security definer set search_path = fr, public, extensions as $$
declare i uuid;
begin
  if not fr.is_prof() then raise exception 'RESERVE_PROF'; end if;
  if p_pin !~ '^[0-9]{4,8}$' then raise exception 'CODE_INVALIDE'; end if;
  if exists (select 1 from fr.eleves where classe = p_classe and fr._cle(prenom) = fr._cle(p_prenom)) then
    raise exception 'PRENOM_EN_DOUBLE';
  end if;
  insert into fr.eleves (classe, prenom, pin_hash)
  values (p_classe, regexp_replace(trim(p_prenom), '\s+', ' ', 'g'), crypt(p_pin, gen_salt('bf')))
  returning id into i;
  return i;
end $$;

create or replace function fr.changer_pin(p_eleve uuid, p_pin text)
returns void language plpgsql security definer set search_path = fr, public, extensions as $$
begin
  if not fr.is_prof() then raise exception 'RESERVE_PROF'; end if;
  if p_pin !~ '^[0-9]{4,8}$' then raise exception 'CODE_INVALIDE'; end if;
  update fr.eleves set pin_hash = crypt(p_pin, gen_salt('bf')), echecs = 0, bloque_jusqua = null where id = p_eleve;
  delete from fr.jetons where eleve_id = p_eleve;
end $$;

create or replace function fr.ouvrir(p_classe text, p_notion text, p_ouverte boolean)
returns void language plpgsql security definer set search_path = fr, public as $$
begin
  if not fr.is_prof() then raise exception 'RESERVE_PROF'; end if;
  insert into fr.ouvertures (classe, notion, ouverte) values (p_classe, left(p_notion, 80), p_ouverte)
  on conflict (classe, notion) do update set ouverte = excluded.ouverte, maj_le = now();
end $$;

-- Ajouter une collègue : son compte existe déjà (créé par elle sur la page prof)
create or replace function fr.ajouter_prof(p_email text, p_nom text default null)
returns void language plpgsql security definer set search_path = fr, public, auth as $$
declare u uuid;
begin
  if not fr.is_prof() then raise exception 'RESERVE_PROF'; end if;
  select id into u from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if u is null then raise exception 'COMPTE_INCONNU'; end if;
  insert into fr.profs (user_id, nom) values (u, nullif(trim(coalesce(p_nom, '')), '')) on conflict (user_id) do nothing;
end $$;

-- ---------------------------------------------------------------------
-- Vérification des écrits par l'IA : appelée par la fonction « corriger-francais » seulement (clé secrète)
-- ---------------------------------------------------------------------
create or replace function fr.ia_autoriser(p_jeton uuid, p_quota int default 30)
returns json language plpgsql security definer set search_path = fr, public as $$
declare v uuid := fr._eleve(p_jeton); k int;
begin
  if not coalesce((select actif from fr.eleves where id = v), false) then
    return json_build_object('ok', false, 'erreur', 'INACTIF', 'restant', 0);
  end if;
  insert into fr.ia_appels (eleve_id, jour, n) values (v, fr._aujourdhui(), 1)
  on conflict (eleve_id, jour) do update set n = fr.ia_appels.n + 1
  returning n into k;
  if k > greatest(coalesce(p_quota, 30), 0) then
    return json_build_object('ok', false, 'erreur', 'QUOTA', 'restant', 0);
  end if;
  return json_build_object('ok', true, 'restant', greatest(coalesce(p_quota, 30), 0) - k);
end $$;

-- ---------------------------------------------------------------------
-- Droits d'exécution
-- ---------------------------------------------------------------------
revoke execute on all functions in schema fr from public, anon, authenticated;
grant execute on function fr.classes_liste()                                                        to anon, authenticated;
grant execute on function fr.connexion(text, text, text)                                            to anon, authenticated;
grant execute on function fr.deconnexion(uuid)                                                      to anon, authenticated;
grant execute on function fr.enregistrer(uuid, text, text, text, numeric, numeric, int, jsonb, timestamptz) to anon, authenticated;
grant execute on function fr.mon_etat(uuid)                                                         to anon, authenticated;
grant execute on function fr.is_prof()                                                              to authenticated;
grant execute on function fr.creer_eleve(text, text, text)                                          to authenticated;
grant execute on function fr.changer_pin(uuid, text)                                                to authenticated;
grant execute on function fr.ouvrir(text, text, boolean)                                            to authenticated;
grant execute on function fr.ajouter_prof(text, text)                                               to authenticated;
grant execute on function fr.ia_autoriser(uuid, int)                                                to service_role;
grant execute on function fr._cle(text) to service_role;

notify pgrst, 'reload schema';
