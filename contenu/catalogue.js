/* =====================================================================
   Français au collège — catalogue : classes, domaines, notions
   Les notions s'inscrivent avec FR.notion({ … }) dans les fichiers contenu/notions-*.js :
     id, domaine, ordre, niveaux ["6e", …], titre, resume, fiche(niveau) → HTML,
     type : "serie" (10 questions notées sur 20) | "ecrit" (rédaction vérifiée par l'IA) | "lecture",
     gen(palier, niveau, ctx) → une question (séries), ouverte : true/false (réglage par défaut, la prof peut changer).
   ===================================================================== */
(function () {
  "use strict";
  const FR = (window.FR = window.FR || {});
  // classes de l'année (la vraie liste vient de la base ; celle-ci sert hors ligne et en mode démo)
  FR.CLASSES_DEFAUT = [
    { id: "6e1", nom: "6e 1", niveau: "6e" },
    { id: "5e3", nom: "5e 3", niveau: "5e" },
    { id: "4e-autea", nom: "4e AUTEA", niveau: "4e" },
    { id: "4e-omuri", nom: "4e OMURI", niveau: "4e" },
    { id: "3e-rangiroa", nom: "3e RANGIROA", niveau: "3e" },
  ];
  FR.NIVEAUX = ["6e", "5e", "4e", "3e"];
  FR.DOMAINES = [
    { id: "grammaire", titre: "Grammaire", ico: "G" },
    { id: "conjugaison", titre: "Conjugaison", ico: "C" },
    { id: "orthographe", titre: "Orthographe", ico: "O" },
    { id: "lexique", titre: "Vocabulaire", ico: "V" },
    { id: "lire", titre: "Lire et comprendre", ico: "L" },
    { id: "ecrire", titre: "Écrire", ico: "É" },
  ];
  FR.NOTIONS = [];
  FR.notion = function (d) {
    if (FR.NOTIONS.some((n) => n.id === d.id)) throw new Error("notion en double : " + d.id);
    FR.NOTIONS.push(Object.assign({ type: "serie", ouverte: true, ordre: 50 }, d));
  };
  FR.trouverNotion = (id) => FR.NOTIONS.find((n) => n.id === id) || null;
  FR.notionsPour = (niv) => FR.NOTIONS.filter((n) => n.niveaux.includes(niv))
    .sort((a, b) => FR.DOMAINES.findIndex((d) => d.id === a.domaine) - FR.DOMAINES.findIndex((d) => d.id === b.domaine) || a.ordre - b.ordre);
  // ouverte pour cette classe ? (réglage de la prof, sinon réglage par défaut de la notion)
  FR.estOuverte = (notion, ouvertures) => (ouvertures && Object.prototype.hasOwnProperty.call(ouvertures, notion.id) ? !!ouvertures[notion.id] : notion.ouverte !== false);
  FR.titreNotion = (n, niv) => (typeof n.titre === "function" ? n.titre(niv) : n.titre);
  FR.resumeNotion = (n, niv) => (typeof n.resume === "function" ? n.resume(niv) : n.resume || "");
})();
