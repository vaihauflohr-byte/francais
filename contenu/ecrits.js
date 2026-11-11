/* =====================================================================
   Français au collège — ÉCRIRE
   1) Rédactions vérifiées par l'IA (type « ecrit ») : consigne, boîte à outils, critères notés (total 20).
      L'IA dit pour chaque critère : réussi, en partie, ou pas encore ; elle relève aussi quelques erreurs de langue.
   2) Réécriture (série notée) : transformer un passage (personne, nombre, temps), corrigée mot à mot.
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u;

  const ECRITS = [
    { id: "e-monstre", niveaux: ["6e"], titre: "Décrire un monstre", resume: "Décris un monstre du lagon et fais sentir la peur qu'il inspire.",
      consigne: "Imagine un monstre qui vit au fond du lagon. Décris-le en 8 à 12 lignes : son corps, sa tête, ses yeux, sa façon de bouger. Fais sentir la peur qu'il inspire.",
      mots: [60, 220],
      aide: `<ul><li><b>Parties du corps</b> : une gueule, des crocs, des écailles, des tentacules, une nageoire, des griffes, une queue.</li>
        <li><b>Adjectifs</b> : gigantesque, visqueux, gluant, écailleux, pointu, glacé, verdâtre, monstrueux.</li>
        <li><b>Verbes</b> : ramper, glisser, surgir, onduler, claquer, rugir, siffler.</li>
        <li><b>La peur</b> : trembler, frissonner, terrifiant, effrayant, glacer le sang.</li>
        <li><b>Pour organiser</b> : d'abord sa tête… ; au milieu de son front… ; son corps… ; enfin sa queue…</li></ul>`,
      criteres: [
        { t: "Le monstre est décrit avec au moins trois parties de son corps (par exemple la tête, les yeux, le corps, la queue).", p: 5 },
        { t: "Les noms sont précisés par des adjectifs ou des compléments (par exemple « des yeux rouges comme des braises »).", p: 4 },
        { t: "La description fait ressentir la peur (mots de la peur, réaction de celui qui le voit, comparaison effrayante).", p: 4 },
        { t: "La description est organisée : on passe d'une partie du corps à l'autre dans un ordre clair.", p: 3 },
        { t: "Langue : les phrases commencent par une majuscule, finissent par un point et les verbes sont conjugués ; peu d'erreurs d'orthographe pour un élève de 6e.", p: 4 }],
      corrige: "Description d'un monstre marin imaginaire, au présent ou à l'imparfait. On attend au moins trois parties du corps décrites, des expansions du nom (adjectifs, compléments du nom, comparaisons), un vocabulaire de la peur et un ordre de description visible. Niveau 6e : des phrases simples mais correctes suffisent." },
    { id: "e-combat", niveaux: ["5e"], titre: "Le combat du héros", resume: "Raconte au passé le combat d'un héros contre un monstre.",
      consigne: "Raconte, au passé, le combat d'un héros ou d'une héroïne contre un monstre que tu inventes (10 à 15 lignes). Ton personnage doit gagner grâce à son courage ou à sa ruse.",
      mots: [100, 280],
      aide: `<ul><li><b>Temps</b> : passé simple pour les actions (il frappa, elle bondit), imparfait pour les descriptions (le monstre avait…).</li>
        <li><b>Connecteurs de temps</b> : d'abord, soudain, alors, ensuite, au même moment, enfin.</li>
        <li><b>Vocabulaire</b> : un bouclier, une lance, une épée ; esquiver, frapper, bondir, s'élancer, rugir, terrasser, vaincre.</li>
        <li><b>Plan</b> : 1) le héros arrive et voit le monstre ; 2) le combat, en plusieurs étapes ; 3) la victoire.</li></ul>`,
      criteres: [
        { t: "Le héros et le monstre sont présentés (nom ou qualités du héros, apparence du monstre).", p: 4 },
        { t: "Le combat est raconté en plusieurs étapes, reliées par des connecteurs de temps (d'abord, soudain, alors, enfin…).", p: 4 },
        { t: "Le récit est au passé : passé simple pour les actions, imparfait pour les descriptions, sans passer au présent.", p: 4 },
        { t: "Le héros montre son courage ou sa ruse, et la fin raconte clairement sa victoire.", p: 4 },
        { t: "Langue : phrases correctes et ponctuées, peu d'erreurs d'orthographe et d'accord pour un élève de 5e.", p: 4 }],
      corrige: "Récit de combat épique au passé (passé simple et imparfait). On attend : présentation des adversaires, au moins trois étapes du combat, connecteurs de temps, une qualité héroïque (courage, ruse), une victoire claire. Niveau 5e." },
    { id: "e-scene", niveaux: ["4e"], titre: "Écrire une scène de comédie", resume: "Un maître avare, un valet malin, une pièce perdue… à toi d'écrire la scène.",
      consigne: "Écris une courte scène de comédie (au moins 8 répliques). Un maître très avare a perdu une pièce de monnaie et accuse tout le monde ; son valet l'a trouvée et la cache dans sa poche. Respecte la présentation du théâtre.",
      mots: [80, 280],
      aide: `<ul><li><b>Présentation</b> : le NOM du personnage en majuscules, puis sa réplique. Exemple : <i>LE MAÎTRE. — Où est ma pièce ?</i></li>
        <li><b>Didascalies</b> entre parenthèses, pour les gestes et le ton : <i>(Il fouille sous la table.)</i> <i>(à part)</i></li>
        <li><b>Pour faire rire</b> : un geste maladroit, une exagération, une répétition, un quiproquo, un aparté.</li></ul>`,
      criteres: [
        { t: "La présentation du théâtre est respectée : le nom du personnage est écrit avant chaque réplique.", p: 4 },
        { t: "Il y a au moins deux didascalies (gestes, ton, déplacements), entre parenthèses.", p: 4 },
        { t: "Il y a au moins un procédé comique (geste, exagération, répétition, quiproquo ou aparté).", p: 4 },
        { t: "La scène compte au moins 8 répliques et on comprend la situation (le maître cherche sa pièce, le valet la cache).", p: 4 },
        { t: "Langue : phrases correctes et ponctuées (points d'exclamation et d'interrogation), peu d'erreurs pour un élève de 4e.", p: 4 }],
      corrige: "Scène de théâtre comique avec un maître avare et un valet. On attend la présentation théâtrale (noms des personnages avant les répliques), des didascalies, au moins un procédé comique identifiable, au moins 8 répliques cohérentes. Classe de 4e de niveau moyen : on valorise une scène simple mais vivante." },
    { id: "e-avis", niveaux: ["4e"], titre: "Donner son avis : l'uniforme", resume: "Faut-il porter un uniforme au collège ? Un paragraphe argumenté.",
      consigne: "Faut-il porter un uniforme au collège ? Donne ton avis dans un paragraphe argumenté de 10 à 15 lignes.",
      mots: [90, 260],
      aide: `<ul><li>Commence par ton avis : « À mon avis, … » ou « Je pense que… »</li>
        <li>Donne <b>deux arguments</b>, chacun avec <b>un exemple</b> : D'abord… En effet… Par exemple… De plus…</li>
        <li>Termine par une conclusion : « Pour toutes ces raisons, … »</li>
        <li><b>Connecteurs</b> : d'abord, ensuite, de plus, en effet, par exemple, cependant, donc, enfin.</li></ul>`,
      criteres: [
        { t: "L'avis est donné clairement dès le début.", p: 4 },
        { t: "Il y a au moins deux arguments différents.", p: 4 },
        { t: "Chaque argument est illustré par un exemple précis.", p: 4 },
        { t: "Le paragraphe est organisé avec des connecteurs logiques et se termine par une conclusion.", p: 4 },
        { t: "Langue : phrases correctes, peu d'erreurs d'orthographe et d'accord pour un élève de 4e.", p: 4 }],
      corrige: "Paragraphe argumentatif. Les deux avis (pour ou contre l'uniforme) sont acceptés. Arguments possibles : égalité entre élèves, moins de moqueries, sentiment d'appartenance, économies ; ou liberté de s'habiller, expression de sa personnalité, coût, confort par la chaleur. Classe de 4e de niveau moyen." },
    { id: "e-souvenir", niveaux: ["3e"], titre: "Brevet : raconter un souvenir", resume: "Sujet d'imagination : un souvenir d'enfance, l'enfant et l'adulte.",
      consigne: "Raconte un souvenir d'enfance qui t'a marqué (une peur, une joie, une bêtise…). Écris à la première personne, au passé, et fais part des sentiments de l'enfant que tu étais et du regard de l'adulte que tu es devenu(e). (15 à 25 lignes)",
      mots: [150, 450],
      aide: `<ul><li><b>Temps</b> : imparfait et passé simple (ou passé composé) pour raconter ; présent pour le regard de l'adulte (« Aujourd'hui, je comprends que… »).</li>
        <li><b>Sentiments</b> : la peur, la honte, la fierté, l'impatience, le soulagement…</li>
        <li><b>Plan possible</b> : la situation (où, quand, avec qui) ; l'événement ; ce que tu as ressenti ; ce que tu en penses aujourd'hui.</li></ul>`,
      criteres: [
        { t: "Le récit est écrit à la première personne et raconte un souvenir d'enfance précis (lieu, moment, personnes).", p: 4 },
        { t: "Les temps du passé sont bien employés (imparfait et passé simple, ou passé composé).", p: 4 },
        { t: "Les sentiments de l'enfant sont exprimés.", p: 4 },
        { t: "Le regard de l'adulte apparaît (présent de l'écriture, réflexion sur ce souvenir).", p: 4 },
        { t: "Langue : phrases correctes et variées, ponctuation, peu d'erreurs pour un élève de 3e.", p: 4 }],
      corrige: "Récit autobiographique (sujet d'imagination du brevet). On attend la première personne, un souvenir précis, des temps du passé maîtrisés, l'expression des sentiments de l'enfant et un retour de l'adulte au présent. Niveau 3e : des phrases simples sont acceptées si elles sont correctes." },
    { id: "e-reflexion", niveaux: ["3e"], titre: "Brevet : écrire sur soi, utile ?", resume: "Sujet de réflexion : un développement argumenté avec des exemples.",
      consigne: "Selon toi, est-il utile d'écrire sur sa propre vie ? Réponds dans un développement argumenté et organisé (15 à 25 lignes), en t'appuyant sur des exemples précis (lectures, films, expérience personnelle).",
      mots: [150, 450],
      aide: `<ul><li><b>Introduction</b> : pose la question et annonce ton plan.</li>
        <li><b>Un paragraphe par argument</b> : idée + explication + exemple (un livre étudié en classe, un film, ton expérience).</li>
        <li><b>Conclusion</b> : réponds clairement à la question.</li>
        <li><b>Connecteurs</b> : tout d'abord, en effet, par exemple, de plus, cependant, ainsi, en conclusion.</li></ul>`,
      criteres: [
        { t: "La réponse à la question est claire (dans l'introduction ou la conclusion).", p: 4 },
        { t: "Il y a au moins deux arguments différents, chacun expliqué.", p: 4 },
        { t: "Les arguments sont appuyés par des exemples précis (lecture, film, expérience).", p: 4 },
        { t: "Le texte est organisé : paragraphes, connecteurs logiques, conclusion.", p: 4 },
        { t: "Langue : phrases correctes, peu d'erreurs pour un élève de 3e.", p: 4 }],
      corrige: "Développement argumenté (sujet de réflexion du brevet). Arguments possibles : se souvenir, mieux se comprendre, témoigner pour les autres, dénoncer une injustice, laisser une trace ; limites : pudeur, mémoire infidèle. Exemples : autobiographies lues en classe, journal d'Anne Frank, expérience personnelle. Niveau 3e." },
  ];
  ECRITS.forEach((e, k) => FR.notion(Object.assign({ domaine: "ecrire", type: "ecrit", ordre: 10 + k,
    fiche: () => `<h2>${U.esc(e.titre)}</h2><p><b>Sujet.</b> ${U.esc(U.typo(e.consigne))}</p><div class="aide-ecrit"><b>Boîte à outils</b>${e.aide}</div>
      <h3>Ce qui sera vérifié</h3><ul>${e.criteres.map((c) => `<li>${U.esc(U.typo(c.t))} <span class="discret">(${c.p} pts)</span></li>`).join("")}</ul>` }, e)));

  // ------------------------------------------------------------------ réécriture
  // [niveau mini (6, 5, 4, 3), palier, consigne, texte, réécriture attendue]
  const REE = [
    [6, 1, "Réécris en remplaçant « je » par « nous ».", "Je chante et je danse sur la plage.", "Nous chantons et nous dansons sur la plage."],
    [6, 1, "Réécris en remplaçant « le chat » par « les chats ».", "Le chat dort sur le canapé.", "Les chats dorment sur le canapé."],
    [6, 1, "Réécris en remplaçant « tu » par « vous ».", "Tu cours trop vite : tu vas tomber !", "Vous courez trop vite : vous allez tomber !"],
    [6, 1, "Réécris en remplaçant « il » par « ils ».", "Il finit de manger et il part à l'école.", "Ils finissent de manger et ils partent à l'école."],
    [6, 1, "Réécris en remplaçant « le cheval » par « les chevaux ».", "Le cheval galope et il saute la barrière.", "Les chevaux galopent et ils sautent la barrière."],
    [5, 1, "Réécris en remplaçant « nous » par « je ».", "Nous regardions la mer et nous rêvions de voyages.", "Je regardais la mer et je rêvais de voyages."],
    [5, 1, "Réécris en remplaçant « elle » par « elles ».", "Elle est contente : elle a gagné la course.", "Elles sont contentes : elles ont gagné la course."],
    [6, 2, "Réécris au passé simple.", "Le guerrier lève son bouclier et attaque le monstre.", "Le guerrier leva son bouclier et attaqua le monstre."],
    [6, 2, "Réécris à l'imparfait.", "Les enfants jouent sur la plage pendant que leur mère prépare le repas.", "Les enfants jouaient sur la plage pendant que leur mère préparait le repas."],
    [6, 2, "Réécris au futur.", "Demain, nous allons au marché et nous achetons des fruits.", "Demain, nous irons au marché et nous achèterons des fruits."],
    [6, 2, "Réécris au présent.", "Le vent soufflait et les vagues frappaient les rochers.", "Le vent souffle et les vagues frappent les rochers."],
    [5, 2, "Réécris au passé simple.", "Le valet ouvre la porte, regarde son maître et éclate de rire.", "Le valet ouvrit la porte, regarda son maître et éclata de rire."],
    [5, 2, "Réécris au passé composé.", "Elle sortit de la maison et elle courut vers le lagon.", "Elle est sortie de la maison et elle a couru vers le lagon."],
    [5, 2, "Réécris à l'imparfait.", "Chaque soir, ma grand-mère me raconte des légendes ; je l'écoute sans bouger.", "Chaque soir, ma grand-mère me racontait des légendes ; je l'écoutais sans bouger."],
    [4, 2, "Réécris au plus-que-parfait.", "Il a fini son travail et il est parti.", "Il avait fini son travail et il était parti."],
    [4, 2, "Réécris au futur.", "Quand tu viens, nous partons ensemble à la pêche.", "Quand tu viendras, nous partirons ensemble à la pêche."],
    [5, 3, "Réécris en remplaçant « Teva » par « Teva et Hina ».", "Teva est arrivé en retard : il était fatigué.", "Teva et Hina sont arrivés en retard : ils étaient fatigués."],
    [5, 3, "Réécris en remplaçant « l'enfant » par « les enfants ».", "L'enfant était fier : il avait gagné la course.", "Les enfants étaient fiers : ils avaient gagné la course."],
    [4, 3, "Réécris en remplaçant « je » par « elles ».", "Je suis partie tôt et je me suis assise près de la fenêtre.", "Elles sont parties tôt et elles se sont assises près de la fenêtre."],
    [4, 3, "Réécris en remplaçant « il » par « elles ».", "Il s'est levé, il a regardé l'horizon et il est resté silencieux.", "Elles se sont levées, elles ont regardé l'horizon et elles sont restées silencieuses."],
    [4, 3, "Réécris au passé simple, en remplaçant « il » par « ils ».", "Il entre dans la grotte et il voit le géant.", "Ils entrèrent dans la grotte et ils virent le géant."],
    [3, 3, "Réécris en remplaçant « je » par « nous ».", "Je me souviens de ce jour : j'avais peur et je tremblais.", "Nous nous souvenons de ce jour : nous avions peur et nous tremblions."],
    [3, 3, "Réécris à l'imparfait, en remplaçant « elle » par « elles ».", "Elle se promène au bord de l'eau et elle chante.", "Elles se promenaient au bord de l'eau et elles chantaient."],
    [3, 3, "Réécris au passé composé, en remplaçant « nous » par « elle ».", "Nous descendîmes vers la plage et nous nous baignâmes.", "Elle est descendue vers la plage et elle s'est baignée."],
  ];
  const NUM = { "6e": 6, "5e": 5, "4e": 4, "3e": 3 };
  FR.notion({
    id: "e-reecriture", domaine: "ecrire", ordre: 1, niveaux: ["6e", "5e", "4e", "3e"], titre: "La réécriture",
    resume: (niv) => (niv === "3e" ? "Comme au brevet : changer la personne, le nombre ou le temps, sans oublier un accord." : "Changer la personne, le nombre ou le temps d'un passage, sans oublier un accord."),
    compo: { tous: { 1: 2, 2: 2, 3: 1 }, "6e": { 1: 3, 2: 2 } },
    fiche: (niv) => `<h2>Réussir une réécriture</h2>
      <ol><li>Lis la consigne : que faut-il changer ? la <b>personne</b> (je → nous), le <b>nombre</b> (singulier → pluriel), le <b>temps</b> ?</li>
      <li>Repère tous les mots qui dépendent du mot changé : <b>verbes</b>, <b>pronoms</b>, <b>déterminants</b> (son → leur), <b>adjectifs</b> et <b>participes passés</b> à accorder.</li>
      <li>Ne change <b>rien d'autre</b> : la ponctuation et les autres mots restent identiques.</li>
      <li>Relis mot à mot, en vérifiant chaque accord.</li></ol>
      <div class="attention">Avec l'auxiliaire <b>être</b>, le participe passé s'accorde avec le sujet : <i>elle est partie, ils sont partis</i>.${NUM[niv] <= 4 ? " Pour les verbes pronominaux : <i>elles se sont assises</i>." : ""}</div>
      <p class="discret">Chaque erreur enlève 0,5 point (sur 2 par réécriture).</p>`,
    gen: (p, niv) => {
      const l = REE.filter((x) => x[0] >= NUM[niv] && x[1] === p);
      const x = U.pick(l.length ? l : REE.filter((y) => y[0] >= NUM[niv]));
      return { type: "reecriture", consigne: x[2], texte: x[3], attendu: x[4], cle: "re|" + x[3] + "|" + x[2] };
    },
  });
  FR.ecrits = { ECRITS, REE };
})();
