// Tire de nombreuses séries pour chaque notion et chaque niveau, et vérifie que chaque question est bien formée.
// Usage : node outils/tester_series.js [nombre de séries par notion et niveau, défaut 200]
const fs = require("fs"), path = require("path"), vm = require("vm");
const racine = path.resolve(__dirname, "..");
const ctx = { console, Math, Date, JSON, setTimeout, clearTimeout };
ctx.window = ctx; ctx.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
vm.createContext(ctx);
const ordre = ["assets/moteur.js", "contenu/catalogue.js"].concat(fs.readdirSync(path.join(racine, "contenu")).filter((f) => f.endsWith(".js") && f !== "catalogue.js").sort().map((f) => "contenu/" + f));
for (const f of ordre) vm.runInContext(fs.readFileSync(path.join(racine, f), "utf8"), ctx, { filename: f });
const FR = ctx.FR, N = Number(process.argv[2] || 200), seul = process.argv[3];
const brut = (h) => String(h == null ? "" : h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
let total = 0; const erreurs = {}, compte = {};
const err = (k, m) => { erreurs[k] = erreurs[k] || []; if (erreurs[k].length < 4) erreurs[k].push(m); erreurs[k].n = (erreurs[k].n || 0) + 1; };
for (const n of FR.NOTIONS) {
  if (seul && n.id !== seul) continue;
  if (n.type !== "serie") continue;
  for (const niv of n.niveaux) {
    const k = n.id + " " + niv;
    try { const f = n.fiche(niv); if (!f || /undefined|NaN/.test(f)) err(k, "fiche vide ou suspecte"); } catch (e) { err(k, "fiche : " + e.message); }
    for (let s = 0; s < N; s++) {
      let qs;
      try { qs = FR.serie.construire(n, niv); } catch (e) { err(k, "exception : " + e.stack.split("\n").slice(0, 3).join(" | ")); continue; }
      const attendu = Object.values((n.compo && (n.compo[niv] || n.compo.tous)) || FR.serie.COMPO).reduce((a, b) => a + b, 0);
      if (qs.length !== attendu) err(k, `série de ${qs.length} questions au lieu de ${attendu}`);
      for (const q of qs) {
        total++; compte[k] = (compte[k] || 0) + 1;
        const txt = JSON.stringify(q);
        if (/undefined|NaN|\[object Object\]/.test(txt)) err(k, "texte suspect : " + txt.slice(0, 200));
        if (!brut(q.consigne)) err(k, "consigne vide");
        if (q.type === "choix") {
          const c = q.choix.map(brut);
          if (c.length < 2 || new Set(c).size !== c.length) err(k, "choix en double : " + c.join(" / "));
          if (!(q.ok >= 0 && q.ok < c.length)) err(k, "bonne réponse hors liste");
        } else if (q.type === "clic") {
          if (!q.mots.some((m) => m.ok)) err(k, "aucun mot à cliquer : " + q.mots.map((m) => m.t).join(" "));
          if (q.mots.some((m) => m.ok && m.sel === false)) err(k, "mot attendu non cliquable");
        } else if (q.type === "segment") {
          if (q.segs.filter((s) => s.ok).length !== 1) err(k, "segments : " + q.segs.filter((s) => s.ok).length + " bons · " + q.segs.map((s) => brut(s.h)).join(" | "));
          if (q.segs.filter((s) => s.sel !== false).length < 2) err(k, "moins de deux segments");
        } else if (q.type === "saisie") {
          if (!q.attendus || !q.attendus.length || q.attendus.some((a) => !brut(a))) err(k, "saisie sans réponse attendue");
        } else if (q.type === "trous") {
          for (const g of q.phr.filter((x) => typeof x !== "string")) if (new Set(g.o).size !== g.o.length || !(g.ok >= 0 && g.ok < g.o.length)) err(k, "trou mal formé : " + g.o.join("/"));
        } else if (q.type === "reecriture") {
          if (!q.attendu || brut(q.attendu) === brut(q.texte)) err(k, "réécriture identique");
        } else err(k, "type inconnu " + q.type);
      }
    }
  }
}
console.log(`${total} questions tirées, ${Object.keys(compte).length} notions × niveaux`);
const ks = Object.keys(erreurs);
console.log(ks.length ? "ERREURS :" : "aucune erreur");
for (const k of ks) { console.log(" ", k, "×", erreurs[k].n); erreurs[k].forEach((m) => console.log("     ", m.slice(0, 300))); }
