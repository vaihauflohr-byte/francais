// Exporte les banques du site en JSON (pour les vérifications en Python) : node outils/export_banques.js > banques.json
const fs = require("fs"), path = require("path"), vm = require("vm");
const racine = path.resolve(__dirname, "..");
const ctx = { window: {}, console };
ctx.window.window = ctx.window; vm.createContext(ctx);
const fichiers = ["assets/moteur.js"].concat(fs.readdirSync(path.join(racine, "contenu")).filter((f) => f.endsWith(".js")).map((f) => "contenu/" + f));
for (const f of fichiers) vm.runInContext(fs.readFileSync(path.join(racine, f), "utf8"), ctx, { filename: f });
const FR = ctx.window.FR;
const sortie = { phrases: (FR.B.phrases || []).map(([n, s]) => ({ n, s, p: FR.phrase(s) })) };
for (const k of Object.keys(FR.B)) if (k !== "phrases") sortie[k] = FR.B[k];
process.stdout.write(JSON.stringify(sortie));
