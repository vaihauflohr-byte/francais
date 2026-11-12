/* =====================================================================
   Français au collège — espace prof
   Connexion (compte Supabase Auth inscrit dans fr.profs), puis par classe :
   résultats (grille de maîtrise, détail de chaque essai, export CSV), élèves et codes (cartes à imprimer),
   exercices ouverts ou fermés, aperçu élève, réglages (collègues, classes).
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, CFG = window.FR_CONFIG || {};
  const T = (s) => U.esc(U.typo(s));
  const app = U.$("#app"), qui = U.$("#qui");
  U.$("#signature").textContent = CFG.signature || "";
  if (!CFG.supabaseUrl || !CFG.supabaseCle || !window.supabase) {
    app.innerHTML = `<p class="alerte">L'espace prof a besoin de la base de données (config.js).</p>`; return;
  }
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseCle, { db: { schema: CFG.schema || "fr" } });
  const SITE = (CFG.siteUrl || location.origin).replace(/^https?:\/\//, "").replace(/\/$/, "");
  const E = { classes: [], classe: null, onglet: "resultats", eleves: [], resultats: [], ouvertures: {}, mode: "meilleure", nouveaux: [] };

  // ------------------------------------------------------------------ outils
  let minuterieToast = null;
  function toast(msg, ms) {
    let t = U.$(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(minuterieToast); minuterieToast = setTimeout(() => { t.hidden = true; }, ms || 3200);
  }
  const date = (iso, heure) => { try { return new Date(iso).toLocaleString("fr-FR", heure ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" }); } catch (e) { return ""; } };
  const n20 = (r) => U.sur20(Number(r.score), Number(r.score_max));
  const duree = (s) => (s == null ? "" : s < 60 ? `${s} s` : `${Math.round(s / 60)} min`);
  const ERREURS = {
    PRENOM_EN_DOUBLE: "ce prénom existe déjà dans la classe (ajoutez l'initiale du nom : « Teva B. »)", CODE_INVALIDE: "code invalide",
    RESERVE_PROF: "réservé aux profs", COMPTE_INCONNU: "aucun compte avec cette adresse : créez-le d'abord dans Supabase (Authentication › Users › « Add user »)",
  };
  const msgErreur = (e) => { const m = (e && (e.message || e.error_description || e.code)) || String(e); const k = Object.keys(ERREURS).find((x) => m.includes(x)); return k ? ERREURS[k] : m; };
  // lecture complète (la base renvoie au plus 1 000 lignes à la fois)
  async function toutLire(fabrique) {
    const tout = [];
    for (let de = 0; ; de += 1000) {
      const { data, error } = await fabrique().range(de, de + 999);
      if (error) throw error;
      tout.push(...data);
      if (data.length < 1000) return tout;
    }
  }
  function codeAuHasard() {
    const a = new Uint32Array(1);
    for (;;) {
      crypto.getRandomValues(a);
      const c = String(a[0] % 10000).padStart(4, "0");
      if (!/^(\d)\1{3}$/.test(c) && !"0123456789".includes(c) && !"9876543210".includes(c) && !/^(19|20)\d\d$/.test(c)) return c;
    }
  }
  // double clic de sécurité pour les actions qui effacent (pas de fenêtre du navigateur)
  function confirmer(bouton, libelle, action) {
    if (bouton.dataset.armé) { delete bouton.dataset.armé; action(); return; }
    const avant = bouton.textContent; bouton.dataset.armé = "1"; bouton.textContent = libelle; bouton.classList.add("danger");
    setTimeout(() => { if (bouton.dataset.armé) { delete bouton.dataset.armé; bouton.textContent = avant; bouton.classList.remove("danger"); } }, 4000);
  }

  // ------------------------------------------------------------------ connexion
  function ecranConnexion(message) {
    qui.innerHTML = "";
    app.innerHTML = `<div class="connexion carte pile"><h1>Espace prof</h1>
      ${message ? `<p class="alerte">${message}</p>` : ""}
      <form id="f"><label class="champ"><span>Adresse e-mail</span><input name="email" type="email" autocomplete="username" required></label>
        <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" autocomplete="current-password" required></label>
        <p class="alerte ko" id="err" hidden></p><button class="btn principal plein" type="submit">Se connecter</button></form>
      <details><summary>Mot de passe oublié</summary><form id="fo" class="pile"><label class="champ"><span>Adresse e-mail</span><input name="email" type="email" required></label>
        <button class="btn" type="submit">Recevoir un lien</button><p class="discret" id="mo" hidden></p></form></details>
      <details><summary>Première fois ?</summary><p class="discret">Les comptes prof sont créés par l'administrateur du site
        (Supabase › Authentication › Users › « Add user »), puis activés par un collègue déjà inscrit dans Réglages › « Ajouter une collègue ».</p></details></div>`;
    U.$("#f").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const f = ev.target, err = U.$("#err"), b = U.$("button", f);
      b.disabled = true; err.hidden = true;
      const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.mdp.value });
      b.disabled = false;
      if (error) { err.textContent = /invalid/i.test(error.message) ? "Adresse ou mot de passe incorrect." : /confirm/i.test(error.message) ? "Adresse pas encore confirmée : cliquez sur le lien reçu par e-mail." : "Connexion impossible : " + error.message; err.hidden = false; return; }
      demarrer();
    });
    U.$("#fo").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const { error } = await sb.auth.resetPasswordForEmail(ev.target.email.value.trim(), { redirectTo: location.origin + location.pathname });
      const m = U.$("#mo"); m.hidden = false; m.textContent = error ? "Échec : " + error.message : "Si un compte existe, un lien a été envoyé. Ouvrez-le sur cet appareil.";
    });
  }
  function ecranNouveauMdp() {
    app.innerHTML = `<div class="connexion carte pile"><h1>Nouveau mot de passe</h1><form id="fn"><label class="champ"><span>Nouveau mot de passe (10 caractères au moins)</span>
      <input name="mdp" type="password" autocomplete="new-password" minlength="10" required></label><button class="btn principal plein" type="submit">Enregistrer</button></form></div>`;
    U.$("#fn").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const { error } = await sb.auth.updateUser({ password: ev.target.mdp.value });
      if (error) { toast("Échec : " + error.message); return; }
      toast("Mot de passe changé."); demarrer();
    });
  }
  sb.auth.onAuthStateChange((evt) => { if (evt === "PASSWORD_RECOVERY") setTimeout(ecranNouveauMdp, 0); });

  async function demarrer() {
    const { data: s } = await sb.auth.getSession();
    if (!s || !s.session) { ecranConnexion(); return; }
    app.innerHTML = `<div class="chargement">Chargement…</div>`;
    const { data: estProf, error } = await sb.rpc("is_prof");
    qui.innerHTML = `<span class="nom">${U.esc(s.session.user.email || "")}</span><button class="btn petit ligne" type="button" id="deco">Se déconnecter</button>`;
    U.$("#deco").onclick = async () => { await sb.auth.signOut(); ecranConnexion(); };
    if (error) { app.innerHTML = `<p class="alerte ko">La base ne répond pas (${U.esc(error.message)}). Le schéma « fr » est-il installé et exposé ?</p>`; return; }
    if (!estProf) {
      app.innerHTML = `<div class="carte pile"><h1>Accès en attente</h1><p>Ce compte n'est pas encore inscrit comme prof du site de français.</p>
        <p>Un collègue déjà inscrit peut l'ajouter : Espace prof › Réglages › « Ajouter une collègue », avec l'adresse <b>${U.esc(s.session.user.email || "")}</b>.</p></div>`;
      return;
    }
    const { data: cl, error: e2 } = await sb.from("classes").select("id, nom, niveau, ordre, active").order("ordre").order("nom");
    if (e2) { app.innerHTML = `<p class="alerte ko">${U.esc(e2.message)}</p>`; return; }
    E.classes = cl || [];
    const garde = U.lsGet("fr_prof_classe", null);
    E.classe = E.classes.find((c) => c.id === garde && c.active) || E.classes.find((c) => c.active) || null;
    E.onglet = U.lsGet("fr_prof_onglet", "resultats");
    dessinerCadre();
    await chargerClasse();
  }

  // ------------------------------------------------------------------ cadre : classes et onglets
  const ONGLETS = [["resultats", "Résultats"], ["eleves", "Élèves et codes"], ["exercices", "Exercices ouverts"], ["apercu", "Aperçu élève"], ["reglages", "Réglages"]];
  function dessinerCadre() {
    app.innerHTML = `<div class="rangee no-print" id="choix-classe" role="tablist" aria-label="Classes">${E.classes.filter((c) => c.active).map((c) =>
      `<button type="button" class="btn petit ${E.classe && c.id === E.classe.id ? "principal" : "ligne"}" data-classe="${U.esc(c.id)}"><span class="puce n${String(c.niveau)[0]}">${U.esc(c.niveau)}</span> ${U.esc(c.nom)}</button>`).join("")}</div>
      <nav class="onglets no-print">${ONGLETS.map(([k, l]) => `<button type="button" data-onglet="${k}" class="${E.onglet === k ? "actif" : ""}">${l}</button>`).join("")}</nav>
      <div id="contenu"></div>`;
    U.$$("[data-classe]").forEach((b) => b.addEventListener("click", async () => {
      E.classe = E.classes.find((c) => c.id === b.dataset.classe); U.lsSet("fr_prof_classe", E.classe.id); E.nouveaux = [];
      dessinerCadre(); await chargerClasse();
    }));
    U.$$("[data-onglet]").forEach((b) => b.addEventListener("click", () => {
      E.onglet = b.dataset.onglet; U.lsSet("fr_prof_onglet", E.onglet);
      U.$$("[data-onglet]").forEach((x) => x.classList.toggle("actif", x === b));
      dessinerOnglet();
    }));
  }
  async function chargerClasse() {
    const c = E.classe, zone = U.$("#contenu");
    if (!c) { zone.innerHTML = `<p class="alerte">Aucune classe active : ajoutez-en une dans Réglages.</p>`; if (E.onglet === "reglages") dessinerOnglet(); return; }
    zone.innerHTML = `<div class="chargement">Chargement de la classe…</div>`;
    try {
      const [el, res, ouv] = await Promise.all([
        toutLire(() => sb.from("eleves").select("id, prenom, actif, cree_le").eq("classe", c.id).order("prenom")),
        toutLire(() => sb.from("resultats").select("id, eleve_id, notion, titre, type, score, score_max, duree_s, fait_le").eq("classe", c.id).order("fait_le", { ascending: false })),
        toutLire(() => sb.from("ouvertures").select("notion, ouverte").eq("classe", c.id)),
      ]);
      E.eleves = el; E.resultats = res; E.ouvertures = {}; ouv.forEach((o) => { E.ouvertures[o.notion] = o.ouverte; });
    } catch (e) { zone.innerHTML = `<p class="alerte ko">Lecture impossible : ${U.esc(msgErreur(e))}</p>`; return; }
    dessinerOnglet();
  }
  function dessinerOnglet() {
    ({ resultats: ongletResultats, eleves: ongletEleves, exercices: ongletExercices, apercu: ongletApercu, reglages: ongletReglages }[E.onglet] || ongletResultats)();
  }

  // ------------------------------------------------------------------ résultats
  function tableau() {
    const notions = FR.notionsPour(E.classe.niveau), par = {};
    for (const r of E.resultats) { const k = r.eleve_id + "|" + r.notion; (par[k] = par[k] || []).push(r); }
    const valeur = (l) => !l || !l.length ? null : E.mode === "derniere" ? n20(l[0]) : E.mode === "moyenne" ? l.reduce((a, r) => a + n20(r), 0) / l.length : Math.max(...l.map(n20));
    return { notions, par, valeur };
  }
  function ongletResultats() {
    const zone = U.$("#contenu"), { notions, par, valeur } = tableau();
    const nbRes = E.resultats.length;
    zone.innerHTML = `<div class="rangee no-print" style="justify-content:space-between">
        <h2 style="margin:0">${U.esc(E.classe.nom)} : ${E.eleves.length} élève${E.eleves.length > 1 ? "s" : ""}, ${nbRes} exercice${nbRes > 1 ? "s" : ""} faits</h2>
        <span class="rangee"><label class="discret">Note affichée <select id="mode" class="btn petit ligne">
          <option value="meilleure">la meilleure</option><option value="derniere">la dernière</option><option value="moyenne">la moyenne des essais</option></select></label>
          <button type="button" class="btn petit ligne" id="csv">Exporter (CSV)</button><button type="button" class="btn petit ligne" id="actu">Actualiser</button></span></div>
      <p class="discret">Couleurs : <span class="cellule r">0–7</span> <span class="cellule j">8–11</span> <span class="cellule vc">12–16</span> <span class="cellule vf">17–20</span> · touchez une note pour voir le détail.</p>
      ${E.eleves.length ? `<div class="tableau-scroll grille-classe"><table class="grille"><thead><tr><th>Élève</th>${notions.map((n) => `<th class="c" title="${T(FR.titreNotion(n, E.classe.niveau))}"><span class="th-notion"><span class="ico">${(FR.DOMAINES.find((d) => d.id === n.domaine) || {}).ico || ""}</span>${T(FR.titreNotion(n, E.classe.niveau))}</span></th>`).join("")}<th class="c">Moyenne</th></tr></thead><tbody>
        ${E.eleves.map((e) => {
          const vals = notions.map((n) => valeur(par[e.id + "|" + n.id]));
          const faits = vals.filter((v) => v != null), moy = faits.length ? faits.reduce((a, b) => a + b, 0) / faits.length : null;
          return `<tr class="${e.actif ? "" : "inactif"}"><td><b>${U.esc(e.prenom)}</b></td>${vals.map((v, i) => v == null ? `<td class="c"><span class="cellule vide">–</span></td>`
            : `<td class="c"><button type="button" class="cellule ${U.maitrise(v).k}" data-e="${e.id}" data-n="${notions[i].id}" title="${(par[e.id + "|" + notions[i].id] || []).length} essai(s)">${U.nf(v)}</button></td>`).join("")}
            <td class="c">${moy == null ? "–" : `<span class="cellule ${U.maitrise(moy).k}">${U.nf(moy)}</span>`}</td></tr>`;
        }).join("")}</tbody></table></div>` : `<p class="alerte">Pas encore d'élève dans cette classe : onglet « Élèves et codes ».</p>`}
      <div id="detail"></div>
      <h2>Derniers exercices</h2><div class="tableau-scroll"><table class="grille"><thead><tr><th>Quand</th><th>Élève</th><th>Exercice</th><th class="c">Note</th><th>Durée</th></tr></thead><tbody>
        ${E.resultats.slice(0, 40).map((r) => { const e = E.eleves.find((x) => x.id === r.eleve_id); const v = n20(r);
          return `<tr><td>${date(r.fait_le, true)}</td><td>${U.esc(e ? e.prenom : "?")}</td><td>${T(r.titre || r.notion)}</td><td class="c"><button type="button" class="cellule ${U.maitrise(v).k}" data-r="${r.id}">${U.nf(v)}</button></td><td>${duree(r.duree_s)}</td></tr>`; }).join("") || `<tr><td colspan="5" class="discret">Rien pour l'instant.</td></tr>`}
      </tbody></table></div>`;
    U.$("#mode").value = E.mode;
    U.$("#mode").addEventListener("change", (ev) => { E.mode = ev.target.value; ongletResultats(); });
    U.$("#actu").addEventListener("click", chargerClasse);
    U.$("#csv").addEventListener("click", exporterCsv);
    U.$$("[data-e]", zone).forEach((b) => b.addEventListener("click", () => detailCellule(b.dataset.e, b.dataset.n)));
    U.$$("[data-r]", zone).forEach((b) => b.addEventListener("click", () => {
      const r = E.resultats.find((x) => String(x.id) === b.dataset.r); if (r) detailCellule(r.eleve_id, r.notion, r.id);
    }));
  }

  function detailCellule(eleveId, notionId, ouvrir) {
    const e = E.eleves.find((x) => x.id === eleveId), n = FR.trouverNotion(notionId);
    const l = E.resultats.filter((r) => r.eleve_id === eleveId && r.notion === notionId);
    const zone = U.$("#detail");
    zone.innerHTML = `<div class="carte pile detail-essais"><div class="rangee" style="justify-content:space-between"><h2 style="margin:0">${U.esc(e ? e.prenom : "?")} · ${T(n ? FR.titreNotion(n, E.classe.niveau) : (l[0] && l[0].titre) || notionId)}</h2>
      <button type="button" class="btn petit ligne" data-fermer>Fermer</button></div>
      <table class="grille"><thead><tr><th>Quand</th><th class="c">Note</th><th>Durée</th><th></th></tr></thead><tbody>
      ${l.map((r) => `<tr><td>${date(r.fait_le, true)}</td><td class="c"><span class="cellule ${U.maitrise(n20(r)).k}">${U.nf(n20(r))}</span> <span class="discret">(${U.nf(Number(r.score))} / ${U.nf(Number(r.score_max))})</span></td>
        <td>${duree(r.duree_s)}</td><td><button type="button" class="btn petit ligne" data-voir="${r.id}">Voir</button> <button type="button" class="btn petit ligne" data-suppr="${r.id}">Supprimer</button></td></tr>
        <tr hidden data-place="${r.id}"><td colspan="4"></td></tr>`).join("")}</tbody></table></div>`;
    U.$("[data-fermer]", zone).onclick = () => { zone.innerHTML = ""; };
    U.$$("[data-voir]", zone).forEach((b) => b.addEventListener("click", () => voirDetails(b.dataset.voir)));
    U.$$("[data-suppr]", zone).forEach((b) => b.addEventListener("click", () => confirmer(b, "Confirmer ?", async () => {
      const { error } = await sb.from("resultats").delete().eq("id", b.dataset.suppr);
      if (error) { toast("Échec : " + msgErreur(error)); return; }
      E.resultats = E.resultats.filter((r) => String(r.id) !== b.dataset.suppr);
      toast("Résultat supprimé."); ongletResultats(); detailCellule(eleveId, notionId);
    })));
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
    if (ouvrir) voirDetails(String(ouvrir));
  }
  const PIC = { present: "✓", partiel: "½", absent: "✗" };
  function htmlVerdicts(v) {
    return `<ul class="liste-verdicts">${(v || []).map((x) => `<li class="${x.verdict}"><span class="pic">${PIC[x.verdict] || "?"}</span><div>${T(x.t)} <span class="discret">(${U.nf(Number(x.p) || 0)} pt)</span>${x.raison ? `<small>${T(x.raison)}</small>` : ""}</div></li>`).join("")}</ul>`;
  }
  async function voirDetails(id) {
    const ligne = U.$(`[data-place="${id}"]`); if (!ligne) return;
    if (!ligne.hidden) { ligne.hidden = true; return; }
    ligne.hidden = false; const td = U.$("td", ligne); td.innerHTML = `<div class="chargement">…</div>`;
    const { data, error } = await sb.from("resultats").select("type, details").eq("id", id).single();
    if (error) { td.innerHTML = `<p class="alerte ko">${U.esc(msgErreur(error))}</p>`; return; }
    const d = data.details || {};
    if (data.type === "ecrit") {
      td.innerHTML = `<div class="pile"><p class="discret">${T(d.sujet || "")}</p><div class="texte-eleve">${T(d.r || "")}</div>
        ${htmlVerdicts(d.v)}${d.conseil ? `<p><b>Conseil donné :</b> ${T(d.conseil)}</p>` : ""}
        ${d.langue && d.langue.length ? `<p><b>Erreurs relevées :</b> ${d.langue.map((x) => `<s>${T(x.extrait)}</s> → ${T(x.correction)}`).join(" · ")}</p>` : ""}
        <p class="discret">${d.essais || 1} vérification${(d.essais || 1) > 1 ? "s" : ""} par l'IA.</p></div>`;
      return;
    }
    const q = d.q || [];
    td.innerHTML = q.length ? `<table class="grille"><thead><tr><th>Question</th><th>Réponse de l'élève</th><th>Attendu</th><th class="c">Points</th></tr></thead><tbody>
      ${q.map((x) => `<tr><td>${T(x.c)}${x.s ? `<div class="discret">${T(x.s)}</div>` : ""}</td>
        <td>${x.v ? `<div class="texte-eleve">${T(x.r)}</div>${htmlVerdicts(x.v)}${x.auto ? `<p class="discret">Auto-évaluation (l'IA n'était pas disponible).</p>` : ""}` : T(x.r)}</td>
        <td>${T(x.a)}</td><td class="c">${U.nf(Number(x.p) || 0)} / ${U.nf(Number(x.m) || 2)}</td></tr>`).join("")}</tbody></table>` : `<p class="discret">Pas de détail.</p>`;
  }

  function exporterCsv() {
    const { notions, par, valeur } = tableau();
    const nb = (v) => (v == null ? "" : String(Math.round(v * 10) / 10).replace(".", ","));
    const champ = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const lignes = [["Élève"].concat(notions.map((n) => FR.titreNotion(n, E.classe.niveau)), ["Moyenne"]).map(champ).join(";")];
    for (const e of E.eleves) {
      const vals = notions.map((n) => valeur(par[e.id + "|" + n.id])), faits = vals.filter((v) => v != null);
      lignes.push([champ(e.prenom)].concat(vals.map(nb), [nb(faits.length ? faits.reduce((a, b) => a + b, 0) / faits.length : null)]).join(";"));
    }
    const blob = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `notes-francais-${E.classe.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ------------------------------------------------------------------ élèves et codes
  function cartesHtml(l) {
    return `<div class="cartes-codes">${l.map((x) => `<div class="carte-code"><div class="discret">Français · ${U.esc(E.classe.nom)}</div><b>${U.esc(x.prenom)}</b>
      <div>Code : <span class="pin">${U.esc(x.code)}</span></div><div class="discret">Site : ${U.esc(SITE)}</div></div>`).join("")}</div>`;
  }
  function ongletEleves() {
    const zone = U.$("#contenu"), derniere = {};
    for (const r of E.resultats) if (!derniere[r.eleve_id]) derniere[r.eleve_id] = r.fait_le;
    zone.innerHTML = `${E.nouveaux.length ? `<section class="zone-cartes carte pile"><div class="rangee no-print" style="justify-content:space-between"><h2 style="margin:0">Cartes à distribuer</h2>
        <span class="rangee"><button type="button" class="btn principal petit" id="imprimer">Imprimer les cartes</button><button type="button" class="btn petit ligne" id="vider">Masquer</button></span></div>
        <p class="alerte no-print">Notez ou imprimez ces codes maintenant : pour la sécurité, ils ne sont gardés que sous forme chiffrée et ne pourront plus être affichés (on peut toujours en donner un nouveau).</p>
        ${cartesHtml(E.nouveaux)}</section>` : ""}
      <section class="carte pile no-print"><h2 style="margin-top:0">Ajouter des élèves à la ${U.esc(E.classe.nom)}</h2>
        <label class="champ"><span>Un prénom par ligne</span><textarea id="noms" rows="5" placeholder="Moana&#10;Teva B.&#10;Hina"></textarea></label>
        <p class="discret">Seul le prénom est gardé (ajoutez l'initiale du nom si deux élèves ont le même). Chaque élève reçoit un code à 4 chiffres.</p>
        <button type="button" class="btn principal" id="creer">Créer les comptes et les codes</button><div id="rapport"></div></section>
      <h2 class="no-print">Élèves (${E.eleves.length})</h2>
      <div class="tableau-scroll no-print"><table class="grille"><thead><tr><th>Prénom</th><th>Dernier exercice</th><th>Compte</th><th></th></tr></thead><tbody>
        ${E.eleves.map((e) => `<tr class="${e.actif ? "" : "inactif"}"><td><b>${U.esc(e.prenom)}</b></td><td>${derniere[e.id] ? date(derniere[e.id], true) : `<span class="discret">jamais</span>`}</td>
          <td><label class="interrupteur"><input type="checkbox" data-actif="${e.id}" ${e.actif ? "checked" : ""}> <span>${e.actif ? "actif" : "en pause"}</span></label></td>
          <td class="rangee"><button type="button" class="btn petit ligne" data-code="${e.id}">Nouveau code</button><button type="button" class="btn petit ligne" data-supprimer="${e.id}">Supprimer</button></td></tr>`).join("")
          || `<tr><td colspan="4" class="discret">Aucun élève.</td></tr>`}</tbody></table></div>`;
    const imp = U.$("#imprimer");
    if (imp) imp.addEventListener("click", () => { document.body.classList.add("cartes-seules"); window.print(); setTimeout(() => document.body.classList.remove("cartes-seules"), 500); });
    const vid = U.$("#vider"); if (vid) vid.addEventListener("click", () => { E.nouveaux = []; ongletEleves(); });
    U.$("#creer").addEventListener("click", creerEleves);
    U.$$("[data-actif]", zone).forEach((c) => c.addEventListener("change", async () => {
      const { error } = await sb.from("eleves").update({ actif: c.checked }).eq("id", c.dataset.actif);
      if (error) { toast("Échec : " + msgErreur(error)); c.checked = !c.checked; return; }
      const e = E.eleves.find((x) => x.id === c.dataset.actif); e.actif = c.checked;
      toast(c.checked ? "Compte réactivé." : "Compte mis en pause : l'élève ne peut plus se connecter."); ongletEleves();
    }));
    U.$$("[data-code]", zone).forEach((b) => b.addEventListener("click", async () => {
      const e = E.eleves.find((x) => x.id === b.dataset.code), code = codeAuHasard();
      const { error } = await sb.rpc("changer_pin", { p_eleve: e.id, p_pin: code });
      if (error) { toast("Échec : " + msgErreur(error)); return; }
      E.nouveaux.unshift({ prenom: e.prenom, code }); toast(`Nouveau code pour ${e.prenom}.`); ongletEleves(); window.scrollTo(0, 0);
    }));
    U.$$("[data-supprimer]", zone).forEach((b) => b.addEventListener("click", () => confirmer(b, "Confirmer (notes effacées) ?", async () => {
      const { error } = await sb.from("eleves").delete().eq("id", b.dataset.supprimer);
      if (error) { toast("Échec : " + msgErreur(error)); return; }
      E.eleves = E.eleves.filter((x) => x.id !== b.dataset.supprimer); E.resultats = E.resultats.filter((r) => r.eleve_id !== b.dataset.supprimer);
      toast("Élève supprimé, avec ses notes."); ongletEleves();
    })));
  }
  async function creerEleves() {
    const noms = U.uniq(U.$("#noms").value.split(/\r?\n/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean));
    if (!noms.length) { toast("Écrivez au moins un prénom."); return; }
    if (noms.some((p) => p.length > 40)) { toast("Un prénom fait plus de 40 caractères."); return; }
    const b = U.$("#creer"); b.disabled = true;
    const ok = [], ko = [];
    for (const prenom of noms) {
      const code = codeAuHasard();
      const { error } = await sb.rpc("creer_eleve", { p_classe: E.classe.id, p_prenom: prenom, p_pin: code });
      if (error) ko.push(`${prenom} : ${msgErreur(error)}`); else ok.push({ prenom, code });
    }
    b.disabled = false;
    E.nouveaux = ok.concat(E.nouveaux);
    await chargerClasse();
    if (ko.length) U.$("#rapport") && (U.$("#rapport").innerHTML = `<p class="alerte ko">Pas créé : ${ko.map(U.esc).join(" ; ")}</p>`);
    toast(`${ok.length} compte${ok.length > 1 ? "s" : ""} créé${ok.length > 1 ? "s" : ""}.`);
  }

  // ------------------------------------------------------------------ exercices ouverts / fermés
  function ongletExercices() {
    const zone = U.$("#contenu"), niv = E.classe.niveau, notions = FR.notionsPour(niv);
    zone.innerHTML = `<p>Les élèves de la ${U.esc(E.classe.nom)} ne voient que les exercices ouverts. Le réglage est immédiat.</p>
      <div class="rangee"><button type="button" class="btn petit ligne" data-tout="1">Tout ouvrir</button><button type="button" class="btn petit ligne" data-tout="0">Tout fermer</button></div>
      ${FR.DOMAINES.map((d) => { const l = notions.filter((n) => n.domaine === d.id); return l.length ? `<h3>${T(d.titre)}</h3><div class="liste-ouvertures">${l.map((n) =>
        `<label class="interrupteur ligne-ouverture"><input type="checkbox" data-notion="${n.id}" ${FR.estOuverte(n, E.ouvertures) ? "checked" : ""}> <span><b>${T(FR.titreNotion(n, niv))}</b> <span class="discret">— ${T(FR.resumeNotion(n, niv))}</span></span></label>`).join("")}</div>` : ""; }).join("")}`;
    const regler = async (id, ouverte) => {
      const { error } = await sb.rpc("ouvrir", { p_classe: E.classe.id, p_notion: id, p_ouverte: ouverte });
      if (error) throw error;
      E.ouvertures[id] = ouverte;
    };
    U.$$("[data-notion]", zone).forEach((c) => c.addEventListener("change", async () => {
      try { await regler(c.dataset.notion, c.checked); toast(c.checked ? "Exercice ouvert." : "Exercice fermé."); }
      catch (e) { c.checked = !c.checked; toast("Échec : " + msgErreur(e)); }
    }));
    U.$$("[data-tout]", zone).forEach((b) => b.addEventListener("click", async () => {
      const v = b.dataset.tout === "1"; b.disabled = true;
      try { for (const n of notions) if (FR.estOuverte(n, E.ouvertures) !== v) await regler(n.id, v); toast(v ? "Tout est ouvert." : "Tout est fermé."); }
      catch (e) { toast("Échec : " + msgErreur(e)); }
      ongletExercices();
    }));
  }

  // ------------------------------------------------------------------ aperçu
  function ongletApercu() {
    const zone = U.$("#contenu");
    zone.innerHTML = `<p>Voir le site comme un élève (rien n'est enregistré). Les écrits peuvent être vérifiés par l'IA, au nom de l'espace prof.</p>
      <div class="rangee">${FR.NIVEAUX.map((n) => `<button type="button" class="btn ${E.classe && E.classe.niveau === n ? "principal" : "ligne"}" data-niveau="${n}"><span class="puce n${n[0]}">${n}</span> Aperçu ${n}</button>`).join("")}</div>`;
    U.$$("[data-niveau]", zone).forEach((b) => b.addEventListener("click", () => {
      const cl = E.classes.find((c) => c.niveau === b.dataset.niveau && c.active);
      FR.api.apercu(b.dataset.niveau, cl ? cl.id : null);
      location.href = "index.html#/accueil";
    }));
  }

  // ------------------------------------------------------------------ réglages
  function ongletReglages() {
    const zone = U.$("#contenu");
    zone.innerHTML = `<section class="carte pile"><h2 style="margin-top:0">Ajouter une collègue</h2>
        <p class="discret">Son compte est d'abord créé dans Supabase (Authentication › Users › « Add user », en cochant « Auto Confirm User »), puis vous l'ajoutez ici avec son adresse.</p>
        <form id="fp" class="rangee"><input class="champ-court" name="email" type="email" placeholder="adresse e-mail" required><button class="btn" type="submit">Ajouter</button></form></section>
      <section class="carte pile"><h2 style="margin-top:0">Classes</h2>
        <div class="tableau-scroll"><table class="grille"><thead><tr><th>Classe</th><th>Niveau</th><th>Visible</th></tr></thead><tbody>
        ${E.classes.map((c) => `<tr><td>${U.esc(c.nom)} <span class="discret">(${U.esc(c.id)})</span></td><td>${U.esc(c.niveau)}</td>
          <td><label class="interrupteur"><input type="checkbox" data-cl="${U.esc(c.id)}" ${c.active ? "checked" : ""}></label></td></tr>`).join("")}</tbody></table></div>
        <form id="fcl" class="rangee"><input class="champ-court" name="nom" placeholder="Nom, ex. 5e 2" required maxlength="30">
          <select name="niveau" class="btn ligne">${FR.NIVEAUX.map((n) => `<option>${n}</option>`).join("")}</select><button class="btn" type="submit">Ajouter la classe</button></form></section>`;
    U.$("#fp").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const { error } = await sb.rpc("ajouter_prof", { p_email: ev.target.email.value.trim() });
      toast(error ? "Échec : " + msgErreur(error) : "Collègue ajoutée : elle peut se connecter.", 5000);
      if (!error) ev.target.reset();
    });
    U.$$("[data-cl]", zone).forEach((c) => c.addEventListener("change", async () => {
      const { error } = await sb.from("classes").update({ active: c.checked }).eq("id", c.dataset.cl);
      if (error) { c.checked = !c.checked; toast("Échec : " + msgErreur(error)); return; }
      E.classes.find((x) => x.id === c.dataset.cl).active = c.checked; dessinerCadre(); dessinerOnglet();
    }));
    U.$("#fcl").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const nom = ev.target.nom.value.trim().replace(/\s+/g, " "), niveau = ev.target.niveau.value;
      const id = U.sansAccents(nom).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
      if (!id) return;
      const { error } = await sb.from("classes").insert({ id, nom, niveau, ordre: E.classes.length + 1, active: true });
      if (error) { toast("Échec : " + msgErreur(error)); return; }
      E.classes.push({ id, nom, niveau, ordre: E.classes.length + 1, active: true }); toast("Classe ajoutée."); dessinerCadre(); dessinerOnglet();
    });
  }

  demarrer();
})();
