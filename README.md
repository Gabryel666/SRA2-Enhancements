# Gab's SRA2 Enhancements

Ce module complémentaire pour FoundryVTT enrichit et personnalise l'expérience de jeu sur le système **Shadowrun Anarchy 2** (SRA2).

[![Version](https://img.shields.io/github/v/release/Gabryel666/SRA2-Enhancements?label=version)](https://github.com/Gabryel666/SRA2-Enhancements/releases/latest)
[![FoundryVTT](https://img.shields.io/badge/FoundryVTT-v14-informational)](https://foundryvtt.com)
[![SRA2](https://img.shields.io/badge/Système-SRA2%2014-blue)](https://foundryvtt.com/packages/sra2)

---

## Fonctionnalités

### 💰 Séparation de l'Économie (XP / Cash)
Le système natif SRA2 gère parfois l'équipement via les points d'expérience. Ce module sépare clairement ces deux concepts :
- Un champ **Cash (¥)** dédié est injecté dans le pied de page de la fiche de personnage V2.
- Le champ XP natif est conservé et renommé explicitement en "XP".

### 🏷️ Coût en Cash sur les Objets
Les armes, équipements, cyberwares, cyberdecks et autres objets bénéficient d'un champ **"Coût en Cash"** affiché en doré dans les listes de la fiche de personnage.

### 🚗 Véhicules & Drones (acteurs)
Les véhicules/drones du système SRA2 (glissés dans les fiches de personnage) bénéficient de la même gestion :
- Champ **"Coût en Cash"** sur leur fiche d'acteur
- Coût en Cash affiché dans la liste des véhicules liés
- **Déduction automatique du Cash** lors de l'acquisition par glissement, comme pour les objets

### 🛒 Déduction Automatique à l'Achat
Lorsqu'un objet ayant un coût en Cash est ajouté à la fiche d'un personnage, une fenêtre de confirmation propose de déduire automatiquement cette somme de son portefeuille.

### 🔊 Sons Personnalisés d'Interface
Configurez un fichier audio qui se joue automatiquement à l'ouverture ou à la fermeture de la fiche de personnage dans les paramètres du module.

---

## Compatibilité

| Élément | Version |
|---|---|
| FoundryVTT | v14 (minimum 14, vérifié 14) |
| Système SRA2 | v14 (vérifié 14.3.0) |
| Fiche supportée | Actor Character Sheet V2 |

---

## Notes Techniques

- **Identifiant du module :** `sra2-enhancements`
- **Migration automatique :** Les anciennes données stockées sous `sra2-xp-cash` sont migrées automatiquement au lancement du monde.
- **Protection des données :** Le Cash des personnages est stocké dans les flags du module (`flags.sra2-enhancements.cash`) et n'interfère pas avec les données système natives.

