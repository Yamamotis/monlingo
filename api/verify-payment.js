import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getDb() {
  if (!getApps().length) {
    const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return getFirestore()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { uid } = req.body ?? {}
  if (!uid) return res.status(400).json({ error: 'uid required' })

  try {
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${uid}&status=approved&sort=date_created&criteria=desc&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } },
    )

    if (!mpRes.ok) return res.status(500).json({ error: 'Erro ao consultar pagamento.' })

    const data = await mpRes.json()
    const approved = data.results?.length > 0

    if (approved) {
      await getDb().doc(`users/${uid}`).set(
        { progress: { isPremium: true } },
        { merge: true },
      )
    }

    return res.status(200).json({ activated: approved })
  } catch (err) {
    console.error('verify-payment error:', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
