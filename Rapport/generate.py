from weasyprint import HTML

# 1. Charger le fichier HTML externe
with open("template.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# 2. Générer le document PDF
HTML(string=html_content).write_pdf("mon_rapport_force_vitesse.pdf")

print("Le PDF a été généré avec succès à partir du fichier HTML !")
