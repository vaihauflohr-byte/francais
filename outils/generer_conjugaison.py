"""Fabrique contenu/conjugaison-formes.js à partir des tables de conjugaison de verbecc (données Verbiste).
Usage : python3 outils/generer_conjugaison.py   (relancer seulement si la liste des verbes change)"""
import json, re, logging, pathlib
logging.disable(logging.CRITICAL)
from verbecc import CompleteConjugator
C = CompleteConjugator(lang="fr")
VERBES = ["chanter", "jouer", "danser", "parler", "manger", "commencer", "appeler", "jeter", "acheter", "nager", "pêcher",
          "ramer", "envoyer", "arriver", "tomber", "rester", "entrer", "finir", "choisir", "grandir", "réussir", "obéir",
          "être", "avoir", "aller", "faire", "dire", "venir", "voir", "prendre", "pouvoir", "vouloir", "partir", "mettre",
          "lire", "écrire", "savoir", "devoir", "courir", "tenir", "sortir", "dormir", "boire", "croire", "recevoir",
          "connaître", "vivre", "peindre", "ouvrir", "offrir", "conduire", "rire", "devenir"]
TEMPS = {  # clé courte : (mode, temps dans verbecc)
    "P": ("indicatif", "présent"), "I": ("indicatif", "imparfait"), "PS": ("indicatif", "passé-simple"),
    "F": ("indicatif", "futur-simple"), "PC": ("indicatif", "passé-composé"), "PQP": ("indicatif", "plus-que-parfait"),
    "FA": ("indicatif", "futur-antérieur"), "CP": ("conditionnel", "présent"), "CPA": ("conditionnel", "passé"),
    "SP": ("subjonctif", "présent"), "IMP": ("imperatif", "imperatif-présent"),
}
PERS = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"]
def sans_pronom(forme, pr):
    f = forme.strip()
    f = re.sub(r"^qu['’]", "", f); f = re.sub(r"^que ", "", f)
    for p in (pr + " ", "j'", "j’"):
        if f.startswith(p): return f[len(p):].strip()
    return f
sortie = {}
for v in VERBES:
    j = json.loads(C.conjugate(v).to_json())
    info = j.get("verb", {})
    d = {"t": {}}
    for k, (mode, temps) in TEMPS.items():
        lignes = j["moods"][mode][temps]
        par = {}
        for l in lignes:
            pr = l.get("pr")
            if pr not in PERS: continue
            formes = [sans_pronom(c, pr) for c in l["c"]]
            par.setdefault(pr, [])
            for f in formes:
                if f not in par[pr]: par[pr].append(f)
        d["t"][k] = par
    # auxiliaire et groupe : d'après le passé composé et la terminaison
    pc_il = d["t"]["PC"].get("il", [""])[0]
    d["aux"] = "être" if pc_il.startswith("est ") else "avoir"
    d["g"] = 1 if v.endswith("er") and v not in ("aller",) else (2 if v in ("finir", "choisir", "grandir", "réussir", "obéir") else 3)
    sortie[v] = d
js = ("/* Généré par outils/generer_conjugaison.py à partir de verbecc (données Verbiste) : ne pas modifier à la main.\n"
      "   Formes sans le pronom ; plusieurs formes = toutes acceptées (ex. accord au féminin avec « être »). */\n"
      "(function(){ const FR = (window.FR = window.FR || {}); FR.B = FR.B || {}; FR.B.formes = " + json.dumps(sortie, ensure_ascii=False, separators=(",", ":")) + "; })();\n")
p = pathlib.Path(__file__).resolve().parent.parent / "contenu" / "conjugaison-formes.js"
p.write_text(js, encoding="utf-8"); print(p, len(js) // 1024, "ko,", len(sortie), "verbes")
