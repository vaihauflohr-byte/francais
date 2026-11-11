/* =====================================================================
   Français au collège — application élève
   Écrans (adresse après #) : / (classes) · /classe/<id> (connexion) · /accueil · /fiche/<notion> · /serie/<notion>
   · /lecture/<notion> · /ecrit/<notion> · /resultats
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, CFG = window.FR_CONFIG || {};
  const app = U.$("#app"), qui = U.$("#qui"), bandeau = U.$("#bandeau");
  const T = (s) => U.esc(U.typo(s));
  const brut = (h) => String(h == null ? "" : h).replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const NUM = { "6e": 6, "5e": 5, "4e": 4, "3e": 3 };
  const ICO_TYPE = { serie: "S'entraîner", lecture: "Lire le texte", ecrit: "Écrire" };
  let etatCourant = null;

  // ------------------------------------------------------------------ petits outils d'affichage
  let minuterieToast = null;
  function toast(msg, ms) {
    let t = U.$(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(minuterieToast); minuterieToast = setTimeout(() => { t.hidden = true; }, ms || 3500);
  }
  const date = (iso) => { try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); } catch (e) { return ""; } };
  const note20 = (r) => U.sur20(Number(r.score), Number(r.score_max));
  function pastille(n20) { const m = U.maitrise(n20); return `<span class="m ${m.k}" title="${m.t}">${n20 == null ? m.t : U.nf(n20) + " / 20"}</span>`; }
  const motsDe = (s) => (String(s).match(/[A-Za-zÀ-ÖØ-öø-ÿœŒ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿœŒ0-9]+)*/g) || []).length;
  const session = () => FR.session.get();
  const niveau = () => (session() || {}).niveau;
  const cleBrouillon = (id) => { const s = session() || {}; return `fr_brouillon_${s.classe}_${U.sansAccents(String(s.prenom || "")).toLowerCase()}_${id}`; };

  // historique : celui du serveur + ce qui attend le réseau sur cet appareil
  function historique(d) {
    const s = session() || {}, h = ((d && d.historique) || []).slice();
    const cle = (x) => U.sansAccents(String(x || "")).toLowerCase().trim();
    for (const x of U.lsGet("fr_file", [])) if (x.s.classe === s.classe && cle(x.s.prenom) === cle(s.prenom)) h.unshift(Object.assign({ attente: true }, x.r));
    return h;
  }
  const ouvertures = () => (etatCourant && etatCourant.ouvertures) || (FR.api.etatEnCache() || {}).ouvertures || {};
  const notionOuverte = (n) => (session() || {}).apercu || FR.estOuverte(n, ouvertures());

  function majEntete() {
    const s = session();
    if (!s) { qui.innerHTML = ""; return; }
    qui.innerHTML = s.apercu
      ? `<span class="puce n${s.niveau[0]}">${s.niveau}</span><span class="nom">Aperçu prof</span><button class="btn petit ligne" type="button" data-fin-apercu>Fin de l'aperçu</button>`
      : `<span class="nom">${U.esc(s.prenom)}</span><span class="puce n${s.niveau[0]}">${U.esc(s.classe_nom || s.niveau)}</span>
         <a class="btn petit ligne" href="#/resultats">Mes notes</a><button class="btn petit ligne" type="button" data-quitter>Quitter</button>`;
    const q = U.$("[data-quitter]", qui), f = U.$("[data-fin-apercu]", qui);
    if (q) q.onclick = async () => {
      if (FR.api.enAttente() && !window.confirm("Des notes attendent encore le réseau sur cet appareil. Elles partiront à ta prochaine connexion. Quitter quand même ?")) return;
      await FR.api.deconnexion(); location.hash = "#/";
    };
    if (f) f.onclick = () => { FR.session.clear(); location.href = "prof.html"; };
  }
  function majBandeau() {
    const s = session(), n = FR.api.enAttente();
    let m = "";
    if (s && s.apercu) m = "Aperçu de la professeure : rien n'est enregistré.";
    else if (!FR.api.configure) m = "Mode démonstration : les notes restent sur cet appareil.";
    else if (!navigator.onLine) m = "Pas de réseau : tu peux continuer, tes notes partiront dès que le réseau reviendra." + (n ? ` (${n} en attente)` : "");
    else if (n) m = `${n} note${n > 1 ? "s" : ""} en attente d'envoi…`;
    bandeau.textContent = m; bandeau.hidden = !m;
  }
  window.addEventListener("online", () => { setTimeout(majBandeau, 1500); });
  window.addEventListener("offline", majBandeau);

  function messageEnvoi(statut) {
    return { envoye: "Note enregistrée : ta professeure la voit.", attente: "Pas de réseau : ta note est gardée sur cet appareil et partira toute seule.",
      session: "Ta connexion a expiré : reconnecte-toi pour envoyer ta note (elle est gardée sur cet appareil).", apercu: "Aperçu : rien n'est enregistré.",
      demo: "Mode démonstration : ta note reste sur cet appareil." }[statut] || "";
  }
  async function enregistrer(r) {
    let st;
    try { st = await FR.api.enregistrer(r); } catch (e) { st = "attente"; }
    if (st === "envoye" && FR.api.estDemo(session())) st = "demo";
    majBandeau();
    return st;
  }

  // ------------------------------------------------------------------ routes
  const ROUTES = { "": vueClasses, classe: vueConnexion, accueil: vueAccueil, fiche: vueFiche, serie: vueSerie, lecture: vueLecture, ecrit: vueEcrit, resultats: vueResultats };
  function route() {
    const [nom, arg] = location.hash.replace(/^#\/?/, "").split("/");
    const s = session();
    if (!s && nom !== "" && nom !== "classe") { location.replace("#/"); return; }
    if (s && (nom === "" || nom === "classe")) { location.replace("#/accueil"); return; }
    majEntete(); majBandeau();
    window.scrollTo(0, 0);
    (ROUTES[nom] || vueClasses)(decodeURIComponent(arg || ""));
  }
  window.addEventListener("hashchange", route);

  function notionDuNiveau(id, type) {
    const n = FR.trouverNotion(id), niv = niveau();
    if (!n || !n.niveaux.includes(niv) || (type && n.type !== type)) { location.replace("#/accueil"); return null; }
    if (!notionOuverte(n)) {
      app.innerHTML = `<div class="carte pile"><h1>${T(FR.titreNotion(n, niv))}</h1><p>Ta professeure n'a pas encore ouvert cet exercice.</p><a class="btn" href="#/accueil">Retour</a></div>`;
      return null;
    }
    return n;
  }

  // ------------------------------------------------------------------ connexion
  async function vueClasses() {
    app.innerHTML = `<div class="accueil-titre"><h1>Bienvenue !</h1><p class="discret">Choisis ta classe pour te connecter.</p></div>
      <div class="classes" id="classes"><div class="chargement">Chargement…</div></div>`;
    const l = await FR.api.classes();
    const zone = U.$("#classes"); if (!zone) return;
    zone.innerHTML = l.length ? l.map((c) => `<a class="classe-btn" href="#/classe/${encodeURIComponent(c.id)}"><span class="puce n${String(c.niveau)[0]}">${U.esc(c.niveau)}</span><b>${U.esc(c.nom)}</b></a>`).join("")
      : `<p class="alerte">Impossible de charger les classes. Vérifie le réseau puis recharge la page.</p>`;
  }

  async function vueConnexion(id) {
    const l = await FR.api.classes(), c = l.find((x) => x.id === id);
    if (!c) { location.replace("#/"); return; }
    app.innerHTML = `<div class="connexion carte pile">
      <a class="lien" href="#/">← Changer de classe</a>
      <h1>${U.esc(c.nom)}</h1>
      <form id="f" autocomplete="off" novalidate>
        <label class="champ"><span>Ton prénom</span><input name="prenom" required maxlength="40" autocapitalize="words" autocorrect="off" spellcheck="false"></label>
        <label class="champ"><span>Ton code</span><input name="pin" class="code-pin" required inputmode="numeric" pattern="[0-9]*" maxlength="8" type="password" autocomplete="off"></label>
        <p class="alerte ko" id="err" hidden></p>
        <button class="btn principal plein" type="submit">Entrer</button>
      </form>
      <p class="discret">Ton prénom et ton code sont sur la carte donnée par ta professeure. Code perdu ? Demande-lui une nouvelle carte.</p></div>`;
    const f = U.$("#f"), err = U.$("#err");
    setTimeout(() => { try { f.prenom.focus(); } catch (e) { /* iPad */ } }, 50);
    f.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const prenom = f.prenom.value.trim(), pin = f.pin.value.trim();
      err.hidden = true;
      if (!prenom || !/^[0-9]{4,8}$/.test(pin)) { err.textContent = "Écris ton prénom et ton code (des chiffres)."; err.hidden = false; return; }
      const b = U.$("button", f); b.disabled = true; b.textContent = "Connexion…";
      try {
        const r = await FR.api.connexion(id, prenom, pin);
        if (r && r.ok) { location.hash = "#/accueil"; return; }
        err.textContent = { IDENTIFIANTS: "Prénom ou code incorrect. Écris ton prénom comme sur ta carte.", BLOQUE: "Trop d'essais : attends 10 minutes, ou demande une nouvelle carte à ta professeure.",
          CLASSE: "Cette classe n'est plus ouverte." }[r && r.erreur] || "Connexion impossible. Réessaie.";
      } catch (e) {
        err.textContent = e.code === "RESEAU" ? "Pas de réseau : la connexion demande internet. Réessaie dans un moment." : "Le site ne répond pas. Réessaie dans un moment.";
      }
      err.hidden = false; b.disabled = false; b.textContent = "Entrer";
    });
  }

  function sessionExpiree() {
    FR.session.clear();
    app.innerHTML = `<div class="carte pile"><h1>Reconnecte-toi</h1><p>Ta connexion a expiré. Tes notes en attente sont gardées sur cet appareil : elles partiront quand tu te reconnecteras.</p>
      <a class="btn principal" href="#/">Me reconnecter</a></div>`;
    majEntete();
  }

  // ------------------------------------------------------------------ tableau de bord
  async function vueAccueil() {
    let d = FR.api.etatEnCache();
    if (d) dessinerAccueil(d); else app.innerHTML = `<div class="chargement">Chargement…</div>`;
    try { d = await FR.api.etat(); }
    catch (e) {
      if (e.code === "SESSION_EXPIREE") { sessionExpiree(); return; }
      if (!d) { const s = session(); d = { eleve: { prenom: s.prenom, classe: s.classe, classe_nom: s.classe_nom, niveau: s.niveau, actif: true }, ouvertures: {}, historique: [] }; }
    }
    if (location.hash.replace(/^#\/?/, "").split("/")[0] === "accueil") dessinerAccueil(d);
  }

  function dessinerAccueil(d) {
    etatCourant = d;
    const s = session(), niv = s.niveau, h = historique(d);
    const parNotion = {};
    for (const r of h) (parNotion[r.notion] = parNotion[r.notion] || []).push(r);
    const notions = FR.notionsPour(niv);
    const blocs = FR.DOMAINES.map((dom) => {
      const l = notions.filter((n) => n.domaine === dom.id);
      if (!l.length) return "";
      const cartes = l.sort((a, b) => notionOuverte(b) - notionOuverte(a)).map((n) => {
        const essais = parNotion[n.id] || [], ouverte = notionOuverte(n);
        const meilleure = essais.length ? Math.max(...essais.map(note20)) : null;
        const lien = n.type === "lecture" ? "lecture" : n.type === "ecrit" ? "ecrit" : "serie";
        return `<article class="notion${ouverte ? "" : " fermee"}">
          <h3>${T(FR.titreNotion(n, niv))}</h3><p>${T(FR.resumeNotion(n, niv))}</p>
          <div class="bas">${ouverte ? pastille(meilleure) + (essais.length ? `<span class="discret">${essais.length} essai${essais.length > 1 ? "s" : ""}</span>` : "") : `<span class="discret">Pas encore ouvert</span>`}
            ${ouverte ? `<span class="rangee">${n.type === "serie" && n.fiche ? `<a class="btn petit ligne" href="#/fiche/${n.id}">Leçon</a>` : ""}<a class="btn petit principal" href="#/${lien}/${n.id}">${ICO_TYPE[n.type] || "Commencer"}</a></span>` : ""}</div>
        </article>`;
      }).join("");
      return `<section class="domaine"><h2><span class="ico" aria-hidden="true">${dom.ico}</span>${T(dom.titre)}</h2><div class="notions">${cartes}</div></section>`;
    }).join("");
    const inactif = d.eleve && d.eleve.actif === false;
    app.innerHTML = `<div class="bonjour"><h1>${s.apercu ? "Aperçu " + niv : "Ia ora na " + U.esc(s.prenom) + " !"}</h1></div>
      ${inactif ? `<p class="alerte ko">Ton compte est en pause : demande à ta professeure.</p>` : ""}
      ${phraseDuJour(niv)}
      ${blocs}`;
    activerPhraseDuJour();
  }

  // ------------------------------------------------------------------ phrase du jour : toucher un mot pour voir sa classe et sa fonction
  let phraseJour = null;
  function phraseDuJour(niv) {
    const l = ((FR.B && FR.B.phrases) || []).filter((x) => x[0] >= NUM[niv]);
    if (!l.length) return "";
    const jour = Math.floor((Date.now() - 10 * 3600 * 1000) / 86400000);     // jour de Tahiti
    try { phraseJour = FR.phrase(l[jour % l.length][1]); } catch (e) { return ""; }
    const P = phraseJour;
    return `<section class="carte phrase-jour"><h2 style="margin-top:0">La phrase du jour</h2>
      <p class="discret">Touche un mot pour voir sa classe et sa fonction.</p>
      <div class="mots">${FR.texteMots(P.toks, 0, P.toks.length - 1, (t, i) => (t.ponct ? `<span class="ponct">${T(t.t)}</span>` : `<button type="button" class="mot" data-i="${i}">${T(t.t)}</button>`))}</div>
      <p class="info-mot" aria-live="polite"></p></section>`;
  }
  function activerPhraseDuJour() {
    const zone = U.$(".phrase-jour"); if (!zone || !phraseJour) return;
    const P = phraseJour, info = U.$(".info-mot", zone);
    const NOMS = { NP: "nom propre", VI: "verbe à l'infinitif", VP: "verbe (participe passé)", PRR: "pronom relatif", V: "verbe conjugué" };
    U.$$(".mot", zone).forEach((b) => b.addEventListener("click", () => {
      U.$$(".mot", zone).forEach((x) => x.classList.toggle("choisi", x === b));
      const i = Number(b.dataset.i), t = P.toks[i];
      const classe = t.c === "x" || !t.c ? null : NOMS[t.c] || FR.CLASSES[t.c];
      const g = P.groupes.filter((x) => x.de <= i && i <= x.a).sort((a, c) => (a.a - a.de) - (c.a - c.de))[0];
      let m = `« ${T(t.t)} »` + (classe ? ` : <b>${classe}</b>` : " : mot qu'on n'étudie pas ici");
      if (g) m += `. Il fait partie du groupe « ${FR.texteGroupe(P, g)} », <b>${U.esc(FR.FONCTIONS[g.f] || g.f)}</b>.`;
      else if (t.c === "V") m += ". C'est le noyau de la phrase.";
      info.innerHTML = m;
    }));
  }

  // ------------------------------------------------------------------ leçon
  function vueFiche(id) {
    const n = notionDuNiveau(id); if (!n) return;
    const niv = niveau(), lien = n.type === "lecture" ? "lecture" : n.type === "ecrit" ? "ecrit" : "serie";
    app.innerHTML = `<p><a class="lien" href="#/accueil">← Retour</a></p><div class="carte fiche">${n.fiche ? n.fiche(niv) : ""}</div>
      <div class="actions"><a class="btn principal" href="#/${lien}/${n.id}">${ICO_TYPE[n.type] || "Commencer"} →</a></div>`;
  }

  // ------------------------------------------------------------------ série notée (10 questions, 2 points chacune)
  function vueSerie(id) {
    const n = notionDuNiveau(id, "serie"); if (!n) return;
    const niv = niveau(), titre = FR.titreNotion(n, niv);
    const qs = FR.serie.construire(n, niv), debut = Date.now(), res = [];
    if (!qs.length) { app.innerHTML = `<p class="alerte">Pas de questions pour ce niveau.</p>`; return; }
    app.innerHTML = `<div class="serie-tete"><a class="btn petit ligne" href="#/accueil">Quitter</a><b class="titre-serie">${T(titre)}</b></div>
      <div class="points" aria-hidden="true">${qs.map(() => `<span class="point"></span>`).join("")}</div>
      <p class="discret" id="num"></p><div class="carte" id="q"></div>`;
    let k = 0;
    const points = U.$$(".point");
    function suivante() {
      if (k >= qs.length) { fin(); return; }
      points.forEach((p, i) => p.classList.toggle("encours", i === k));
      U.$("#num").textContent = `Question ${k + 1} sur ${qs.length}`;
      const cont = U.$("#q");
      FR.question(qs[k], cont, { onFin(r, retour) {
        res.push({ q: qs[k], r });
        points[k].classList.remove("encours"); points[k].classList.add(r.ok ? "ok" : r.partiel ? "mi" : "ko");
        const b = U.h(`<div class="actions"><button type="button" class="btn principal">${k + 1 < qs.length ? "Question suivante →" : "Voir ma note"}</button></div>`);
        retour.appendChild(b);
        const bouton = U.$("button", b);
        bouton.addEventListener("click", () => { k++; suivante(); window.scrollTo(0, 0); });
        try { bouton.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* vieux navigateur */ }
      } });
    }
    async function fin() {
      const score = res.reduce((a, x) => a + x.r.pts, 0), max = 2 * qs.length;
      const details = { q: res.map(({ q, r }) => ({ c: brut(q.consigne).slice(0, 160), s: brut(q.support || q.texte || "").slice(0, 200), r: brut(r.rep).slice(0, 200), a: brut(r.att).slice(0, 200), p: r.pts })) };
      app.innerHTML = `<div class="chargement">Enregistrement…</div>`;
      const st = await enregistrer({ notion: n.id, titre, type: "serie", score, score_max: max, duree_s: Math.round((Date.now() - debut) / 1000), details });
      bilan({ titre, score, max, statut: st, revoir: res.filter((x) => !x.r.ok).map(({ q, r }) => ({ c: q.consigne, s: q.support || (q.type === "reecriture" ? T(q.texte) : ""), r: r.rep, a: r.att, corr: q.correction || r.html })),
        refaire: () => vueSerie(id), libelleRefaire: "Nouvelle série" });
    }
    suivante();
  }

  function bilan(o) {
    const n20 = U.sur20(o.score, o.max), m = U.maitrise(n20);
    app.innerHTML = `<div class="carte bilan pile"><p class="discret">${T(o.titre)}</p>
        <div class="note">${U.nf(n20)}<small> / 20</small></div><p><span class="m ${m.k}">${m.t}</span></p>
        <p class="discret">${U.esc(messageEnvoi(o.statut))}</p>
        <div class="actions" style="justify-content:center">${o.refaire ? `<button type="button" class="btn principal" data-refaire>${U.esc(o.libelleRefaire || "Recommencer")}</button>` : ""}<a class="btn ligne" href="#/accueil">Retour à l'accueil</a></div></div>
      ${o.revoir && o.revoir.length ? `<h2>À revoir</h2><ul class="revoir carte">${o.revoir.map((x) => `<li><div class="q">${x.c}</div>${x.s ? `<div class="support">${x.s}</div>` : ""}
        <div>Ta réponse : <s>${U.esc(U.typo(x.r))}</s></div><div>Bonne réponse : <b>${U.esc(U.typo(x.a))}</b></div>${x.corr ? `<div class="correction">${x.corr}</div>` : ""}</li>`).join("")}</ul>` : o.max && o.score >= o.max ? `<p class="alerte ok">Tout est juste : bravo !</p>` : ""}
      ${o.html || ""}`;
    const b = U.$("[data-refaire]"); if (b) b.addEventListener("click", o.refaire);
    window.scrollTo(0, 0);
    majBandeau();
  }

  // ------------------------------------------------------------------ réponse rédigée vérifiée par l'IA (lecture et écriture)
  const INFO_IA = `Ta réponse sera lue par une intelligence artificielle (Claude, de l'entreprise Anthropic) qui donne des conseils. Ni ton nom, ni ta classe ne lui sont envoyés. Elle peut se tromper : ta professeure voit ton texte.`;
  const PICS = { present: ["✓", "réussi"], partiel: ["½", "en partie"], absent: ["✗", "pas encore"] };
  function htmlVerdicts(elements, v, conseil, langue) {
    return `<ul class="liste-verdicts">${elements.map((e, i) => {
      const x = v[i] || { verdict: "partiel", raison: "" };
      return `<li class="${x.verdict}"><span class="pic" aria-label="${PICS[x.verdict][1]}">${PICS[x.verdict][0]}</span><div>${T(e.t)} <span class="discret">(${U.nf(x.pts)} / ${U.nf(e.p)})</span>${x.raison ? `<small>${T(x.raison)}</small>` : ""}</div></li>`;
    }).join("")}</ul>
    ${conseil ? `<p><b>Conseil :</b> ${T(conseil)}</p>` : ""}
    ${langue && langue.length ? `<h3>Erreurs de langue repérées</h3><ul class="erreurs-langue">${langue.map((e) => `<li><s>${T(e.extrait)}</s> → <b>${T(e.correction)}</b> <span class="discret">${T(e.regle)}</span></li>`).join("")}</ul>` : ""}`;
  }
  // points : réussi = tout, en partie = la moitié, pas encore = 0 ; un critère sans avis de l'IA compte « en partie »
  function compter(elements, rep) {
    const parI = {}; for (const e of rep.elements || []) parI[e.i] = e;
    const v = elements.map((e, i) => { const x = parI[i] || { verdict: "partiel", raison: "Ce point n'a pas pu être vérifié." }; return { verdict: x.verdict, raison: x.raison, pts: x.verdict === "present" ? e.p : x.verdict === "partiel" ? e.p / 2 : 0 }; });
    return { v, pts: v.reduce((a, x) => a + x.pts, 0) };
  }

  // o = { consigne, aide, debut, corrige, elements, mots:[min,max], texte (étudié), langue, essais (1 ou 2), brouillon (clé), autoEval (si l'IA ne répond pas) }
  // → Promise({ pts, max, details })
  function redaction(cont, o) {
    return new Promise((fini) => {
      const max = o.elements.reduce((a, e) => a + e.p, 0);
      const garde = U.lsGet(o.brouillon, null);
      cont.innerHTML = `<div class="consigne">${T(o.consigne)}</div>
        ${o.aide ? `<div class="aide-ecrit">${o.aide}</div>` : ""}
        <textarea class="redac" rows="7" spellcheck="true" lang="fr" aria-label="Ta réponse">${U.esc(garde != null ? garde : o.debut || "")}</textarea>
        <div class="compteur" aria-live="polite"></div>
        <p class="discret info-ia">${INFO_IA}</p>
        <div class="actions"><button type="button" class="btn principal" data-verifier>Faire vérifier ma réponse</button></div>
        <div class="zone-retour" aria-live="polite"></div>`;
      const ta = U.$("textarea", cont), cpt = U.$(".compteur", cont), btn = U.$("[data-verifier]", cont), zone = U.$(".zone-retour", cont), act = btn.parentNode;
      let essais = 0, dernier = null, minuterie = null;
      const majCpt = () => { const n = motsDe(ta.value); cpt.textContent = `${n} mot${n > 1 ? "s" : ""}` + (o.mots ? ` (entre ${o.mots[0]} et ${o.mots[1]})` : ""); };
      ta.addEventListener("input", () => { majCpt(); clearTimeout(minuterie); minuterie = setTimeout(() => U.lsSet(o.brouillon, ta.value), 600); });
      majCpt();
      const terminer = (r) => { U.lsDel(o.brouillon); fini(r); };

      function autoEvaluation(pourquoi) {
        ta.readOnly = true; btn.remove();
        zone.innerHTML = `<div class="retour mi"><div class="titre">Vérifie toi-même ta réponse</div><p>${U.esc(pourquoi)}</p>
          <p><b>Une réponse possible :</b> ${T(o.corrige)}</p><p>Coche ce que ta réponse contient vraiment :</p>
          ${o.elements.map((e, i) => `<label class="rangee" style="margin:6px 0;align-items:flex-start"><input type="checkbox" data-i="${i}" style="width:24px;height:24px;flex:none"> <span>${T(e.t)} <span class="discret">(${U.nf(e.p)} pt${e.p > 1 ? "s" : ""})</span></span></label>`).join("")}
          <div class="actions"><button type="button" class="btn principal" data-valider-auto>Valider</button></div></div>`;
        U.$("[data-valider-auto]", zone).addEventListener("click", () => {
          const coches = U.$$("input[type=checkbox]", zone).map((c) => c.checked);
          const v = o.elements.map((e, i) => ({ verdict: coches[i] ? "present" : "absent", raison: "", pts: coches[i] ? e.p : 0 }));
          const pts = v.reduce((a, x) => a + x.pts, 0);
          U.$$("input", zone).forEach((c) => { c.disabled = true; });
          U.$("[data-valider-auto]", zone).remove();
          terminer({ pts, max, details: { r: ta.value.slice(0, 4000), v: v.map((x, i) => ({ t: o.elements[i].t, verdict: x.verdict, p: x.pts })), auto: true } });
        });
      }

      btn.addEventListener("click", async () => {
        const rep = ta.value.trim(), n = motsDe(rep);
        if (o.mots && n < o.mots[0]) { toast(`Écris au moins ${o.mots[0]} mots (tu en as ${n}).`); return; }
        if (o.mots && n > o.mots[1] * 1.5) { toast(`Ton texte est trop long : ${o.mots[1]} mots environ suffisent.`); return; }
        U.lsSet(o.brouillon, ta.value);
        if (!FR.ia.possible()) {
          if (o.autoEval) autoEvaluation(session() && session().apercu ? "En aperçu, la vérification par l'IA demande que l'espace prof soit ouvert sur cet appareil." : "La vérification automatique n'est pas disponible ici.");
          else zone.innerHTML = `<p class="alerte">La vérification n'est pas disponible ici${session() && session().apercu ? " (en aperçu, ouvre d'abord l'espace prof sur cet appareil)" : ""}. Ton texte est gardé sur cet appareil.</p>`;
          return;
        }
        if (!navigator.onLine) { zone.innerHTML = `<p class="alerte">Pas de réseau : la vérification demande internet. Ton texte est gardé sur cet appareil ; réessaie dans un moment.</p>`; if (o.autoEval) autoEvaluation("Pas de réseau pour la vérification automatique."); return; }
        btn.disabled = true; btn.textContent = "Vérification en cours…"; ta.readOnly = true;
        zone.innerHTML = `<p class="discret">L'IA lit ta réponse (cela peut prendre 20 secondes)…</p>`;
        try {
          const r = await FR.ia.corriger({ niveau: niveau(), question: o.consigne, texte: o.texte || "", corrige: o.corrige, elements: o.elements.map((e, i) => ({ i, t: e.t, p: e.p })), reponse: rep, langue: !!o.langue });
          essais++;
          const c = compter(o.elements, r);
          dernier = { pts: c.pts, max, details: { r: rep.slice(0, 4000), v: c.v.map((x, i) => ({ t: o.elements[i].t, verdict: x.verdict, raison: x.raison, p: x.pts })), conseil: r.conseil || "", langue: r.langue || [], essais } };
          const peutAmeliorer = essais < (o.essais || 1) && c.pts < max;
          const cls = c.pts >= max ? "ok" : c.pts >= max / 2 ? "mi" : "ko";
          zone.innerHTML = `<div class="retour ${cls}"><div class="titre">Vérification : ${U.nf(c.pts)} / ${U.nf(max)}</div>${htmlVerdicts(o.elements, c.v, r.conseil, r.langue)}
            ${typeof r.restant === "number" && r.restant <= 3 ? `<p class="discret">Encore ${r.restant} vérification${r.restant > 1 ? "s" : ""} possible${r.restant > 1 ? "s" : ""} aujourd'hui.</p>` : ""}
            <div class="actions">${peutAmeliorer ? `<button type="button" class="btn ligne" data-ameliorer>Améliorer ma réponse (dernier essai)</button>` : ""}<button type="button" class="btn principal" data-garder>${peutAmeliorer ? "Garder cette note" : "Continuer"}</button></div></div>`;
          btn.remove();
          const am = U.$("[data-ameliorer]", zone);
          if (am) am.addEventListener("click", () => {
            ta.readOnly = false;
            zone.innerHTML = `<p class="discret">Corrige ta réponse avec les conseils, puis fais-la vérifier une dernière fois.</p>`;
            btn.disabled = false; btn.textContent = "Faire vérifier ma nouvelle réponse"; act.appendChild(btn);
            try { ta.focus({ preventScroll: false }); } catch (e) { /* iPad */ }
          });
          U.$("[data-garder]", zone).addEventListener("click", (ev) => { ev.target.disabled = true; U.$$("[data-ameliorer]", zone).forEach((x) => x.remove()); terminer(dernier); });
        } catch (e) {
          ta.readOnly = false; btn.disabled = false; btn.textContent = "Faire vérifier ma réponse"; if (!btn.isConnected) act.appendChild(btn);
          if (e.code === "SESSION_EXPIREE") { zone.innerHTML = `<p class="alerte ko">Ta connexion a expiré : ton texte est gardé sur cet appareil. <a href="#/">Reconnecte-toi</a>, puis reviens ici.</p>`; FR.session.clear(); return; }
          const msg = e.code === "QUOTA" ? "Tu as fait beaucoup de vérifications aujourd'hui : c'est fini pour aujourd'hui."
            : e.code === "INACTIF" ? "Ton compte est en pause : demande à ta professeure."
            : e.code === "IA_RESEAU" ? "Pas de réponse (réseau)." : "La vérification n'a pas marché.";
          if (dernier) { zone.innerHTML = `<p class="alerte">${msg} Ta note précédente est gardée.</p>`; terminer(dernier); return; }
          if (o.autoEval) { autoEvaluation(msg + " Vérifie toi-même ta réponse avec le corrigé."); return; }
          zone.innerHTML = `<p class="alerte">${msg} Ton texte est gardé sur cet appareil : réessaie plus tard.</p>`;
        }
      });
    });
  }

  // ------------------------------------------------------------------ lire et comprendre
  function htmlPassage(x) { return x.nom ? `<b>${T(x.t)}</b>` : x.dida ? `<i>${T(x.t)}</i>` : T(x.t); }
  function htmlTexte(tx) {
    const pas = FR.passages(tx);
    const pars = tx.par.map((_, p) => `<p class="l">${pas.filter((x) => x.p === p).map(htmlPassage).join(" ")}</p>`).join("");
    return `<div class="texte-lu" id="texte"><h3 style="margin-top:0">${T(tx.titre)}</h3>${pars}<p class="src">${T(tx.source)}</p>
      ${tx.notes && tx.notes.length ? `<p class="src">${tx.notes.map(([m, d]) => `<b>${T(m)}</b> : ${T(d)}`).join(" · ")}</p>` : ""}</div>`;
  }
  function texteBrut(tx) { return tx.titre + "\n" + tx.par.map((par) => par.map((t) => t.replace(/^#/, "")).join(" ")).join("\n") + "\n(" + tx.source + ")"; }
  function questionLecture(q, tx) {
    if (q.type === "choix") return FR.gen.choix({ bon: q.bon, faux: q.faux, q: { consigne: T(q.consigne), correction: q.correction ? `<p>${T(q.correction)}</p>` : "" } });
    if (q.type === "citation") {
      const segs = [];
      tx.par.forEach((par, p) => {
        if (p) segs.push({ h: "<br>", sel: false });
        FR.passages({ par: [par] }).forEach((x, j) => {
          if (j) segs.push({ h: " ", sel: false });
          segs.push(x.nom ? { h: `<b>${T(x.t)}</b>`, sel: false } : { h: htmlPassage(x), ok: FR.passageVise(x, q.ok) });
        });
      });
      return { type: "segment", consigne: T(q.consigne), segs, joint: "", classe: "support texte-cite", correction: q.correction ? `<p>${T(q.correction)}</p>` : "" };
    }
    return null;
  }

  function vueLecture(id) {
    const n = notionDuNiveau(id, "lecture"); if (!n) return;
    const niv = niveau(), titre = FR.titreNotion(n, niv), tx = n.texte, debut = Date.now();
    const qs = n.questions, res = [];
    app.innerHTML = `<div class="serie-tete"><a class="btn petit ligne" href="#/accueil">Quitter</a><b class="titre-serie">${T(titre)}</b></div>
      <div class="points" aria-hidden="true">${qs.map(() => `<span class="point"></span>`).join("")}</div>
      <div class="lecture"><div class="lecture-texte">${htmlTexte(tx)}</div>
      <div class="lecture-q"><p class="discret" id="num"></p><div class="carte" id="q"></div></div></div>`;
    const points = U.$$(".point");
    let k = 0;
    const suite = (libelle) => U.h(`<div class="actions"><button type="button" class="btn principal">${libelle}</button></div>`);
    function suivante() {
      if (k >= qs.length) { fin(); return; }
      points.forEach((p, i) => p.classList.toggle("encours", i === k));
      U.$("#num").innerHTML = `Question ${k + 1} sur ${qs.length} <a class="lien no-print" href="#texte" data-relire>Relire le texte</a>`;
      const rel = U.$("[data-relire]"); if (rel) rel.addEventListener("click", (ev) => { ev.preventDefault(); U.$("#texte").scrollIntoView({ behavior: "smooth" }); });
      const q = qs[k], cont = U.$("#q");
      const apres = (r) => {
        res.push(r);
        points[k].classList.remove("encours"); points[k].classList.add(r.pts >= r.m ? "ok" : r.pts > 0 ? "mi" : "ko");
      };
      const boutonSuite = (parent) => {
        const b = suite(k + 1 < qs.length ? "Question suivante →" : "Voir ma note");
        parent.appendChild(b);
        const bouton = U.$("button", b);
        bouton.addEventListener("click", () => { k++; suivante(); try { U.$(".lecture-q").scrollIntoView({ behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } });
        try { bouton.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* rien */ }
      };
      if (q.type === "redige") {
        redaction(cont, { consigne: q.consigne, aide: q.aide, debut: q.debut, corrige: q.corrige, elements: q.elements, mots: q.mots, texte: texteBrut(tx),
          langue: false, essais: 1, brouillon: cleBrouillon(n.id + "_" + k), autoEval: true }).then((r) => {
          apres({ c: q.consigne, r: r.details.r, a: q.corrige, pts: r.pts, m: r.max, v: r.details.v, auto: !!r.details.auto, conseil: r.details.conseil, redige: true });
          boutonSuite(cont);
        });
        return;
      }
      const eq = questionLecture(q, tx);
      FR.question(eq, cont, { onFin(r, retour) { apres({ c: q.consigne, r: r.rep, a: r.att, pts: r.pts, m: 2, corr: eq.correction, s: "" }); boutonSuite(retour); } });
    }
    async function fin() {
      const score = res.reduce((a, x) => a + x.pts, 0), max = res.reduce((a, x) => a + x.m, 0);
      const details = { q: res.map((x) => Object.assign({ c: brut(x.c).slice(0, 200), r: String(x.r || "").slice(0, x.redige ? 4000 : 200), a: brut(x.a).slice(0, x.redige ? 600 : 200), p: x.pts, m: x.m },
        x.redige ? { v: x.v, auto: x.auto, conseil: x.conseil } : {})) };
      app.innerHTML = `<div class="chargement">Enregistrement…</div>`;
      const st = await enregistrer({ notion: n.id, titre, type: "lecture", score, score_max: max, duree_s: Math.round((Date.now() - debut) / 1000), details });
      bilan({ titre, score, max, statut: st, revoir: res.filter((x) => !x.redige && x.pts < x.m).map((x) => ({ c: T(x.c), r: x.r, a: x.a, corr: x.corr })),
        refaire: () => vueLecture(id), libelleRefaire: "Refaire" });
    }
    suivante();
  }

  // ------------------------------------------------------------------ écrire (rédaction vérifiée par l'IA)
  function vueEcrit(id) {
    const n = notionDuNiveau(id, "ecrit"); if (!n) return;
    const niv = niveau(), titre = FR.titreNotion(n, niv), debut = Date.now();
    app.innerHTML = `<p><a class="lien" href="#/accueil">← Retour</a></p><h1>${T(titre)}</h1>
      <details class="carte" open><summary><b>Ce qui sera vérifié</b> (sur 20)</summary><ul>${n.criteres.map((c) => `<li>${T(c.t)} <span class="discret">(${c.p} pts)</span></li>`).join("")}</ul></details>
      <div class="carte" id="ecrit" style="margin-top:12px"></div>`;
    redaction(U.$("#ecrit"), { consigne: n.consigne, aide: `<details><summary><b>Boîte à outils</b></summary>${n.aide}</details>`, corrige: n.corrige, elements: n.criteres,
      mots: n.mots, langue: true, essais: 2, brouillon: cleBrouillon(n.id), autoEval: false }).then(async (r) => {
      const details = Object.assign({ sujet: n.consigne.slice(0, 300) }, r.details);
      const st = await enregistrer({ notion: n.id, titre, type: "ecrit", score: r.pts, score_max: r.max, duree_s: Math.round((Date.now() - debut) / 1000), details });
      const zone = U.$("#ecrit .zone-retour");
      const n20 = U.sur20(r.pts, r.max), m = U.maitrise(n20);
      if (zone) zone.insertAdjacentHTML("beforeend", `<div class="carte bilan pile" style="margin-top:14px"><div class="note">${U.nf(n20)}<small> / 20</small></div>
        <p><span class="m ${m.k}">${m.t}</span></p><p class="discret">${U.esc(messageEnvoi(st))}</p>
        <div class="actions" style="justify-content:center"><a class="btn principal" href="#/accueil">Retour à l'accueil</a></div></div>`);
      majBandeau();
    });
  }

  // ------------------------------------------------------------------ mes notes
  async function vueResultats() {
    const s = session();
    app.innerHTML = `<p><a class="lien" href="#/accueil">← Retour</a></p><h1>Mes notes</h1><div id="liste"><div class="chargement">Chargement…</div></div>`;
    let d = FR.api.etatEnCache();
    try { d = await FR.api.etat(); } catch (e) { if (e.code === "SESSION_EXPIREE") { sessionExpiree(); return; } }
    const h = historique(d);
    const liste = U.$("#liste"); if (!liste) return;
    if (!h.length) { liste.innerHTML = `<p class="discret">Pas encore de note. Lance un exercice depuis l'accueil !</p>`; return; }
    liste.innerHTML = `<div class="tableau-scroll"><table class="grille"><thead><tr><th>Date</th><th>Exercice</th><th class="c">Note</th></tr></thead><tbody>
      ${h.map((r) => { const n20 = note20(r), m = U.maitrise(n20); const no = FR.trouverNotion(r.notion);
        return `<tr><td>${date(r.fait_le)}${r.attente ? ` <span class="discret">(en attente)</span>` : ""}</td><td>${T(r.titre || (no ? FR.titreNotion(no, s.niveau) : r.notion))}</td>
          <td class="c"><span class="cellule ${m.k}" title="${m.t}">${U.nf(n20)}</span></td></tr>`; }).join("")}</tbody></table></div>`;
  }

  // ------------------------------------------------------------------ démarrage
  U.$("#signature").textContent = CFG.signature || "";
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  route();
})();
