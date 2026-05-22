export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { uid } = req.body ?? {}
  if (!uid) return res.status(400).json({ error: 'uid required' })

  const appUrl = process.env.APP_URL || 'https://monlingo.com.br'

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Monlingo Premium — Acesso Vitalício',
            unit_price: 14.99,
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        external_reference: uid,
        back_urls: {
          success: `${appUrl}/?payment=success`,
          failure: `${appUrl}/?payment=failed`,
          pending: `${appUrl}/?payment=pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhook`,
        payment_methods: {
          installments: 1,
          excluded_payment_types: [],
          default_payment_method_id: 'pix',
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('MP create-preference error:', text)
      return res.status(500).json({ error: 'Erro ao criar preferência de pagamento.' })
    }

    const data = await response.json()
    return res.status(200).json({ url: data.init_point })
  } catch (err) {
    console.error('create-payment exception:', err)
    return res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}
