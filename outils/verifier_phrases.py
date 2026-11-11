"""Compare les classes notées dans contenu/phrases.js avec l'analyseur spaCy (fr_core_news_lg).
Affiche les désaccords à relire à la main (l'analyseur se trompe aussi : c'est une alerte, pas un verdict).
Usage : node outils/export_banques.js | python3 outils/verifier_phrases.py"""
import json, sys, spacy
nlp = spacy.load("fr_core_news_lg")
ATT = {"N": {"NOUN"}, "NP": {"PROPN", "NOUN"}, "D": {"DET"}, "A": {"ADJ"}, "V": {"VERB", "AUX"}, "VI": {"VERB", "AUX"},
       "VP": {"VERB", "ADJ"}, "PR": {"PRON"}, "PRR": {"PRON"}, "ADV": {"ADV"}, "P": {"ADP"}, "CC": {"CCONJ"}, "CS": {"SCONJ"}, "I": {"INTJ"}}
d = json.load(sys.stdin); n = 0; des = 0
for ph in d["phrases"]:
    toks = ph["p"]["toks"]
    texte, pos = "", []
    for t in toks:
        w = t["t"]
        if texte and not texte.endswith("'") and not w.startswith("-") and w not in ".,": texte += " "
        pos.append((len(texte), t)); texte += w
    doc = nlp(texte)
    for debut, t in pos:
        if t["ponct"] or t["c"] in (None, "x"): continue
        n += 1
        sp = [x for x in doc if x.idx <= debut < x.idx + max(1, len(x.text))]
        u = sp[0].pos_ if sp else "?"
        if u not in ATT.get(t["c"], set()):
            des += 1; print(f"  {t['t']!r:16} noté {t['c']:4} · spaCy {u:6} · {texte}")
        if t.get("v") and t.get("lemme") and sp and sp[0].lemma_ != t["lemme"] and sp[0].pos_ != "AUX":
            print(f"  lemme ? {t['t']!r} noté {t['lemme']} · spaCy {sp[0].lemma_} · {texte}")
print(f"{n} mots comparés, {des} désaccords à relire")
