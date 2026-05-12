# Application de Gestion d’Auto-École avec Firebase

## 🎯 Objectif du Projet

Créer une application de gestion pour une auto-école permettant :

- Le suivi des élèves
- La gestion des paiements
- Le blocage automatique des inscriptions aux examens en cas d’impayés

---

# 🛠️ Stack Technique

## Frontend
- Nextjs + Tailwind CSS  


## Backend / Base de Données
- Firebase Firestore

## Authentification
- Firebase Auth

---

# 📦 Structure Firestore

## Collection `eleves`

```json
{
  "nom": "Diallo",
  "prenom": "Moussa",
  "telephone": "771234567",
  "formule": "Permis B",
  "prix_total": 300000,
  "montant_paye": 150000,
  "statut": "inscrit"
}