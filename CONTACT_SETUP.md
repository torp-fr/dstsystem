# 📧 Guide Complet - Formulaire de Contact DST-System

## Vue d'ensemble

Le formulaire de contact utilise **Vercel Functions** pour traiter les emails sans serveur. Les messages sont envoyés à `DST-System@hotmail.com`.

---

## 🚀 Déploiement sur Vercel

### Architecture
```
Frontend (React/Vite)  →  Vercel CDN
                       →  /api/contact (Serverless Function)
                           ↓
                        Nodemailer
                           ↓
                        SMTP Hotmail/Outlook
```

### Configuration requise

**1. Variables d'environnement dans Vercel :**

Allez sur : **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**

Ajoutez ces deux variables :

```
EMAIL_USER = DST-System@hotmail.com
EMAIL_PASSWORD = votre_mot_de_passe_d_application
```

**2. Obtenir le mot de passe d'application :**

⚠️ **N'UTILISEZ PAS votre mot de passe réel** !

1. Allez sur : https://account.microsoft.com/security/app-passwords
2. Connectez-vous avec `DST-System@hotmail.com`
3. Sélectionnez : **Mail** + **Windows**
4. Cliquez **Créer**
5. Copiez le mot de passe généré (ex: `abcd efgh ijkl mnop`)
6. Collez-le dans `EMAIL_PASSWORD` sur Vercel

**3. Redéployez :**

- Après chaque `git push`, Vercel redéploie automatiquement
- Vérifiez dans **Deployments** que le statut est **"Ready"**

---

## 📝 Fichiers clés

| Fichier | Rôle |
|---------|------|
| `/api/contact.js` | Endpoint serverless Vercel |
| `src/pages/Contact.tsx` | Formulaire de contact |
| `vercel.json` | Configuration Vercel |

---

## 🧪 Tester localement (développement)

```bash
# Installer les dépendances
npm install

# Lancer Vite (frontend uniquement)
npm run dev
```

Le frontend tourne sur `http://localhost:5173`.

L'endpoint `/api/contact` n'est disponible qu'en production sur Vercel.

---

## 📧 Endpoint API

### POST `/api/contact`

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
  "details": "Authentication failed"
}
```

---

## 🔒 Sécurité

✅ **Bonnes pratiques respectées :**
- Variables d'environnement : jamais hardcodées
- `.env` est ignoré par `.gitignore`
- Mots de passe d'application : sécurisés via Microsoft
- Email de confirmation automatique au demandeur

---

## ❌ Troubleshooting

### "Failed to send email" en production
→ Vérifier que `EMAIL_USER` et `EMAIL_PASSWORD` sont configurés dans Vercel Settings
→ Vérifier que c'est un mot de passe d'application, pas le mot de passe du compte

### Page `/contact` affiche 404
→ Vérifier que `vercel.json` contient la configuration `rewrites`
→ Forcer un redéploiement sur Vercel

### API appelle `localhost:3001`
→ Le build en cache doit être vidé
→ Forcer un "Redeploy" depuis Vercel Dashboard

---

## 📋 Checklist de déploiement

- [ ] Variables `EMAIL_USER` et `EMAIL_PASSWORD` configurées sur Vercel
- [ ] Mot de passe = mot de passe d'application Hotmail (pas le vrai)
- [ ] Dernier déploiement sur Vercel = **"Ready"**
- [ ] `vercel.json` présent avec configuration correcte
- [ ] Formulaire testable sur `https://votreurl.vercel.app/contact`
- [ ] Email de test reçu à `DST-System@hotmail.com`
