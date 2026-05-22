/**
 * Gera arquivos MP3 para todo o vocabulário francês do Monlingo
 * usando Google Cloud Text-to-Speech (voz fr-FR-Wavenet-C, feminina).
 *
 * Uso:
 *   GOOGLE_TTS_KEY=sua_chave node scripts/generate-audio.mjs
 *
 * Pré-requisito:
 *   1. Criar projeto no Google Cloud Console
 *   2. Ativar "Cloud Text-to-Speech API"
 *   3. Criar uma chave de API (APIs & Services → Credentials → Create Credentials → API Key)
 */

import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllVocab } from '../src/data/lessons.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_KEY   = process.env.GOOGLE_TTS_KEY

if (!API_KEY) {
  console.error('\n❌  Variável GOOGLE_TTS_KEY não definida.')
  console.error('    Execute: GOOGLE_TTS_KEY=sua_chave node scripts/generate-audio.mjs\n')
  process.exit(1)
}

export function textToFilename(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos: é→e ç→c à→a
    .replace(/['‘’]/g, '')                   // remove apóstrofos
    .replace(/[^a-z0-9]+/g, '-')                       // resto → hífen
    .replace(/^-+|-+$/g, '')                           // trim hífens
    .slice(0, 80)
}

async function synthesize(text) {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-C' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.82, pitch: 0 },
      }),
    }
  )
  const data = await res.json()
  if (!data.audioContent) throw new Error(JSON.stringify(data))
  return Buffer.from(data.audioContent, 'base64')
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  const outDir = path.join(__dirname, '..', 'public', 'audio')
  fs.mkdirSync(outDir, { recursive: true })

  const vocab      = getAllVocab()
  const uniqueTexts = [...new Set(vocab.map(v => v.fr))]

  console.log(`\n🎙️  ${uniqueTexts.length} palavras/frases únicas encontradas`)
  console.log(`📁  Salvando em public/audio/\n`)

  let generated = 0, skipped = 0, errors = 0

  for (const text of uniqueTexts) {
    const filename = textToFilename(text)
    const outPath  = path.join(outDir, `${filename}.mp3`)

    if (fs.existsSync(outPath)) {
      skipped++
      continue
    }

    try {
      const audio = await synthesize(text)
      fs.writeFileSync(outPath, audio)
      generated++
      process.stdout.write(`\r  ✓ ${generated} gerados   ${skipped} já existiam   ${errors} erros    `)
      await sleep(130) // ~7 req/s — dentro do limite do free tier
    } catch (err) {
      errors++
      console.error(`\n  ✗ Falha: "${text}" — ${err.message}`)
    }
  }

  console.log(`\n\n✅  Concluído!`)
  console.log(`   ${generated} arquivos gerados`)
  console.log(`   ${skipped} já existiam (pulados)`)
  if (errors) console.log(`   ${errors} erros`)
  console.log(`\n💡  Próximo passo: git add public/audio && git commit -m "feat: audio TTS pré-gerado"\n`)
}

main()
