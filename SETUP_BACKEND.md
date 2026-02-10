# Configuration du Backend - Système de Contact

## 📋 Vue d'ensemble

Le backend gère l'envoi des emails depuis le formulaire de contact. Il utilise **Express.js** et **Nodemailer** pour communiquer avec le serveur SMTP Hotmail/Outlook.

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (copie de `.env.example`) :

```bash
cp .env.example .env
```

Éditez `.env` et configurez vos identifiants :
```
EMAIL_USER=DST-System@hotmail.com
EMAIL_PASSWORD=your_app_password_here
PORT=3001
```

### 3. Configuration Hotmail/Outlook

Pour utiliser un compte Hotmail/Outlook avec Nodemailer :

1. **Activer l'authentification par application** :
   - Allez à https://account.microsoft.com/security/app-passwords
   - Créez un **mot de passe d'application**
   - Collez ce mot de passe dans `EMAIL_PASSWORD` dans le fichier `.env`

2. **Alternative : Utiliser un mot de passe d'application spécifique**
   - Microsoft recommande d'utiliser des mots de passe d'application pour les services tiers
   - Plus d'infos : https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a324991e6b19

### 4. Démarrer le projet

**Mode développement (Frontend + Backend en parallèle)** :
```bash
npm run dev
```

**Ou séparément** :
- Frontend: `npm run dev:frontend` (Vite, port 5173)
- Backend: `npm run dev:backend` (Express, port 3001)

## 📧 Endpoint API

### POST `/api/contact`

Envoie un email au formulaire de contact.

**Request :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization": "Police Nationale",
  "message": "Je souhaite en savoir plus sur vos services..."
}
```

**Response (succès)** :
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Response (erreur)** :
```json
{
  "success": false,
  "error": "Failed to send email",
  "details": "..."
}
```

## 🔧 Comportement

1. **Email reçu par DST-System** : Tous les messages sont envoyés à `DST-System@hotmail.com` avec les informations du contact
2. **Email de confirmation** : Un email de confirmation est automatiquement envoyé au demandeur
3. **Validation** : Les champs `name`, `email` et `message` sont requis

## ⚠️ Notes importantes

- Les credentials ne sont **jamais** commitées (`.env` est dans `.gitignore`)
- Le serveur écoute sur `http://localhost:3001` en développement
- En production, configurer les variables d'environnement via les paramètres du serveur/plateforme

## 🐛 Troubleshooting

### "Failed to send email"
- Vérifier que `EMAIL_USER` et `EMAIL_PASSWORD` sont corrects
- Vérifier la connexion Internet
- Activer l'authentification par application Hotmail

### "Cannot POST /api/contact"
- S'assurer que le backend est en cours d'exécution (`npm run dev:backend`)
- Vérifier que le port 3001 n'est pas occupé

### CORS Error
- Vérifier que le frontend appelle `http://localhost:3001`
- Le CORS est déjà configuré pour accepter toutes les origines en développement
