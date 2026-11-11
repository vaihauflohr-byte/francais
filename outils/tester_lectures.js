// Vérifie les textes à lire et les sujets d'écriture : citations qui existent, choix bien formés, points.
// Usage : node outils/tester_lectures.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const racine = path.resolve(__dirname, "..");
const ctx = { console, Math, Date, JSON }; ctx.window = ctx;
ctx.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
vm.createContext(ctx);
const ordre = ["assets/moteur.js", "contenu/catalogue.js"].concat(fs.readdirSync(path.join(racine, "contenu")).filter((f) => f.endsWith(".js") && f !== "catalogue.js").sort().map((f) => "contenu/" + f));
for (const f of ordre) vm.runInContext(fs.readFileSync(path.join(racine, f), "utf8"), ctx, { filename: f });
const FR = ctx.FR, U = FR.u;
let pb = 0;
const err = (m) => { pb++; console.log("  ✗ " + m); };
for (const n of FR.NOTIONS.filter((x) => x.type === "lecture")) {
  const pas = FR.passages(n.texte), mots = pas.map((x) => x.t).join(" ").split(/\s+/).length;
  let total = 0;
  console.log(`${n.id} (${n.niveaux.join(", ")}) : ${pas.length} passages, ${mots} mots, ${n.questions.length} questions`);
  n.questions.forEach((q, k) => {
    const nom = `${n.id} q${k + 1}`;
    if (q.type === "choix") {
      total += 2;
      if (!q.bon || !q.faux || q.faux.length < 2) err(nom + " : choix incomplets");
      if (new Set([q.bon].concat(q.faux).map(U.norm)).size !== q.faux.length + 1) err(nom + " : choix en double");
    } else if (q.type === "citation") {
      total += 2;
      for (const d of q.ok) { const l = pas.filter((x) => FR.passageVise(x, [d])); if (l.length !== 1) err(`${nom} : « ${d} » correspond à ${l.length} passage(s)`); }
    } else if (q.type === "redige") {
      const s = q.elements.reduce((a, e) => a + e.p, 0); total += s;
      if (!s || q.elements.some((e) => !e.t || !(e.p > 0))) err(nom + " : critères mal formés");
      if (!q.corrige || !q.consigne) err(nom + " : corrigé ou consigne manquant");
      if (q.mots && !(q.mots[0] < q.mots[1])) err(nom + " : bornes de mots");
      // les citations du corrigé existent-elles dans le texte ?
      const brut = U.norm(pas.map((x) => x.t).join(" ")).replace(/[’]/g, "'");
      for (const c of (q.corrige.match(/«\s*([^»]+?)\s*»/g) || []).map((x) => x.replace(/[«»]/g, "").trim().replace(/\[[^\]]*\]/g, "").replace(/[’]/g, "'"))) {
        const morceaux = c.split(/\s+/).filter(Boolean);
        if (!brut.includes(U.norm(c)) && !(morceaux.length > 3 && brut.includes(U.norm(morceaux.slice(0, 3).join(" "))))) err(`${nom} : citation du corrigé introuvable « ${c} »`);
      }
    } else err(nom + " : type inconnu " + q.type);
  });
  console.log(`  points : ${total}`);
}
for (const n of FR.NOTIONS.filter((x) => x.type === "ecrit")) {
  const s = n.criteres.reduce((a, c) => a + c.p, 0);
  console.log(`${n.id} (${n.niveaux.join(", ")}) : ${n.criteres.length} critères, ${s} points, ${n.mots.join("–")} mots`);
  if (s !== 20) err(n.id + " : total des critères ≠ 20");
  if (!n.consigne || !n.corrige || !n.aide) err(n.id + " : champ manquant");
  try { const f = n.fiche(n.niveaux[0]); if (/undefined|NaN/.test(f)) err(n.id + " : fiche suspecte"); } catch (e) { err(n.id + " : fiche " + e.message); }
}
console.log(pb ? `${pb} problème(s)` : "aucun problème");
