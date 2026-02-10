# Configuration du Backend avec Vercel Functions

## 📋 Vue d'ensemble

Le backend a été migré vers **Vercel Functions** (serverless) pour fonctionner nativement avec Vercel. Plus besoin de serveur Express - Vercel gère l'endpoint automatiquement.

## 🚀 Structure

```
/api
  └── contact.js  ← Endpoint POST /api/contact
```

Les fichiers dans le dossier `/api` sont automatiquement transformés en Vercel Functions accessibles via `https://yoururl.com/api/contact`.

## 🔧 Configuration sur Vercel

### 1. Ajouter les variables d'environnement

Allez dans **Settings > Environment Variables** de votre projet Vercel et ajoutez :

```
EMAIL_USER = DST-System@hotmail.com
EMAIL_PASSWORD = votre_mot_de_passe_d_application
```

### 2. Comment obtenir le mot de passe d'application

**Important** : N'utilisez PAS votre mot de passe Outlook direct !

1. Allez sur : https://account.microsoft.com/security/app-passwords
2. Connectez-vous à DST-System@hotmail.com
3. Générez un **mot de passe d'application** (Mail + Windows)
4. Copiez le mot de passe généré (ex: `abcd efgh ijkl mnop`)
5. Utilisez-le dans la variable `EMAIL_PASSWORD`

### 3. Redéployer

- **Automatique** : Tout commit sur votre branche va redéployer automatiquement
- **Manuel** : Dans Vercel, cliquez sur "Deployments" → "Redeploy"

## 📧 Endpoint API

### POST `/api/contact`

Envoie un email via Vercel Function.

**Request :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization": "Police Nationale",
  "message": "Je souhaite en savoir plus..."
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

## 🧪 Tester localement

Pour tester avant de déployer :

```bash
npm install
npm run build
npm run preview
```

Ensuite, testez le formulaire de contact. Il appelera `/api/contact` en production.

## 📝 Fichiers pertinents

- **`/api/contact.js`** - Vercel Function
- **`src/pages/Contact.tsx`** - Formulaire (appelle `/api/contact`)
- **`vercel.json`** - Configuration Vercel
- **`package.json`** - Dépendances (nodemailer seulement)

## ⚠️ Notes importantes

- ✅ Les variables d'environnement ne sont **jamais** commitées
- ✅ Vercel déploie automatiquement après chaque push
- ✅ Les Vercel Functions sont **serverless** (pas de serveur toujours actif)
- ✅ Gratuit jusqu'à 100 invocations/jour (plus que suffisant pour un formulaire de contact)

## 🐛 Troubleshooting

### "Failed to send email" en production
- Vérifier que `EMAIL_USER` et `EMAIL_PASSWORD` sont configurés dans Vercel Settings
- Vérifier que c'est un mot de passe d'application Hotmail, pas le mot de passe du compte

### "Cannot POST /api/contact"
- Vérifier que le déploiement est complet
- Attendre 1-2 minutes après le push
- Vérifier les logs dans Vercel Dashboard

### Tester l'endpoint directement
```bash
curl -X POST https://yoururl.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "organization": "Test",
    "message": "Test"
  }'
```
