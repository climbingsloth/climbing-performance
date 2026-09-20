import numpy as np
from weasyprint import HTML

# 1. Tes données
x = np.array([1.06, 0.94, 0.71, 0.41, 0.38])  # Vitesse
y = np.array([627.2, 676.2, 725.2, 774.2, 803.6])  # Force

# 2. Calculs de régression
a, b = np.polyfit(x, y, 1)
f0 = b
v0 = -b / a
pmax = (f0 * v0) / 4

# 3. Code HTML/CSS/SVG (sous forme de chaîne de caractères)
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        @page {{ size: A4 portrait; margin: 10mm; }}
        body {{ font-family: Arial, sans-serif; color: #0f172a; }}
        .card {{ background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; }}
        h1 {{ color: #2563eb; }}
    </style>
</head>
<body>
    <h1>Fiche Profil Force-Vitesse</h1>
    <div class="card">
        <p><b>F0 :</b> {f0:.2f} N</p>
        <p><b>V0 :</b> {v0:.2f} m/s</p>
        <p><b>Pmax :</b> {pmax:.2f} W</p>
    </div>
    
    <!-- Le graphique est généré en SVG ici -->
    <svg width="500" height="200">
        <!-- Grille et axes en SVG -->
        <line x1="50" y1="180" x2="450" y2="180" stroke="black" stroke-width="2" />
        <line x1="50" y1="20" x2="50" y2="180" stroke="black" stroke-width="2" />
        <!-- Droite de régression -->
        <line x1="50" y1="40" x2="400" y2="180" stroke="#2563eb" stroke-width="2" />
    </svg>
</body>
</html>
"""

# 4. Génération du PDF
HTML(string=html_content).write_pdf("mon_profil_fv.pdf")
print("PDF généré avec succès !")
