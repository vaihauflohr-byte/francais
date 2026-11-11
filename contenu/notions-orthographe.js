/* =====================================================================
   Français au collège — notions d'ORTHOGRAPHE
   Les homophones grammaticaux · Les accords (groupe nominal, sujet-verbe, participe passé) · -é, -er, -ez ou -ait ?
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, G = FR.gen;
  const NUM = { "6e": 6, "5e": 5, "4e": 4, "3e": 3 };

  // ------------------------------------------------------------------ homophones
  // [paire, niveau min, phrase avec {bonne réponse}] ; les choix viennent de la paire
  const PAIRES = {
    a: { n: 6, o: ["a", "à"], astuce: "« <b>a</b> » est le verbe avoir : on peut le remplacer par « avait ». « <b>à</b> » est une préposition : on ne peut pas." },
    est: { n: 6, o: ["est", "et"], astuce: "« <b>est</b> » est le verbe être : on peut le remplacer par « était ». « <b>et</b> » relie deux mots ou deux groupes : on peut dire « et puis »." },
    sont: { n: 6, o: ["sont", "son"], astuce: "« <b>sont</b> » est le verbe être : on peut le remplacer par « étaient ». « <b>son</b> » est un déterminant : on peut le remplacer par « mon »." },
    ont: { n: 6, o: ["ont", "on"], astuce: "« <b>ont</b> » est le verbe avoir : on peut le remplacer par « avaient ». « <b>on</b> » est un pronom sujet : on peut le remplacer par « il »." },
    ou: { n: 6, o: ["ou", "où"], astuce: "« <b>ou</b> » marque un choix : on peut dire « ou bien ». « <b>où</b> » indique un lieu ou un moment." },
    se: { n: 5, o: ["se", "ce"], astuce: "« <b>se</b> » est un pronom, devant un verbe (se baigner → me baigner). « <b>ce</b> » est devant un nom (ce garçon) ou devant qui, que, dont (ce qui)." },
    ses: { n: 5, o: ["ses", "ces"], astuce: "« <b>ses</b> » veut dire « les siens » (on peut dire « mes »). « <b>ces</b> » montre quelque chose (on peut dire « ces… -là »)." },
    mais: { n: 5, o: ["mais", "mes"], astuce: "« <b>mais</b> » marque une opposition (on peut dire « pourtant »). « <b>mes</b> » est un déterminant (on peut dire « tes »)." },
    cest: { n: 4, o: ["c'est", "s'est"], astuce: "« <b>s'est</b> » est suivi d'un participe passé (verbe pronominal : il s'est blessé → je me suis blessé). « <b>c'est</b> » veut dire « cela est »." },
    leur: { n: 4, o: ["leur", "leurs"], astuce: "Devant un <b>verbe</b>, « leur » est un pronom : il ne prend <b>jamais</b> de s. Devant un <b>nom</b>, c'est un déterminant : « leurs » si le nom est au pluriel." },
    la: { n: 4, o: ["la", "l'a", "là"], astuce: "« <b>là</b> » indique un lieu (on peut dire « ici »). « <b>l'a</b> » = « l'avait ». « <b>la</b> » est un déterminant (une) ou un pronom (le)." },
    peu: { n: 4, o: ["peu", "peut", "peux"], astuce: "« <b>peut</b> », « <b>peux</b> » : verbe pouvoir (on peut dire « pouvait ») ; peux avec je et tu, peut avec il, elle, on. « <b>peu</b> » = pas beaucoup." },
    ni: { n: 4, o: ["ni", "n'y"], astuce: "« <b>n'y</b> » = ne + y (on peut dire « ne… pas… là »). « <b>ni</b> » sert à nier deux choses : ni… ni…" },
    quel: { n: 3, o: ["quel", "quelle", "quels", "quelles", "qu'elle", "qu'elles"], astuce: "« <b>qu'elle(s)</b> » = que + elle(s) : on peut dire « qu'il(s) ». « <b>quel</b> » accompagne un nom et s'accorde avec lui." },
    quand: { n: 3, o: ["quand", "quant", "qu'en"], astuce: "« <b>quand</b> » = lorsque. « <b>quant à</b> » = en ce qui concerne. « <b>qu'en</b> » = que + en." },
    sans: { n: 3, o: ["sans", "s'en"], astuce: "« <b>s'en</b> » est devant un verbe (il s'en va → je m'en vais). « <b>sans</b> » est le contraire de « avec »." },
  };
  const H = [
    ["a", "Teva {a} attrapé un gros poisson."], ["a", "Nous allons {à} la plage demain."], ["a", "Hina {a} oublié son cahier sur la table."],
    ["a", "Le bateau arrive {à} Moorea."], ["a", "Mon frère {a} douze ans."], ["a", "Il pense {à} ses vacances."], ["a", "La pirogue {a} chaviré près du récif."],
    ["a", "Elle offre un collier {à} sa mère."], ["a", "Le professeur {a} corrigé nos copies."], ["a", "Nous mangeons {à} midi."], ["a", "Ma tante {a} une voiture rouge."],
    ["a", "Le chien {a} faim."], ["a", "Ils jouent {à} cache-cache."], ["a", "On {a} vu des dauphins ce matin."], ["a", "Le marché ouvre {à} six heures."],
    ["est", "Le lagon {est} calme ce matin."], ["est", "Teva {et} Hina rament ensemble."], ["est", "La mer {est} bleue."], ["est", "J'achète du pain {et} des fruits."],
    ["est", "Mon père {est} pêcheur."], ["est", "Le soleil brille {et} le vent souffle."], ["est", "Ce film {est} passionnant."], ["est", "Elle chante {et} danse."],
    ["est", "Le collège {est} fermé le dimanche."], ["est", "Il prend son sac {et} il part."], ["est", "La tortue {est} sortie de l'eau."], ["est", "Les mangues {et} les papayes sont mûres."],
    ["est", "Où {est} ton frère ?"], ["est", "Il fait chaud {et} humide."],
    ["sont", "Les enfants {sont} sur la plage."], ["sont", "Teva range {son} sac."], ["sont", "Mes cousins {sont} arrivés hier."], ["sont", "Hina prête {son} vélo à Moana."],
    ["sont", "Les vagues {sont} très hautes."], ["sont", "Le pêcheur répare {son} filet."], ["sont", "Ces fleurs {sont} magnifiques."], ["sont", "Il a perdu {son} chapeau."],
    ["sont", "Les élèves {sont} en retard."], ["sont", "Elle aime {son} île."], ["sont", "Où {sont} mes lunettes ?"], ["sont", "Le chien cherche {son} os."],
    ["ont", "Les pêcheurs {ont} rapporté des thons."], ["ont", "{On} part à la plage dimanche."], ["ont", "Mes parents {ont} une pirogue."], ["ont", "{On} entend la mer depuis la maison."],
    ["ont", "Les élèves {ont} fini leur travail."], ["ont", "Ce soir, {on} mange du poisson."], ["ont", "Ils {ont} peur des requins."], ["ont", "{On} a gagné le match !"],
    ["ont", "Les touristes {ont} pris des photos."], ["ont", "Quand {on} nage, il faut bien respirer."], ["ont", "Mes amies {ont} raté le bus."],
    ["ou", "Tu préfères la mangue {ou} l'ananas ?"], ["ou", "{Où} habites-tu ?"], ["ou", "Je ne sais pas {où} est mon sac."], ["ou", "Il viendra lundi {ou} mardi."],
    ["ou", "La maison {où} je suis né est petite."], ["ou", "Veux-tu de l'eau {ou} du jus ?"], ["ou", "Le jour {où} il est parti, il pleuvait."], ["ou", "Prends le bus {ou} le vélo."],
    ["ou", "{Où} vas-tu en vacances ?"], ["ou", "C'est la plage {où} nous jouons."],
    ["se", "Les enfants {se} baignent dans le lagon."], ["se", "{Ce} garçon est mon voisin."], ["se", "Il {se} lève tôt."], ["se", "J'aime {ce} livre."],
    ["se", "Elle {se} souvient de son enfance."], ["se", "{Ce} qui compte, c'est l'amitié."], ["se", "Les pêcheurs {se} reposent."], ["se", "{Ce} soir, nous dînons dehors."],
    ["se", "Teva {se} prépare pour la course."], ["se", "Tout {ce} que tu dis est vrai."],
    ["ses", "Hina range {ses} affaires."], ["ses", "Regarde {ces} nuages, là-bas !"], ["ses", "Le pêcheur répare {ses} filets."], ["ses", "{Ces} fleurs viennent du jardin."],
    ["ses", "Il a oublié {ses} clés."], ["ses", "J'aime {ces} chansons-là."], ["ses", "Teva prête {ses} palmes à son cousin."], ["ses", "Qui a planté {ces} cocotiers ?"],
    ["ses", "Elle écrit à {ses} amies."],
    ["mais", "J'ai cherché {mes} lunettes."], ["mais", "Il pleut, {mais} nous sortons."], ["mais", "{Mes} parents travaillent à Papeete."], ["mais", "Elle est fatiguée {mais} heureuse."],
    ["mais", "Je range {mes} cahiers."], ["mais", "Le requin est grand {mais} calme."],
    ["cest", "{C'est} mon cousin qui a gagné."], ["cest", "Teva {s'est} blessé au pied."], ["cest", "{C'est} l'heure de partir."], ["cest", "Elle {s'est} levée tôt."],
    ["cest", "Le ciel {s'est} couvert."], ["cest", "{C'est} une belle journée."], ["cest", "Le pêcheur {s'est} reposé."], ["cest", "{C'est} difficile."],
    ["cest", "Hina {s'est} souvenue de son rêve."], ["cest", "{C'est} à toi de jouer."],
    ["leur", "Les élèves rangent {leurs} cahiers."], ["leur", "Je {leur} ai donné un cadeau."], ["leur", "Il {leur} parle doucement."], ["leur", "Les touristes ont perdu {leurs} valises."],
    ["leur", "Je {leur} téléphone chaque soir."], ["leur", "Ils aiment {leur} maison."], ["leur", "La maîtresse {leur} raconte une légende."], ["leur", "Les élèves ont rendu {leurs} copies."],
    ["leur", "Nous {leur} avons écrit."], ["leur", "Mes voisins promènent {leurs} trois chiens."],
    ["la", "Le livre ? Hina {l'a} déjà lu."], ["la", "Pose ton sac {là}."], ["la", "{La} mer est agitée."], ["la", "Cette chanson, Teva {l'a} apprise par cœur."],
    ["la", "Je suis {là} !"], ["la", "Il {la} regarde."], ["la", "Le ballon ? Moana {l'a} lancé."], ["la", "Range {la} vaisselle."],
    ["peu", "Il {peut} venir demain."], ["peu", "Je {peux} t'aider."], ["peu", "Il y a {peu} de poissons aujourd'hui."], ["peu", "Tu {peux} nager jusqu'au récif."],
    ["peu", "Elle mange {peu}."], ["peu", "On {peut} partir maintenant."],
    ["ni", "Je {n'y} vais jamais seul."], ["ni", "Il n'aime ni le thé {ni} le café."], ["ni", "Nous {n'y} pensons plus."], ["ni", "Elle ne veut ni partir {ni} rester."],
    ["ni", "Tu {n'y} arriveras pas sans aide."],
    ["quel", "{Quelle} belle journée !"], ["quel", "Je pense {qu'elle} viendra."], ["quel", "{Quel} temps fait-il ?"], ["quel", "Il faut {qu'elle} se repose."],
    ["quel", "{Quelles} chansons préfères-tu ?"], ["quel", "Je crois {qu'elles} sont parties."], ["quel", "{Quels} beaux poissons !"],
    ["quand", "{Quand} la nuit tombe, les crabes sortent."], ["quand", "{Quant} à moi, je reste ici."], ["quand", "{Qu'en} penses-tu ?"], ["quand", "Je viendrai {quand} tu voudras."],
    ["quand", "Il ne parle {qu'en} tahitien avec sa grand-mère."], ["quand", "{Quant} aux élèves, ils sont partis."],
    ["sans", "Il est parti {sans} son sac."], ["sans", "Elle {s'en} va demain."], ["sans", "Ne pars pas {sans} moi."], ["sans", "Teva {s'en} souvient très bien."],
    ["sans", "Ils nagent {sans} palmes."],
  ];
  const paireDuNiveau = (niv) => Object.keys(PAIRES).filter((k) => PAIRES[k].n >= NUM[niv]);
  function qHomophone(niv, palier) {
    const ps = paireDuNiveau(niv);
    // palier 1 : paires de 6e ; palier 2 : paires du niveau ; palier 3 : les plus récentes du niveau (et les pièges)
    const choix = palier === 1 ? ps.filter((k) => PAIRES[k].n === 6) : palier === 3 && NUM[niv] < 6 ? ps.filter((k) => PAIRES[k].n === NUM[niv] || PAIRES[k].n === NUM[niv] + 1) : ps;
    const lignes = H.map((x, k) => [x, k]).filter(([x]) => choix.includes(x[0]));
    const [[cle, phrase], k] = U.pick(lignes);
    const m = phrase.match(/\{([^}]+)\}/), bon = m[1], debut = m.index === 0;
    const cap = (s) => (debut ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    let opts = PAIRES[cle].o.filter((o) => o !== bon.toLowerCase());
    if (opts.length > 3) opts = U.sample(opts, 3);
    const support = U.esc(U.typo(phrase.replace(/\{[^}]+\}/, "§"))).replace("§", "<b>……</b>");
    return G.choix({ bon: cap(bon), faux: opts.map(cap),
      q: { consigne: "Choisis le mot qui convient.", support, melanger: false, cle: "hm|" + k,
        correction: `<p><b>${U.esc(U.typo(phrase.replace(/[{}]/g, "")))}</b></p><p class="astuce">${PAIRES[cle].astuce}</p>` } });
  }

  // ------------------------------------------------------------------ accords dans le groupe nominal
  const NOMS = [["pirogue", "f", "pirogues"], ["requin", "m", "requins"], ["île", "f", "îles"], ["lagon", "m", "lagons"], ["vague", "f", "vagues"],
    ["poisson", "m", "poissons"], ["fleur", "f", "fleurs"], ["cocotier", "m", "cocotiers"], ["plage", "f", "plages"], ["bateau", "m", "bateaux"],
    ["cheval", "m", "chevaux"], ["journal", "m", "journaux"], ["bijou", "m", "bijoux"], ["tortue", "f", "tortues"], ["chanson", "f", "chansons"],
    ["montagne", "f", "montagnes"], ["maison", "f", "maisons"], ["filet", "m", "filets"], ["coquillage", "m", "coquillages"], ["robe", "f", "robes"]];
  // adjectif : m.s, f.s, m.p, f.p ; avant : se place devant le nom
  const ADJ = [["petit", "petite", "petits", "petites", 1], ["grand", "grande", "grands", "grandes", 1], ["joli", "jolie", "jolis", "jolies", 1],
    ["gros", "grosse", "gros", "grosses", 1], ["long", "longue", "longs", "longues", 1],
    ["blanc", "blanche", "blancs", "blanches", 0], ["bleu", "bleue", "bleus", "bleues", 0], ["vert", "verte", "verts", "vertes", 0], ["noir", "noire", "noirs", "noires", 0],
    ["magnifique", "magnifique", "magnifiques", "magnifiques", 0], ["immense", "immense", "immenses", "immenses", 0], ["coloré", "colorée", "colorés", "colorées", 0]];
  const voyelle = (s) => /^[aeéèêiîoôuûyh]/i.test(s);
  function gnAccord(palier) {
    for (let e = 0; e < 50; e++) {
      const n = U.pick(NOMS), a = U.pick(ADJ), pl = Math.random() < (palier === 1 ? 0.5 : 0.7), f = n[1] === "f";
      if (/^(chanson|journal)$/.test(n[0]) && /^(blanc|bleu|vert|noir|coloré|gros|long)$/.test(a[0])) continue;   // pas de « chanson bleue »
      const forme = a[f ? (pl ? 3 : 1) : (pl ? 2 : 0)];
      if (palier === 1 && a[1] === a[0] + "e" && !pl) continue;   // trop facile
      let det;
      if (a[4]) det = pl ? U.pick(["les", "ces", "mes"]) : (voyelle(a[f ? 1 : 0]) ? (f ? "cette" : "cet") : (f ? U.pick(["la", "une", "cette"]) : U.pick(["le", "un", "ce"])));
      else det = pl ? U.pick(["des", "les", "ces", "mes"]) : (voyelle(n[0]) ? (f ? U.pick(["une", "cette"]) : U.pick(["un", "cet"])) : (f ? U.pick(["la", "une", "cette"]) : U.pick(["le", "un", "ce"])));
      if (a[4] && !pl && voyelle(forme) && !f) continue;
      const nom = pl ? n[2] : n[0];
      return { n, a, pl, f, forme, det, nom, avant: !!a[4] };
    }
    return null;
  }
  function qAccordGN(niv, palier) {
    const x = gnAccord(palier); if (!x) return null;
    const avantTxt = x.avant ? `${x.det} ` : `${x.det} ${x.nom} `, apresTxt = x.avant ? `(${x.a[0]}) ${x.nom}` : `(${x.a[0]})`;
    const regle = `<p>L'adjectif s'accorde en <b>genre</b> et en <b>nombre</b> avec le nom qu'il précise : « ${x.nom} » est ${x.f ? "féminin" : "masculin"} ${x.pl ? "pluriel" : "singulier"}.</p>`;
    const cle = "gn|" + x.n[0] + "|" + x.a[0] + "|" + x.pl;
    if (palier === 1) {
      const opts = U.uniq([x.forme].concat(x.a.slice(0, 4))).slice(0, 4);
      return G.choix({ bon: x.forme, faux: opts.slice(1), q: { consigne: "Choisis la forme de l'adjectif qui convient.", support: `${U.esc(U.typo(avantTxt))}<b>……</b> ${U.esc(apresTxt.replace(/^\([^)]*\)\s*/, ""))}`.replace(/\s+$/, "") + ` <span class="discret">(${x.a[0]})</span>`, correction: regle, cle, melanger: false } });
    }
    return { type: "saisie", consigne: "Accorde l'adjectif entre parenthèses.", avant: avantTxt.trim(), apres: apresTxt, attendus: [x.forme], correction: regle, cle };
  }

  // ------------------------------------------------------------------ accord sujet-verbe
  const PRES = (v, p) => FR.B.formes[v].t.P[p][0];
  const SV = [
    // [niveau min, phrase avec {verbe} , personne attendue, explication]
    [6, "Les enfants de ma voisine {jouer} sur la plage.", "ils", "Le sujet est « les enfants de ma voisine » : c'est « les enfants » qui jouent (pluriel)."],
    [6, "Le chien de mes voisins {dormir} sous la table.", "il", "Le sujet est « le chien de mes voisins » : c'est « le chien » qui dort (singulier). « Mes voisins » complète le nom."],
    [6, "Sur la plage {courir} les enfants.", "ils", "Le sujet est placé après le verbe : ce sont « les enfants » qui courent."],
    [6, "Dans le lagon {nager} une tortue.", "il", "Le sujet est après le verbe : c'est « une tortue » qui nage (3e personne du singulier)."],
    [6, "Teva et Hina {danser} au heiva.", "ils", "Deux sujets reliés par « et » : le verbe se met au pluriel."],
    [6, "Ma sœur et moi {chanter} une chanson.", "nous", "« Ma sœur et moi » = nous : 1re personne du pluriel."],
    [6, "Toi et ton frère {lire} une histoire.", "vous", "« Toi et ton frère » = vous : 2e personne du pluriel."],
    [6, "Le bruit des vagues {bercer} les enfants.", "il", "Le sujet est « le bruit des vagues » : c'est « le bruit » qui berce (singulier)."],
    [6, "Les fleurs du jardin {sentir} bon.", "ils", "Le sujet est « les fleurs du jardin » : ce sont « les fleurs » qui sentent bon (pluriel)."],
    [5, "Je les {voir} chaque matin.", "je", "« les » est un pronom COD, pas le sujet. Le sujet est « je »."],
    [5, "Tu les {appeler} souvent.", "tu", "« les » est un pronom COD placé devant le verbe : le sujet est « tu »."],
    [5, "Mes cousins nous {attendre} au port.", "ils", "« nous » est un pronom COD ; le sujet est « mes cousins »."],
    [5, "Le pêcheur leur {offrir} des poissons.", "il", "« leur » est un pronom COI (à eux) ; le sujet est « le pêcheur »."],
    [5, "Chaque élève {prendre} son cahier.", "il", "« Chaque » s'emploie avec un nom au singulier : le verbe est au singulier."],
    [4, "C'est moi qui {finir} le travail.", "je", "Après « moi qui », le verbe s'accorde avec « moi » : 1re personne du singulier."],
    [4, "C'est toi qui {choisir} la musique.", "tu", "Après « toi qui », le verbe s'accorde avec « toi » : 2e personne du singulier."],
    [4, "Ce sont les élèves qui {partir} les premiers.", "ils", "« qui » reprend « les élèves » : le verbe est à la 3e personne du pluriel."],
    [4, "La plupart des touristes {prendre} des photos.", "ils", "Avec « la plupart des » + nom pluriel, le verbe se met au pluriel."],
    [4, "Où {aller} tes amis ce soir ?", "ils", "Le sujet est inversé : ce sont « tes amis » qui vont."],
  ];
  const VERBES_SV = { jouer: "jouer", dormir: "dormir", courir: "courir", nager: "nager", danser: "danser", chanter: "chanter", lire: "lire", bercer: null, sentir: null,
    voir: "voir", appeler: "appeler", attendre: null, offrir: "offrir", prendre: "prendre", finir: "finir", choisir: "choisir", partir: "partir", aller: "aller" };
  // formes au présent (verbes absents de la table : écrites ici, vérifiées à la main)
  const EXTRA = { bercer: { je: "berce", tu: "berces", il: "berce", nous: "berçons", vous: "bercez", ils: "bercent" },
    sentir: { je: "sens", tu: "sens", il: "sent", nous: "sentons", vous: "sentez", ils: "sentent" },
    attendre: { je: "attends", tu: "attends", il: "attend", nous: "attendons", vous: "attendez", ils: "attendent" } };
  const present = (v, p) => (EXTRA[v] ? EXTRA[v][p] : PRES(v, p));
  function qSujetVerbe(niv, palier) {
    const tous = SV.map((x, k) => [x, k]).filter(([x]) => x[0] >= NUM[niv]);
    const recents = tous.filter(([x]) => x[0] === NUM[niv]);
    const l = palier === 3 && recents.length ? recents : tous;
    const [[, phrase, pers, expl], k] = U.pick(l);
    const v = phrase.match(/\{(\w+)\}/)[1], bon = present(v, pers);
    const autres = U.uniq(["il", "ils", "tu", "nous", "vous", "je"].map((p) => present(v, p))).filter((f) => f !== bon);
    const support = U.esc(U.typo(phrase.replace(/\{\w+\}/, "§"))).replace("§", `<b>……</b> <span class="discret">(${v})</span>`);
    if (palier >= 2 && Math.random() < 0.5) {
      const [av, ap] = phrase.split(/\{\w+\}/);
      return { type: "saisie", consigne: "Conjugue le verbe au présent. Attention au sujet !", avant: av.trim(), apres: `(${v})${ap}`, attendus: [bon],
        correction: `<p>${expl}</p><p><b>${U.esc(U.typo(phrase.replace(/\{\w+\}/, bon)))}</b></p>`, cle: "sv|" + k };
    }
    return G.choix({ bon, faux: U.sample(autres, 3), q: { consigne: "Choisis la forme du verbe qui convient (présent).", support, cle: "sv|" + k,
      correction: `<p>${expl}</p><p><b>${U.esc(U.typo(phrase.replace(/\{\w+\}/, bon)))}</b></p><p class="astuce">Trouve d'abord le sujet avec « C'est… qui ». Le verbe s'accorde avec lui, pas avec le mot le plus proche.</p>` } });
  }

  // ------------------------------------------------------------------ participe passé (4e, 3e)
  const PP = [
    ["Les fleurs que Hina a {cueillies} (cueillir) sentent bon.", "COD « que » (= les fleurs) placé avant avoir : accord au féminin pluriel."],
    ["Elles sont {parties} (partir) à l'aube.", "Avec être, le participe s'accorde avec le sujet « elles »."],
    ["Nous avons {mangé} (manger) des mangues.", "Avec avoir, pas d'accord avec le sujet ; le COD « des mangues » est placé après."],
    ["Les lettres qu'il a {écrites} (écrire) sont touchantes.", "COD « qu' » (= les lettres) placé avant avoir : accord au féminin pluriel."],
    ["Mes cousines sont {arrivées} (arriver) hier.", "Avec être, accord avec le sujet « mes cousines » (féminin pluriel)."],
    ["Les poissons que les pêcheurs ont {pêchés} (pêcher) sont frais.", "COD « que » (= les poissons) placé avant avoir : masculin pluriel."],
    ["Hina a {rangé} (ranger) ses affaires.", "Avec avoir, le COD « ses affaires » est après le verbe : pas d'accord."],
    ["La pirogue a été {réparée} (réparer) par mon oncle.", "Voix passive (être) : accord avec le sujet « la pirogue »."],
    ["Ils se sont {levés} (lever) tôt.", "Verbe pronominal : ils ont levé qui ? eux-mêmes (« se », placé avant) : accord au masculin pluriel."],
    ["Les chansons qu'elle a {chantées} (chanter) étaient belles.", "COD « qu' » (= les chansons) placé avant avoir : féminin pluriel."],
    ["Teva et Moana sont {allés} (aller) au marché.", "Avec être, accord avec le sujet « Teva et Moana » (masculin pluriel)."],
    ["Elle a {pris} (prendre) le bus.", "Avec avoir, COD « le bus » après le verbe : pas d'accord."],
    ["Les photos que tu as {prises} (prendre) sont réussies.", "COD « que » (= les photos) placé avant avoir : féminin pluriel."],
    ["La porte est {ouverte} (ouvrir).", "Avec être, accord avec le sujet « la porte » (féminin singulier)."],
    ["Les élèves ont {fini} (finir) leur travail.", "Avec avoir, COD « leur travail » après le verbe : pas d'accord."],
    ["La légende que le conteur a {racontée} (raconter) fait peur.", "COD « que » (= la légende) placé avant avoir : féminin singulier."],
    ["Mes amies sont {venues} (venir) me voir.", "Avec être, accord avec le sujet « mes amies » (féminin pluriel)."],
    ["Nous avons {vu} (voir) des tortues.", "Avec avoir, COD « des tortues » après le verbe : pas d'accord."],
    ["Les tortues que nous avons {vues} (voir) étaient énormes.", "COD « que » (= les tortues) placé avant avoir : féminin pluriel."],
    ["La lettre a été {envoyée} (envoyer) hier.", "Voix passive (être) : accord avec le sujet « la lettre »."],
  ];
  const MS = { cueillir: "cueilli", partir: "parti", manger: "mangé", écrire: "écrit", arriver: "arrivé", pêcher: "pêché", ranger: "rangé", réparer: "réparé",
    lever: "levé", chanter: "chanté", aller: "allé", prendre: "pris", ouvrir: "ouvert", finir: "fini", raconter: "raconté", venir: "venu", voir: "vu", envoyer: "envoyé" };
  function qParticipe(niv, palier) {
    const l = PP.map((x, k) => [x, k]).filter(([x]) => palier === 1 ? !/que|qu'| se /.test(x[0]) : palier === 2 ? true : /que|qu'| se /.test(x[0]));
    const [[phrase, expl], k] = U.pick(l);
    const m = phrase.match(/\{([^}]+)\} \(([^)]+)\)/), bon = m[1], inf = m[2];
    const [av, ap] = phrase.split(m[0]);
    const corr = `<p>${expl}</p><p><b>${U.esc(U.typo(phrase.replace(m[0], bon)))}</b></p><p class="astuce">Avec <b>être</b> : accord avec le sujet. Avec <b>avoir</b> : accord seulement avec le COD placé <b>avant</b> le verbe.</p>`;
    if (palier === 1) {
      const ms = MS[inf];   // participe au masculin singulier
      const opts = U.uniq([bon, ms, ms + "e", ms.endsWith("s") ? ms : ms + "s", ms + "es"]);
      if (ms && opts.length >= 3) return G.choix({ bon, faux: opts.filter((o) => o !== bon).slice(0, 3), q: { consigne: "Choisis la bonne forme du participe passé.", support: `${U.esc(U.typo(av))}<b>……</b> <span class="discret">(${inf})</span>${U.esc(U.typo(ap))}`, correction: corr, cle: "pp|" + k } });
    }
    return { type: "saisie", consigne: "Écris le participe passé du verbe entre parenthèses, bien accordé.", avant: av.trim(), apres: `(${inf})${ap}`, attendus: [bon], correction: corr, cle: "pp|" + k };
  }

  // ------------------------------------------------------------------ -é, -er, -ez ou -ait ?
  const ER = [
    ["Il faut {nettoyer} la plage.", "nettoy", "Après « il faut », le verbe est à l'infinitif : on peut dire « il faut vendre »."],
    ["Les élèves ont {nettoyé} la plage.", "nettoy", "Après l'auxiliaire avoir, c'est le participe passé : « ils ont vendu »."],
    ["Vous {nettoyez} la plage.", "nettoy", "Avec « vous », la terminaison est -ez : « vous vendez »."],
    ["Autrefois, Teva {nettoyait} la plage chaque samedi.", "nettoy", "C'est l'imparfait (autrefois, chaque samedi) : « il vendait »."],
    ["Je vais {chanter} une chanson.", "chant", "Après « je vais », le verbe est à l'infinitif : « je vais vendre »."],
    ["Elle a {chanté} une chanson.", "chant", "Après « a » (avoir), c'est le participe passé : « elle a vendu »."],
    ["Vous {chantez} très bien.", "chant", "Avec « vous » : -ez (« vous vendez »)."],
    ["Nous aimons {danser}.", "dans", "Après un verbe conjugué (« aimons »), le second verbe est à l'infinitif : « nous aimons vendre »."],
    ["Ils ont {dansé} toute la nuit.", "dans", "Après « ont » (avoir), c'est le participe passé : « ils ont vendu »."],
    ["Il faut {ramer} plus vite.", "ram", "Après « il faut » : infinitif (« il faut vendre »)."],
    ["Le pêcheur a {ramé} jusqu'au motu.", "ram", "Après « a » : participe passé (« il a vendu »)."],
    ["Pouvez-vous {fermer} la porte ?", "ferm", "Après « pouvez-vous », infinitif : « pouvez-vous vendre ? »."],
    ["Vous {fermez} la fenêtre.", "ferm", "Avec « vous » : -ez."],
    ["Ma mère va {préparer} le repas.", "prépar", "Après « va », infinitif : « elle va vendre »."],
    ["Le repas est {préparé}.", "prépar", "Ici « préparé » est un participe passé (« le repas est vendu »)."],
    ["Elle veut {nager} avec les dauphins.", "nag", "Après « veut », infinitif : « elle veut vendre »."],
    ["Nous avons {nagé} avec les dauphins.", "nag", "Après « avons », participe passé : « nous avons vendu »."],
    ["Tu dois {écouter} le conteur.", "écout", "Après « dois », infinitif : « tu dois vendre »."],
    ["Hier, nous avons {écouté} le conteur.", "écout", "Après « avons », participe passé : « nous avons vendu »."],
    ["Chaque soir, il {écoutait} la radio.", "écout", "Imparfait (chaque soir) : « il vendait »."],
    ["Avant de {manger}, lave-toi les mains.", "mang", "Après la préposition « de », infinitif : « avant de vendre »."],
    ["Vous {mangez} trop vite !", "mang", "Avec « vous » : -ez."],
  ];
  function qER(niv, palier) {
    const [[phrase, rad, expl], k] = U.pick(ER.map((x, i) => [x, i]));
    const m = phrase.match(/\{([^}]+)\}/), bon = m[1];
    const e = /g$/.test(rad) ? "e" : "";   // nageait, mangeait
    const opts = [rad + "er", rad + "é", rad + "ez", rad + e + "ait"];
    const support = U.esc(U.typo(phrase.replace(m[0], "§"))).replace("§", "<b>……</b>");
    return G.choix({ bon, faux: opts.filter((o) => o !== bon), q: { consigne: "Choisis la bonne terminaison.", support, melanger: false, cle: "er|" + k,
      correction: `<p>${expl}</p><p class="astuce">Astuce : remplace par un verbe du 3e groupe comme <b>vendre</b> : vendre (-er), vendu (-é), vendez (-ez), vendait (-ait).</p>` } });
  }

  FR.notion({
    id: "o-homophones", domaine: "orthographe", ordre: 1, niveaux: ["6e", "5e", "4e", "3e"], titre: "Les homophones grammaticaux",
    resume: (niv) => "Choisir le bon mot : " + paireDuNiveau(niv).map((k) => PAIRES[k].o.slice(0, 2).join("/")).join(", ") + ".",
    fiche: (niv) => `<h2>Les homophones grammaticaux</h2><p>Des mots qui se prononcent pareil mais ne s'écrivent pas pareil. Pour choisir, on <b>remplace</b> le mot par un autre.</p>
      <div class="tableau-scroll"><table><tr><th>Mots</th><th>L'astuce</th></tr>${paireDuNiveau(niv).map((k) => `<tr><td><b>${PAIRES[k].o.join(" / ")}</b></td><td>${PAIRES[k].astuce}</td></tr>`).join("")}</table></div>`,
    gen: (p, niv) => qHomophone(niv, p),
  });
  FR.notion({
    id: "o-accords", domaine: "orthographe", ordre: 2, niveaux: ["6e", "5e", "4e", "3e"], titre: (niv) => (niv === "4e" || niv === "3e" ? "Les accords (dont le participe passé)" : "Les accords"),
    resume: (niv) => (niv === "4e" || niv === "3e" ? "Accorder l'adjectif, le verbe avec son sujet et le participe passé." : "Accorder l'adjectif avec le nom et le verbe avec son sujet."),
    fiche: (niv) => `<h2>Les accords</h2>
      <h3>Dans le groupe nominal</h3><div class="regle">Le déterminant et l'adjectif prennent le <b>genre</b> (masculin/féminin) et le <b>nombre</b> (singulier/pluriel) du nom.</div>
      <p class="ex">une pirogue blanche → des pirogues blanches ; un bateau neuf → des bateaux neufs</p>
      <h3>Le verbe et son sujet</h3><div class="regle">Le verbe s'accorde avec son <b>sujet</b>, même s'il est loin ou placé après le verbe.</div>
      <p class="ex">Le chien de mes voisins <b>dort</b>. (c'est « le chien » qui dort) — Sur la plage <b>courent</b> les enfants.</p>
      ${niv === "4e" || niv === "3e" ? `<h3>Le participe passé</h3><div class="regle">Avec <b>être</b> : il s'accorde avec le sujet (elles sont part<b>ies</b>). Avec <b>avoir</b> : il ne s'accorde pas avec le sujet, mais avec le <b>COD placé avant</b> le verbe (les fleurs qu'elle a cueill<b>ies</b>).</div>` : ""}`,
    gen(p, niv) {
      const r = Math.random();
      if (niv === "4e" || niv === "3e") return r < 0.45 ? qParticipe(niv, p) : r < 0.75 ? qSujetVerbe(niv, p) : qAccordGN(niv, p);
      return r < 0.55 ? qAccordGN(niv, p) : qSujetVerbe(niv, p);
    },
  });
  FR.notion({
    id: "o-terminaisons", domaine: "orthographe", ordre: 3, niveaux: ["6e", "5e"], titre: "-é, -er, -ez ou -ait ?",
    resume: "Choisir la bonne terminaison des verbes en -er grâce au verbe « vendre ».",
    fiche: () => `<h2>-é, -er, -ez ou -ait ?</h2><p>Ces terminaisons se prononcent presque pareil. Pour choisir, remplace le verbe par <b>vendre</b> :</p>
      <div class="tableau-scroll"><table><tr><th>Si on peut dire…</th><th>on écrit…</th><th>Exemple</th></tr>
      <tr><td>vendre</td><td><b>-er</b> (infinitif)</td><td class="ex">Il faut nettoy<b>er</b> la plage. (il faut vendre)</td></tr>
      <tr><td>vendu</td><td><b>-é</b> (participe passé)</td><td class="ex">Ils ont nettoy<b>é</b> la plage. (ils ont vendu)</td></tr>
      <tr><td>vendez</td><td><b>-ez</b> (avec vous)</td><td class="ex">Vous nettoy<b>ez</b> la plage. (vous vendez)</td></tr>
      <tr><td>vendait</td><td><b>-ait</b> (imparfait)</td><td class="ex">Il nettoy<b>ait</b> la plage. (il vendait)</td></tr></table></div>`,
    gen: (p, niv) => qER(niv, p),
  });
  FR.orthographe = { PAIRES, H, NOMS, ADJ, SV, PP, ER, EXTRA };
})();
