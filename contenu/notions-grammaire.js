/* =====================================================================
   Français au collège — notions de GRAMMAIRE
   Le verbe conjugué · Le sujet · Les classes grammaticales (méthode DNB) · Les fonctions · Les propositions
   Les questions sont tirées des phrases annotées (contenu/phrases.js) et de petites banques écrites ici.
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, G = FR.gen;
  const NUM = { "6e": 6, "5e": 5, "4e": 4, "3e": 3 };
  let cache = null;
  const corpus = () => cache || (cache = FR.B.phrases.map(([n, s], k) => ({ n, k, P: FR.phrase(s) })));
  const phrasesPour = (niv, f) => corpus().filter((e) => e.n >= NUM[niv] && (!f || f(e.P)));
  const brut = (P) => FR.texteMots(P.toks);
  const motsDe = (P, de, a) => FR.texteMots(P.toks, de, a);

  // ------------------------------------------------------------------ classes
  const LIB = { N: "nom", D: "déterminant", A: "adjectif", V: "verbe", PR: "pronom", ADV: "adverbe", P: "préposition",
    CC: "conjonction de coordination", CS: "conjonction de subordination", PRR: "pronom relatif" };
  const ART = { N: "un nom", D: "un déterminant", A: "un adjectif", V: "un verbe", PR: "un pronom", ADV: "un adverbe", P: "une préposition",
    CC: "une conjonction de coordination", CS: "une conjonction de subordination", PRR: "un pronom relatif" };
  const POOL = { "6e": ["N", "D", "A", "V", "PR", "ADV", "P", "CC"], "5e": ["N", "D", "A", "V", "PR", "ADV", "P", "CC"],
    "4e": ["N", "D", "A", "V", "PR", "ADV", "P", "CC", "CS"], "3e": ["N", "D", "A", "V", "PR", "ADV", "P", "CC", "CS", "PRR"] };
  const classeDe = (t, niv) => {
    let c = t.c; if (!c || c === "x") return null;
    if (c === "NP") c = "N"; if (c === "VI" || c === "VP") c = "V";
    if (c === "PRR" && niv !== "3e") c = "PR"; if (c === "CS" && !POOL[niv].includes("CS")) return null;
    return c;
  };
  const REGLE = {
    N: "Un <b>nom</b> désigne une personne, un animal, une chose ou une idée. On peut mettre un déterminant devant et lui ajouter un adjectif.",
    D: "Un <b>déterminant</b> se place devant le nom et l'annonce (le, une, mon, ce, chaque, deux…). On peut le remplacer par un autre déterminant.",
    A: "Un <b>adjectif</b> donne une précision sur le nom et s'accorde avec lui. On peut souvent lui ajouter « très ».",
    V: "Un <b>verbe</b> se conjugue : il change avec le temps et la personne. Conjugué, on peut l'encadrer par ne… pas.",
    PR: "Un <b>pronom</b> remplace un nom ou un groupe nominal (il, elle, la, lui, leur, nous…). On peut le remplacer par le groupe qu'il reprend.",
    ADV: "Un <b>adverbe</b> ne change jamais (invariable). Il précise un verbe, un adjectif ou toute la phrase. Souvent, on peut le supprimer ou le déplacer.",
    P: "Une <b>préposition</b> ne change jamais. Elle introduit un groupe de mots : à, de, dans, sur, sous, avec, pour, vers, chez…",
    CC: "Une <b>conjonction de coordination</b> relie deux mots, deux groupes ou deux propositions : mais, ou, et, donc, or, ni, car (« donc » est aujourd'hui classé parmi les adverbes de liaison).",
    CS: "Une <b>conjonction de subordination</b> introduit une proposition subordonnée : que, quand, lorsque, si, comme, puisque…",
    PRR: "Un <b>pronom relatif</b> (qui, que, dont, où…) reprend un nom placé avant lui (l'antécédent) et introduit une proposition subordonnée relative.",
  };
  // distracteurs proches pour chaque classe
  const PROCHES = { N: ["A", "V", "D"], D: ["PR", "A", "P"], A: ["N", "ADV", "V"], V: ["N", "A", "ADV"], PR: ["D", "N", "ADV"],
    ADV: ["A", "P", "CC"], P: ["ADV", "CC", "D"], CC: ["P", "ADV", "CS"], CS: ["PRR", "CC", "P"], PRR: ["CS", "PR", "D"] };
  function distracteurs(c, niv, n) {
    const pool = POOL[niv].filter((x) => x !== c && !(c === "PR" && x === "PRR") && !(c === "PRR" && x === "PR"));
    const proches = (PROCHES[c] || []).filter((x) => pool.includes(x));
    return U.uniq(proches.concat(U.shuffle(pool))).slice(0, n);
  }

  function qClasseSouligne(niv, cibles, ctx) {
    const e = U.pick(phrasesPour(niv, (P) => P.toks.some((t) => cibles.includes(classeDe(t, niv)))));
    if (!e) return null;
    const ix = e.P.toks.map((t, i) => (cibles.includes(classeDe(t, niv)) ? i : -1)).filter((i) => i >= 0);
    const i = U.pick(ix), t = e.P.toks[i], c = classeDe(t, niv);
    return G.choix({
      bon: LIB[c], faux: distracteurs(c, niv, 3).map((x) => LIB[x]),
      q: { consigne: "Quelle est la classe grammaticale du mot souligné ?", support: FR.phraseSoulignee(e.P, i, i),
        correction: `<p>${REGLE[c]}</p>`, cle: "cs|" + e.k + "|" + i, donnees: { phrase: brut(e.P), mot: t.t } },
    });
  }
  const PLURIEL = { N: "tous les noms (communs et propres)", D: "tous les déterminants", A: "tous les adjectifs", V: "tous les verbes (conjugués ou à l'infinitif)",
    PR: "tous les pronoms", ADV: "tous les adverbes", P: "toutes les prépositions", CC: "toutes les conjonctions de coordination",
    CS: "toutes les conjonctions de subordination", PRR: "tous les pronoms relatifs" };
  function qClicClasse(niv, cibles) {
    const c = U.pick(cibles);
    const e = U.pick(phrasesPour(niv, (P) => { const n = P.toks.filter((t) => classeDe(t, niv) === c).length; return n >= 1 && n <= 4; }));
    if (!e) return null;
    return G.clic(e.P, (t) => classeDe(t, niv) === c, {
      consigne: `Clique sur ${PLURIEL[c]} de la phrase.`, correction: `<p>${REGLE[c]}</p>`, cle: "cc|" + c + "|" + e.k,
    });
  }

  // méthode DNB : « Le mot "…" est un … car on peut le déplacer / le remplacer / lui ajouter un mot / le supprimer / l'encadrer »
  const GESTES = ["le déplacer", "le remplacer", "lui ajouter un mot", "le supprimer", "l'encadrer"];
  const DNB = [  // [niveau min, phrase, mot, classe, geste (index), exemple]
    [6, "Le requin nage lentement.", "lentement", "ADV", 3, "Le requin nage."],
    [6, "Le requin nage lentement.", "lentement", "ADV", 0, "Lentement, le requin nage."],
    [6, "Teva lance le ballon.", "lance", "V", 4, "Teva ne lance pas le ballon."],
    [6, "La pirogue glisse.", "pirogue", "N", 2, "La longue pirogue glisse."],
    [6, "La pirogue glisse.", "La", "D", 1, "Cette pirogue glisse."],
    [6, "Le lagon est calme.", "calme", "A", 2, "Le lagon est très calme."],
    [6, "Une vague immense arrive.", "immense", "A", 3, "Une vague arrive."],
    [6, "Il répare son filet.", "Il", "PR", 1, "Le pêcheur répare son filet."],
    [6, "Hina mange une mangue.", "une", "D", 1, "Hina mange cette mangue."],
    [6, "Le chat dort sous la table.", "sous", "P", 1, "Le chat dort sur la table."],
    [6, "Teva court vite mais il tombe.", "mais", "CC", 1, "Teva court vite et il tombe."],
    [6, "Nous partirons demain.", "demain", "ADV", 0, "Demain, nous partirons."],
    [6, "Elle chante une chanson douce.", "douce", "A", 3, "Elle chante une chanson."],
    [6, "Ils rament vers l'île.", "rament", "V", 4, "Ils ne rament pas vers l'île."],
    [6, "Mon frère deviendra pêcheur.", "Mon", "D", 1, "Ton frère deviendra pêcheur."],
    [6, "Le soleil brille.", "soleil", "N", 2, "Le soleil brûlant brille."],
    [6, "Elle lit un livre.", "Elle", "PR", 1, "Hina lit un livre."],
    [6, "La mer est très belle.", "très", "ADV", 3, "La mer est belle."],
    [6, "Le vent souffle.", "souffle", "V", 4, "Le vent ne souffle pas."],
    [6, "Le pêcheur répare son filet.", "son", "D", 1, "Le pêcheur répare ce filet."],
    [5, "Je la vois chaque matin.", "la", "PR", 1, "Je vois Hina chaque matin."],
    [5, "Nous leur écrivons une lettre.", "leur", "PR", 1, "Nous écrivons une lettre à nos cousins."],
    [5, "Les enfants retrouvent leur chien.", "leur", "D", 1, "Les enfants retrouvent ce chien."],
    [5, "Le guerrier lève sa lance.", "lance", "N", 2, "Le guerrier lève sa lance pointue."],
    [5, "Souvent, le héros doute.", "Souvent", "ADV", 3, "Le héros doute."],
    [4, "Le roi écoute Chimène mais il hésite.", "écoute", "V", 4, "Le roi n'écoute pas Chimène mais il hésite."],
    [4, "La comédienne salue le public.", "public", "N", 2, "La comédienne salue le public enthousiaste."],
    [3, "L'auteur raconte son enfance heureuse.", "heureuse", "A", 3, "L'auteur raconte son enfance."],
    [3, "Autrefois, l'île était calme.", "Autrefois", "ADV", 0, "L'île était calme autrefois."],
  ];
  function qMethodeDNB(niv, ctx) {
    const l = DNB.map((x, k) => [x, k]).filter(([x]) => x[0] >= NUM[niv]);
    const [x, k] = U.pick(l);
    const pool = POOL[niv].filter((c) => c !== "PRR");
    const opts = U.uniq([x[3]].concat(U.shuffle(pool.filter((c) => c !== x[3])).slice(0, 4)));
    return {
      type: "trous", cle: "dnb|" + k,
      consigne: `Justifie la classe du mot avec la <b>méthode DNB</b>. Phrase : « ${U.esc(U.typo(x[1]))} »`,
      phr: [`Le mot « ${x[2]} » est `, { o: opts.map((c) => ART[c]), ok: 0, m: `Le mot « ${x[2]} » est ${ART[x[3]]}.` },
        " car on peut ", { o: GESTES, ok: x[4], m: `Regarde l'exemple : il montre qu'on peut ${GESTES[x[4]]}.` },
        ` : « ${x[5]} »`],
      correction: `<p>${REGLE[x[3]]}</p><p class="astuce">Méthode DNB : « Le mot "…" est (classe) car on peut le déplacer / le remplacer / lui ajouter un mot / le supprimer / l'encadrer », puis un exemple qui montre ce geste.</p>`,
    };
  }
  // mots à deux visages : la / le / les / leur (déterminant ou pronom), que (pronom relatif ou conjonction)
  function qDeuxVisages(niv) {
    const MOTS = niv === "3e" || niv === "4e" ? ["la", "le", "les", "leur", "l'", "que", "qu'"] : ["la", "le", "les", "leur", "l'"];
    const e = U.pick(phrasesPour(niv, (P) => P.toks.some((t) => MOTS.includes(t.t.toLowerCase()) && ["D", "PR", "PRR", "CS"].includes(t.c))));
    if (!e) return null;
    const ix = e.P.toks.map((t, i) => (MOTS.includes(t.t.toLowerCase()) && ["D", "PR", "PRR", "CS"].includes(t.c) ? i : -1)).filter((i) => i >= 0);
    // on privilégie les pronoms et les « que » (plus rares)
    const rares = ix.filter((i) => e.P.toks[i].c !== "D"), i = rares.length && Math.random() < 0.7 ? U.pick(rares) : U.pick(ix);
    const t = e.P.toks[i];
    const estQue = /^qu/.test(t.t.toLowerCase());
    const c = estQue ? (t.c === "PRR" ? (niv === "3e" ? "PRR" : "PR") : "CS") : t.c;
    const opts = estQue ? (niv === "3e" ? ["PRR", "CS", "D"] : ["PR", "CS", "D"]) : ["D", "PR", "ADV"];
    const pourquoi = estQue
      ? (c === "CS" ? "Ici « que » ne reprend aucun nom : il relie le verbe à la proposition qui suit. C'est une conjonction de subordination." : "Ici « que » reprend le nom placé juste avant (son antécédent) : c'est un pronom relatif.")
      : (c === "D" ? `Ici « ${t.t} » est devant un nom : c'est un déterminant.` : `Ici « ${t.t} » est devant un verbe et remplace un groupe nominal : c'est un pronom.`);
    return G.choix({ bon: LIB[c], faux: opts.filter((x) => x !== c).map((x) => LIB[x]),
      q: { consigne: `Dans cette phrase, quelle est la classe du mot souligné « ${U.esc(U.typo(t.t))} » ?`, support: FR.phraseSoulignee(e.P, i, i),
        correction: `<p>${pourquoi}</p><p class="astuce">Astuce : devant un <b>nom</b>, c'est un déterminant ; devant un <b>verbe</b>, c'est un pronom.</p>`, cle: "dv|" + e.k + "|" + i } });
  }

  // ------------------------------------------------------------------ verbe conjugué
  const formes = (P) => FR.formesVerbales(P);
  const aInf = (P) => P.toks.some((t) => t.c === "VI");
  const lemmeDe = (P, f) => P.toks[f[f.length - 1]].lemme || P.toks[f[0]].lemme;
  const ACCROCHE = "Clique sur le verbe conjugué. À un temps composé, il est formé de deux mots (ex. « a mangé ») : clique sur les deux.";
  const REGLE_VERBE = `<p>Un <b>verbe conjugué</b> change quand on change le temps (hier, demain) ou la personne. On peut l'encadrer par <b>ne… pas</b>. L'infinitif (manger, finir, prendre) n'est pas conjugué.</p>`;
  function negation(P) {   // « ne… pas » autour du verbe conjugué, si la phrase s'y prête
    const f = formes(P);
    if (f.length !== 1 || P.toks.some((t) => t.t === "ne" || t.t === "pas" || t.t === "jamais")) return null;
    const i0 = f[0][0], S = P.groupes.find((g) => g.f === "S");
    if (!S || S.a >= i0) return null;
    let j = i0; while (j - 1 > S.a && P.toks[j - 1].c === "PR") j--;
    if (j - 1 !== S.a) return null;
    const out = [];
    P.toks.forEach((t, i) => {
      if (i === j) out.push(/^[aeéèêiouyhâ]/i.test(P.toks[j].t) ? { t: "n'", c: "ADV" } : { t: "ne", c: "ADV" });
      out.push(t);
      if (i === i0) out.push({ t: "pas", c: "ADV" });
    });
    return FR.texteMots(out);
  }
  function qVerbeClic(niv, palier) {
    if (palier === 1) {
      const e = U.pick(phrasesPour(niv, (P) => formes(P).length === 1 && !aInf(P) && formes(P)[0].length === 1));
      return G.clic(e.P, (t) => t.v != null, { consigne: ACCROCHE, correction: REGLE_VERBE, cle: "vc|" + e.k });
    }
    if (palier === 2) {
      const e = U.pick(phrasesPour(niv, (P) => formes(P).length >= 2 || (formes(P).length === 1 && formes(P)[0].length === 2)));
      return G.clic(e.P, (t) => t.v != null, { consigne: "Clique sur tous les verbes conjugués de la phrase (deux mots pour un temps composé).", correction: REGLE_VERBE, cle: "vc|" + e.k });
    }
    const e = U.pick(phrasesPour(niv, (P) => aInf(P)));
    return G.clic(e.P, (t) => t.v != null, { consigne: "Clique <b>seulement</b> sur le verbe conjugué : pas sur le verbe à l'infinitif.",
      correction: REGLE_VERBE + `<p class="astuce">Un verbe à l'infinitif suit souvent un autre verbe (« veut <u>devenir</u> », « aime <u>cuisiner</u> ») : il ne change pas avec la personne.</p>`, cle: "vi|" + e.k });
  }
  function qInfinitif(niv, palier) {
    const e = U.pick(phrasesPour(niv, (P) => formes(P).some((f) => lemmeDe(P, f)) && (palier < 3 ? formes(P).every((f) => f.length === 1) : formes(P).some((f) => f.length > 1 || /^(être|avoir|aller|faire|devenir|pouvoir|vouloir|savoir|voir|venir)$/.test(lemmeDe(P, f))))));
    if (!e) return null;
    const f = U.pick(formes(e.P).filter((x) => lemmeDe(e.P, x))), inf = lemmeDe(e.P, f), forme = motsDe(e.P, f[0], f[f.length - 1]);
    const F = FR.B.formes && FR.B.formes[inf];
    const faux = [];
    if (F) { const pc = ((F.t.PC.il || [])[0] || "").split(" ").pop(); const imp = (F.t.I.il || [])[0]; [pc, imp].forEach((x) => { if (x && x !== inf) faux.push(x); }); }
    if (/er$/.test(inf)) faux.push(inf.slice(0, -2) + "ez");
    faux.push(...U.shuffle(["finir", "prendre", "voir", "aller", "faire", "dormir"].filter((x) => x !== inf)));
    return G.choix({ bon: inf, faux: U.uniq(faux.filter((x) => U.norm(x) !== U.norm(forme.replace(/<[^>]+>/g, "")))).slice(0, 3),
      q: { consigne: `Quel est l'infinitif du verbe souligné ?`, support: FR.phraseSoulignee(e.P, f[0], f[f.length - 1]),
        correction: `<p>L'infinitif est le nom du verbe, la forme qu'on trouve dans le dictionnaire. Pour le trouver : « il faut… » + verbe (« il faut <b>${inf}</b> »).</p>`, cle: "inf|" + e.k + "|" + f[0] } });
  }
  function qNegation(niv) {
    const l = phrasesPour(niv, (P) => !!negation(P));
    const e = U.pick(l); if (!e) return null;
    const f = formes(e.P)[0], v = motsDe(e.P, f[0], f[f.length - 1]);
    return G.choix({ bon: `On peut l'encadrer par ne… pas : « ${negation(e.P)} »`,
      faux: [["On peut lui ajouter un adjectif.", "On ajoute un adjectif à un nom, pas à un verbe."], ["On peut le supprimer sans changer le sens.", "Sans son verbe, la phrase ne veut plus rien dire."], ["On peut le remplacer par un déterminant.", "Un déterminant se place devant un nom."]],
      q: { consigne: `Comment prouver que « ${v} » est un verbe conjugué ?`, support: U.esc(U.typo(brut(e.P))), correction: REGLE_VERBE, cle: "neg|" + e.k } });
  }

  // ------------------------------------------------------------------ sujet
  function segments(P, cible) {   // groupes de premier niveau + mots isolés ; cible : groupe à trouver
    const top = P.groupes.filter((g) => !P.groupes.some((h) => h !== g && h.de <= g.de && h.a >= g.a && (h.a - h.de) > (g.a - g.de)));
    const segs = []; let i = 0;
    while (i < P.toks.length) {
      const g = top.find((x) => x.de === i);
      if (g) { segs.push({ h: U.esc(U.typo(motsDe(P, g.de, g.a))), ok: g === cible }); i = g.a + 1; continue; }
      const t = P.toks[i];
      segs.push(t.ponct ? { h: U.esc(t.t), sel: false } : { h: U.esc(U.typo(t.t)), ok: false });
      i++;
    }
    // ponctuation collée au segment précédent
    const out = [];
    segs.forEach((s) => { if (s.sel === false && out.length && /^[.,;:!?…]$/.test(s.h)) { out[out.length - 1].h += s.h.replace(/^([;:!?])$/, " $1"); } else out.push(s); });
    return out;
  }
  const TONIQUE = { je: "moi", "j'": "moi", tu: "toi", il: "lui", elle: "elle", nous: "nous", vous: "vous", ils: "eux", elles: "elles", on: "on" };
  function cestQui(P, S, f) {
    let s = motsDe(P, S.de, S.a);
    const premier = P.toks[S.de].t.toLowerCase(), plur = /^(les|des|mes|tes|ses|nos|vos|leurs|ces|deux|ils|elles)$/.test(premier) || /\bet\b/.test(s);
    if (S.de === S.a && TONIQUE[premier]) s = TONIQUE[premier];
    else s = s.charAt(0).toLowerCase() === s.charAt(0) ? s : (P.toks[S.de].c === "NP" ? s : s.charAt(0).toLowerCase() + s.slice(1));
    // la suite de la phrase après le sujet (ou le verbe seul si le sujet est inversé)
    const fin = P.toks.length - 1 - (P.toks[P.toks.length - 1].ponct ? 1 : 0);
    const v = S.a < f[0] ? motsDe(P, S.a + 1, fin) : motsDe(P, f[0], f[f.length - 1]);
    return `${plur && !/^(nous|vous)$/.test(s) ? "Ce sont" : "C'est"} ${s} qui ${v}.`;
  }
  function sujetDe(P, f) {   // groupe sujet du verbe f : le plus proche avant lui, sinon juste après (sujet inversé)
    const avant = P.groupes.filter((g) => g.f === "S" && g.a < f[0]).sort((a, b) => b.a - a.a)[0];
    if (avant) return avant;
    return P.groupes.find((g) => g.f === "S" && g.de > f[f.length - 1]) || null;
  }
  function qSujet(niv, palier) {
    const filtre = (P) => {
      const fs = formes(P), S = P.groupes.filter((g) => g.f === "S");
      if (!fs.length || !S.length || P.toks.some((t) => t.c === "PRR" || t.c === "CS")) return false;
      if (palier === 1) return fs.length === 1 && S.length === 1 && S[0].a < fs[0][0] && P.toks[S[0].de].c !== "PR";
      if (palier === 2) return fs.length === 1 && S.length === 1 && (S[0].de > fs[0][0] || P.groupes.some((g) => g.f === "CN" && g.de > S[0].de && g.a <= S[0].a) || P.toks.some((t, i) => t.c === "PR" && i > S[0].a && i < fs[0][0]));
      return fs.length >= 2 && fs.every((f) => sujetDe(P, f));
    };
    const e = U.pick(phrasesPour(niv, filtre)) || U.pick(phrasesPour(niv, (P) => formes(P).length === 1 && P.groupes.some((g) => g.f === "S")));
    if (!e) return null;
    const f = palier === 3 ? U.pick(formes(e.P)) : formes(e.P)[0], S = sujetDe(e.P, f);
    if (!S) return null;
    const v = motsDe(e.P, f[0], f[f.length - 1]);
    return { type: "segment", consigne: `Touche le <b>sujet</b> du verbe « ${U.esc(U.typo(v))} ».`, segs: segments(e.P, S), cle: "suj|" + e.k + "|" + f[0],
      correction: `<p>Pour trouver le sujet, encadre-le par « C'est… qui » (ou « Ce sont… qui ») : <b>${U.esc(U.typo(cestQui(e.P, S, f)))}</b></p><p class="astuce">Le sujet peut être loin du verbe ou placé après lui. Un pronom (la, le, lui…) entre le sujet et le verbe n'est pas le sujet.</p>` };
  }

  // ------------------------------------------------------------------ fonctions
  const FPOOL = { "5e": ["S", "COD", "COI", "ATT", "CP", "CN", "EPI"], "4e": ["S", "COD", "COI", "ATT", "CP", "CN", "EPI", "CAG", "APP"], "3e": ["S", "COD", "COI", "ATT", "CP", "CN", "EPI", "CAG", "APP"] };
  const FLIB = { S: "sujet", COD: "COD (complément d'objet direct)", COI: "COI (complément d'objet indirect)", ATT: "attribut du sujet",
    CP: "complément de phrase (circonstanciel)", CN: "complément du nom", EPI: "épithète", CAG: "complément d'agent", APP: "apposition" };
  const FREGLE = {
    S: "Le <b>sujet</b> dit qui fait l'action (ou de qui on parle). Il commande l'accord du verbe. On le trouve avec « C'est… qui ».",
    COD: "Le <b>COD</b> complète le verbe <b>sans préposition</b> ; il répond à « quoi ? » ou « qui ? » après le verbe. On ne peut ni le supprimer ni le déplacer.",
    COI: "Le <b>COI</b> complète le verbe <b>avec une préposition</b> (à, de) ; il répond à « à qui ? », « à quoi ? », « de quoi ? ».",
    ATT: "L'<b>attribut du sujet</b> donne une caractéristique du sujet, après un verbe d'état : être, sembler, devenir, paraître, rester, demeurer.",
    CP: "Le <b>complément de phrase</b> (complément circonstanciel) dit où, quand, comment, pourquoi… On peut le <b>supprimer</b> et le <b>déplacer</b>.",
    CN: "Le <b>complément du nom</b> précise un nom ; il est souvent introduit par une préposition (de, à, en…). Une proposition relative complète aussi un nom.",
    EPI: "L'<b>épithète</b> est un adjectif placé tout près du nom qu'il précise, sans verbe entre eux.",
    CAG: "Le <b>complément d'agent</b> dit qui fait l'action dans une phrase à la <b>voix passive</b> ; il commence par « par » (parfois « de »).",
    APP: "L'<b>apposition</b> est détachée par des virgules et donne une information sur un nom.",
  };
  function qFonction(niv, palier) {
    const pool = FPOOL[niv] || FPOOL["5e"];
    const cibles = palier === 1 ? ["S", "COD", "ATT", "CP"] : palier === 2 ? ["COI", "CN", "EPI", "COD", "CP"] : pool.filter((f) => !["S"].includes(f));
    const e = U.pick(phrasesPour(niv, (P) => P.groupes.some((g) => cibles.includes(g.f) && pool.includes(g.f))));
    if (!e) return null;
    const gs = e.P.groupes.filter((g) => cibles.includes(g.f) && pool.includes(g.f));
    const g = U.pick(gs);
    const proches = { S: ["COD", "ATT", "CP"], COD: ["COI", "ATT", "S"], COI: ["COD", "CP", "CN"], ATT: ["COD", "EPI", "S"], CP: ["COD", "COI", "CN"],
      CN: ["COI", "CP", "EPI"], EPI: ["ATT", "CN", "APP"], CAG: ["COI", "CP", "CN"], APP: ["EPI", "S", "CN"] }[g.f].filter((x) => pool.includes(x));
    return G.choix({ bon: FLIB[g.f], faux: U.uniq(proches.concat(U.shuffle(pool))).filter((x) => x !== g.f).slice(0, 3).map((x) => FLIB[x]),
      q: { consigne: "Quelle est la fonction du groupe souligné ?", support: FR.phraseSoulignee(e.P, g.de, g.a), correction: `<p>${FREGLE[g.f]}</p>`, cle: "fn|" + e.k + "|" + g.de + "-" + g.a } });
  }
  function qFonctionSegment(niv) {
    const pool = (FPOOL[niv] || FPOOL["5e"]).filter((f) => ["COD", "COI", "ATT", "CP", "S", "CAG"].includes(f));
    const f = U.pick(pool);
    const e = U.pick(phrasesPour(niv, (P) => {
      const top = P.groupes.filter((g) => !P.groupes.some((h) => h !== g && h.de <= g.de && h.a >= g.a && (h.a - h.de) > (g.a - g.de)));
      return top.filter((g) => g.f === f).length === 1;
    }));
    if (!e) return null;
    const top = e.P.groupes.filter((g) => !e.P.groupes.some((h) => h !== g && h.de <= g.de && h.a >= g.a && (h.a - h.de) > (g.a - g.de)));
    const g = top.find((x) => x.f === f);
    const nom = { S: "le sujet", COD: "le COD", COI: "le COI", ATT: "l'attribut du sujet", CP: "le complément de phrase", CAG: "le complément d'agent" }[f];
    return { type: "segment", consigne: `Touche ${nom} dans cette phrase.`, segs: segments(e.P, g), correction: `<p>${FREGLE[f]}</p>`, cle: "fs|" + e.k + "|" + f };
  }

  // ------------------------------------------------------------------ propositions (4e, 3e)
  const PROPS = [  // [niveau min, phrase, nombre de propositions, lien, type de subordonnée ou null]
    [4, "Le vent souffle, la pluie tombe.", 2, "juxtaposées", null],
    [4, "Le vent souffle et la pluie tombe.", 2, "coordonnées", null],
    [4, "Le vent souffle quand la pluie tombe.", 2, "subordonnée", "circonstancielle"],
    [4, "Teva court vite mais il tombe.", 2, "coordonnées", null],
    [4, "Hina rit ; ses amies chantent.", 2, "juxtaposées", null],
    [4, "Je pense que tu as raison.", 2, "subordonnée", "complétive"],
    [4, "Le garçon qui court est mon cousin.", 2, "subordonnée", "relative"],
    [4, "La plage que je préfère est immense.", 2, "subordonnée", "relative"],
    [4, "Nous partirons quand la pluie cessera.", 2, "subordonnée", "circonstancielle"],
    [4, "Les pêcheurs rentrent car la mer est forte.", 2, "coordonnées", null],
    [4, "Le soleil se couche, les crabes sortent, la plage se vide.", 3, "juxtaposées", null],
    [4, "Le rideau tombe.", 1, "simple", null],
    [4, "Le public applaudit les comédiens.", 1, "simple", null],
    [4, "Rodrigue aime Chimène, mais il doit venger son père.", 2, "coordonnées", null],
    [4, "Le roi écoute Chimène, puis il hésite.", 2, "juxtaposées", null],
    [3, "Les élèves savent que le brevet approche.", 2, "subordonnée", "complétive"],
    [3, "Comme il pleuvait, le match a été annulé.", 2, "subordonnée", "circonstancielle"],
    [3, "Le livre dont je parle est passionnant.", 2, "subordonnée", "relative"],
    [3, "La ville où j'habite est petite.", 2, "subordonnée", "relative"],
    [3, "Si tu viens, nous irons à la plage.", 2, "subordonnée", "circonstancielle"],
    [3, "Le témoin affirme qu'il a vu la lumière.", 2, "subordonnée", "complétive"],
    [3, "Bien que la mer soit calme, les pêcheurs restent au port.", 2, "subordonnée", "circonstancielle"],
    [3, "J'espère que tu viendras.", 2, "subordonnée", "complétive"],
    [3, "Les habitants qui vivaient près du site ont quitté leur île.", 2, "subordonnée", "relative"],
  ];
  const PREGLE = `<p>Il y a autant de <b>propositions</b> que de <b>verbes conjugués</b>.</p>
    <p>Elles sont <b>juxtaposées</b> (séparées par une virgule, un point-virgule ou deux-points), <b>coordonnées</b> (reliées par mais, ou, et, donc, or, ni, car) ou l'une est <b>subordonnée</b> à l'autre (introduite par qui, que, dont, où, quand, si, comme, parce que…).</p>`;
  function qPropositions(niv, palier) {
    const l = PROPS.map((x, k) => [x, k]).filter(([x]) => x[0] >= NUM[niv]);
    const [x, k] = U.pick(palier === 3 && niv === "3e" ? l.filter(([y]) => y[4]) : l);
    if (palier === 1) return G.choix({ bon: String(x[2]), faux: ["1", "2", "3", "4"].filter((n) => n !== String(x[2])).slice(0, 3),
      q: { consigne: "Combien de propositions cette phrase contient-elle ?", support: U.esc(U.typo(x[1])), correction: PREGLE, cle: "pn|" + k, melanger: false } });
    if (palier === 2 || niv !== "3e" || !x[4]) {
      const LIEN = { juxtaposées: "Des propositions juxtaposées", coordonnées: "Des propositions coordonnées", subordonnée: "Une proposition principale et une subordonnée", simple: "Une seule proposition (phrase simple)" };
      return G.choix({ bon: LIEN[x[3]], faux: Object.keys(LIEN).filter((y) => y !== x[3]).map((y) => LIEN[y]),
        q: { consigne: "Comment cette phrase est-elle construite ?", support: U.esc(U.typo(x[1])), correction: PREGLE, cle: "pl|" + k } });
    }
    const TYPE = { relative: "une subordonnée relative", complétive: "une subordonnée conjonctive complétive", circonstancielle: "une subordonnée conjonctive circonstancielle" };
    return G.choix({ bon: TYPE[x[4]], faux: Object.keys(TYPE).filter((y) => y !== x[4]).map((y) => TYPE[y]).concat(["une proposition indépendante"]),
      q: { consigne: "Quelle sorte de subordonnée cette phrase contient-elle ?", support: U.esc(U.typo(x[1])), cle: "pt|" + k,
        correction: `<p>La <b>relative</b> commence par un pronom relatif (qui, que, dont, où) et complète un nom. La <b>complétive</b> commence par « que » et complète le verbe (souvent COD). La <b>circonstancielle</b> dit quand, pourquoi, à quelle condition… (quand, comme, si, bien que, parce que).</p>` } });
  }

  // ------------------------------------------------------------------ fiches (leçons)
  const tableauClasses = (niv) => `<div class="tableau-scroll"><table><tr><th>Classe</th><th>À quoi la reconnaître</th><th>Exemples</th></tr>${POOL[niv].map((c) =>
    `<tr><td><b>${LIB[c]}</b></td><td>${REGLE[c].replace(/^Une? <b>[^<]+<\/b> /, "").replace(/^Un <b>[^<]+<\/b> /, "")}</td><td class="ex">${{ N: "pirogue, Teva, courage", D: "le, une, mon, cette, deux", A: "petit, bleue, courageux", V: "nage, avons visité, finir", PR: "il, elle, la, lui, leur", ADV: "vite, très, hier, ne… pas", P: "à, de, dans, sur, avec", CC: "mais, ou, et, or, ni, car", CS: "que, quand, si, comme", PRR: "qui, que, dont, où" }[c]}</td></tr>`).join("")}</table></div>`;

  FR.notion({
    id: "g-verbe", domaine: "grammaire", ordre: 1, niveaux: ["6e", "5e"], titre: "Le verbe conjugué",
    resume: "Repérer le verbe conjugué, trouver son infinitif, le prouver avec « ne… pas ».",
    fiche: () => `<h2>Reconnaître un verbe conjugué</h2>
      <div class="regle">Le <b>verbe conjugué</b> change quand on change le <b>temps</b> (hier, aujourd'hui, demain) ou la <b>personne</b> (je, tu, il…).</div>
      <h3>Les gestes du grammairien pour le prouver</h3>
      <ul><li><b>L'encadrer</b> par ne… pas : <span class="ex">Le requin <b>nage</b>. → Le requin <b>ne</b> nage <b>pas</b>.</span></li>
      <li><b>Le remplacer</b> en changeant le temps : <span class="ex">Le requin nage. → Hier, le requin <b>nageait</b>.</span></li></ul>
      <h3>Attention</h3>
      <div class="attention">À un <b>temps composé</b>, le verbe conjugué a <b>deux mots</b> : l'auxiliaire (avoir ou être) et le participe passé : <span class="ex">nous <b>avons visité</b>, elle <b>est allée</b>.</span></div>
      <div class="attention">Le verbe à l'<b>infinitif</b> n'est pas conjugué : <span class="ex">Teva veut <u>devenir</u> pilote.</span> Ici, seul « veut » est conjugué.</div>
      <h3>L'infinitif</h3><p>C'est le nom du verbe, celui du dictionnaire. Pour le trouver : « il faut… » : <span class="ex">nage → il faut <b>nager</b> ; dort → il faut <b>dormir</b>.</span></p>`,
    gen(p, niv) {
      if (p === 1) return Math.random() < 0.6 ? qVerbeClic(niv, 1) : qInfinitif(niv, 1);
      if (p === 2) return Math.random() < 0.55 ? qVerbeClic(niv, 2) : qNegation(niv);
      return Math.random() < 0.6 ? qVerbeClic(niv, 3) : qInfinitif(niv, 3);
    },
  });

  FR.notion({
    id: "g-sujet", domaine: "grammaire", ordre: 2, niveaux: ["6e", "5e"], titre: "Le sujet du verbe",
    resume: "Trouver le sujet avec « C'est… qui », même quand il est loin du verbe ou après lui.",
    fiche: () => `<h2>Trouver le sujet</h2>
      <div class="regle">Le <b>sujet</b> dit <b>qui fait l'action</b> (ou de qui on parle). C'est lui qui commande l'accord du verbe.</div>
      <h3>La méthode : « C'est… qui »</h3>
      <p class="ex">Le petit requin nage. → <b>C'est le petit requin qui</b> nage.</p>
      <p class="ex">Les enfants jouent. → <b>Ce sont les enfants qui</b> jouent.</p>
      <h3>Les pièges</h3>
      <div class="attention">Le sujet peut être <b>après</b> le verbe : <span class="ex">Sur la plage jouent <b>les enfants</b>.</span></div>
      <div class="attention">Le sujet peut être <b>long</b> : <span class="ex"><b>Les enfants de ma voisine</b> jouent.</span> (c'est « les enfants » qui jouent, pas « ma voisine »).</div>
      <div class="attention">Un pronom entre le sujet et le verbe n'est pas le sujet : <span class="ex"><b>Je</b> la vois.</span> (« la » est COD).</div>`,
    gen: (p, niv) => qSujet(niv, p),
  });

  FR.notion({
    id: "g-classes", domaine: "grammaire", ordre: 3, niveaux: ["6e", "5e", "4e", "3e"], titre: "Les classes grammaticales",
    resume: "Nom, déterminant, adjectif, verbe, pronom, adverbe… et la méthode DNB pour le justifier.",
    fiche: (niv) => `<h2>La classe grammaticale (la nature) d'un mot</h2>
      <p>Chaque mot appartient à une <b>classe</b>. Elle ne change pas selon la phrase… sauf pour quelques mots à deux visages (la, le, les, leur${niv === "4e" || niv === "3e" ? ", que" : ""}).</p>
      ${tableauClasses(niv)}
      <h3>La méthode DNB pour justifier</h3>
      <div class="regle">« Le mot "…" est un … (classe) <b>car on peut</b> le déplacer / le remplacer / lui ajouter un mot / le supprimer / l'encadrer », puis un <b>exemple</b> qui montre ce geste.</div>
      <p class="ex">Le mot « lentement » est un adverbe car on peut le supprimer : « Le requin nage. »</p>
      <div class="attention">Mots à deux visages : devant un <b>nom</b>, « la », « le », « les », « leur » sont des <b>déterminants</b> (<i>la</i> pirogue) ; devant un <b>verbe</b>, ce sont des <b>pronoms</b> (je <i>la</i> vois).</div>`,
    gen(p, niv) {
      const base1 = ["N", "D", "A", "V"], base2 = POOL[niv].filter((c) => !base1.includes(c) && c !== "PRR");
      if (p === 1) return Math.random() < 0.5 ? qClasseSouligne(niv, base1) : qClicClasse(niv, ["N", "A", "D", "V"]);
      if (p === 2) { const r = Math.random(); return r < 0.4 ? qClasseSouligne(niv, base2) : r < 0.7 ? qClicClasse(niv, ["PR", "ADV", "P"]) : qMethodeDNB(niv); }
      const r = Math.random();
      if (niv === "6e") return r < 0.5 ? qMethodeDNB(niv) : qClasseSouligne(niv, base2);
      return r < 0.45 ? qDeuxVisages(niv) : r < 0.75 ? qMethodeDNB(niv) : qClasseSouligne(niv, niv === "3e" ? ["PRR", "CS", "CC", "P"] : base2);
    },
  });

  FR.notion({
    id: "g-fonctions", domaine: "grammaire", ordre: 4, niveaux: ["5e", "4e", "3e"], titre: "Les fonctions dans la phrase",
    resume: "Sujet, COD, COI, attribut, complément de phrase, complément du nom, épithète…",
    fiche: (niv) => `<h2>La fonction d'un groupe de mots</h2>
      <p>La <b>classe</b> dit ce qu'est un mot ; la <b>fonction</b> dit le rôle qu'il joue dans la phrase.</p>
      <div class="tableau-scroll"><table><tr><th>Fonction</th><th>Comment la reconnaître</th><th>Exemple</th></tr>
      ${(FPOOL[niv] || FPOOL["5e"]).map((f) => `<tr><td><b>${FLIB[f]}</b></td><td>${FREGLE[f].replace(/^(Le|L'|La) <b>[^<]+<\/b> ?/, "")}</td><td class="ex">${{ S: "<u>Le pêcheur</u> répare son filet.", COD: "Le pêcheur répare <u>son filet</u>.", COI: "Teva téléphone <u>à sa grand-mère</u>.", ATT: "La mer est <u>calme</u>.", CP: "<u>Le soir</u>, les pêcheurs rentrent.", CN: "le marché <u>de Papeete</u>", EPI: "une chanson <u>douce</u>", CAG: "Le poisson a été pêché <u>par mon oncle</u>.", APP: "Teva, <u>un jeune pêcheur</u>, répare sa pirogue." }[f]}</td></tr>`).join("")}
      </table></div>
      <div class="attention">COD ou complément de phrase ? Le complément de phrase peut être <b>supprimé et déplacé</b> ; le COD, non. <span class="ex">Le soir, les pêcheurs rentrent. → Les pêcheurs rentrent le soir.</span></div>`,
    gen(p, niv) { return p === 3 && Math.random() < 0.5 ? qFonctionSegment(niv) : p === 2 && Math.random() < 0.35 ? qFonctionSegment(niv) : qFonction(niv, p); },
  });

  FR.notion({
    id: "g-propositions", domaine: "grammaire", ordre: 5, niveaux: ["4e", "3e"], titre: "Phrase simple, phrase complexe",
    resume: "Compter les propositions, voir comment elles sont reliées, reconnaître les subordonnées.",
    fiche: (niv) => `<h2>La phrase complexe</h2>
      <div class="regle">Une phrase a autant de <b>propositions</b> que de <b>verbes conjugués</b>. Une seule : phrase <b>simple</b>. Plusieurs : phrase <b>complexe</b>.</div>
      <div class="tableau-scroll"><table><tr><th>Les propositions sont…</th><th>Reliées par…</th><th>Exemple</th></tr>
      <tr><td><b>juxtaposées</b></td><td>une virgule, un point-virgule, deux-points</td><td class="ex">Le vent souffle, la pluie tombe.</td></tr>
      <tr><td><b>coordonnées</b></td><td>mais, ou, et, donc, or, ni, car</td><td class="ex">Le vent souffle et la pluie tombe.</td></tr>
      <tr><td><b>subordonnée</b> à une principale</td><td>qui, que, dont, où, quand, si, comme, parce que…</td><td class="ex">Le vent souffle quand la pluie tombe.</td></tr></table></div>
      ${niv === "3e" ? `<h3>Les trois sortes de subordonnées</h3><ul>
      <li><b>Relative</b> : introduite par un pronom relatif, elle complète un nom. <span class="ex">Le garçon <u>qui court</u> est mon cousin.</span></li>
      <li><b>Conjonctive complétive</b> : introduite par « que », elle complète le verbe. <span class="ex">Je pense <u>que tu as raison</u>.</span></li>
      <li><b>Conjonctive circonstancielle</b> : elle dit quand, pourquoi, à quelle condition… <span class="ex">Nous partirons <u>quand la pluie cessera</u>.</span></li></ul>` : ""}`,
    gen: (p, niv) => qPropositions(niv, p),
  });

  FR.grammaire = { LIB, POOL, classeDe, corpus, phrasesPour, negation, segments, cestQui, sujetDe, DNB, PROPS };
})();
