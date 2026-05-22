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
  // Always return 200 to Mercado Pago to prevent retries on our errors
  try {
    // MP sends IPN as GET with ?id=&topic= OR new webhooks as POST with JSON body
    const paymentId = req.query?.id || req.body?.data?.id
    const topic     = req.query?.topic || req.query?.type || req.body?.type || req.body?.action

    const isPayment =
      topic === 'payment' ||
      topic === 'payment.created' ||
      topic === 'payment.updated'

    if (!paymentId || !isPayment) return res.status(200).end()

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) return res.status(200).end()

    const payment = await mpRes.json()

    if (payment.status !== 'approved') return res.status(200).end()

    const uid = payment.external_reference
    if (!uid) return res.status(200).end()

    await getDb().doc(`users/${uid}`).set(
      { progress: { isPremium: true } },
      { merge: true },
    )
  } catch (err) {
    console.error('webhook error:', err)
  }

  return res.status(200).end()
}
