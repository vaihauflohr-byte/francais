// Affiche des questions tirées au hasard, en texte, pour les relire : node outils/apercu_questions.js <notion> <niveau> [nombre]
const fs = require("fs"), path = require("path"), vm = require("vm");
const racine = path.resolve(__dirname, "..");
const ctx = { console, Math, Date, JSON }; ctx.window = ctx;
ctx.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
vm.createContext(ctx);
const ordre = ["assets/moteur.js", "contenu/catalogue.js"].concat(fs.readdirSync(path.join(racine, "contenu")).filter((f) => f.endsWith(".js") && f !== "catalogue.js").sort().map((f) => "contenu/" + f));
for (const f of ordre) vm.runInContext(fs.readFileSync(path.join(racine, f), "utf8"), ctx, { filename: f });
const FR = ctx.FR, [id, niv, nb] = process.argv.slice(2);
const b = (h) => String(h == null ? "" : h).replace(/<span class="souligne">/g, "_").replace(/<\/span>/g, "_").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const n = FR.trouverNotion(id); let k = 0;
while (k < Number(nb || 8)) {
  for (const q of FR.serie.construire(n, niv)) {
    if (k++ >= Number(nb || 8)) break;
    let r = `[${q.palier}] ${b(q.consigne)}`;
    if (q.support) r += `\n     « ${b(q.support)} »`;
    if (q.type === "choix") r += `\n     ✓ ${b(q.choix[q.ok])}   ✗ ${q.choix.filter((_, i) => i !== q.ok).map(b).join(" | ")}`;
    if (q.type === "clic") r += `\n     ${q.mots.map((m) => (m.ok ? "[" + m.t + "]" : m.t)).join(" ")}`;
    if (q.type === "segment") r += `\n     ${q.segs.map((s) => (s.ok ? "[[" + b(s.h) + "]]" : b(s.h))).join(" / ")}`;
    if (q.type === "saisie") r += `\n     ${q.avant} ___ ${q.apres}   → ${q.attendus.join(" / ")}`;
    if (q.type === "trous") r += `\n     ${q.phr.map((x) => (typeof x === "string" ? x : "[" + x.o[x.ok] + "]")).join("")}`;
    if (q.type === "reecriture") r += `\n     ${q.texte}\n  →  ${q.attendu}`;
    if (q.correction) r += `\n     · ${b(q.correction).slice(0, 220)}`;
    console.log(r);
  }
}
