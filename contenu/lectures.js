/* =====================================================================
   Français au collège — LIRE ET COMPRENDRE (un texte, des questions, une réponse rédigée vérifiée par l'IA)
   Texte : paragraphes ; chaque paragraphe = liste de passages (une phrase ou un groupe de phrases).
     « (…) » : didascalie (en italique) · « #NOM » : nom de personnage (non cliquable).
   Questions :
     { type: "choix", consigne, bon, faux: [...], correction }                      → 2 points
     { type: "citation", consigne, ok: ["début du passage attendu", …], correction } → 2 points (toucher le passage dans le texte)
     { type: "redige", consigne, aide, debut, corrige, elements: [{ t, p }], mots: [min, max] } → somme des p (vérifiée par l'IA)
   Les textes de Molière sont dans le domaine public ; les autres sont écrits pour l'entraînement.
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR;
  const REP = "<b>R</b>eprends les mots de la question · <b>E</b>xplique avec tes mots · <b>P</b>rouve avec une citation du texte, entre guillemets.";

  FR.notion({
    id: "lire-hina", domaine: "lire", type: "lecture", ordre: 1, niveaux: ["6e"], titre: "Hina et l'anguille",
    resume: "Une légende polynésienne : d'où vient le cocotier ?",
    texte: {
      titre: "Hina et l'anguille", source: "Légende polynésienne, racontée pour l'entraînement.",
      par: [
        ["Autrefois, sur l'île de Tahiti, vivait une jeune femme nommée Hina.", "Chaque matin, elle allait se baigner dans un bassin d'eau douce, au pied de la montagne."],
        ["Un jour, une énorme anguille sortit de l'eau sombre.", "Elle s'approcha lentement de Hina et la regarda avec de grands yeux tristes.", "Hina poussa un cri et s'enfuit en courant jusqu'au village."],
        ["Le lendemain, l'anguille l'attendait encore.", "Alors, d'une voix douce, elle parla :", "« N'aie pas peur, Hina. Je suis Tuna, le roi des anguilles. J'ai quitté mon royaume pour vivre près de toi. »"],
        ["Mais les gens du village avaient peur du monstre.", "Le héros Maui décida de le combattre.", "Avant de mourir, Tuna appela Hina :", "« Quand je serai mort, coupe ma tête et enterre-la près de ta maison. Il en sortira une plante qui nourrira ton peuple. »"],
        ["Hina obéit.", "Quelques jours plus tard, une pousse verte sortit de la terre.", "Elle grandit et devint le premier cocotier.", "Ses noix donnaient une eau fraîche et une chair blanche et sucrée."],
        ["Aujourd'hui encore, si tu regardes bien une noix de coco, tu verras trois petites taches : ce sont les deux yeux et la bouche de Tuna."],
      ],
      notes: [],
    },
    questions: [
      { type: "choix", consigne: "Où Hina allait-elle se baigner chaque matin ?", bon: "Dans un bassin d'eau douce, au pied de la montagne.",
        faux: ["Dans le lagon, près du village.", "Dans la mer, derrière le récif.", "Dans une rivière, au fond de la vallée."],
        correction: "Paragraphe 1 : « elle allait se baigner dans un bassin d'eau douce, au pied de la montagne »." },
      { type: "citation", consigne: "Touche la phrase qui montre que Hina a eu peur la première fois qu'elle a vu l'anguille.", ok: ["Hina poussa un cri"],
        correction: "Elle crie et elle s'enfuit en courant : ce sont des réactions de peur." },
      { type: "choix", consigne: "Qui est l'anguille ?", bon: "Tuna, le roi des anguilles.", faux: ["Le héros Maui, transformé en anguille.", "Un dieu de la mer.", "Un poisson ordinaire, sans nom."],
        correction: "Elle se présente elle-même : « Je suis Tuna, le roi des anguilles »." },
      { type: "citation", consigne: "Touche le passage dans lequel Tuna demande quelque chose à Hina avant de mourir.", ok: ["« Quand je serai mort"],
        correction: "Tuna lui demande d'enterrer sa tête près de sa maison : il utilise l'impératif (« coupe », « enterre-la »)." },
      { type: "choix", consigne: "Cette légende explique l'origine…", bon: "du cocotier.", faux: ["des anguilles.", "de l'île de Tahiti.", "du village de Hina."],
        correction: "De la tête de Tuna sort « le premier cocotier » : c'est un récit des origines." },
      { type: "choix", consigne: "Les verbes « sortit », « poussa » et « décida » sont conjugués…", bon: "au passé simple.", faux: ["à l'imparfait.", "au présent.", "au futur."],
        correction: "Le passé simple raconte les actions principales du récit : il sortit, elle poussa, il décida." },
      { type: "redige", consigne: "Selon la légende, pourquoi voit-on trois petites taches sur une noix de coco ? Réponds par une phrase complète, avec tes mots.",
        aide: "Commence en reprenant la question : « On voit trois petites taches sur une noix de coco parce que… »",
        debut: "On voit trois petites taches sur une noix de coco parce que ",
        corrige: "On voit trois petites taches sur une noix de coco parce que le premier cocotier a poussé là où Hina a enterré la tête de Tuna : les taches sont les deux yeux et la bouche de l'anguille.",
        elements: [{ t: "Le cocotier est né de la tête de Tuna, que Hina a enterrée.", p: 2 }, { t: "Les trois taches sont les deux yeux et la bouche de Tuna.", p: 2 },
          { t: "La réponse est une phrase complète qui reprend la question (majuscule au début, point à la fin).", p: 1 }],
        mots: [8, 90] },
    ],
  });

  FR.notion({
    id: "lire-cyclope", domaine: "lire", type: "lecture", ordre: 1, niveaux: ["5e"], titre: "Ulysse et le Cyclope",
    resume: "Un épisode de L'Odyssée : comment Ulysse échappe-t-il au géant ?",
    texte: {
      titre: "Ulysse et le Cyclope", source: "D'après L'Odyssée d'Homère (chant IX), récit adapté pour l'entraînement.",
      par: [
        ["Après la guerre de Troie, Ulysse et ses compagnons naviguaient vers leur île, Ithaque.", "Un soir, ils abordèrent sur une terre inconnue et entrèrent dans une immense grotte, remplie de fromages et d'agneaux."],
        ["Soudain, le sol trembla.", "Un géant apparut, qui poussait devant lui un troupeau de moutons.", "C'était Polyphème, un Cyclope : il n'avait qu'un œil, au milieu du front.",
          "Il ferma l'entrée de la grotte avec un rocher si lourd que vingt hommes n'auraient pas pu le déplacer."],
        ["Quand il aperçut les marins, il en saisit deux et les dévora.", "Les compagnons d'Ulysse tremblaient de terreur.", "Ulysse, lui, réfléchissait."],
        ["Le lendemain soir, il offrit au géant un vin très fort.", "« Comment t'appelles-tu ? » demanda le Cyclope.", "« Je m'appelle Personne », répondit le héros.", "Le monstre but, puis s'endormit lourdement."],
        ["Alors Ulysse prit un long pieu d'olivier, durcit sa pointe dans le feu et, avec l'aide de ses compagnons, l'enfonça dans l'œil du géant.", "Polyphème hurla de douleur.",
          "Les autres Cyclopes accoururent : « Qui te fait du mal ? »", "« Personne ! » cria-t-il.", "Ils repartirent en haussant les épaules."],
        ["Au matin, le géant aveugle ouvrit la grotte pour laisser sortir ses moutons.", "Il tâtait leur dos, mais les Grecs s'étaient accrochés sous le ventre des bêtes.", "Ainsi, grâce à sa ruse, Ulysse sauva ses compagnons."],
      ],
      notes: [["un pieu", "un gros bâton pointu."], ["tâter", "toucher avec la main pour reconnaître quelque chose."]],
    },
    questions: [
      { type: "choix", consigne: "Pourquoi Ulysse et ses compagnons ne peuvent-ils pas sortir de la grotte ?", bon: "Le Cyclope a bouché l'entrée avec un énorme rocher.",
        faux: ["Ils se sont perdus dans le noir.", "Les moutons bloquent la sortie.", "Les autres Cyclopes gardent l'entrée."],
        correction: "« Il ferma l'entrée de la grotte avec un rocher si lourd que vingt hommes n'auraient pas pu le déplacer. »" },
      { type: "citation", consigne: "Touche la phrase qui décrit le physique du Cyclope.", ok: ["C'était Polyphème"],
        correction: "« il n'avait qu'un œil, au milieu du front » : c'est un détail physique." },
      { type: "choix", consigne: "Pourquoi Ulysse dit-il qu'il s'appelle « Personne » ?", bon: "Pour que les autres Cyclopes ne comprennent pas qui attaque Polyphème.",
        faux: ["Parce qu'il a oublié son nom.", "Parce que c'est son vrai nom.", "Pour faire rire le Cyclope."],
        correction: "Quand Polyphème crie « Personne ! », les autres croient que personne ne lui fait de mal et ils repartent." },
      { type: "citation", consigne: "Touche la phrase qui montre que la ruse du nom « Personne » a réussi.", ok: ["Ils repartirent en haussant", "« Personne ! » cria-t-il"],
        correction: "Les autres Cyclopes repartent sans aider Polyphème : la ruse a marché." },
      { type: "choix", consigne: "Quelle qualité d'Ulysse ce passage met-il surtout en valeur ?", bon: "Sa ruse, son intelligence.", faux: ["Sa force physique.", "Sa gourmandise.", "Sa peur."],
        correction: "« Ulysse, lui, réfléchissait » ; « grâce à sa ruse, Ulysse sauva ses compagnons »." },
      { type: "choix", consigne: "Les verbes « abordèrent », « apparut » et « ferma » sont conjugués…", bon: "au passé simple.", faux: ["à l'imparfait.", "au passé composé.", "au présent."],
        correction: "Le passé simple sert aux actions principales du récit ; l'imparfait (« naviguaient », « tremblaient ») aux descriptions et aux actions qui durent." },
      { type: "redige", consigne: "Ulysse est-il un héros ? Justifie ta réponse avec deux éléments du texte.",
        aide: "Pense à ce qu'il fait pour sauver ses compagnons. Donne deux actions différentes.", debut: "Oui, Ulysse est un héros car ",
        corrige: "Oui, Ulysse est un héros : il ne panique pas et sauve ses compagnons grâce à sa ruse. D'abord, il dit s'appeler « Personne », si bien que les autres Cyclopes ne viennent pas aider Polyphème. Ensuite, il aveugle le géant avec un pieu et fait sortir ses hommes accrochés sous le ventre des moutons.",
        elements: [{ t: "Affirme qu'Ulysse est un héros (il affronte un monstre, il sauve ses compagnons).", p: 1 },
          { t: "Donne un premier élément du texte : la ruse du faux nom « Personne », ou le vin offert pour endormir le Cyclope.", p: 2 },
          { t: "Donne un deuxième élément, différent du premier : il aveugle le Cyclope avec le pieu, ou il fait sortir ses compagnons accrochés sous les moutons.", p: 2 }],
        mots: [15, 140] },
    ],
  });

  FR.notion({
    id: "lire-avare", domaine: "lire", type: "lecture", ordre: 1, niveaux: ["4e"], titre: "Molière, L'Avare : « Au voleur ! »",
    resume: "Le célèbre monologue d'Harpagon : pourquoi fait-il rire ?",
    texte: {
      titre: "L'Avare, acte IV, scène 7 (début)", source: "Molière, L'Avare (1668). Harpagon vient de découvrir qu'on lui a volé sa cassette pleine d'or.",
      par: [
        ["#HARPAGON", "(Il crie au voleur dès le jardin, et vient sans chapeau.)"],
        ["Au voleur ! au voleur ! à l'assassin ! au meurtrier !", "Justice, juste Ciel ! je suis perdu, je suis assassiné, on m'a coupé la gorge, on m'a dérobé mon argent.",
          "Qui peut-ce être ? Qu'est-il devenu ? Où est-il ? Où se cache-t-il ?", "Que ferai-je pour le trouver ? Où courir ? Où ne pas courir ?", "N'est-il point là ? N'est-il point ici ? Qui est-ce ?",
          "Arrête. Rends-moi mon argent, coquin…", "(Il se prend lui-même le bras.)", "Ah ! c'est moi.", "Mon esprit est troublé, et j'ignore où je suis, qui je suis, et ce que je fais."],
        ["Hélas ! mon pauvre argent, mon pauvre argent, mon cher ami ! on m'a privé de toi ; et puisque tu m'es enlevé, j'ai perdu mon support, ma consolation, ma joie ; tout est fini pour moi, et je n'ai plus que faire au monde !",
          "Sans toi, il m'est impossible de vivre.", "C'en est fait, je n'en puis plus ; je me meurs, je suis mort, je suis enterré.",
          "N'y a-t-il personne qui veuille me ressusciter, en me rendant mon cher argent, ou en m'apprenant qui l'a pris ?"],
      ],
      notes: [["point", "pas (« N'est-il point là ? » = « N'est-il pas là ? »)."], ["coquin", "voyou, homme malhonnête."], ["mon support", "mon soutien."],
        ["je n'ai plus que faire au monde", "je n'ai plus aucune raison de vivre."], ["C'en est fait", "c'est fini."], ["je n'en puis plus", "je n'en peux plus."]],
    },
    questions: [
      { type: "choix", consigne: "Ce passage est…", bon: "un monologue : Harpagon est seul en scène et se parle à lui-même.",
        faux: ["un dialogue entre Harpagon et son fils.", "un aparté au milieu d'une conversation.", "une tirade adressée à un valet."],
        correction: "Harpagon est seul : il parle à lui-même, à son argent et même au public." },
      { type: "citation", consigne: "Touche la didascalie qui montre qu'Harpagon est si troublé qu'il s'attrape lui-même.", ok: ["(Il se prend lui-même"],
        correction: "Il croit attraper le voleur… et il se tient son propre bras : c'est un comique de gestes." },
      { type: "choix", consigne: "Que vient-il d'arriver à Harpagon ?", bon: "On lui a volé son argent.", faux: ["On l'a vraiment assassiné.", "Il a perdu son chapeau.", "Son fils l'a frappé."],
        correction: "« on m'a dérobé mon argent » : « dérober » veut dire voler. « Assassiné », « coupé la gorge » sont des exagérations." },
      { type: "choix", consigne: "« mon pauvre argent, mon pauvre argent, mon cher ami ! » : Harpagon parle à son argent comme…", bon: "à une personne qu'il aime.",
        faux: ["à un objet sans valeur.", "à un ennemi.", "à son voleur."],
        correction: "Il tutoie son argent et l'appelle « mon cher ami » : il le traite comme une personne aimée (personnification)." },
      { type: "citation", consigne: "Touche la phrase où Harpagon exagère en disant qu'il est mort.", ok: ["C'en est fait"],
        correction: "« je me meurs, je suis mort, je suis enterré » : la gradation est exagérée, donc comique." },
      { type: "choix", consigne: "Pourquoi Harpagon pose-t-il autant de questions à la suite (« Où est-il ? Où se cache-t-il ? ») ?", bon: "Il est affolé et ne sait plus quoi faire.",
        faux: ["Il interroge les autres personnages.", "Il est calme et réfléchit.", "Il pose une devinette au public."],
        correction: "Les questions s'enchaînent sans réponse : elles montrent sa panique (il est seul en scène)." },
      { type: "redige", consigne: "Pourquoi cette scène fait-elle rire le public ? Donne deux raisons en t'appuyant sur le texte.",
        aide: REP + "<br>Pense au comique de gestes (ce qu'il fait) et au comique de mots (ce qu'il dit).", debut: "Cette scène fait rire car ",
        corrige: "Cette scène fait rire car Harpagon est ridicule. D'abord, il y a un comique de gestes : il s'attrape le bras en croyant tenir le voleur (« Il se prend lui-même le bras »). Ensuite, il exagère son malheur : « je me meurs, je suis mort, je suis enterré », alors qu'on lui a seulement volé de l'argent.",
        elements: [{ t: "Un comique de gestes : Harpagon s'attrape lui-même le bras en croyant tenir le voleur.", p: 2 },
          { t: "Une deuxième raison : il exagère (« je suis mort, je suis enterré »), il répète « au voleur », il pose une avalanche de questions, ou il parle à son argent comme à un ami.", p: 2 },
          { t: "Au moins une citation exacte du texte, entre guillemets.", p: 1 }, { t: "Une phrase complète qui reprend la question.", p: 1 }],
        mots: [15, 170] },
    ],
  });

  FR.notion({
    id: "lire-pirogue", domaine: "lire", type: "lecture", ordre: 1, niveaux: ["3e"], titre: "La pirogue de mon grand-père",
    resume: "Un récit d'enfance : le narrateur adulte se souvient. Entraînement à la réponse R-E-P.",
    texte: {
      titre: "La pirogue de mon grand-père", source: "Récit d'enfance écrit pour l'entraînement.",
      par: [
        ["J'avais dix ans.", "Cet été-là, mes parents m'avaient envoyé chez mon grand-père, à Taha'a.", "Il vivait seul dans une petite maison au bord du lagon.", "Je le trouvais sévère : il parlait peu et ne riait presque jamais."],
        ["Un matin, il partit au village.", "Sa pirogue était là, sur le sable.", "Il m'avait interdit d'y toucher.", "Mais le lagon brillait, et je me croyais déjà un grand navigateur.", "Je poussai la pirogue dans l'eau et je pagayai vers le large."],
        ["Le vent se leva d'un coup.", "La pirogue se mit à tourner sur elle-même.", "Je n'arrivais plus à revenir vers la plage.", "J'avais peur, je pleurais, j'appelais au secours."],
        ["Soudain, j'entendis une voix.", "Mon grand-père nageait vers moi.", "Il ramena la pirogue jusqu'au rivage sans dire un mot.", "Je m'attendais à être puni.", "Il me regarda longtemps, puis il dit seulement : « Demain, je t'apprendrai. »"],
        ["Aujourd'hui, j'ai quarante ans.", "Mon grand-père n'est plus là, mais chaque fois que je monte dans une pirogue, j'entends encore sa voix.", "Cet été-là, je n'ai pas seulement appris à pagayer.", "J'ai compris qu'il m'aimait, à sa manière, en silence."],
      ],
      notes: [],
    },
    questions: [
      { type: "choix", consigne: "Qui raconte cette histoire ?", bon: "Le narrateur devenu adulte, qui se souvient de son enfance.",
        faux: ["Le grand-père, qui parle de son petit-fils.", "Un narrateur extérieur, qui ne participe pas à l'histoire.", "Un enfant de dix ans, le soir même de l'aventure."],
        correction: "Le récit est à la première personne (« je ») et le narrateur dit : « Aujourd'hui, j'ai quarante ans. »" },
      { type: "citation", consigne: "Touche la phrase qui montre que le narrateur est aujourd'hui un adulte.", ok: ["Aujourd'hui, j'ai quarante ans."],
        correction: "Le présent et « Aujourd'hui » marquent le moment de l'écriture : le narrateur a quarante ans." },
      { type: "choix", consigne: "« je me croyais déjà un grand navigateur » : que ressentait l'enfant ?", bon: "Il avait trop confiance en lui.",
        faux: ["Il avait peur de la mer.", "Il était triste d'être seul.", "Il était en colère contre son grand-père."],
        correction: "« je me croyais » : il pensait être capable, mais il se trompait ; le narrateur adulte se moque gentiment de lui-même." },
      { type: "citation", consigne: "Touche la phrase qui montre la peur de l'enfant.", ok: ["J'avais peur, je pleurais"],
        correction: "Trois verbes à l'imparfait s'enchaînent : il a peur, il pleure, il appelle au secours." },
      { type: "choix", consigne: "Dans le dernier paragraphe, le narrateur emploie le présent (« j'ai quarante ans », « j'entends »). Pourquoi ?", bon: "Il parle du moment où il écrit, une fois adulte.",
        faux: ["L'histoire de la pirogue se passe aujourd'hui.", "C'est le grand-père qui parle.", "Il raconte un rêve."],
        correction: "C'est le présent de l'écriture : l'adulte regarde son souvenir et le commente." },
      { type: "choix", consigne: "Pourquoi l'enfant s'attendait-il à être puni ?", bon: "Il avait pris la pirogue alors que son grand-père le lui avait interdit.",
        faux: ["Il avait cassé la pirogue.", "Il était parti au village sans prévenir.", "Il avait menti à ses parents."],
        correction: "« Il m'avait interdit d'y toucher. » : l'enfant a désobéi." },
      { type: "redige", consigne: "Comment le regard du narrateur sur son grand-père change-t-il entre le début et la fin du texte ? Réponds en reprenant la question, en expliquant et en citant le texte (R-E-P).",
        aide: REP + "<br>Compare le premier et le dernier paragraphe.", debut: "Le regard du narrateur sur son grand-père change : ",
        corrige: "Le regard du narrateur sur son grand-père change complètement. Au début, l'enfant le trouve dur : « Je le trouvais sévère : il parlait peu et ne riait presque jamais. » Mais son grand-père vient le sauver sans le gronder et lui dit « Demain, je t'apprendrai ». À la fin, devenu adulte, il le dit lui-même : « J'ai compris qu'il m'aimait, à sa manière, en silence. »",
        elements: [{ t: "Au début, l'enfant trouve son grand-père sévère, froid (il parle peu, ne rit presque jamais).", p: 2 },
          { t: "À la fin, le narrateur comprend que son grand-père l'aimait, sans le dire.", p: 2 },
          { t: "Ce qui a changé son regard : le grand-père l'a sauvé sans le punir et lui a proposé de lui apprendre à pagayer.", p: 2 },
          { t: "Au moins une citation exacte du texte, entre guillemets.", p: 1 }, { t: "Une phrase qui reprend la question.", p: 1 }],
        mots: [25, 220] },
    ],
  });
})();
