# Gestion d'auto-école

Application web de gestion pour une auto-école : suivi des élèves, des paiements et des inscriptions aux examens.

🔗 **Démo :** https://gestion-auto-ecole-red.vercel.app/login

<!-- Ajouter une capture d'écran ici, par exemple : ![Tableau de bord](docs/dashboard.png) -->

## Fonctionnalités

- **Tableau de bord** : vue d'ensemble des élèves et des derniers inscrits.
- **Gestion des élèves** : création, modification et suppression, recherche par nom ou téléphone, formule (Permis A, B, C, D) et statut (actif, suspendu, diplômé).
- **Paiements** : enregistrement des versements (espèces, virement, chèque) et calcul automatique du reste à payer.
- **Examens** : blocage automatique de l'inscription à l'examen tant que la formation n'est pas soldée, avec la liste des élèves autorisés et bloqués.
- **Authentification** : accès protégé via Firebase Auth.
- **Responsive** : barre latérale sur ordinateur, navigation en bas de l'écran sur mobile.

## Stack technique

| Couche | Technologies |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Firebase Firestore, Firebase Auth |
| Déploiement | Vercel |

## Lancer le projet en local

```bash
git clone https://github.com/Nguirane120/gestion-auto-ecole.git
cd gestion-auto-ecole
npm install
npm run dev
```

Créer un fichier `.env.local` avec les clés de configuration Firebase :

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

L'application est disponible sur http://localhost:3000.

## Auteur

**Alioune Badara Nguirane** — Développeur Full Stack Web & Mobile
[GitHub](https://github.com/Nguirane120) · [LinkedIn](https://www.linkedin.com/in/alioune-badara-nguirane-711820197/)
