/* =====================================================================
   Français au collège — notions de VOCABULAIRE
   La formation des mots (dérivation, composition, emprunt) · Le sens des mots · Les mots de la séquence (par niveau)
   Décompositions écrites comme dans le contrôle de langue de la classe : préfixe + radical + suffixe, ex. dés- / agré(er) / -able.
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, G = FR.gen;
  const NUM = { "6e": 6, "5e": 5, "4e": 4, "3e": 3 };
  const T = (s) => U.esc(U.typo(s));
  const le = (m) => (/^[aeiouyéèêâîôûœ]/i.test(m) ? "l'" + m : "le " + m);

  // ------------------------------------------------------------------ formation des mots
  // [mot, préfixe ou "", radical, suffixe ou "", à partir de (6 = 6e, 5 = 5e), mot de base si on ne le lit pas dans le radical]
  const DECO = [
    ["relecture", "re-", "lect-", "-ure", 6, "lire (la lecture)"], ["désagréable", "dés-", "agré(er)", "-able", 6], ["jardinage", "", "jardin", "-age", 6],
    ["déchargement", "dé-", "charg(er)", "-ment", 6], ["illégalement", "il-", "légal(e)", "-ment", 5], ["lavable", "", "lav(er)", "-able", 6],
    ["défaire", "dé-", "faire", "", 6], ["refaire", "re-", "faire", "", 6], ["replanter", "re-", "plant(er)", "", 6], ["démontable", "dé-", "mont(er)", "-able", 6],
    ["incassable", "in-", "cass(er)", "-able", 6], ["rangement", "", "rang(er)", "-ment", 6], ["nageur", "", "nag(er)", "-eur", 6], ["chanteur", "", "chant(er)", "-eur", 6],
    ["maisonnette", "", "maison", "-ette", 6], ["gentillesse", "", "gentil", "-esse", 6], ["dangereux", "", "danger", "-eux", 6], ["pêcheur", "", "pêch(er)", "-eur", 6],
    ["arrosage", "", "arros(er)", "-age", 6], ["irréel", "ir-", "réel", "", 5], ["illisible", "il-", "lis-", "-ible", 5, "lire"], ["mécontent", "mé-", "content", "", 6],
    ["désordre", "dés-", "ordre", "", 6], ["prévoir", "pré-", "voir", "", 6], ["anormal", "a-", "normal", "", 5], ["antivol", "anti-", "vol", "", 5],
    ["inutile", "in-", "utile", "", 6], ["impossible", "im-", "possible", "", 6], ["malheureux", "mal-", "heur", "-eux", 6, "heur, un ancien mot qui veut dire « la chance »"],
    ["lentement", "", "lent(e)", "-ment", 6], ["rapidement", "", "rapide", "-ment", 6], ["fillette", "", "fill(e)", "-ette", 6], ["richesse", "", "rich(e)", "-esse", 6],
    ["déboucher", "dé-", "bouch(er)", "", 6], ["imbattable", "im-", "batt(re)", "-able", 5], ["inconnu", "in-", "connu", "", 6], ["revenir", "re-", "venir", "", 6], ["prénom", "pré-", "nom", "", 6],
  ];
  const deco = (x) => [x[1], x[2], x[3]].filter(Boolean).join(" + ");
  const base = (x) => x[5] || x[2].replace(/\((.*)\)/, "$1").replace(/-$/, "");
  const VARIANTE = { "dé-": "dé", "dés-": "dé", "in-": "in", "im-": "in", "il-": "in", "ir-": "in", "mé-": "mal", "mal-": "mal" };
  const memeFamille = (a, b) => a === b || (VARIANTE[a] && VARIANTE[a] === VARIANTE[b]);
  const SENS_PREF = { "re-": "de nouveau (encore une fois)", "dé-": "le contraire, défaire", "dés-": "le contraire, défaire", "in-": "le contraire (ne… pas)", "im-": "le contraire (ne… pas)",
    "il-": "le contraire (ne… pas)", "ir-": "le contraire (ne… pas)", "mé-": "mal, le contraire", "mal-": "mal, le contraire", "pré-": "avant, à l'avance", "a-": "sans, le contraire", "anti-": "contre" };
  const SENS_SUFF = { "-able": "qu'on peut (qui peut être…)", "-ible": "qu'on peut (qui peut être…)", "-eur": "celui qui fait l'action", "-age": "l'action de…",
    "-ette": "petit (diminutif)", "-esse": "la qualité de…", "-eux": "qui a, qui est plein de…", "-ure": "l'action ou son résultat" };
  // le sens d'un mot se devine grâce à son préfixe et à son suffixe : [mot, bon sens, 3 faux sens, à partir de]
  const DEF = [
    ["incassable", "qu'on ne peut pas casser", ["qu'on peut casser facilement", "qui casse tout", "qu'on a cassé de nouveau"]],
    ["illisible", "qu'on ne peut pas lire", ["qu'on peut lire facilement", "qui lit beaucoup", "qu'on a lu à l'avance"], 5],
    ["imbattable", "qu'on ne peut pas battre", ["qu'on bat facilement", "qui se bat souvent", "qu'on a battu de nouveau"], 5],
    ["démontable", "qu'on peut démonter, défaire pièce par pièce", ["qu'on ne peut pas monter", "qui monte très haut", "qu'on a monté à l'avance"]],
    ["lavable", "qu'on peut laver", ["qu'on ne peut pas laver", "qui lave", "qu'on lave de nouveau"]],
    ["replanter", "planter de nouveau", ["arracher ce qu'on a planté", "planter à l'avance", "mal planter"]],
    ["prévoir", "voir, imaginer à l'avance", ["voir de nouveau", "ne pas voir", "mal voir"]],
    ["relecture", "le fait de lire de nouveau", ["une lecture faite à l'avance", "une petite lecture", "le contraire d'une lecture"]],
    ["nageur", "celui qui nage", ["l'action de nager", "un petit bassin", "qu'on peut traverser à la nage"]],
    ["maisonnette", "une petite maison", ["une très grande maison", "celui qui construit les maisons", "le fait de bâtir une maison"]],
    ["désordre", "le contraire de l'ordre", ["un ordre donné de nouveau", "un petit ordre", "un ordre donné à l'avance"]],
    ["mécontent", "qui n'est pas content", ["très content", "content de nouveau", "content à l'avance"]],
    ["antivol", "un système contre le vol", ["une personne qui vole", "l'action de voler de nouveau", "un petit vol"], 5],
    ["irréel", "qui n'est pas réel", ["très réel", "réel de nouveau", "réel à l'avance"], 5],
    ["inutile", "qui ne sert à rien", ["très utile", "de nouveau utile", "utile à l'avance"]],
    ["pêcheur", "celui qui pêche", ["l'action de pêcher", "qu'on peut pêcher", "un petit poisson"]],
    ["arrosage", "l'action d'arroser", ["celui qui arrose", "qu'on peut arroser", "le contraire d'arroser"]],
    ["dangereux", "qui présente un danger", ["qui ne présente aucun danger", "l'action de mettre en danger", "un petit danger"]],
    ["fillette", "une petite fille", ["une grande fille", "celle qui garde les filles", "la qualité d'une fille"]],
    ["anormal", "qui n'est pas normal", ["très normal", "normal de nouveau", "normal à l'avance"], 5],
    ["revenir", "venir de nouveau, retourner", ["ne pas venir", "venir à l'avance", "mal venir"]],
  ];
  const FAMILLES = [  // [mot de base, membres, intrus (ressemble mais n'est pas de la famille), niveau]
    ["terre", ["terrain", "terrestre", "atterrir"], "terrible", 6], ["mer", ["marin", "maritime", "amerrir"], "merveilleux", 6],
    ["fleur", ["fleuriste", "fleurir", "floral"], "flûte", 6], ["bois", ["boisé", "déboiser", "boiserie"], "boisson", 6],
    ["lait", ["laitier", "laitage", "allaiter"], "laid", 6], ["jour", ["journée", "journal", "aujourd'hui"], "jouer", 6],
    ["nager", ["nageur", "nage", "nageoire"], "neige", 6], ["main", ["manuel", "manucure", "maintenir"], "maison", 5],
    ["pied", ["piéton", "pédestre", "trépied"], "pierre", 5], ["vent", ["venteux", "éventail", "paravent"], "vendre", 5],
    ["dent", ["dentiste", "dentaire", "édenté"], "danse", 6], ["chant", ["chanter", "chanteur", "chanson"], "champion", 6],
  ];
  const FORMATION = [  // [mot, procédé, précision]
    ["portefeuille", "composition", "porte + feuille"], ["chou-fleur", "composition", "chou + fleur"], ["pomme de terre", "composition", "pomme + de + terre"],
    ["sèche-cheveux", "composition", "sèche + cheveux"], ["lave-vaisselle", "composition", "lave + vaisselle"], ["tire-bouchon", "composition", "tire + bouchon"],
    ["parapluie", "composition", "para (protéger) + pluie"], ["week-end", "emprunt", "à l'anglais"], ["pizza", "emprunt", "à l'italien"], ["tabou", "emprunt", "au polynésien « tapu »"],
    ["football", "emprunt", "à l'anglais"], ["judo", "emprunt", "au japonais"], ["kayak", "emprunt", "à la langue des Inuits"], ["yoga", "emprunt", "au sanskrit, une langue de l'Inde"],
    ["relecture", "dérivation", "re- + lect- + -ure"], ["lavable", "dérivation", "lav(er) + -able"], ["jardinage", "dérivation", "jardin + -age"],
    ["défaire", "dérivation", "dé- + faire"], ["gentiment", "dérivation", "gentil + -ment"], ["maisonnette", "dérivation", "maison + -ette"],
  ];
  const PROCEDE = { "dérivation": "par dérivation (préfixe ou suffixe ajouté à un radical)", "composition": "par composition (plusieurs mots assemblés)", "emprunt": "par emprunt (mot pris à une autre langue)" };
  const MENT = [["rapidement", "adverbe"], ["lentement", "adverbe"], ["gentiment", "adverbe"], ["doucement", "adverbe"], ["calmement", "adverbe"],
    ["rangement", "nom"], ["chargement", "nom"], ["changement", "nom"], ["enseignement", "nom"], ["déménagement", "nom"]];
  const RACINES = [  // 3e : composition savante [élément, sens, exemple, décomposition de l'exemple]
    ["bio", "la vie", "biologie", "bio (la vie) + logie (l'étude)"], ["géo", "la terre", "géographie", "géo (la terre) + graphie (écrire, décrire)"],
    ["graph", "écrire", "autographe", "auto (soi-même) + graphe (écrire) : une signature de sa propre main"], ["phone", "le son, la voix", "téléphone", "télé (loin) + phone (la voix)"],
    ["télé", "loin", "télescope", "télé (loin) + scope (observer)"], ["chrono", "le temps", "chronomètre", "chrono (le temps) + mètre (la mesure)"],
    ["hydr", "l'eau", "hydravion", "hydr(o) (l'eau) + avion : un avion qui se pose sur l'eau"], ["micro", "petit", "microscope", "micro (petit) + scope (observer)"],
    ["poly", "plusieurs", "polygone", "poly (plusieurs) + gone (l'angle)"], ["auto", "soi-même", "autobiographie", "auto (soi-même) + bio (la vie) + graphie (écrire)"],
    ["photo", "la lumière", "photographie", "photo (la lumière) + graphie (écrire)"], ["thermo", "la chaleur", "thermomètre", "thermo (la chaleur) + mètre (la mesure)"],
    ["logie", "l'étude, la science", "zoologie", "zoo (l'animal) + logie (l'étude)"], ["mètre", "la mesure", "centimètre", "centi (centième) + mètre (la mesure)"],
    ["scope", "observer, regarder", "périscope", "péri (autour) + scope (observer)"], ["cide", "qui tue", "insecticide", "insecti (l'insecte) + cide (qui tue)"],
    ["vore", "qui mange", "herbivore", "herbi (l'herbe) + vore (qui mange)"], ["anthropo", "l'être humain", "anthropologie", "anthropo (l'être humain) + logie (l'étude)"],
  ];

  function qFormation(niv, palier) {
    const l = DECO.filter((x) => x[4] >= NUM[niv]);
    const r = Math.random();
    if (palier === 1) {
      if (r < 0.5) {
        const x = U.pick(l.filter((y) => y[1]));
        const autres = U.uniq(l.map((y) => y[1]).filter((p) => p && !memeFamille(p, x[1])));
        return G.choix({ bon: x[1], faux: U.sample(autres, 3), q: { consigne: `Quel est le <b>préfixe</b> du mot « ${x[0]} » ?`, cle: "pf|" + x[0],
          correction: `<p>${x[0]} = ${deco(x)}. Le préfixe se place <b>avant</b> le radical ; ici « ${x[1]} » veut dire « ${T(SENS_PREF[x[1]])} ».</p>` } });
      }
      const x = U.pick(l.filter((y) => y[3]));
      const autres = U.uniq(l.map((y) => y[3]).filter((s) => s && s !== x[3] && !(SENS_SUFF[s] && SENS_SUFF[s] === SENS_SUFF[x[3]])));
      return G.choix({ bon: x[3], faux: U.sample(autres, 3), q: { consigne: `Quel est le <b>suffixe</b> du mot « ${x[0]} » ?`, cle: "sf|" + x[0],
        correction: `<p>${x[0]} = ${deco(x)}. Le suffixe se place <b>après</b> le radical${SENS_SUFF[x[3]] ? ` ; « ${x[3]} » veut dire « ${T(SENS_SUFF[x[3]])} »` : ""}.</p>` } });
    }
    if (palier === 2) {
      if (r < 0.25) {
        const x = U.pick(l.filter((y) => y[1] && SENS_PREF[y[1]]));
        const bon = SENS_PREF[x[1]], contraire = /contraire/.test(bon);
        const sens = U.uniq(Object.values(SENS_PREF)).filter((s) => s !== bon && !(contraire && /contraire/.test(s)));
        return G.choix({ bon, faux: U.sample(sens, 3), q: { consigne: `Dans « ${x[0]} », que veut dire le préfixe « ${x[1]} » ?`, cle: "sp|" + x[0], correction: `<p>${x[0]} = ${deco(x)}.</p>` } });
      }
      if (r < 0.5) {
        const f = U.pick(FAMILLES.filter((y) => y[3] >= NUM[niv]));
        return G.choix({ bon: f[2], faux: f[1], q: { consigne: `Quel mot n'est <b>pas</b> de la même famille que « ${T(f[0])} » ?`, cle: "fm|" + f[0],
          correction: `<p>Les mots d'une même <b>famille</b> ont le même radical et un sens commun : ${T(f[1].join(", "))} viennent de « ${T(f[0])} ». « ${T(f[2])} » lui ressemble mais n'a rien à voir.</p>` } });
      }
      if (r < 0.7) {
        const [m, c] = U.pick(MENT);
        return G.choix({ bon: c === "adverbe" ? "un adverbe" : "un nom", faux: c === "adverbe" ? ["un nom", "un adjectif"] : ["un adverbe", "un adjectif"], q: { melanger: false,
          consigne: `Le mot « ${m} » se termine par -ment. Quelle est sa classe ?`, cle: "mt|" + m,
          correction: `<p>-ment forme des <b>adverbes</b> à partir d'adjectifs (rapide → rapidement) et des <b>noms</b> à partir de verbes (ranger → le rangement). Astuce : si on peut dire « ${T(le(m))} », c'est un nom.</p>` } });
      }
      const [m, p, prec] = U.pick(FORMATION);
      return G.choix({ bon: PROCEDE[p], faux: Object.keys(PROCEDE).filter((y) => y !== p).map((y) => PROCEDE[y]), q: { consigne: `Comment le mot « ${T(m)} » a-t-il été formé ?`, cle: "fo|" + m,
        correction: `<p>« ${T(m)} » : ${p} (${T(prec)}).</p>` } });
    }
    if (niv === "3e" && r < 0.4) {
      const [e, s, ex, d] = U.pick(RACINES);
      return G.choix({ bon: s, faux: U.sample(RACINES.filter((y) => y[1] !== s && !d.includes("(" + y[1])).map((y) => y[1]), 3),
        q: { consigne: `Dans « ${ex} », que veut dire l'élément savant « ${e} » ?`, cle: "rc|" + e,
          correction: `<p>Les éléments savants viennent du grec ou du latin et s'assemblent pour former des mots (composition savante) : ${ex} = ${T(d)}.</p>` } });
    }
    const defs = DEF.filter((y) => (y[3] || 6) >= NUM[niv]);
    if (r < 0.7) {
      const [m, bon, faux] = U.pick(defs), x = DECO.find((y) => y[0] === m);
      return G.choix({ bon, faux, q: { consigne: `Grâce à son préfixe ou à son suffixe, devine le sens du mot « ${m} ».`, cle: "df|" + m,
        correction: `<p>${m} = ${deco(x)}${x[1] && SENS_PREF[x[1]] ? ` ; ${x[1]} = ${T(SENS_PREF[x[1]])}` : ""}${x[3] && SENS_SUFF[x[3]] ? ` ; ${x[3]} = ${T(SENS_SUFF[x[3]])}` : ""}.</p>`.replace("….", "…") } });
    }
    const x = U.pick(l.filter((y) => y[1] && y[3])), deux = U.sample(l.filter((y) => !y[1] !== !y[3]), 3);
    return G.choix({ bon: x[0], faux: deux.map((y) => y[0]), q: { consigne: "Quel mot est formé d'un préfixe, d'un radical <b>et</b> d'un suffixe ?", cle: "3p|" + x[0],
      correction: `<p><b>${x[0]} = ${deco(x)}</b> (le mot de base : ${T(base(x))}). Les autres n'ont que deux éléments : ${deux.map((y) => `${y[0]} = ${deco(y)}`).join(" ; ")}.</p>` } });
  }

  // ------------------------------------------------------------------ sens des mots
  const SYN = [["commencer", "débuter", ["finir", "continuer", "arrêter"]], ["finir", "terminer", ["commencer", "débuter", "continuer"]], ["bateau", "navire", ["avion", "rivière", "port"]],
    ["peur", "crainte", ["courage", "joie", "colère"]], ["content", "heureux", ["triste", "fâché", "inquiet"]], ["regarder", "observer", ["écouter", "oublier", "cacher"]],
    ["habiter", "résider", ["partir", "voyager", "construire"]], ["beau", "joli", ["laid", "grand", "vieux"]], ["difficile", "compliqué", ["facile", "simple", "rapide"]],
    ["calme", "tranquille", ["agité", "bruyant", "nerveux"]], ["courageux", "brave", ["peureux", "lâche", "timide"]], ["maison", "habitation", ["jardin", "plage", "voiture"]],
    ["colère", "fureur", ["calme", "joie", "peur"]], ["vite", "rapidement", ["lentement", "doucement", "calmement"]], ["effrayer", "terrifier", ["rassurer", "calmer", "consoler"]],
    ["triste", "malheureux", ["joyeux", "content", "gai"]]];
  const ANT = [  // [classe, mot, contraire] : les distracteurs sont pris dans la même classe
    ["v", "ouvrir", "fermer"], ["v", "gagner", "perdre"], ["v", "monter", "descendre"], ["v", "entrer", "sortir"], ["v", "accepter", "refuser"], ["v", "allumer", "éteindre"],
    ["v", "acheter", "vendre"], ["v", "construire", "détruire"], ["v", "aimer", "détester"], ["v", "oublier", "se souvenir"],
    ["a", "grand", "petit"], ["a", "chaud", "froid"], ["a", "lent", "rapide"], ["a", "courageux", "peureux"], ["a", "propre", "sale"], ["a", "plein", "vide"],
    ["a", "lourd", "léger"], ["a", "facile", "difficile"], ["a", "gentil", "méchant"], ["a", "ancien", "moderne"],
    ["n", "joie", "tristesse"], ["n", "ami", "ennemi"], ["n", "jour", "nuit"], ["n", "guerre", "paix"], ["n", "début", "fin"], ["n", "victoire", "défaite"],
    ["d", "toujours", "jamais"], ["d", "tôt", "tard"], ["d", "souvent", "rarement"], ["d", "dedans", "dehors"]];
  const FIG = [["Teva a un cœur d'or.", "or", 1], ["Ce collier est en or.", "or", 0], ["Il pleut des cordes.", "cordes", 1], ["Le pêcheur attache la pirogue avec des cordes.", "cordes", 0],
    ["Hina dévore un roman.", "dévore", 1], ["Le requin dévore un poisson.", "dévore", 0], ["Elle a la tête dans les nuages.", "nuages", 1], ["Les nuages cachent le soleil.", "nuages", 0],
    ["Il bout de colère.", "bout", 1], ["L'eau bout dans la casserole.", "bout", 0], ["Mon frère a un poil dans la main.", "poil", 1], ["Le chat perd ses poils.", "poils", 0],
    ["Ce livre est une mine d'informations.", "mine", 1], ["Les ouvriers travaillent dans une mine.", "mine", 0], ["La nouvelle l'a glacé.", "glacé", 1], ["Le jus de fruit est glacé.", "glacé", 0]];
  const CHAMPS = [["la mer", ["vague", "marin", "lagon", "récif"], "désert"], ["la peur", ["frayeur", "trembler", "effrayant", "terreur"], "rire"],
    ["le théâtre", ["scène", "rideau", "réplique", "comédien"], "stylo"], ["la joie", ["bonheur", "sourire", "rire", "gaieté"], "colère"],
    ["la nuit", ["étoile", "lune", "obscurité", "sombre"], "soleil"], ["l'école", ["cahier", "élève", "récréation", "professeur"], "pirogue"],
    ["le combat", ["bouclier", "lance", "adversaire", "victoire"], "berceau"], ["la cuisine", ["casserole", "recette", "four", "éplucher"], "cahier"]];
  const REG = [["bagnole", "voiture", "automobile"], ["boulot", "travail", "labeur"], ["bouquin", "livre", "ouvrage"], ["bouffer", "manger", "se restaurer"],
    ["baraque", "maison", "demeure"], ["godasses", "chaussures", "souliers"]];
  const qSyn = () => {
    const [m, s, f] = U.pick(SYN);
    return G.choix({ bon: s, faux: f, q: { consigne: `Quel mot est un <b>synonyme</b> de « ${m} » ?`, cle: "sy|" + m, correction: `<p>Un <b>synonyme</b> a le même sens (ou un sens très proche) et la même classe : ${m} → ${s}.</p>` } });
  };
  const qAnt = () => {
    const p = U.pick(ANT), sens = Math.random() < 0.5, m = sens ? p[1] : p[2], bon = sens ? p[2] : p[1];
    const faux = U.sample(ANT.filter((x) => x[0] === p[0] && x !== p).map((x) => x[1 + U.rnd(2)]), 3);
    return G.choix({ bon, faux, q: { consigne: `Quel mot est un <b>antonyme</b> (le contraire) de « ${m} » ?`, cle: "an|" + m, correction: `<p>Un <b>antonyme</b> a le sens contraire : ${m} ≠ ${bon}.</p>` } });
  };
  const qFig = () => {
    const [ph, mot, fig] = U.pick(FIG);
    return G.choix({ bon: fig ? "au sens figuré" : "au sens propre", faux: [fig ? "au sens propre" : "au sens figuré"], q: { melanger: false,
      consigne: `Dans cette phrase, le mot « ${mot} » est employé…`, support: T(ph), cle: "fg|" + ph,
      correction: `<p>Le <b>sens propre</b> est le sens premier, concret. Le <b>sens figuré</b> est une image : ${fig ? `ici, ce n'est pas vraiment de « ${mot} » qu'il s'agit.` : `ici, il s'agit vraiment de « ${mot} ».`}</p>` } });
  };
  const qChamp = () => {
    const [c, mots, intrus] = U.pick(CHAMPS);
    return G.choix({ bon: intrus, faux: U.sample(mots, 3), q: { consigne: `Quel mot n'appartient <b>pas</b> au champ lexical de ${T(c)} ?`, cle: "cl|" + c,
      correction: `<p>Un <b>champ lexical</b> est l'ensemble des mots qui se rapportent à un même thème : ${mots.join(", ")} parlent de ${T(c)}.</p>` } });
  };
  const qReg = () => {
    const t = U.pick(REG), k = U.rnd(3), nom = ["familier", "courant", "soutenu"][k];
    return G.choix({ bon: t[k], faux: t.filter((_, i) => i !== k), q: { consigne: `Quel mot appartient au registre <b>${nom}</b> ?`, cle: "rg|" + t[1] + "|" + k,
      correction: `<p>${t[0]} (familier) — ${t[1]} (courant) — ${t[2]} (soutenu). Le registre familier s'emploie entre amis, à l'oral ; le soutenu, dans les écrits soignés.</p>` } });
  };
  function qSens(niv, palier) {
    const r = Math.random();
    if (palier === 1) return r < 0.5 ? qSyn() : qAnt();
    if (palier === 2) return r < 0.25 ? qSyn() : r < 0.5 ? qAnt() : qFig();
    if (niv === "6e") return r < 0.4 ? qFig() : qChamp();
    return r < 0.3 ? qFig() : r < 0.65 ? qChamp() : qReg();
  }

  // ------------------------------------------------------------------ les mots de la séquence (un lexique par niveau)
  // phrases : [phrase avec ……, réponse, mots à ne pas proposer (trop proches)]
  const LEX = {
    "6e": { titre: "Les mots des récits", resume: "Conte, légende, mythe, quête, épreuve, péripétie… les mots pour parler des récits.", mots: [
      ["un conte", "Récit imaginaire, souvent merveilleux, qui commence souvent par « Il était une fois »."],
      ["une légende", "Récit ancien transmis à l'oral, lié à un lieu ou à un personnage, qui mêle le vrai et l'imaginaire."],
      ["un mythe", "Récit très ancien qui explique l'origine du monde, des êtres humains ou des choses."],
      ["une fable", "Court récit, souvent en vers, avec des animaux, qui donne une leçon."],
      ["la morale", "Leçon que l'on tire d'une histoire."],
      ["un héros", "Personnage principal qui accomplit des actions extraordinaires."],
      ["un monstre", "Créature effrayante, souvent énorme, qui n'est ni vraiment humaine ni vraiment animale."],
      ["une quête", "Long voyage pour trouver quelque chose ou quelqu'un."],
      ["une épreuve", "Obstacle difficile que le héros doit surmonter."],
      ["une ruse", "Moyen habile de tromper quelqu'un."],
      ["une métamorphose", "Transformation d'un être en un autre."],
      ["le merveilleux", "Tout ce qui appartient à la magie : fées, sortilèges, objets magiques."],
      ["le narrateur", "Celui qui raconte l'histoire."],
      ["une péripétie", "Événement imprévu qui change le cours de l'histoire."],
      ["le dénouement", "Fin de l'histoire, quand le problème est résolu."],
      ["la situation initiale", "Début du récit, qui présente les personnages, le lieu et l'époque."],
      ["l'élément perturbateur", "Événement qui vient troubler la situation du début."],
      ["une divinité", "Un dieu ou une déesse."]],
      phrases: [["Le héros doit traverser l'océan pour retrouver sa sœur : c'est ……", "une quête"], ["« Il était une fois une princesse… » : ce récit est ……", "un conte", ["une légende"]],
        ["Ulysse se cache sous le ventre d'un bélier pour échapper au cyclope : c'est ……", "une ruse"], ["Dans la légende, la jeune fille se transforme en fleur : c'est ……", "une métamorphose"],
        ["« La raison du plus fort est toujours la meilleure » : c'est …… de la fable.", "la morale"], ["Ce récit très ancien explique comment Maui a pêché les îles : c'est ……", "un mythe", ["une légende"]],
        ["Celui qui raconte l'histoire, c'est ……", "le narrateur"], ["Pour épouser la princesse, le héros doit vaincre le dragon : c'est ……", "une épreuve", ["une quête", "une péripétie"]]] },
    "5e": { titre: "Les mots du héros et du combat", resume: "Épopée, exploit, bravoure… et l'équipement de l'hoplite.", mots: [
      ["une épopée", "Long poème qui raconte les exploits d'un héros (comme L'Odyssée)."],
      ["un exploit", "Action extraordinaire, très difficile à réaliser."],
      ["la bravoure", "Grand courage face au danger."],
      ["héroïque", "Digne d'un héros, très courageux."],
      ["un adversaire", "Personne contre qui l'on combat."],
      ["vaincre", "Remporter la victoire sur quelqu'un."],
      ["un demi-dieu", "Être né d'un dieu (ou d'une déesse) et d'un être humain."],
      ["l'Olympe", "Montagne où vivent les dieux grecs."],
      ["un oracle", "Réponse d'un dieu à une question que l'on pose, ou la personne qui la transmet."],
      ["un hoplite", "Soldat grec qui combat à pied, lourdement armé."],
      ["le casque", "Protection de métal pour la tête."],
      ["la cuirasse", "Armure qui protège la poitrine et le dos."],
      ["les cnémides", "Protections de métal pour les jambes (les tibias)."],
      ["le bouclier", "Arme de défense, tenue au bras, pour arrêter les coups."],
      ["la lance", "Longue arme terminée par une pointe de métal."],
      ["l'épée courte", "Arme à lame pour le combat de près."],
      ["un périple", "Long voyage avec de nombreuses étapes."]],
      phrases: [["Pour se protéger les jambes, l'hoplite porte ……", "les cnémides"], ["Hercule a tué l'hydre de Lerne : c'est ……", "un exploit"],
        ["L'Odyssée raconte en vers les aventures d'Ulysse : c'est ……", "une épopée"], ["Achille, fils d'une déesse et d'un roi, est ……", "un demi-dieu"],
        ["Pour se protéger des coups, l'hoplite tient à son bras ……", "le bouclier"], ["Les dieux grecs vivent sur ……", "l'Olympe"],
        ["Pour protéger sa poitrine et son dos, l'hoplite porte ……", "la cuirasse"], ["Avant la guerre, le roi demande à Delphes l'avis des dieux : il consulte ……", "un oracle"]] },
    "4e": { titre: "Les mots du théâtre", resume: "Réplique, tirade, aparté, didascalie, quiproquo… et les lieux du théâtre.", mots: [
      ["un acte", "Grande partie d'une pièce de théâtre, divisée en scènes."],
      ["une scène", "Partie d'un acte, qui change quand un personnage entre ou sort."],
      ["une réplique", "Ce que dit un personnage quand c'est à lui de parler."],
      ["une tirade", "Longue réplique d'un personnage."],
      ["un monologue", "Un personnage, seul sur scène, parle à lui-même."],
      ["un aparté", "Paroles qu'un personnage dit pour lui-même : seul le public les entend."],
      ["une didascalie", "Indication de l'auteur (geste, ton, déplacement, décor), souvent en italique."],
      ["un quiproquo", "Malentendu : un personnage prend une personne ou une chose pour une autre."],
      ["le dénouement", "Fin de la pièce, où l'intrigue se résout."],
      ["la scène d'exposition", "Première scène, qui présente les personnages et la situation."],
      ["le comique de gestes", "On rit à cause des gestes : coups de bâton, chutes, grimaces."],
      ["une comédie", "Pièce qui fait rire et qui finit bien."],
      ["une tragédie", "Pièce où le héros, écrasé par le destin, connaît une fin malheureuse."],
      ["un dilemme", "Choix impossible entre deux solutions aussi difficiles l'une que l'autre."],
      ["un dramaturge", "Auteur de pièces de théâtre."],
      ["le metteur en scène", "Personne qui dirige les comédiens et décide du jeu et du décor."],
      ["une troupe", "Groupe de comédiens qui jouent ensemble."],
      ["les coulisses", "Partie cachée au public, sur les côtés de la scène."],
      ["les cintres", "Partie haute, au-dessus de la scène, où l'on suspend les décors."],
      ["le poulailler", "Places tout en haut de la salle, les moins chères."],
      ["la fosse d'orchestre", "Espace creusé devant la scène, où jouent les musiciens."],
      ["la rampe", "Rangée de lumières au bord de la scène."],
      ["une répétition", "Séance où les comédiens s'entraînent avant le spectacle."],
      ["une stichomythie", "Échange de répliques très courtes et rapides."],
      ["un alexandrin", "Vers de douze syllabes, comme dans Le Cid."]],
      phrases: [["Rodrigue doit choisir entre venger son père et garder l'amour de Chimène : c'est ……", "un dilemme"],
        ["« (Il se cache derrière le rideau.) » : cette indication en italique est ……", "une didascalie"],
        ["Seul en scène, Rodrigue exprime longuement ses doutes : c'est ……", "un monologue", ["une tirade", "une réplique"]],
        ["Le valet dit tout bas « Quel avare ! » : seul le public l'entend, c'est ……", "un aparté"],
        ["Le maître prend son valet pour un voleur : c'est ……", "un quiproquo"], ["Corneille a écrit Le Cid : c'est ……", "un dramaturge"],
        ["Sganarelle reçoit des coups de bâton et tombe par terre : le public rit, c'est ……", "le comique de gestes"],
        ["Les comédiens s'entraînent une dernière fois avant le spectacle : c'est ……", "une répétition"]] },
    "3e": { titre: "Les mots de l'autobiographie et de l'image", resume: "Autobiographie, pacte, mémoires… et les mots pour analyser une image.", mots: [
      ["une autobiographie", "Récit qu'une personne écrit sur sa propre vie : l'auteur, le narrateur et le personnage principal sont la même personne."],
      ["le pacte autobiographique", "Promesse de l'auteur de dire la vérité sur sa vie."],
      ["des mémoires", "Récit de sa vie, centré sur les événements historiques que l'on a vécus."],
      ["un journal intime", "Texte écrit au jour le jour, daté, pour soi-même."],
      ["une biographie", "Récit de la vie de quelqu'un, écrit par une autre personne."],
      ["un autoportrait", "Portrait qu'un artiste fait de lui-même."],
      ["un témoignage", "Récit de quelqu'un qui a vu ou vécu un événement."],
      ["dénoncer", "Montrer publiquement une injustice pour la combattre."],
      ["un écrivain engagé", "Écrivain qui défend une cause dans ses œuvres."],
      ["le premier plan", "Ce qui est le plus proche de nous dans l'image."],
      ["l'arrière-plan", "Ce qui est le plus loin, au fond de l'image."],
      ["un plan d'ensemble", "Plan qui montre un vaste paysage ou tout un décor."],
      ["un gros plan", "Plan qui montre un visage ou un objet de très près."],
      ["une plongée", "Image prise d'en haut : le sujet paraît petit, écrasé."],
      ["une contre-plongée", "Image prise d'en bas : le sujet paraît grand, puissant."],
      ["le cadrage", "Choix de ce que l'on montre dans l'image."],
      ["le hors-champ", "Ce qu'on ne voit pas dans l'image mais qu'on devine."],
      ["les couleurs chaudes", "Rouge, orange, jaune : elles évoquent la chaleur, l'énergie."],
      ["les couleurs froides", "Bleu, vert, violet : elles évoquent le calme, la tristesse, le froid."]],
      phrases: [["L'auteur promet de tout raconter sans mentir : c'est ……", "le pacte autobiographique"],
        ["Le photographe se place au ras du sol pour que le guerrier paraisse immense : c'est ……", "une contre-plongée"],
        ["On ne voit que les yeux de la femme, en très grand : c'est ……", "un gros plan"],
        ["Au fond du tableau, on aperçoit des montagnes : c'est ……", "l'arrière-plan"],
        ["Un passant raconte aux journalistes l'accident qu'il a vu : c'est ……", "un témoignage"],
        ["Une jeune fille écrit chaque soir, en datant ses pages : c'est ……", "un journal intime"],
        ["Un écrivain raconte sa propre vie, de son enfance à aujourd'hui : c'est ……", "une autobiographie", ["des mémoires"]],
        ["Le peintre s'est représenté lui-même devant son miroir : c'est ……", "un autoportrait"]] },
  };
  const sorte = (m) => (/^(un|une|le|la) |^l'/.test(m) ? "sg" : /^(les|des) /.test(m) ? "pl" : "autre");
  // distracteurs de la même sorte (nom singulier, pluriel, autre) pour que la grammaire ne donne pas la réponse
  const voisins = (l, m, exclus) => {
    const ok = l.filter((x) => x[0] !== m && !(exclus || []).includes(x[0]));
    const meme = U.shuffle(ok.filter((x) => sorte(x[0]) === sorte(m)));
    return meme.concat(U.shuffle(ok.filter((x) => sorte(x[0]) !== sorte(m)))).slice(0, 3);
  };
  function qLexique(niv, palier) {
    const L = LEX[niv], l = L.mots;
    if (palier === 1) {
      const [m, d] = U.pick(l);
      return G.choix({ bon: m, faux: voisins(l, m).map((x) => x[0]), q: { consigne: "Quel mot correspond à cette définition ?", support: T(d), cle: "lx1|" + m,
        correction: `<p><b>${T(m)}</b> : ${T(d)}</p>` } });
    }
    if (palier === 2) {
      const [m, d] = U.pick(l);
      return G.choix({ bon: d, faux: voisins(l, m).map((x) => x[1]), q: { consigne: `Que veut dire « ${T(m)} » ?`, cle: "lx2|" + m, correction: `<p><b>${T(m)}</b> : ${T(d)}</p>` } });
    }
    const [ph, m, exclus] = U.pick(L.phrases);
    return G.choix({ bon: m, faux: voisins(l, m, exclus).map((x) => x[0]), q: { consigne: "Quel mot complète la phrase ?", support: T(ph).replace("……", "<b>……</b>"), cle: "lx3|" + ph,
      correction: `<p><b>${T(m)}</b> : ${T((l.find((x) => x[0] === m) || ["", ""])[1])}</p>` } });
  }

  FR.notion({
    id: "l-formation", domaine: "lexique", ordre: 1, niveaux: ["6e", "5e", "4e", "3e"], titre: "La formation des mots",
    resume: (niv) => (niv === "3e" ? "Préfixes, suffixes, familles, composition, emprunts et éléments savants." : "Préfixe, radical, suffixe, familles de mots, composition et emprunt."),
    fiche: (niv) => `<h2>Comment les mots sont formés</h2>
      <div class="regle"><b>La dérivation</b> : on forme un mot nouveau en ajoutant un <b>préfixe</b> (avant) et/ou un <b>suffixe</b> (après) à un <b>radical</b>. <span class="ex">défaire, lentement, jardinier</span></div>
      <div class="tableau-scroll"><table><tr><th>Mot</th><th>Préfixe</th><th>Radical</th><th>Suffixe</th></tr>
      <tr><td>relecture</td><td>re-</td><td>lect-</td><td>-ure</td></tr><tr><td>désagréable</td><td>dés-</td><td>agré(er)</td><td>-able</td></tr>
      <tr><td>jardinage</td><td>—</td><td>jardin</td><td>-age</td></tr><tr><td>malheureux</td><td>mal-</td><td>heur</td><td>-eux</td></tr></table></div>
      <p>Les préfixes et les suffixes ont un sens : <b>re-</b> = de nouveau · <b>in-, im-, il-, ir-, dé-, dés-</b> = le contraire · <b>pré-</b> = avant · <b>-able, -ible</b> = qu'on peut · <b>-eur</b> = celui qui · <b>-ette</b> = petit.</p>
      <div class="regle"><b>La composition</b> : on assemble deux mots ou plus (soudés, avec un trait d'union ou séparés). <span class="ex">portefeuille, chou-fleur, pomme de terre</span></div>
      <div class="regle"><b>L'emprunt</b> : on prend un mot à une autre langue. <span class="ex">week-end (anglais), pizza (italien), tabou (polynésien « tapu »)</span></div>
      <p>Une <b>famille de mots</b> : tous les mots formés sur le même radical (terre, terrain, terrestre, atterrir).</p>
      <div class="attention">-ment forme des <b>adverbes</b> (rapide → rapidement) mais aussi des <b>noms</b> (ranger → le rangement).</div>
      ${niv === "3e" ? `<h3>Les éléments savants (grec, latin)</h3><p>${RACINES.slice(0, 12).map((x) => `<b>${x[0]}</b> = ${T(x[1])}`).join(" · ")}…</p>` : ""}`,
    gen: (p, niv) => qFormation(niv, p),
  });
  FR.notion({
    id: "l-sens", domaine: "lexique", ordre: 2, niveaux: ["6e", "5e", "4e", "3e"], titre: "Le sens des mots",
    resume: (niv) => (niv === "6e" ? "Synonymes, antonymes, sens propre et figuré, champ lexical." : "Synonymes, antonymes, sens propre et figuré, champ lexical, registres de langue."),
    fiche: (niv) => `<h2>Le sens des mots</h2>
      <ul><li><b>Synonymes</b> : même sens, même classe (commencer / débuter).</li><li><b>Antonymes</b> : sens contraire (ouvrir / fermer).</li>
      <li><b>Sens propre</b> : le sens premier, concret (un collier en <i>or</i>). <b>Sens figuré</b> : une image (un cœur d'<i>or</i>).</li>
      <li><b>Champ lexical</b> : les mots qui se rapportent à un même thème (la mer : vague, lagon, récif, marin).</li>
      ${niv === "6e" ? "" : "<li><b>Registres de langue</b> : familier (bagnole), courant (voiture), soutenu (automobile).</li>"}</ul>`,
    gen: (p, niv) => qSens(niv, p),
  });
  FR.notion({
    id: "l-sequence", domaine: "lexique", ordre: 3, niveaux: ["6e", "5e", "4e", "3e"], titre: (niv) => LEX[niv].titre,
    resume: (niv) => LEX[niv].resume,
    fiche: (niv) => `<h2>${LEX[niv].titre}</h2><div class="tableau-scroll"><table><tr><th>Mot</th><th>Sens</th></tr>${LEX[niv].mots.map(([m, d]) => `<tr><td><b>${T(m)}</b></td><td>${T(d)}</td></tr>`).join("")}</table></div>`,
    gen: (p, niv) => qLexique(niv, p),
  });
  FR.lexique = { DECO, DEF, FAMILLES, FORMATION, MENT, RACINES, SYN, ANT, FIG, CHAMPS, REG, LEX };
})();
