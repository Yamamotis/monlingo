import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore }                 from 'firebase-admin/firestore'

function getDb() {
  if (!getApps().length) {
    const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return getFirestore()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const { uid, subscription } = req.body ?? {}
  if (!uid || !subscription)   return res.status(400).json({ error: 'uid and subscription required' })

  try {
    const db = getDb()
    await db.collection('users').doc(uid).update({ pushSubscription: subscription })
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
