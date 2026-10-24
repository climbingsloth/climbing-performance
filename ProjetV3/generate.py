import json
import sys
import os
import re
from datetime import datetime
import numpy as np
from jinja2 import Template
from weasyprint import HTML

# 1. Vérification de l'argument CLI
if len(sys.argv) < 2:
    print("Erreur : Veuillez préciser le fichier JSON en paramètre.")
    print("Usage: python3 generate.py <chemin_vers_donnees.json>")
    sys.exit(1)

json_path = sys.argv[1]

if not os.path.exists(json_path):
    print(f"Erreur : Le fichier '{json_path}' n'existe pas.")
    sys.exit(1)

script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.dirname(os.path.abspath(json_path))

# Charger les règles d'interprétation
rules_path = os.path.join(script_dir, "interpretation_rules.json")
if os.path.exists(rules_path):
    with open(rules_path, "r", encoding="utf-8") as f:
        interpretation_rules = json.load(f)
else:
    interpretation_rules = None

# 2. Charger les données JSON de l'athlète
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 3. Calcul dynamique de l'âge
try:
    date_test = datetime.strptime(data["date_test"], "%Y-%m-%d")
    date_naissance = datetime.strptime(data["athlete"]["date_naissance"], "%Y-%m-%d")
    age_au_test = date_test.year - date_naissance.year - (
        (date_test.month, date_test.day) < (date_naissance.month, date_naissance.day)
    )
    data["athlete"]["age_au_test"] = age_au_test
except (KeyError, ValueError) as e:
    print(f"Erreur lors du calcul de l'âge : ({e})")
    sys.exit(1)

# 4. Normalisation des points
normalized_points = []
for p in data["points"]:
    force = p["force"]
    if "vitesse" in p and p["vitesse"] is not None:
        vitesse = p["vitesse"]
        puissance = force * vitesse
    elif "puissance" in p and p["puissance"] is not None:
        puissance = p["puissance"]
        vitesse = puissance / force if force != 0 else 0
    else:
        raise ValueError(f"Le point {p} doit contenir 'vitesse' ou 'puissance'.")

    normalized_points.append({
        "force": round(force, 1),
        "vitesse": round(vitesse, 2),
        "puissance": round(puissance, 1)
    })

# 5. Régression linéaire et paramètres F-V
vitesses = np.array([p["vitesse"] for p in normalized_points])
forces = np.array([p["force"] for p in normalized_points])

a, b = np.polyfit(vitesses, forces, 1)  # F(v) = a*v + b
f0 = b
v0 = -b / a
pmax = (f0 * v0) / 4
r2 = np.corrcoef(vitesses, forces)[0, 1] ** 2

poids = data["athlete"]["poids_kg"]
f0_rel = f0 / poids
pmax_rel = pmax / poids

mvt = 0.20
f_1rm = (a * mvt) + b
m_1rm_totale = f_1rm / 9.81
m_1rm_lest = m_1rm_totale - poids
ratio_1rm = m_1rm_totale / poids

# 6. Détermination dynamique du profil, diagnostic et prescriptions (Levernier)
def determiner_profil_et_cotation(f0_rel, v0, pmax_rel, ratio_1rm, a, poids, rules):
    # Option B : Pente relative absolue |S_fv| / Poids (N/kg/(m/s))
    pente_abs_rel = abs(a) / poids if poids > 0 else abs(a)

    rule_match = None
    if rules:
        for rule in rules.get("profils", []):
            if rule["pente_min"] <= pente_abs_rel < rule["pente_max"]:
                rule_match = rule
                break

    if not rule_match:
        rule_match = {
            "profil": "Profil Équilibré",
            "orientation": "PROFIL ÉQUILIBRÉ",
            "diagnostic": "Répartition harmonieuse entre la force brute et la vitesse d'exécution.",
            "recommandation": "Consolider la puissance maximale (Pmax) globale.",
            "exercices": ["Travail combiné lourd-léger.", "Transfert sur bloc dynamique."],
            "methode": "no method find"
        }



    # Génération automatique du diagnostic à partir de la recommandation si absent du JSON
    diag_text = rule_match.get("diagnostic")
    if not diag_text:
        diag_text = f"Profil orienté : {rule_match.get('profil', 'Équilibré')}. {rule_match.get('recommandation', '')}"

    # Récupération directe depuis le fichier JSON
    methode_val = rule_match.get("methode")
    if not methode_val:
        methode_val = "no method find"

    # Profil disciplinaire
    profil_discipline = "Profil Développement / Régional"
    norme_info = "Objectif : Augmenter 1RM/kg"
    if rules:
        for d in rules.get("disciplines", []):
            if ratio_1rm >= d.get("ratio_1rm_min", 0.0) and v0 >= d.get("v0_min", 0.0):
                profil_discipline = d["label"]
                norme_info = d["norme_info"]
                break

    # Cotations
    cot_bloc = "< 7A"
    cot_falaise = "< 7c+"
    if rules:
        for level in rules.get("cotations", []):
            if pmax_rel >= level["pmax_rel_min"]:
                cot_bloc = level["cotation_bloc"]
                cot_falaise = level["cotation_falaise"]
                break

    return {
        "profil": rule_match.get("profil"),
        "orientation": rule_match.get("orientation", "PRESCRIPTION"),
        "diagnostic": diag_text,
        "recommandation": rule_match.get("recommandation", ""),
        "exercices": rule_match.get("exercices", []),
        "methode": methode_val,
        "profil_discipline": profil_discipline,
        "norme_info": norme_info,
        "cotation_bloc": cot_bloc,
        "cotation_falaise": cot_falaise
    }

# Calcul automatique des clés
auto_interp = determiner_profil_et_cotation(f0_rel, v0, pmax_rel, ratio_1rm, a, poids, interpretation_rules)

if "interpretation" not in data or not isinstance(data["interpretation"], dict):
    data["interpretation"] = auto_interp
else:
    # Remplacement systématique si "TODO" ou valeur manquante
    for k, v in auto_interp.items():
        val_existante = data["interpretation"].get(k)
        if not val_existante or str(val_existante).strip().upper() == "TODO":
            data["interpretation"][k] = v
        # Forcer la méthode si elle est toujours absente ou manquante
        if not data["interpretation"].get("methode"):
            data["interpretation"]["methode"] = auto_interp["methode"]

# 7. Échelle dynamique pour le graphique SVG
# Ajustement précis sur la hauteur utile de la zone SVG (Y de 20 à 220 = 200px)
max_force_scale = float(np.ceil(f0 / 100.0) * 100.0) if f0 > 0 else 1000.0
y_ratio = 200.0 / max_force_scale

def to_svg(v, f):
    cx = 60 + (v / v0) * 540 if v0 > 0 else 60
    cy = 220 - (f * y_ratio)
    return cx, cy

def power_to_svg(v, p):
    cx = 60 + (v / v0) * 540 if v0 > 0 else 60
    cy = 220 - (p / pmax) * 160 if pmax > 0 else 220
    return cx, cy

svg_points = [{"cx": to_svg(p["vitesse"], p["force"])[0], "cy": to_svg(p["vitesse"], p["force"])[1]} for p in normalized_points]
x1, y1 = to_svg(0, f0)
x2, y2 = to_svg(v0, 0)

v_vals = np.linspace(0, v0, 50)
path_coords = [f"{power_to_svg(v, (a * v + b) * v)[0]:.1f},{power_to_svg(v, (a * v + b) * v)[1]:.1f}" for v in v_vals]
svg_power_path = "M " + " L ".join(path_coords)
pmax_cx, pmax_cy = power_to_svg(v0 / 2, pmax)

# 8. Rendu HTML avec Jinja2
template_path = os.path.join(script_dir, "template.html")
with open(template_path, "r", encoding="utf-8") as f:
    template = Template(f.read())

rendered_html = template.render(
    date_test=data["date_test"],
    athlete=data["athlete"],
    points=normalized_points,
    interpretation=data["interpretation"],
    f0=f0,
    v0=v0,
    pmax=pmax,
    pente=a,
    r2=r2,
    mvt=mvt,
    m_1rm_totale=m_1rm_totale,
    m_1rm_lest=m_1rm_lest,
    ratio_1rm=ratio_1rm,
    svg_points=svg_points,
    svg_line={"x1": x1, "y1": y1, "x2": x2, "y2": y2},
    svg_power_path=svg_power_path,
    pmax_node={"cx": pmax_cx, "cy": pmax_cy}
)

# 9. Génération du PDF
def sanitize(string):
    return re.sub(r'[\W_]+', '', string)

nom = sanitize(data["athlete"]["nom"])
prenom = sanitize(data["athlete"]["prenom"])
date_str = data["date_test"]

pdf_filename = f"Rapport_FV_{nom}_{prenom}_{date_str}.pdf"
pdf_path = os.path.join(output_dir, pdf_filename)

HTML(string=rendered_html).write_pdf(pdf_path)
print(f"Rapport généré avec succès : '{pdf_path}'")