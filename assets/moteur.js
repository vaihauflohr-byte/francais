/* =====================================================================
   Français au collège — moteur des exercices
   - outils (FR.u), phrases annotées (FR.phrase), types de questions (FR.types),
   - construction d'une série (FR.serie) : 10 questions, 2 points chacune, note sur 20.
   Les banques et les générateurs de chaque notion sont dans contenu/*.js.
   ===================================================================== */
(function () {
  "use strict";
  const FR = (window.FR = window.FR || {});

  // ------------------------------------------------------------------ outils
  const U = (FR.u = {});
  U.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  U.rnd = (n) => Math.floor(Math.random() * n);
  U.pick = (a) => a[U.rnd(a.length)];
  U.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = U.rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.sample = (a, n) => U.shuffle(a).slice(0, n);
  U.uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  // texte comparable : apostrophes et espaces normalisés
  U.norm = (s) => String(s == null ? "" : s).normalize("NFC").replace(/[’ʼ‘`´]/g, "'").replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();
  U.sansAccents = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
  U.nf = (x) => (Math.round(x * 10) / 10).toString().replace(".", ",");
  // typographie française à l'affichage : apostrophe courbe, espaces insécables avant ? ! ; : et dans les guillemets
  U.typo = (s) => String(s).replace(/'/g, "’").replace(/«[ \u00a0]*/g, "«\u00a0").replace(/[ \u00a0]*»/g, "\u00a0»").replace(/ ([?!;:])/g, "\u202f$1");
  // barème de maîtrise de la prof : 0–7 rouge, 8–11 jaune, 12–16 vert clair, 17–20 vert foncé (note ramenée sur 20)
  U.maitrise = (n20) => (n20 == null ? { k: "aucun", t: "Pas encore fait" }
    : n20 >= 17 ? { k: "vf", t: "Très bonne maîtrise" } : n20 >= 12 ? { k: "vc", t: "Maîtrise satisfaisante" }
    : n20 >= 8 ? { k: "j", t: "Maîtrise fragile" } : { k: "r", t: "Maîtrise insuffisante" });
  U.sur20 = (s, m) => (m ? (20 * s) / m : 0);
  U.$ = (sel, el) => (el || document).querySelector(sel);
  U.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  U.h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  U.lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  U.lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage plein ou bloqué */ } };
  U.lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) { /* rien */ } };

  // ------------------------------------------------------------------ phrases annotées
  // Écriture : « [Le/D petit/A requin/N]S nage/V1 [lentement/ADV]CP ./ »
  //   mot/CLASSE ; groupes entre crochets suivis de leur fonction ; ponctuation : « ./ » « ,/ »…
  //   Classes : N nom, NP nom propre, D déterminant, A adjectif, V1 V2… verbe conjugué (même numéro = même forme
  //   verbale, ex. « a/V1 mangé/V1 »), VI verbe à l'infinitif, VP participe employé seul, PR pronom, PRR pronom relatif,
  //   ADV adverbe, P préposition, CC conjonction de coordination, CS conjonction de subordination, I interjection,
  //   x mot qu'on ne demande jamais (mot ambigu, locution).
  //   Fonctions : S sujet, COD, COI, ATT attribut du sujet, CP complément de phrase (circonstanciel), CN complément du nom,
  //   EPI épithète, CAG complément d'agent, APP apposition.
  const CLASSES = {
    N: "nom", NP: "nom", D: "déterminant", A: "adjectif", V: "verbe", VI: "verbe", VP: "verbe", PR: "pronom", PRR: "pronom",
    ADV: "adverbe", P: "préposition", CC: "conjonction de coordination", CS: "conjonction de subordination", I: "interjection",
  };
  FR.CLASSES = CLASSES;
  FR.FONCTIONS = {
    S: "sujet", COD: "complément d'objet direct (COD)", COI: "complément d'objet indirect (COI)", ATT: "attribut du sujet",
    CP: "complément de phrase (circonstanciel)", CN: "complément du nom", EPI: "épithète", CAG: "complément d'agent", APP: "apposition",
  };
  FR.phrase = function (src) {
    const toks = [], groupes = [], pile = [];
    for (let brut of String(src).trim().split(/\s+/)) {
      while (brut.startsWith("[")) { pile.push(toks.length); brut = brut.slice(1); }
      const m = brut.match(/^(.+?)\/([A-Za-z0-9]*)(?:=([^\]\s]+))?((?:\][A-Za-z]+)*)$/);
      if (!m) throw new Error("phrase mal écrite : " + brut + " dans « " + src + " »");
      const mot = m[1].replace(/_/g, " "), tag = m[2], lemme = m[3] || null;
      let classe = tag, verbe = null;
      const v = tag.match(/^V(\d+)$/);
      if (v) { classe = "V"; verbe = Number(v[1]); }
      toks.push({ t: mot, c: tag === "" ? null : classe, v: verbe, ponct: tag === "", lemme });
      if (m[4]) for (const f of m[4].split("]").filter(Boolean)) {
        if (!pile.length) throw new Error("crochet fermant en trop : " + src);
        groupes.push({ f, de: pile.pop(), a: toks.length - 1 });
      }
    }
    if (pile.length) throw new Error("crochet non fermé : " + src);
    return { src, toks, groupes };
  };
  // texte d'une suite de mots, avec la typographie française
  FR.texteMots = function (toks, de, a, rendu) {
    de = de || 0; a = a == null ? toks.length - 1 : a;
    let s = "";
    for (let i = de; i <= a; i++) {
      const t = toks[i], prec = i > de ? toks[i - 1] : null, mot = rendu ? rendu(t, i) : U.esc(U.typo(t.t));
      let sep = " ";
      if (!prec) sep = "";
      else if (/['’]$/.test(prec.t) || prec.t === "«" || prec.t === "(" || prec.t === "-" ) sep = prec.t === "«" ? " " : "";
      else if (/^[.,)…]$/.test(t.t) || t.t.startsWith("-")) sep = "";
      else if (/^[;:!?»]$/.test(t.t)) sep = " ";
      s += sep + mot;
    }
    return s;
  };
  FR.texteGroupe = (P, g) => FR.texteMots(P.toks, g.de, g.a).replace(/<[^>]+>/g, "");
  // phrase affichée avec des mots soulignés (indices) ou un groupe souligné
  FR.phraseSoulignee = function (P, de, a) {
    return FR.texteMots(P.toks, 0, P.toks.length - 1, (t, i) => {
      const m = U.esc(U.typo(t.t));
      if (i === de && i === a) return `<span class="souligne">${m}</span>`;
      if (i === de) return `<span class="souligne">${m}`;
      if (i === a) return `${m}</span>`;
      return m;
    });
  };
  FR.formesVerbales = function (P) {
    const f = {};
    P.toks.forEach((t, i) => { if (t.v != null) (f[t.v] = f[t.v] || []).push(i); });
    return Object.keys(f).map((k) => f[k]);
  };

  // ------------------------------------------------------------------ types de questions
  // Chaque type : rendu(q, zone) → objet { pret(), lire() } ; corriger(q, lu) → { ok, pts, rep, att, html }
  const T = (FR.types = {});
  const lettre = (i) => "ABCDEFGH"[i];

  T.choix = {
    rendu(q, zone) {
      const ordre = q.ordre || (q.ordre = q.melanger === false ? q.choix.map((_, i) => i) : U.shuffle(q.choix.map((_, i) => i)));
      zone.innerHTML = `<div class="choix ${q.choix.every((c) => String(c).length < 28) && q.choix.length > 2 ? "deux" : ""}" role="radiogroup" aria-label="Choix">${ordre
        .map((i, k) => `<button type="button" role="radio" aria-checked="false" data-i="${i}"><span class="k" aria-hidden="true">${lettre(k)}</span>${q.choixHtml ? q.choix[i] : U.esc(U.typo(q.choix[i]))}</button>`)
        .join("")}</div>`;
      let sel = null;
      U.$$("button", zone).forEach((b) => b.addEventListener("click", () => {
        if (zone.dataset.fini) return;
        sel = Number(b.dataset.i);
        U.$$("button", zone).forEach((x) => { x.classList.toggle("choisi", x === b); x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        zone.dispatchEvent(new Event("change"));
      }));
      return { pret: () => sel != null, lire: () => sel };
    },
    corriger(q, sel, zone) {
      const ok = sel === q.ok;
      U.$$("button", zone).forEach((b) => { const i = Number(b.dataset.i); if (i === q.ok) b.classList.add("bon"); else if (i === sel) b.classList.add("faux"); b.disabled = true; });
      const brut = (x) => String(x).replace(/<[^>]+>/g, "");
      return { ok, pts: ok ? 2 : 0, rep: brut(q.choix[sel]), att: brut(q.choix[q.ok]),
        html: !ok && q.pourquoi && q.pourquoi[sel] ? `<p>${q.pourquoi[sel]}</p>` : "" };
    },
  };

  // cliquer sur des mots d'une phrase (q.mots : [{t, sel, ok, ponct}])
  T.clic = {
    rendu(q, zone) {
      const toks = q.mots;
      zone.innerHTML = `<div class="mots">${FR.texteMots(toks, 0, toks.length - 1, (t, i) =>
        t.sel === false || t.ponct ? `<span class="ponct">${U.esc(U.typo(t.t))}</span>` : `<button type="button" class="mot" data-i="${i}" aria-pressed="false">${U.esc(U.typo(t.t))}</button>`)}</div>
        ${q.multi ? `<p class="discret">Tu peux choisir plusieurs mots. Touche un mot une deuxième fois pour l'enlever.</p>` : ""}`;
      const sel = new Set();
      U.$$(".mot", zone).forEach((b) => b.addEventListener("click", () => {
        if (zone.dataset.fini) return;
        const i = Number(b.dataset.i);
        if (!q.multi) { sel.clear(); U.$$(".mot", zone).forEach((x) => { x.classList.remove("choisi"); x.setAttribute("aria-pressed", "false"); }); }
        if (sel.has(i)) { sel.delete(i); b.classList.remove("choisi"); b.setAttribute("aria-pressed", "false"); }
        else { sel.add(i); b.classList.add("choisi"); b.setAttribute("aria-pressed", "true"); }
        zone.dispatchEvent(new Event("change"));
      }));
      return { pret: () => sel.size > 0, lire: () => Array.from(sel).sort((a, b) => a - b) };
    },
    corriger(q, lu, zone) {
      const bons = q.mots.map((t, i) => (t.ok ? i : -1)).filter((i) => i >= 0), s = new Set(lu);
      let ok = bons.length === s.size && bons.every((i) => s.has(i));
      U.$$(".mot", zone).forEach((b) => {
        const i = Number(b.dataset.i), t = q.mots[i]; b.disabled = true;
        if (t.ok && s.has(i)) b.classList.add("bon"); else if (t.ok) b.classList.add("oubli"); else if (s.has(i)) b.classList.add("faux");
      });
      const mots = (ix) => ix.map((i) => U.typo(q.mots[i].t)).join(" · ");
      const oublis = bons.filter((i) => !s.has(i)), trop = lu.filter((i) => !q.mots[i].ok);
      let html = "";
      if (!ok && oublis.length) html += `<p>Il manquait : <b>${U.esc(mots(oublis))}</b> (en pointillés).</p>`;
      if (!ok && trop.length) html += `<p>En trop : <b>${U.esc(mots(trop))}</b>.</p>`;
      return { ok, pts: ok ? 2 : 0, rep: mots(lu), att: mots(bons), html };
    },
  };

  // choisir un segment dans un texte (groupe de mots, phrase-preuve) : q.segs : [{h (html), ok, sel}]
  T.segment = {
    rendu(q, zone) {
      zone.innerHTML = `<div class="${q.classe || "support"}">${q.segs.map((s, i) => (s.sel === false ? s.h : `<span class="seg" role="button" tabindex="0" data-i="${i}">${s.h}</span>`)).join(q.joint == null ? " " : q.joint)}</div>`;
      let sel = null;
      U.$$(".seg", zone).forEach((b) => {
        const f = () => { if (zone.dataset.fini) return; sel = Number(b.dataset.i); U.$$(".seg", zone).forEach((x) => x.classList.toggle("choisi", x === b)); zone.dispatchEvent(new Event("change")); };
        b.addEventListener("click", f); b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
      });
      return { pret: () => sel != null, lire: () => sel };
    },
    corriger(q, sel, zone) {
      const ok = !!q.segs[sel].ok;
      U.$$(".seg", zone).forEach((b) => { const i = Number(b.dataset.i); if (q.segs[i].ok) b.classList.add("bon"); else if (i === sel) b.classList.add("faux"); });
      const brut = (h) => h.replace(/<[^>]+>/g, "");
      return { ok, pts: ok ? 2 : 0, rep: brut(q.segs[sel].h), att: q.segs.filter((s) => s.ok).map((s) => brut(s.h)).join(" / "), html: "" };
    },
  };

  // réponse à écrire : q.avant, q.apres (texte autour), q.attendus (réponses acceptées)
  const comparable = (s, casse) => { s = U.norm(s).replace(/[.!]+$/, "").trim(); return casse ? s : s.toLowerCase(); };
  T.saisie = {
    rendu(q, zone) {
      zone.innerHTML = `<div class="saisie">${q.avant ? `<span>${q.avantHtml || U.esc(U.typo(q.avant))}</span>` : ""}<input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Ta réponse" placeholder="${U.esc(q.indice || "ta réponse")}">${q.apres ? `<span>${U.esc(U.typo(q.apres))}</span>` : ""}</div>`;
      const inp = U.$("input", zone);
      inp.addEventListener("input", () => zone.dispatchEvent(new Event("change")));
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); zone.dispatchEvent(new Event("valider")); } });
      setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { /* iPad */ } }, 60);
      return { pret: () => inp.value.trim().length > 0, lire: () => inp.value };
    },
    corriger(q, lu, zone) {
      const inp = U.$("input", zone); inp.disabled = true;
      const r = comparable(lu, q.casse), acc = q.attendus.map((a) => comparable(a, q.casse));
      // l'élève a pu recopier le pronom (« je chante », « j'aime ») : on l'accepte
      const pre = q.pronom ? comparable(q.pronom, q.casse) : "";
      let ok = acc.includes(r) || (pre && acc.some((a) => comparable(pre + (pre.endsWith("'") ? "" : " ") + a, q.casse) === r));
      let html = "";
      if (!ok && acc.some((a) => U.sansAccents(a) === U.sansAccents(r))) html = `<p><b>Presque !</b> Regarde bien les accents.</p>`;
      inp.classList.add(ok ? "bon" : "faux");
      return { ok, pts: ok ? 2 : 0, rep: U.norm(lu), att: q.attendus[0], html };
    },
  };

  // phrase à compléter avec des listes : q.phr = ["texte", {o:[…], ok, m}, "texte", …]
  T.trous = {
    rendu(q, zone) {
      zone.innerHTML = `<p class="trous">${q.phr.map((x, i) => typeof x === "string" ? U.esc(U.typo(x)) :
        `<select data-g="${i}" aria-label="Choisis le mot qui manque"><option value="">choisir…</option>${(x.ordre || (x.ordre = U.shuffle(x.o.map((_, k) => k))))
          .map((k) => `<option value="${k}">${U.esc(U.typo(x.o[k]))}</option>`).join("")}</select>`).join("")}</p>`;
      U.$$("select", zone).forEach((s) => s.addEventListener("change", () => zone.dispatchEvent(new Event("change"))));
      return { pret: () => U.$$("select", zone).every((s) => s.value !== ""), lire: () => U.$$("select", zone).map((s) => Number(s.value)) };
    },
    corriger(q, lu, zone) {
      let ok = true, k = 0; const rem = [];
      U.$$("select", zone).forEach((s) => {
        const g = q.phr[Number(s.dataset.g)], bon = lu[k++] === g.ok; s.disabled = true;
        s.classList.add(bon ? "bon" : "faux"); if (!bon) { ok = false; if (g.m) rem.push(g.m); }
      });
      let i = 0; const rep = q.phr.map((x) => (typeof x === "string" ? x : "[" + x.o[lu[i++]] + "]")).join("");
      const att = q.phr.map((x) => (typeof x === "string" ? x : "[" + x.o[x.ok] + "]")).join("");
      return { ok, pts: ok ? 2 : 0, rep, att, html: rem.length ? `<p>${rem.map(U.esc).join(" ")}</p>` : "" };
    },
  };

  // réécriture : on modifie le passage dans la zone de texte ; comparaison mot à mot avec la réécriture attendue
  const decoupe = (s) => U.norm(s).replace(/([.,;:!?«»()…])/g, " $1 ").replace(/'/g, "' ").split(/\s+/).filter(Boolean);
  function ecarts(a, b) {   // plus courte suite d'opérations pour passer de a (élève) à b (attendu)
    const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const ops = []; let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && D[i][j] === D[i - 1][j - 1]) { ops.unshift({ k: "=", t: b[j - 1] }); i--; j--; }
      else if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { ops.unshift({ k: "~", t: b[j - 1], x: a[i - 1] }); i--; j--; }
      else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { ops.unshift({ k: "+", t: b[j - 1] }); j--; }
      else { ops.unshift({ k: "-", x: a[i - 1] }); i--; }
    }
    return { n: D[n][m], ops };
  }
  FR.ecarts = ecarts;
  const recolle = (mots) => mots.join(" ").replace(/ ([.,…)])/g, "$1").replace(/' /g, "'").replace(/\( /g, "(");
  T.reecriture = {
    rendu(q, zone) {
      zone.innerHTML = `<p class="discret">Modifie le texte dans le cadre : change seulement ce que la consigne demande.</p>
        <textarea class="redac" rows="5" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Ta réécriture">${U.esc(U.typo(q.texte))}</textarea>
        <div class="actions"><button type="button" class="btn petit ligne" data-remettre>Remettre le texte de départ</button></div>`;
      const ta = U.$("textarea", zone);
      U.$("[data-remettre]", zone).addEventListener("click", () => { ta.value = U.typo(q.texte); });
      ta.addEventListener("input", () => zone.dispatchEvent(new Event("change")));
      return { pret: () => U.norm(ta.value) !== U.norm(q.texte), lire: () => ta.value };
    },
    corriger(q, lu, zone) {
      const ta = U.$("textarea", zone); ta.disabled = true;
      U.$$("[data-remettre]", zone).forEach((b) => b.remove());
      const e = ecarts(decoupe(lu), decoupe(q.attendu));
      const pts = Math.max(0, 2 - 0.5 * e.n), ok = e.n === 0;
      const vu = e.ops.map((o) => o.k === "=" ? U.esc(o.t) : o.k === "~" ? `<del>${U.esc(o.x)}</del> <ins>${U.esc(o.t)}</ins>` : o.k === "+" ? `<ins>${U.esc(o.t)}</ins>` : `<del>${U.esc(o.x)}</del>`);
      const html = ok ? "" : `<p>${e.n} erreur${e.n > 1 ? "s" : ""} (−0,5 point chacune). En vert, ce qu'il fallait écrire ; barré, ce qui est en trop ou faux :</p><p class="diff support">${U.typo(recolle(vu))}</p>`;
      return { ok, pts, rep: U.norm(lu), att: q.attendu, html, partiel: !ok && pts > 0 };
    },
  };

  // ------------------------------------------------------------------ une question à l'écran
  // FR.question(q, conteneur, { onFin(res) }) : affiche consigne, support, réponse, bouton Valider, puis la correction.
  FR.question = function (q, cont, o) {
    o = o || {};
    const type = T[q.type];
    if (!type) throw new Error("type de question inconnu : " + q.type);
    cont.innerHTML = `${q.palier ? `<div class="palier">${["", "Je découvre", "Je m'entraîne", "Je vais plus loin"][q.palier] || ""}</div>` : ""}
      <div class="consigne">${q.consigne}</div>
      ${q.support ? `<div class="support">${q.support}</div>` : ""}
      <div class="zone-rep"></div>
      <div class="actions"><button type="button" class="btn principal" data-valider disabled>Valider</button></div>
      <div class="zone-retour" aria-live="polite"></div>`;
    const zone = U.$(".zone-rep", cont), btn = U.$("[data-valider]", cont), retour = U.$(".zone-retour", cont);
    const r = type.rendu(q, zone);
    const maj = () => { btn.disabled = !r.pret(); };
    zone.addEventListener("change", maj);
    const valider = () => {
      if (zone.dataset.fini || !r.pret()) return;
      zone.dataset.fini = "1";
      const res = type.corriger(q, r.lire(), zone);
      btn.remove();
      const cls = res.ok ? "ok" : res.partiel ? "mi" : "ko";
      retour.innerHTML = `<div class="retour ${cls}">
        <div class="titre">${res.ok ? "✓ Bravo !" : res.partiel ? "≈ Presque" : "✗ Pas tout à fait"}<span class="discret" style="margin-left:auto">${U.nf(res.pts)} / 2</span></div>
        ${!res.ok && q.type !== "reecriture" ? `<div class="attendu">La bonne réponse : <b>${U.esc(U.typo(res.att))}</b></div>` : ""}
        ${res.html || ""}
        ${q.correction ? `<div class="correction">${q.correction}</div>` : ""}
      </div>`;
      if (o.onFin) o.onFin(res, retour);
    };
    btn.addEventListener("click", valider);
    zone.addEventListener("valider", valider);
    maj();
    return { valider };
  };

  // ------------------------------------------------------------------ séries
  // Une notion (contenu/catalogue.js) donne gen(palier, niveau, ctx) → question. ctx.deja : clés déjà tirées.
  FR.serie = {
    COMPO: { 1: 4, 2: 3, 3: 3 },
    construire(notion, niveau) {
      const compo = (notion.compo && (notion.compo[niveau] || notion.compo.tous)) || FR.serie.COMPO;
      const vus = U.lsGet("fr_vus_" + notion.id, []);
      const ctx = { deja: new Set(), vus: new Set(vus), niveau };
      const qs = [];
      for (const p of [1, 2, 3]) {
        for (let k = 0; k < (compo[p] || 0); k++) {
          let q = null;
          for (let essai = 0; essai < 40 && !q; essai++) {
            const c = notion.gen(p, niveau, ctx);
            if (!c) continue;
            const cle = c.cle || c.consigne + "|" + (c.support || "");
            if (ctx.deja.has(cle) || (essai < 25 && ctx.vus.has(cle))) continue;
            ctx.deja.add(cle); c.cle = cle; c.palier = c.palier || p; q = c;
          }
          if (q) qs.push(q);
        }
      }
      U.lsSet("fr_vus_" + notion.id, vus.concat(Array.from(ctx.deja)).slice(-80));
      return qs;
    },
  };

  // ------------------------------------------------------------------ textes à lire (contenu/lectures.js)
  // passages d'un texte : { p (paragraphe), t (texte), nom (nom de personnage), dida (didascalie) }
  FR.passages = function (tx) {
    const l = [];
    tx.par.forEach((par, p) => par.forEach((t) => l.push({ p, t: t.replace(/^#/, ""), nom: t.startsWith("#"), dida: t.startsWith("(") })));
    return l;
  };
  // un passage attendu est désigné par son début (« Hina poussa un cri ») : comparaison souple (apostrophes, espaces)
  FR.passageVise = (pas, debuts) => !pas.nom && debuts.some((d) => U.norm(pas.t).startsWith(U.norm(d)));

  // ------------------------------------------------------------------ aides pour écrire les générateurs
  const G = (FR.gen = {});
  // QCM : bonne réponse + distracteurs (avec, si on veut, pourquoi chacun est faux)
  G.choix = function (o) {
    const choix = [o.bon].concat(o.faux.map((f) => (Array.isArray(f) ? f[0] : f)));
    const pourquoi = [""].concat(o.faux.map((f) => (Array.isArray(f) ? f[1] : "")));
    return Object.assign({ type: "choix", choix, ok: 0, pourquoi }, o.q);
  };
  // phrase annotée → mots cliquables ; ok(t, i) dit si le mot est à choisir
  G.clic = function (P, ok, q) {
    const mots = P.toks.map((t, i) => ({ t: t.t, ponct: t.ponct, sel: !t.ponct && t.c !== "x", ok: !t.ponct && t.c !== "x" && !!ok(t, i) }));
    return Object.assign({ type: "clic", multi: true }, q, { mots });
  };
})();
