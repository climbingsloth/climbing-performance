import json
import numpy as np
from jinja2 import Template
from weasyprint import HTML

# 1. Charger les données du fichier JSON
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 2. Calculs de la régression linéaire
vitesses = np.array([p["vitesse"] for p in data["points"]])
forces = np.array([p["force"] for p in data["points"]])

a, b = np.polyfit(vitesses, forces, 1)  # F(v) = a*v + b
f0 = b
v0 = -b / a
pmax = (f0 * v0) / 4
r2 = np.corrcoef(vitesses, forces)[0, 1] ** 2

# 3. Conversions SVG (Graphique : X de 60 à 600, Y de 220 à 20)
# Axe X : Vitesse (0 à 4.5 m/s -> 120 px/unit)
# Axe Y Gauche : Force (0 à 1000 N -> 0.2 px/unit)
# Axe Y Droite : Puissance (0 à 1000 W -> 0.2 px/unit pour l'échelle)
def to_svg(v, f):
    cx = 60 + (v * 120)
    cy = 220 - (f * 0.2)
    return cx, cy

def power_to_svg(v, p):
    cx = 60 + (v * 120)
    cy = 220 - (p * 0.2)  # Échelle 1 W = 0.2 px (adaptée pour 1000 W max)
    return cx, cy

# Points SVG de la droite Force-Vitesse
svg_points = [{"cx": to_svg(p["vitesse"], p["force"])[0], "cy": to_svg(p["vitesse"], p["force"])[1]} for p in data["points"]]
x1, y1 = to_svg(0, f0)
x2, y2 = to_svg(v0, 0)

# 4. Génération du tracé de la parabole de Puissance (Path SVG)
v_vals = np.linspace(0, v0, 50)
path_coords = []
for v in v_vals:
    p = (a * v + b) * v  # P = F * v
    cx, cy = power_to_svg(v, p)
    path_coords.append(f"{cx:.1f},{cy:.1f}")

svg_power_path = "M " + " L ".join(path_coords)

# Sommet de la parabole (Pmax)
pmax_cx, pmax_cy = power_to_svg(v0 / 2, pmax)

# 5. Injection Jinja2
with open("template.html", "r", encoding="utf-8") as f:
    template = Template(f.read())

rendered_html = template.render(
    athlete=data["athlete"],
    points=data["points"],
    interpretation=data["interpretation"],
    f0=f0,
    v0=v0,
    pmax=pmax,
    pente=a,
    r2=r2,
    svg_points=svg_points,
    svg_line={"x1": x1, "y1": y1, "x2": x2, "y2": y2},
    svg_power_path=svg_power_path,
    pmax_node={"cx": pmax_cx, "cy": pmax_cy}
)

# 6. Génération PDF
HTML(string=rendered_html).write_pdf("rapport_force_vitesse_pro.pdf")
print("PDF avec parabole Pmax généré avec succès !")
