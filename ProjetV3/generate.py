import json
import sys
import os
import re
from datetime import datetime
import numpy as np
from jinja2 import Template
from weasyprint import HTML

# 1. Vérification de l'argument CLI (Fichier JSON)
if len(sys.argv) < 2:
    print("Erreur : Veuillez préciser le fichier JSON en paramètre.")
    print("Usage: python3 generate.py <chemin_vers_donnees.json>")
    sys.exit(1)

json_path = sys.argv[1]

if not os.path.exists(json_path):
    print(f"Erreur : Le fichier '{json_path}' n'existe pas.")
    sys.exit(1)

# 2. Charger les données du fichier JSON
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 3. Calcul dynamique de l'âge à la date du test
try:
    date_test = datetime.strptime(data["date_test"], "%Y-%m-%d")
    date_naissance = datetime.strptime(data["athlete"]["date_naissance"], "%Y-%m-%d")
    
    # Calcul exact de l'âge (prend en compte si l'anniversaire est déjà passé cette année-là)
    age_au_test = date_test.year - date_naissance.year - (
        (date_test.month, date_test.day) < (date_naissance.month, date_naissance.day)
    )
    data["athlete"]["age_au_test"] = age_au_test
except (KeyError, ValueError) as e:
    print(f"Erreur lors du calcul de l'âge : Vérifiez que 'date_test' et 'date_naissance' sont au format YYYY-MM-DD. ({e})")
    sys.exit(1)

# 4. Normalisation des points : Calcul systématique de Vitesse et Puissance
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
        raise ValueError(f"Le point {p} doit contenir soit 'vitesse' soit 'puissance'.")

    normalized_points.append({
        "force": round(force, 1),
        "vitesse": round(vitesse, 2),
        "puissance": round(puissance, 1)
    })

# 5. Calculs de régression linéaire et paramètres F-V
vitesses = np.array([p["vitesse"] for p in normalized_points])
forces = np.array([p["force"] for p in normalized_points])

a, b = np.polyfit(vitesses, forces, 1)  # F(v) = a*v + b
f0 = b
v0 = -b / a
pmax = (f0 * v0) / 4
r2 = np.corrcoef(vitesses, forces)[0, 1] ** 2

# Estimation 1RM (MVT = 0.20 m/s)
mvt = 0.20
f_1rm = (a * mvt) + b
m_1rm_totale = f_1rm / 9.81
m_1rm_lest = m_1rm_totale - data["athlete"]["poids_kg"]

# 6. Conversion SVG
def to_svg(v, f):
    cx = 60 + (v * 120)
    cy = 220 - (f * 0.2)
    return cx, cy

def power_to_svg(v, p):
    cx = 60 + (v * 120)
    cy = 220 - (p * 0.2)
    return cx, cy

svg_points = [{"cx": to_svg(p["vitesse"], p["force"])[0], "cy": to_svg(p["vitesse"], p["force"])[1]} for p in normalized_points]
x1, y1 = to_svg(0, f0)
x2, y2 = to_svg(v0, 0)

# Tracé de la parabole de puissance
v_vals = np.linspace(0, v0, 50)
path_coords = []
for v in v_vals:
    p = (a * v + b) * v
    cx, cy = power_to_svg(v, p)
    path_coords.append(f"{cx:.1f},{cy:.1f}")

svg_power_path = "M " + " L ".join(path_coords)
pmax_cx, pmax_cy = power_to_svg(v0 / 2, pmax)

# 7. Rendu Jinja2
with open("template.html", "r", encoding="utf-8") as f:
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
    svg_points=svg_points,
    svg_line={"x1": x1, "y1": y1, "x2": x2, "y2": y2},
    svg_power_path=svg_power_path,
    pmax_node={"cx": pmax_cx, "cy": pmax_cy}
)

# 8. Génération du nom de PDF unique
def sanitize(string):
    return re.sub(r'[\W_]+', '', string)

nom = sanitize(data["athlete"]["nom"])
prenom = sanitize(data["athlete"]["prenom"])
date_str = data["date_test"]

pdf_filename = f"Rapport_FV_{nom}_{prenom}_{date_str}.pdf"

# 9. Génération du PDF
HTML(string=rendered_html).write_pdf(pdf_filename)
print(f"Rapport généré avec succès : '{pdf_filename}'")