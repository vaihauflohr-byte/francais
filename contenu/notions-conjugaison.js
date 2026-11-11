/* =====================================================================
   Français au collège — notions de CONJUGAISON
   Conjuguer (réponse à écrire) · Reconnaître le temps et le mode
   Les formes viennent de contenu/conjugaison-formes.js (verbecc, données Verbiste), jamais écrites à la main.
   ===================================================================== */
(function () {
  "use strict";
  const FR = window.FR, U = FR.u, G = FR.gen;
  const F = () => FR.B.formes;
  const NOM = { P: "présent de l'indicatif", I: "imparfait", PS: "passé simple", F: "futur simple", PC: "passé composé", PQP: "plus-que-parfait",
    FA: "futur antérieur", CP: "conditionnel présent", CPA: "conditionnel passé", SP: "subjonctif présent", IMP: "impératif présent" };
  const NOMCOURT = { P: "présent", I: "imparfait", PS: "passé simple", F: "futur simple", PC: "passé composé", PQP: "plus-que-parfait",
    FA: "futur antérieur", CP: "conditionnel présent", CPA: "conditionnel passé", SP: "subjonctif présent", IMP: "impératif présent" };
  // avec le mode, pour la 4e et la 3e
  const NOMMODE = { P: "présent de l'indicatif", I: "imparfait de l'indicatif", PS: "passé simple de l'indicatif", F: "futur simple de l'indicatif",
    PC: "passé composé de l'indicatif", PQP: "plus-que-parfait de l'indicatif", FA: "futur antérieur de l'indicatif", CP: "présent du conditionnel",
    CPA: "passé du conditionnel", SP: "présent du subjonctif", IMP: "présent de l'impératif" };
  const au = (t) => (/^[aeiouyéèêiî]/i.test(NOMCOURT[t]) ? "à l'" : "au ") + NOMCOURT[t];
  const MODE = { P: "indicatif", I: "indicatif", PS: "indicatif", F: "indicatif", PC: "indicatif", PQP: "indicatif", FA: "indicatif", CP: "conditionnel", CPA: "conditionnel", SP: "subjonctif", IMP: "impératif" };
  const TEMPS_NIV = {
    "6e": ["P", "I", "F", "PS", "PC", "IMP"], "5e": ["P", "I", "F", "PS", "PC", "PQP", "CP", "IMP"],
    "4e": ["P", "I", "F", "PS", "PC", "PQP", "FA", "CP", "SP", "IMP"], "3e": ["P", "I", "F", "PS", "PC", "PQP", "FA", "CP", "CPA", "SP", "IMP"],
  };
  const REGLE = {
    P: "Présent : 1er groupe <b>-e, -es, -e, -ons, -ez, -ent</b> ; 2e groupe <b>-is, -is, -it, -issons, -issez, -issent</b> ; 3e groupe le plus souvent <b>-s, -s, -t</b> (ou -d), -ons, -ez, -ent.",
    I: "Imparfait : <b>-ais, -ais, -ait, -ions, -iez, -aient</b>, pour tous les verbes.",
    F: "Futur simple : l'infinitif (ou un radical) + <b>-ai, -as, -a, -ons, -ez, -ont</b>.",
    PS: "Passé simple : verbes en -er <b>-ai, -as, -a, -âmes, -âtes, -èrent</b> ; 2e groupe et beaucoup de verbes du 3e groupe <b>-is, -is, -it, -îmes, -îtes, -irent</b> ; d'autres <b>-us, -us, -ut, -ûmes, -ûtes, -urent</b> (ou -ins, -int pour venir, tenir).",
    PC: "Passé composé : auxiliaire <b>avoir</b> ou <b>être</b> au présent + participe passé. Avec être, le participe s'accorde avec le sujet.",
    PQP: "Plus-que-parfait : auxiliaire avoir ou être à l'<b>imparfait</b> + participe passé.",
    FA: "Futur antérieur : auxiliaire avoir ou être au <b>futur</b> + participe passé.",
    CP: "Conditionnel présent : radical du futur + terminaisons de l'imparfait <b>-ais, -ais, -ait, -ions, -iez, -aient</b>.",
    CPA: "Conditionnel passé : auxiliaire avoir ou être au <b>conditionnel présent</b> + participe passé.",
    SP: "Subjonctif présent (après « il faut que »…) : <b>-e, -es, -e, -ions, -iez, -ent</b> ; quelques verbes irréguliers : que je sois, que j'aie, que j'aille, que je fasse, que je puisse, que je sache, que je veuille.",
    IMP: "Impératif présent : trois personnes, <b>sans sujet</b> (tu, nous, vous). Verbes en -er : pas de -s à la 2e personne du singulier (chante !).",
  };
  // sujets : texte, personne (clé des tables), genre/nombre
  const PRONOMS = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"];
  const NOMS = [["Teva", "il"], ["Hina", "elle"], ["le pêcheur", "il"], ["la directrice", "elle"], ["mes cousins", "ils"], ["les filles", "elles"], ["mon oncle", "il"], ["ma sœur", "elle"], ["les élèves", "ils"], ["Moana et Hina", "elles"]];
  const VERBES = {
    1: ["chanter", "jouer", "danser", "parler", "nager", "ramer", "pêcher", "arriver", "rester", "entrer", "tomber", "finir", "choisir", "grandir", "réussir", "obéir", "être", "avoir", "aller"],
    2: ["manger", "commencer", "faire", "dire", "venir", "voir", "prendre", "partir", "mettre", "lire", "écrire", "sortir", "dormir"],
    3: ["appeler", "jeter", "acheter", "envoyer", "pouvoir", "vouloir", "savoir", "devoir", "courir", "tenir", "boire", "croire", "recevoir", "connaître", "vivre", "peindre", "ouvrir", "offrir", "conduire", "rire"],
  };
  const COMPL = {
    chanter: ["une chanson", "à la fête"], jouer: ["au ballon", "sur la plage"], danser: ["à la fête", "sur la scène"], parler: ["à la directrice", "au capitaine"],
    nager: ["dans le lagon", "vers la pirogue"], ramer: ["vers l'île", "jusqu'au motu"], pêcher: ["au large", "des thons"], arriver: ["en retard", "à l'aéroport"],
    rester: ["à la maison", "sur la plage"], entrer: ["dans la classe", "dans le musée"], tomber: ["dans l'eau", "de la pirogue"], finir: ["le travail", "la course"],
    choisir: ["un livre", "une place"], grandir: ["très vite"], réussir: ["les exercices", "le gâteau"], obéir: ["au capitaine", "aux règles"],
    être: ["en retard", "à la plage"], avoir: ["un chien", "de la chance"], aller: ["à la plage", "au marché"], manger: ["un poisson cru", "des mangues"],
    commencer: ["le travail", "la course"], faire: ["un gâteau", "du sport"], dire: ["la vérité", "bonjour"], venir: ["à la fête", "en pirogue"],
    voir: ["un dauphin", "la mer"], prendre: ["le bus", "le bateau"], partir: ["en vacances", "à l'aube"], mettre: ["la table", "un chapeau"],
    lire: ["un roman", "le journal"], écrire: ["une lettre", "un poème"], sortir: ["le soir", "de la maison"], dormir: ["sous la tente", "dans le hamac"],
    appeler: ["les secours", "le médecin"], jeter: ["les papiers à la poubelle", "le filet à la mer"], acheter: ["des mangues", "un cadeau"], envoyer: ["une lettre", "un message"],
    pouvoir: ["venir", "partir"], vouloir: ["un gâteau", "partir"], savoir: ["la réponse", "nager"], devoir: ["partir", "travailler"],
    courir: ["sur la plage", "très vite"], tenir: ["la corde", "le gouvernail"], boire: ["de l'eau", "un jus de fruit"], croire: ["cette histoire", "à la légende"],
    recevoir: ["une lettre", "un cadeau"], connaître: ["la réponse", "cette chanson"], vivre: ["à Papeete", "près de la mer"], peindre: ["un tableau", "la pirogue"],
    ouvrir: ["la fenêtre", "la porte"], offrir: ["des fleurs", "un collier"], conduire: ["la voiture", "le bateau"], rire: ["de bon cœur", "aux éclats"],
  };
  const MARQUE = {
    P: ["Aujourd'hui,", "En ce moment,", "Chaque matin,", "Le dimanche,"], I: ["Autrefois,", "À cette époque,", "Chaque été,", "Le soir,"],
    PS: ["Ce jour-là,", "Soudain,", "Le lendemain,", "Tout à coup,"], F: ["Demain,", "L'an prochain,", "Ce soir,", "Bientôt,"],
    PC: ["Hier,", "Ce matin,", "La semaine dernière,", "Samedi dernier,"], PQP: ["La veille,", "Avant la tempête,", "Une heure plus tôt,"],
    FA: ["Avant midi,", "D'ici demain,", "Avant ce soir,"], CP: ["Avec plus de temps,", "Sans cette pluie,", "Si nous le pouvions,"],
    CPA: ["Avec plus de temps,", "Sans cette pluie,", "Avec un peu de chance,"],
  };
  const SANS_IMP = ["pouvoir", "vouloir", "devoir", "savoir", "pleuvoir"];
  const voyelle = (s) => /^[aeéèêiïîoôuûyhâ]/i.test(s);

  // une phrase à compléter : { avant, apres, attendus, pronom, phrase (corrigée) }
  function fabriquer(v, t, niv, ctx) {
    const tab = F()[v] && F()[v].t[t];
    if (!tab) return null;
    const imp = t === "IMP";
    let sujetTxt = null, pers;
    if (imp) pers = U.pick(["tu", "nous", "vous"]);
    else if (Math.random() < 0.55 || (t === "PS" && niv === "6e")) {
      if (t === "PS" && niv === "6e") { const n = U.pick(NOMS.concat([["il", "il"], ["elle", "elle"], ["ils", "ils"], ["elles", "elles"]])); sujetTxt = n[0]; pers = n[1]; }
      else { const n = U.pick(NOMS); sujetTxt = n[0]; pers = n[1]; }
    } else { pers = U.pick(PRONOMS); sujetTxt = pers; }
    const attendus = tab[pers];
    if (!attendus || !attendus.length) return null;
    const compl = U.pick(COMPL[v] || [""]);
    let avant, pronom = null;
    if (imp) avant = "";
    else {
      const s = sujetTxt === "je" && voyelle(attendus[0]) ? "j'" : sujetTxt;
      if (PRONOMS.includes(sujetTxt)) pronom = s;
      if (t === "SP") avant = "Il faut " + (/^[aeiouyh]/i.test(s) && !/^h/.test(s) ? "qu'" : "que ") + s;
      else avant = U.pick(MARQUE[t]) + " " + s;
      avant = avant.charAt(0).toUpperCase() + avant.slice(1);
    }
    const fin = imp ? " !" : ".";
    const apres = `(${v}) ${compl}${fin}`.replace(" .", ".").replace(" !", " !");
    const colle = (a) => (/'$/.test(a) ? a : a + " ");
    const phrase = (imp ? attendus[0].charAt(0).toUpperCase() + attendus[0].slice(1) + " " + compl + " !" : colle(avant) + attendus[0] + " " + compl + ".").replace(/\s+([.!])$/, (m, p) => (p === "!" ? " !" : "."));
    return { v, t, pers, avant: imp ? "" : colle(avant).replace(/ $/, ""), apres, attendus, pronom, phrase, imp };
  }
  const PERSNOM = { tu: "2e personne du singulier", nous: "1re personne du pluriel", vous: "2e personne du pluriel" };
  function qConjuguer(niv, palier, ctx) {
    const tempsNiv = TEMPS_NIV[niv];
    const parPalier = { 1: ["P", "I", "F"], 2: ["PS", "PC", "PQP", "CP", "I", "F"], 3: tempsNiv };
    const tl = parPalier[palier].filter((t) => tempsNiv.includes(t));
    for (let essai = 0; essai < 30; essai++) {
      const t = U.pick(tl);
      const groupe = palier === 1 ? VERBES[1] : palier === 2 ? VERBES[1].concat(VERBES[2]) : VERBES[2].concat(VERBES[3]);
      const v = U.pick(groupe.filter((x) => t !== "IMP" || !SANS_IMP.includes(x)));
      const x = fabriquer(v, t, niv, ctx);
      if (!x) continue;
      const consigne = x.imp ? `Conjugue le verbe à l'<b>impératif présent</b>, ${PERSNOM[x.pers]} (« ${x.pers} »).` : `Conjugue le verbe entre parenthèses <b>${au(t)}</b>.`;
      return { type: "saisie", consigne, avant: x.avant, apres: x.apres, attendus: x.attendus, pronom: x.pronom, indice: x.imp ? `(${v})` : "",
        correction: `<p>La phrase : <b>${U.esc(U.typo(x.phrase))}</b></p><p class="astuce">${REGLE[t]}</p>${x.attendus.length > 1 ? `<p>Réponses acceptées : ${x.attendus.map((a) => U.esc(a)).join(" ou ")}.</p>` : ""}`,
        cle: "cj|" + v + "|" + t + "|" + x.pers, donnees: { verbe: v, temps: t, personne: x.pers } };
    }
    return null;
  }
  // reconnaître le temps (et le mode)
  function ambigu(v, t, pers, forme, autres) {
    return autres.some((u) => u !== t && F()[v].t[u] && (F()[v].t[u][pers] || []).includes(forme));
  }
  const PROCHES = { P: ["PS", "I", "F"], I: ["CP", "P", "PS"], PS: ["P", "I", "PC"], F: ["CP", "P", "FA"], PC: ["PQP", "P", "PS"], PQP: ["PC", "I", "CPA"],
    FA: ["F", "PC", "CPA"], CP: ["F", "I", "CPA"], CPA: ["CP", "PQP", "FA"], SP: ["P", "I", "CP"], IMP: ["P", "SP", "F"] };
  function qTemps(niv, palier, ctx) {
    const tempsNiv = TEMPS_NIV[niv];
    const tl = palier === 1 ? ["P", "I", "F", "PC"].filter((t) => tempsNiv.includes(t)) : palier === 2 ? ["PS", "PQP", "CP", "F", "I"].filter((t) => tempsNiv.includes(t)) : tempsNiv;
    for (let essai = 0; essai < 40; essai++) {
      const t = U.pick(tl), v = U.pick(VERBES[1].concat(VERBES[2], palier === 3 ? VERBES[3] : []).filter((x) => t !== "IMP" || !SANS_IMP.includes(x)));
      const x = fabriquer(v, t, niv, ctx);
      if (!x || x.attendus.length > 1) continue;
      if (ambigu(v, t, x.pers, x.attendus[0], tempsNiv)) continue;
      const opts = U.uniq((PROCHES[t] || []).filter((u) => tempsNiv.includes(u)).concat(U.shuffle(tempsNiv))).filter((u) => u !== t).slice(0, 3);
      const verbe = x.attendus[0];
      const support = x.imp ? `<span class="souligne">${U.esc(U.typo(verbe.charAt(0).toUpperCase() + verbe.slice(1)))}</span> ${U.esc(U.typo(x.phrase.split(" ").slice(verbe.split(" ").length).join(" ")))}`
        : `${U.esc(U.typo(x.avant))}${/'$/.test(x.avant) ? "" : " "}<span class="souligne">${U.esc(U.typo(verbe))}</span> ${U.esc(U.typo(x.apres.replace(/^\([^)]*\)\s*/, "")))}`;
      const N = niv === "4e" || niv === "3e" ? NOMMODE : NOM;
      return G.choix({ bon: N[t], faux: opts.map((u) => N[u]),
        q: { consigne: niv === "3e" || niv === "4e" ? "À quel temps et à quel mode est conjugué le verbe souligné ?" : "À quel temps est conjugué le verbe souligné ?",
          support, correction: `<p>« ${U.esc(U.typo(verbe))} » : verbe <b>${v}</b>, ${NOM[t]} (mode ${MODE[t]}).</p><p class="astuce">${REGLE[t]}</p>`, cle: "tp|" + v + "|" + t + "|" + x.pers } });
    }
    return null;
  }

  FR.notion({
    id: "c-conjuguer", domaine: "conjugaison", ordre: 1, niveaux: ["6e", "5e", "4e", "3e"], titre: "Conjuguer un verbe",
    resume: (niv) => "Écrire la bonne forme : " + TEMPS_NIV[niv].map((t) => NOMCOURT[t]).join(", ") + ".",
    fiche: (niv) => `<h2>Conjuguer : les terminaisons à connaître</h2>
      <p>Pour conjuguer : 1) trouve l'<b>infinitif</b> et le <b>groupe</b> du verbe ; 2) trouve la <b>personne</b> (qui fait l'action ?) ; 3) écris la terminaison du temps demandé.</p>
      <div class="tableau-scroll"><table><tr><th>Temps</th><th>Ce qu'il faut savoir</th></tr>${TEMPS_NIV[niv].map((t) => `<tr><td><b>${NOMCOURT[t]}</b></td><td>${REGLE[t]}</td></tr>`).join("")}</table></div>
      <div class="attention">Les trois groupes : <b>1er groupe</b> = verbes en -er (sauf aller) ; <b>2e groupe</b> = verbes en -ir qui font -issons (finir → nous finissons) ; <b>3e groupe</b> = tous les autres (aller, faire, prendre, venir…).</div>
      <div class="attention">Pièges : nous mang<b>e</b>ons, nous commen<b>ç</b>ons ; j'appe<b>ll</b>e, je je<b>tt</b>e, j'ach<b>è</b>te ; j'<b>enverrai</b>, je <b>courrai</b>.</div>`,
    gen: (p, niv, ctx) => qConjuguer(niv, p, ctx),
  });

  FR.notion({
    id: "c-temps", domaine: "conjugaison", ordre: 2, niveaux: ["6e", "5e", "4e", "3e"], titre: (niv) => (niv === "4e" || niv === "3e" ? "Reconnaître le temps et le mode" : "Reconnaître le temps"),
    resume: "Dire à quel temps (et à quel mode) un verbe est conjugué, sans se faire piéger.",
    fiche: (niv) => `<h2>Reconnaître un temps</h2>
      <ol><li>Repère le <b>verbe conjugué</b> et son infinitif.</li><li>Regarde s'il y a <b>un mot</b> (temps simple) ou <b>deux mots</b> (temps composé : auxiliaire + participe passé).</li><li>Regarde la <b>terminaison</b> (ou le temps de l'auxiliaire).</li></ol>
      <div class="tableau-scroll"><table><tr><th>Temps simple</th><th>Temps composé correspondant</th></tr>
      <tr><td>présent : je chante</td><td>passé composé : j'ai chanté</td></tr>
      <tr><td>imparfait : je chantais</td><td>plus-que-parfait : j'avais chanté</td></tr>
      <tr><td>futur simple : je chanterai</td><td>futur antérieur : j'aurai chanté</td></tr>
      <tr><td>conditionnel présent : je chanterais</td><td>conditionnel passé : j'aurais chanté</td></tr></table></div>
      <div class="attention">Futur ou conditionnel ? <b>je chanterai</b> (futur, -ai) / <b>je chanterais</b> (conditionnel, -ais). Astuce : remplace par « il » : il chantera (futur) / il chanterait (conditionnel).</div>
      ${niv === "4e" || niv === "3e" ? `<h3>Les modes</h3><p><b>Indicatif</b> (faits réels : présent, imparfait, passé simple, futur, passé composé…), <b>conditionnel</b> (ce qui dépend d'une condition, l'imaginaire), <b>subjonctif</b> (après « il faut que », « je veux que »…), <b>impératif</b> (ordres, conseils, sans sujet).</p>` : ""}`,
    gen: (p, niv, ctx) => qTemps(niv, p, ctx),
  });

  FR.conjugaison = { NOM, NOMCOURT, MODE, TEMPS_NIV, REGLE, fabriquer };
})();
