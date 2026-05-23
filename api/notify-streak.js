import webpush                        from 'web-push'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore }                 from 'firebase-admin/firestore'

function getDb() {
  if (!getApps().length) {
    const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return getFirestore()
}

// Executado às 23:00 UTC = 20:00 BRT pelo Vercel Cron
export default async function handler(req, res) {
  // Permite chamada manual com secret
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    webpush.setVapidDetails(
      'mailto:' + (process.env.VITE_ADMIN_EMAIL ?? 'admin@monlingo.app'),
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    )

    const db       = getDb()
    const today    = new Date().toISOString().slice(0, 10)
    const snapshot = await db.collection('users').get()

    let sent = 0, skipped = 0

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const prog = data.progress ?? {}

      // Pula quem já estudou hoje ou não tem subscription
      if (prog.lastStudyDate === today)  { skipped++; continue }
      if (!data.pushSubscription)        { skipped++; continue }
      if (!prog.streak || prog.streak < 1) { skipped++; continue }

      const streak = prog.streak ?? 0
      const body   = streak > 0
        ? `Não perca sua sequência de ${streak} dia${streak !== 1 ? 's' : ''}! 🔥`
        : 'Que tal estudar um pouquinho de francês hoje? 🇫🇷'

      try {
        await webpush.sendNotification(data.pushSubscription, JSON.stringify({
          title: 'Monlingo — hora de estudar!',
          body,
        }))
        sent++
      } catch {
        // Subscription expirada ou inválida — remove
        await doc.ref.update({ pushSubscription: null }).catch(() => {})
      }
    }

    res.status(200).json({ sent, skipped })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
