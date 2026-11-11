/* =====================================================================
   Français au collège — accès à la base (schéma « fr » de Supabase)
   - Élève : appels directs aux fonctions (PostgREST /rest/v1/rpc/…, en-tête Content-Profile: fr).
   - Résultats : file d'attente dans ce navigateur, envoyée dès que le réseau revient.
   - Mode démo (config sans supabaseUrl) et aperçu prof : tout reste dans ce navigateur, rien n'est transmis.
   - Vérification des écrits : fonction Supabase « corriger-francais » (clé de l'API Claude côté serveur).
   ===================================================================== */
(function () {
  "use strict";
  const FR = (window.FR = window.FR || {});
  const U = FR.u;
  const CFG = window.FR_CONFIG || {};
  const URL_BASE = String(CFG.supabaseUrl || "").replace(/\/+$/, "");
  const CLE = CFG.supabaseCle || "";
  const SCHEMA = CFG.schema || "fr";
  const configure = !!(URL_BASE && CLE);

  const erreur = (code, reseau) => Object.assign(new Error(code), { code, reseau: !!reseau });

  // ------------------------------------------------------------------ session élève
  const CLE_SESSION = "fr_session", CLE_FILE = "fr_file";
  FR.session = {
    get: () => U.lsGet(CLE_SESSION, null),
    set: (s) => U.lsSet(CLE_SESSION, s),
    clear: () => U.lsDel(CLE_SESSION),
  };

  // ------------------------------------------------------------------ appels
  async function rpc(fn, args, opts) {
    const h = { "Content-Type": "application/json", apikey: CLE, "Content-Profile": SCHEMA, "Accept-Profile": SCHEMA };
    if (CLE && !CLE.startsWith("sb_")) h.Authorization = "Bearer " + CLE;   // ancienne clé (JWT)
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), (opts && opts.delai) || 15000) : null;
    let r;
    try { r = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, { method: "POST", headers: h, body: JSON.stringify(args || {}), signal: ctl ? ctl.signal : undefined }); }
    catch (e) { throw erreur("RESEAU", true); }
    finally { if (t) clearTimeout(t); }
    const brut = await r.text();
    let d = null; try { d = brut ? JSON.parse(brut) : null; } catch (e) { d = null; }
    if (!r.ok) {
      const msg = (d && (d.message || d.error)) || brut || "";
      for (const code of ["SESSION_EXPIREE", "SCORE_INVALIDE", "DETAILS_TROP_LONGS", "RESERVE_PROF"]) if (msg.includes(code)) throw erreur(code);
      if (/invalid input syntax for type uuid/.test(msg)) throw erreur("SESSION_EXPIREE");
      throw erreur("SERVEUR_" + r.status, r.status >= 500);
    }
    return d;
  }

  // ------------------------------------------------------------------ mode démo / aperçu (navigateur seulement)
  const demo = {
    async classes() { return FR.CLASSES_DEFAUT || []; },
    async connexion(classe, prenom) {
      const c = (FR.CLASSES_DEFAUT || []).find((x) => x.id === classe) || { id: classe, nom: classe, niveau: "6e" };
      return { ok: true, jeton: "demo-" + c.id, prenom: prenom || "Élève", classe: c.id, classe_nom: c.nom, niveau: c.niveau, demo: true };
    },
    async etat(s) {
      return { eleve: { prenom: s.prenom, classe: s.classe, classe_nom: s.classe_nom, niveau: s.niveau, actif: true },
        ouvertures: U.lsGet("fr_demo_ouvertures_" + s.classe, {}), historique: U.lsGet("fr_demo_hist_" + s.jeton, []) };
    },
    async enregistrer(s, r) {
      const h = U.lsGet("fr_demo_hist_" + s.jeton, []);
      h.unshift({ notion: r.notion, titre: r.titre, type: r.type, score: r.score, score_max: r.score_max, fait_le: r.fait_le });
      U.lsSet("fr_demo_hist_" + s.jeton, h.slice(0, 400));
      return true;
    },
  };

  const vrai = {
    async classes() { return (await rpc("classes_liste", {})) || []; },
    async connexion(classe, prenom, pin) { return rpc("connexion", { p_classe: classe, p_prenom: prenom, p_pin: pin }); },
    async etat(s) { return rpc("mon_etat", { p_jeton: s.jeton }); },
    async enregistrer(s, r) {
      await rpc("enregistrer", { p_jeton: s.jeton, p_notion: r.notion, p_titre: r.titre, p_type: r.type, p_score: r.score,
        p_score_max: r.score_max, p_duree_s: r.duree_s, p_details: r.details || null, p_fait_le: r.fait_le });
      return true;
    },
  };
  const estDemo = (s) => !configure || (s && (s.demo || s.apercu));
  const B = (s) => (estDemo(s) ? demo : vrai);

  FR.api = {
    configure,
    mode: configure ? "supabase" : "demo",
    estDemo,
    async classes() {
      if (!configure) return demo.classes();
      try { const l = await vrai.classes(); if (Array.isArray(l) && l.length) { U.lsSet("fr_classes", l); return l; } } catch (e) { /* hors ligne */ }
      return U.lsGet("fr_classes", null) || FR.CLASSES_DEFAUT || [];
    },
    async connexion(classe, prenom, pin) {
      const r = configure ? await vrai.connexion(classe, prenom, pin) : await demo.connexion(classe, prenom, pin);
      if (r && r.ok) {
        const s = { jeton: r.jeton, prenom: r.prenom, classe: r.classe, classe_nom: r.classe_nom, niveau: r.niveau, demo: !!r.demo };
        FR.session.set(s);
        if (configure && !r.demo) { FR.api.reprendreFile(s); FR.api.viderFile().catch(() => {}); }
      }
      return r;
    },
    apercu(niveau, classe) {
      const c = (FR.CLASSES_DEFAUT || []).find((x) => x.id === classe) || { id: "apercu-" + niveau, nom: "Aperçu " + niveau, niveau };
      FR.session.set({ jeton: "apercu-" + c.id, prenom: "Aperçu prof", classe: c.id, classe_nom: c.nom, niveau: c.niveau || niveau, apercu: true });
    },
    async etat() {
      const s = FR.session.get(); if (!s) throw erreur("NON_CONNECTE");
      const d = await B(s).etat(s);
      U.lsSet("fr_etat_" + s.classe + "_" + s.prenom, d);
      return d;
    },
    etatEnCache() { const s = FR.session.get(); return s ? U.lsGet("fr_etat_" + s.classe + "_" + s.prenom, null) : null; },
    async deconnexion() {
      const s = FR.session.get();
      if (s && !estDemo(s)) { try { await rpc("deconnexion", { p_jeton: s.jeton }, { delai: 5000 }); } catch (e) { /* tant pis */ } }
      FR.session.clear();
    },
    // résultat : { notion, titre, type, score, score_max, duree_s, details }
    // renvoie "envoye" | "attente" (pas de réseau : partira plus tard) | "session" (reconnexion nécessaire) | "apercu"
    async enregistrer(r) {
      const s = FR.session.get(); if (!s) throw erreur("NON_CONNECTE");
      r.fait_le = r.fait_le || new Date().toISOString();
      r.uid = r.uid || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      if (s.apercu) return "apercu";
      if (estDemo(s)) { await demo.enregistrer(s, r); return "envoye"; }
      U.lsSet(CLE_FILE, U.lsGet(CLE_FILE, []).concat([{ s: { jeton: s.jeton, classe: s.classe, prenom: s.prenom }, r }]));
      const v = await FR.api.viderFile();
      if (!U.lsGet(CLE_FILE, []).some((x) => x.r.uid === r.uid)) return "envoye";
      return v.session ? "session" : "attente";
    },
    enAttente: () => U.lsGet(CLE_FILE, []).length,
    // après une nouvelle connexion : les résultats en attente de cet élève reprennent son nouveau jeton
    reprendreFile(s) {
      const cle = (x) => U.sansAccents(String(x || "")).toLowerCase().trim();
      U.lsSet(CLE_FILE, U.lsGet(CLE_FILE, []).map((x) => (x.s.classe === s.classe && cle(x.s.prenom) === cle(s.prenom) ? Object.assign(x, { s: { jeton: s.jeton, classe: s.classe, prenom: s.prenom } }) : x)));
    },
    // envoie les résultats en attente, dans l'ordre ; s'arrête au premier souci de réseau ou de session
    async viderFile() {
      if (!configure || FR.api._vidage) return { envoyes: 0, restants: U.lsGet(CLE_FILE, []).length };
      FR.api._vidage = true;
      let envoyes = 0, session = false;
      try {
        for (;;) {
          const file = U.lsGet(CLE_FILE, []);
          if (!file.length) break;
          const x = file[0];
          try { await vrai.enregistrer(x.s, x.r); envoyes++; }
          catch (e) {
            if (e.reseau || /^SERVEUR_5/.test(e.code)) break;                 // réseau : on réessaiera plus tard
            if (e.code === "SESSION_EXPIREE") { session = true; break; }      // l'élève doit se reconnecter : rien n'est perdu
            U.lsSet("fr_file_rejets", U.lsGet("fr_file_rejets", []).concat([Object.assign({ erreur: e.code }, x)]).slice(-50));
          }
          const f2 = U.lsGet(CLE_FILE, []); if (f2.length && f2[0].r.uid === x.r.uid) f2.shift(); U.lsSet(CLE_FILE, f2);
        }
      } finally { FR.api._vidage = false; }
      return { envoyes, session, restants: U.lsGet(CLE_FILE, []).length };
    },
  };

  // ------------------------------------------------------------------ vérification d'un écrit par l'IA
  const IA_URL = CFG.iaUrl || (URL_BASE ? `${URL_BASE}/functions/v1/${CFG.iaFonction || "corriger-francais"}` : "");
  // aperçu : la session de l'espace prof (même site) permet de faire vérifier un écrit sans compte élève
  function jetonProf() {
    try {
      const ref = (URL_BASE.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1];
      const d = ref ? JSON.parse(localStorage.getItem(`sb-${ref}-auth-token`) || "null") : null;
      const t = d && d.access_token, exp = d && d.expires_at;
      return t && (!exp || exp * 1000 > Date.now() + 30000) ? t : null;
    } catch (e) { return null; }
  }
  FR.ia = {
    actif: () => !!IA_URL && CFG.ia !== false,
    // la vérification est-elle possible pour cette session ? (pas en démo ; en aperçu, seulement si l'espace prof est ouvert)
    possible() { const s = FR.session.get(); return !!(FR.ia.actif() && s && !s.demo && configure && (!s.apercu || jetonProf())); },
    // p = { niveau, question, texte, corrige, elements:[{i,t,p}], reponse, langue:true } → { elements:[{i,verdict,raison}], conseil, langue:[…], restant }
    async corriger(p) {
      if (!FR.ia.actif()) throw erreur("IA_ABSENTE");
      const s = FR.session.get();
      if (!s) throw erreur("NON_CONNECTE");
      if (s.demo || !configure) throw erreur("IA_APERCU");
      const h = { "Content-Type": "application/json" }, corps = Object.assign({}, p);
      if (CLE) h.apikey = CLE;
      if (s.apercu) { const j = jetonProf(); if (!j) throw erreur("IA_APERCU"); h.Authorization = "Bearer " + j; }
      else { corps.jeton = s.jeton; if (CFG.iaJeton) h.Authorization = "Bearer " + CFG.iaJeton; }
      const ctl = typeof AbortController === "function" ? new AbortController() : null, t = ctl ? setTimeout(() => ctl.abort(), 45000) : null;
      let r;
      try { r = await fetch(IA_URL, { method: "POST", headers: h, body: JSON.stringify(corps), signal: ctl ? ctl.signal : undefined }); }
      catch (e) { throw erreur("IA_RESEAU", true); }
      finally { if (t) clearTimeout(t); }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw erreur(d.erreur || "IA_" + r.status);
      if (!d || !Array.isArray(d.elements)) throw erreur("IA_REPONSE");
      return d;
    },
  };

  // dès que le réseau revient : on envoie ce qui attend
  if (typeof window.addEventListener === "function") window.addEventListener("online", () => { FR.api.viderFile().catch(() => {}); });
})();
