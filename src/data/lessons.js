// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeQ(vocab, item, dir) {
  const ans       = dir === 'fr-pt' ? item.pt : item.fr
  const wrongField = dir === 'fr-pt' ? 'pt'   : 'fr'
  const question   = dir === 'fr-pt'
    ? `O que significa "${item.fr}"?`
    : `Como se diz "${item.pt}" em francês?`
  const wrongs = shuffle(vocab.filter(v => v[wrongField] !== ans)).slice(0, 3).map(v => v[wrongField])
  const options = shuffle([ans, ...wrongs])
  return { type: 'multiple-choice', question, options, correct: options.indexOf(ans), speakFr: item.fr }
}

function makeListeningQ(vocab, item) {
  const ans    = item.pt
  const wrongs = shuffle(vocab.filter(v => v.pt !== ans)).slice(0, 3).map(v => v.pt)
  const options = shuffle([ans, ...wrongs])
  return { type: 'listening', question: 'Ouça e selecione a tradução', speakFr: item.fr, options, correct: options.indexOf(ans) }
}

function makeTypingQ(item) {
  return { type: 'typing', pt: item.pt, correct: item.fr, speakFr: item.fr }
}

function genTypingExercise(vocab) {
  return {
    number:    4,
    title:     'Exercício 4',
    subtitle:  'Escrita em francês ✍️',
    questions: shuffle(vocab.map(item => makeTypingQ(item))),
  }
}

function makeOrderingQ(item) {
  const words = item.fr.split(' ')
  if (words.length < 3) return null
  return {
    type:    'ordering',
    pt:      item.pt,
    words:   shuffle([...words]),
    correct: words,
    speakFr: item.fr,
  }
}

function genOrderingExercise(vocab) {
  return {
    number:   5,
    title:    'Exercício 5',
    subtitle: 'Organize as frases 🔤',
    questions: shuffle(vocab.map(makeOrderingQ).filter(Boolean)),
  }
}

// ── Fill-in-the-blank ─────────────────────────────────────────────────────────
const BLANK_STOP = new Set([
  'le','la','les','un','une','des','de','du','en','à','au','aux',
  'je','tu','il','elle','nous','vous','ils','elles','on',
  'me','ma','mon','se','te','ta','ton','sa','son',
  'ne','pas','et','ou','que','qui','ce',
  "j'","c'","l'","n'","d'","m'","s'","t'",
])

function makeBlankQ(item) {
  const rawWords = item.fr.split(' ')
  if (rawWords.length === 1) {
    // Palavra única — mostra apenas o placeholder
    return {
      type:     'blank',
      prompt:   item.pt,
      sentence: '___',
      correct:  item.fr.toLowerCase(),
      hint:     item.fr[0].toLowerCase(),
      speakFr:  item.fr,
    }
  }

  // Frase: escolhe a palavra mais longa que não seja stop word
  const candidates = rawWords.map((w, i) => {
    const norm = w.toLowerCase().replace(/[.,!?;:'"«»]/g, '').replace(/^(l'|d'|j'|n'|s'|m'|t'|c')/, '')
    return { w, i, norm }
  }).filter(x => !BLANK_STOP.has(x.norm) && x.norm.length > 2)

  const target = candidates.length
    ? candidates.sort((a, b) => b.norm.length - a.norm.length)[0]
    : { w: rawWords[rawWords.length - 1], i: rawWords.length - 1, norm: rawWords[rawWords.length - 1].toLowerCase() }

  const sentence = rawWords.map((w, i) => i === target.i ? '___' : w).join(' ')

  return {
    type:     'blank',
    prompt:   item.pt,
    sentence,
    correct:  target.norm,
    hint:     target.norm[0],
    speakFr:  item.fr,
  }
}

function genBlankExercise(vocab) {
  return {
    number:    6,
    title:     'Exercício 6',
    subtitle:  'Complete a lacuna ✏️',
    questions: shuffle(vocab.map(makeBlankQ).filter(Boolean)),
  }
}

// ── Exercícios mistos (todos os tipos embaralhados, 2×15 questões) ────────────
function genMixedExercises(vocab) {
  // Gera todas as questões de todos os tipos
  const pool = shuffle([
    ...vocab.map(item => makeQ(vocab, item, 'fr-pt')),
    ...vocab.map(item => makeQ(vocab, item, 'pt-fr')),
    ...vocab.map(item => makeListeningQ(vocab, item)),
    ...vocab.map(item => makeTypingQ(item)),
    ...vocab.map(makeBlankQ).filter(Boolean),
    ...vocab.map(makeOrderingQ).filter(Boolean),
    // Questão de combinação (uma por exercício, com 5 pares aleatórios)
    {
      type:  'matching',
      pairs: shuffle([...vocab]).slice(0, Math.min(5, vocab.length)).map(v => ({ fr: v.fr, pt: v.pt })),
    },
  ])

  const perEx = 15
  return [
    {
      number:   1,
      title:    'Exercício 1',
      subtitle: 'Treino misto — parte 1 🎯',
      questions: pool.slice(0, perEx),
    },
    {
      number:   2,
      title:    'Exercício 2',
      subtitle: 'Treino misto — parte 2 🎯',
      questions: pool.slice(perEx, perEx * 2),
    },
  ]
}

function genEvalQuestions(vocab) {
  const all = shuffle([...vocab])
  return shuffle([
    ...all.slice(0, 5).map(item => makeQ(vocab, item, 'pt-fr')),
    ...all.slice(5).map(item => makeQ(vocab, item, 'fr-pt')),
  ])
}

// ── Vocabulary ────────────────────────────────────────────────────────────────

const VOCAB = {
  m1: [
    { fr: 'Bonjour',          pt: 'Olá / Bom dia',     note: 'Cumprimento mais comum, usado até ~18h',         sentence: 'Bonjour ! Comment tu t\'appelles ?' },
    { fr: 'Bonsoir',          pt: 'Boa tarde / noite',  note: 'Usado a partir do fim da tarde',                 sentence: 'Bonsoir madame, une table pour deux ?' },
    { fr: 'Bonne nuit',       pt: 'Boa noite',          note: 'Só ao se despedir para dormir',                  sentence: 'Bonne nuit ! Dors bien.' },
    { fr: 'Au revoir',        pt: 'Tchau / Até logo',   note: 'Despedida formal e informal',                    sentence: 'Au revoir et à bientôt !' },
    { fr: 'Merci',            pt: 'Obrigado(a)',         note: null,                                             sentence: 'Merci beaucoup pour votre aide !' },
    { fr: "S'il vous plaît",  pt: 'Por favor',          note: 'Forma formal; "s\'il te plaît" é informal',     sentence: 'Un café, s\'il vous plaît.' },
    { fr: 'Oui',              pt: 'Sim',                note: null,                                             sentence: 'Oui, je comprends très bien.' },
    { fr: 'Non',              pt: 'Não',                note: null,                                             sentence: 'Non merci, je n\'ai pas faim.' },
    { fr: 'Excusez-moi',      pt: 'Com licença',        note: 'Também usado para pedir desculpa',               sentence: 'Excusez-moi, où est la gare ?' },
    { fr: 'De rien',          pt: 'De nada',            note: 'Resposta para "Merci"',                          sentence: 'De rien, c\'était avec plaisir !' },
  ],
  m2: [
    { fr: 'Un',    pt: 'Um',    note: null, sentence: 'J\'ai un chien et deux chats.' },
    { fr: 'Deux',  pt: 'Dois',  note: null, sentence: 'Deux cafés, s\'il vous plaît.' },
    { fr: 'Trois', pt: 'Três',  note: null, sentence: 'Il faut trois heures pour y aller.' },
    { fr: 'Quatre',pt: 'Quatro',note: null, sentence: 'Il y a quatre saisons dans l\'année.' },
    { fr: 'Cinq',  pt: 'Cinco', note: null, sentence: 'Je reviens dans cinq minutes.' },
    { fr: 'Six',   pt: 'Seis',  note: null, sentence: 'Il est six heures du matin.' },
    { fr: 'Sept',  pt: 'Sete',  note: null, sentence: 'Il y a sept jours dans une semaine.' },
    { fr: 'Huit',  pt: 'Oito',  note: null, sentence: 'Il a huit ans.' },
    { fr: 'Neuf',  pt: 'Nove',  note: null, sentence: 'Il reste neuf jours de vacances.' },
    { fr: 'Dix',   pt: 'Dez',   note: null, sentence: 'J\'ai dix doigts.' },
  ],
  m3: [
    { fr: 'Rouge',  pt: 'Vermelho', note: null,                                    sentence: 'La voiture rouge est très belle.' },
    { fr: 'Bleu',   pt: 'Azul',    note: null,                                    sentence: 'Le ciel est bleu aujourd\'hui.' },
    { fr: 'Vert',   pt: 'Verde',   note: null,                                    sentence: 'L\'herbe est verte au printemps.' },
    { fr: 'Jaune',  pt: 'Amarelo', note: null,                                    sentence: 'Le soleil est jaune et brillant.' },
    { fr: 'Blanc',  pt: 'Branco',  note: null,                                    sentence: 'La neige est blanche et froide.' },
    { fr: 'Noir',   pt: 'Preto',   note: null,                                    sentence: 'Le café est noir et fort.' },
    { fr: 'Rose',   pt: 'Rosa',    note: 'Também é a palavra para "rosa" (flor)', sentence: 'Elle porte une robe rose.' },
    { fr: 'Orange', pt: 'Laranja', note: 'Invariável — não muda com gênero',      sentence: 'J\'aime le jus d\'orange.' },
    { fr: 'Violet', pt: 'Roxo',    note: null,                                    sentence: 'Il a peint les murs en violet.' },
    { fr: 'Marron', pt: 'Marrom',  note: 'Invariável — não muda com gênero',      sentence: 'J\'ai les cheveux marron.' },
  ],
  m4: [
    { fr: 'Père',       pt: 'Pai',    note: null,                        sentence: 'Mon père travaille à Paris.' },
    { fr: 'Mère',       pt: 'Mãe',    note: null,                        sentence: 'Ma mère fait la cuisine.' },
    { fr: 'Frère',      pt: 'Irmão',  note: null,                        sentence: 'Mon frère a vingt ans.' },
    { fr: 'Sœur',       pt: 'Irmã',   note: null,                        sentence: 'Ma sœur étudie la médecine.' },
    { fr: 'Grand-père', pt: 'Avô',    note: null,                        sentence: 'Mon grand-père a soixante-dix ans.' },
    { fr: 'Grand-mère', pt: 'Avó',    note: null,                        sentence: 'Ma grand-mère fait de bons gâteaux.' },
    { fr: 'Fils',       pt: 'Filho',  note: 'O "s" final é mudo',        sentence: 'Leur fils joue au football.' },
    { fr: 'Fille',      pt: 'Filha',  note: 'Também significa "menina"', sentence: 'Sa fille est très intelligente.' },
    { fr: 'Oncle',      pt: 'Tio',    note: null,                        sentence: 'Mon oncle habite à Lyon.' },
    { fr: 'Tante',      pt: 'Tia',    note: null,                        sentence: 'Ma tante est médecin.' },
  ],
  m5: [
    { fr: 'Lundi',       pt: 'Segunda-feira', note: null,                       sentence: 'Le lundi, je vais à l\'école.' },
    { fr: 'Mardi',       pt: 'Terça-feira',   note: null,                       sentence: 'Mardi, j\'ai rendez-vous chez le médecin.' },
    { fr: 'Mercredi',    pt: 'Quarta-feira',  note: null,                       sentence: 'Le mercredi, les enfants n\'ont pas école.' },
    { fr: 'Jeudi',       pt: 'Quinta-feira',  note: null,                       sentence: 'Jeudi, on se retrouve au café ?' },
    { fr: 'Vendredi',    pt: 'Sexta-feira',   note: null,                       sentence: 'Le vendredi soir, je sors avec mes amis.' },
    { fr: 'Samedi',      pt: 'Sábado',        note: 'Faz parte do week-end',    sentence: 'Samedi, on fait les courses ensemble.' },
    { fr: 'Dimanche',    pt: 'Domingo',       note: 'Faz parte do week-end',    sentence: 'Le dimanche, toute la famille se réunit.' },
    { fr: "Aujourd'hui", pt: 'Hoje',          note: null,                       sentence: 'Aujourd\'hui, il fait très beau !' },
    { fr: 'Demain',      pt: 'Amanhã',        note: null,                       sentence: 'Demain, c\'est mon anniversaire.' },
    { fr: 'Hier',        pt: 'Ontem',         note: null,                       sentence: 'Hier, j\'ai vu un très bon film.' },
  ],
  m6: [
    { fr: 'Pain',    pt: 'Pão',       note: 'O "pain" francês (baguete) é famoso' },
    { fr: 'Eau',     pt: 'Água',      note: null },
    { fr: 'Lait',    pt: 'Leite',     note: null },
    { fr: 'Café',    pt: 'Café',      note: 'Pronuncia-se "kafê"' },
    { fr: 'Pomme',   pt: 'Maçã',      note: null },
    { fr: 'Fromage', pt: 'Queijo',    note: 'A França tem mais de 1.000 tipos!' },
    { fr: 'Vin',     pt: 'Vinho',     note: null },
    { fr: 'Jus',     pt: 'Suco',      note: 'O "s" final é mudo' },
    { fr: 'Beurre',  pt: 'Manteiga',  note: null },
    { fr: 'Œuf',     pt: 'Ovo',       note: 'Pronuncia-se "euf" no singular' },
  ],
  m7: [
    { fr: 'Chat',      pt: 'Gato',      note: 'O "t" final é mudo' },
    { fr: 'Chien',     pt: 'Cachorro',  note: null },
    { fr: 'Oiseau',    pt: 'Pássaro',   note: null },
    { fr: 'Poisson',   pt: 'Peixe',     note: null },
    { fr: 'Cheval',    pt: 'Cavalo',    note: null },
    { fr: 'Vache',     pt: 'Vaca',      note: null },
    { fr: 'Lion',      pt: 'Leão',      note: null },
    { fr: 'Lapin',     pt: 'Coelho',    note: null },
    { fr: 'Éléphant',  pt: 'Elefante',  note: null },
    { fr: 'Serpent',   pt: 'Cobra',     note: null },
  ],
  m8: [
    { fr: 'Tête',    pt: 'Cabeça',  note: null },
    { fr: 'Main',    pt: 'Mão',     note: null },
    { fr: 'Pied',    pt: 'Pé',      note: null },
    { fr: 'Œil',     pt: 'Olho',    note: 'Plural: "les yeux"' },
    { fr: 'Oreille', pt: 'Orelha',  note: null },
    { fr: 'Bouche',  pt: 'Boca',    note: null },
    { fr: 'Nez',     pt: 'Nariz',   note: 'O "z" final é mudo' },
    { fr: 'Bras',    pt: 'Braço',   note: null },
    { fr: 'Jambe',   pt: 'Perna',   note: null },
    { fr: 'Dos',     pt: 'Costas',  note: null },
  ],
  m9: [
    { fr: 'Chemise',    pt: 'Camisa',   note: null },
    { fr: 'Pantalon',   pt: 'Calça',    note: null },
    { fr: 'Robe',       pt: 'Vestido',  note: null },
    { fr: 'Chaussure',  pt: 'Sapato',   note: 'Pronuncia-se "chossür"' },
    { fr: 'Chapeau',    pt: 'Chapéu',   note: null },
    { fr: 'Manteau',    pt: 'Casaco',   note: null },
    { fr: 'Chaussette', pt: 'Meia',     note: null },
    { fr: 'Cravate',    pt: 'Gravata',  note: null },
    { fr: 'Veste',      pt: 'Jaqueta',  note: 'Diferente de "veste" em português!' },
    { fr: 'Short',      pt: 'Bermuda',  note: 'Empréstimo do inglês' },
  ],
  m10: [
    { fr: 'Maison',       pt: 'Casa',          note: null },
    { fr: 'Chambre',      pt: 'Quarto',         note: null },
    { fr: 'Cuisine',      pt: 'Cozinha',        note: null },
    { fr: 'Salle de bain',pt: 'Banheiro',       note: null },
    { fr: 'Salon',        pt: 'Sala de estar',  note: null },
    { fr: 'Porte',        pt: 'Porta',          note: null },
    { fr: 'Fenêtre',      pt: 'Janela',         note: null },
    { fr: 'Table',        pt: 'Mesa',           note: null },
    { fr: 'Chaise',       pt: 'Cadeira',        note: null },
    { fr: 'Lit',          pt: 'Cama',           note: null },
  ],

  // ── Módulos de frases (11–15) ──────────────────

  m11: [
    { fr: 'Je m\'appelle…',              pt: 'Meu nome é…',                   note: 'Verbo s\'appeler — reflexivo' },
    { fr: 'J\'ai vingt ans',             pt: 'Tenho vinte anos',               note: 'Idade usa "avoir" (ter), não "être"' },
    { fr: 'Je suis brésilien',           pt: 'Sou brasileiro',                 note: 'Feminino: brésilienne' },
    { fr: 'Enchanté !',                  pt: 'Prazer em conhecê-lo!',          note: 'Feminino: Enchantée' },
    { fr: 'Comment vous appelez-vous ?', pt: 'Qual é o seu nome?',             note: 'Forma formal; informal: tu t\'appelles comment ?' },
    { fr: 'Quel âge avez-vous ?',        pt: 'Quantos anos você tem?',         note: 'Literal: "Que idade você tem?"' },
    { fr: 'Je parle un peu français',    pt: 'Falo um pouco de francês',       note: 'Un peu = um pouco' },
    { fr: 'J\'habite au Brésil',         pt: 'Moro no Brasil',                 note: 'Habiter = morar' },
    { fr: 'Je suis étudiant',            pt: 'Sou estudante',                  note: 'Feminino: étudiante' },
    { fr: 'Très bien, merci !',          pt: 'Muito bem, obrigado!',           note: 'Très = muito; merci já foi no Módulo 1!' },
  ],

  m12: [
    { fr: 'Je voudrais un café',          pt: 'Eu gostaria de um café',        note: 'Voudrais = condicional de vouloir — mais educado' },
    { fr: 'Avez-vous du pain ?',          pt: 'Vocês têm pão?',                note: 'Du = artigo partitivo masculino' },
    { fr: 'L\'eau, s\'il vous plaît',     pt: 'A água, por favor',             note: 'Combinação com Módulo 1 e Módulo 6' },
    { fr: 'C\'est délicieux !',           pt: 'Está delicioso!',               note: 'C\'est = é/está' },
    { fr: 'L\'addition, s\'il vous plaît',pt: 'A conta, por favor',            note: 'L\'addition = a conta do restaurante' },
    { fr: 'Je veux du fromage',           pt: 'Quero queijo',                  note: 'Je veux = forma direta; voudrais é mais educado' },
    { fr: 'Un verre de vin, s\'il vous plaît', pt: 'Uma taça de vinho, por favor', note: 'Un verre = um copo/taça' },
    { fr: 'Le pain est frais',            pt: 'O pão está fresco',             note: 'Frais = fresco' },
    { fr: 'J\'aime le lait',             pt: 'Gosto de leite',                note: 'Aimer + artigo definido = gostar de algo em geral' },
    { fr: 'Apportez-moi du jus',         pt: 'Traga-me um suco',              note: 'Apporter = trazer; moi = me/a mim' },
  ],

  m13: [
    { fr: 'J\'ai un frère',              pt: 'Tenho um irmão',                note: 'Lembra frère do Módulo 4!' },
    { fr: 'Ma mère est gentille',        pt: 'Minha mãe é gentil',            note: 'Gentille = gentil (feminino)' },
    { fr: 'Mon père travaille',          pt: 'Meu pai trabalha',              note: 'Mon = meu (masculino), Ma = minha (feminino)' },
    { fr: 'J\'aime ma famille',          pt: 'Amo minha família',             note: 'Famille = família' },
    { fr: 'Mon grand-père a soixante ans', pt: 'Meu avô tem sessenta anos',   note: 'Soixante = 60 (além do 1–10 do Módulo 2)' },
    { fr: 'Ma grand-mère est belle',     pt: 'Minha avó é bonita',            note: 'Belle = bonita (feminino de beau)' },
    { fr: 'Mon fils s\'appelle Pedro',   pt: 'Meu filho se chama Pedro',      note: 'S\'appelle = se chama (Módulo 11)' },
    { fr: 'Ma fille est petite',         pt: 'Minha filha é pequena',         note: 'Petite = pequena (feminino de petit)' },
    { fr: 'Mon oncle habite en France',  pt: 'Meu tio mora na França',        note: 'Habiter = morar (Módulo 11); en France = na França' },
    { fr: 'Voici ma tante',             pt: 'Esta é minha tia',              note: 'Voici = aqui está / este(a) é' },
  ],

  m14: [
    { fr: 'La robe est rouge',           pt: 'O vestido é vermelho',          note: 'Adjetivos concordam com o gênero do substantivo' },
    { fr: 'Le chat est noir',            pt: 'O gato é preto',                note: 'Combina Módulo 7 (chat) + Módulo 3 (noir)' },
    { fr: 'Ma chambre est bleue',        pt: 'Meu quarto é azul',             note: 'Bleue = feminino de bleu' },
    { fr: 'Le chien est grand',          pt: 'O cachorro é grande',           note: 'Grand = grande (masculino)' },
    { fr: 'La maison est blanche',       pt: 'A casa é branca',               note: 'Blanche = feminino de blanc' },
    { fr: 'Mon manteau est marron',      pt: 'Meu casaco é marrom',           note: 'Marron é invariável (não muda)' },
    { fr: 'Le cheval est beau',          pt: 'O cavalo é bonito',             note: 'Beau (masc.) / Belle (fem.)' },
    { fr: 'La porte est verte',          pt: 'A porta é verde',               note: 'Verte = feminino de vert' },
    { fr: 'Le pantalon est noir',        pt: 'A calça é preta',               note: 'Combina Módulo 9 (pantalon) + Módulo 3 (noir)' },
    { fr: 'La fenêtre est petite',       pt: 'A janela é pequena',            note: 'Petite = feminino de petit' },
  ],

  m15: [
    { fr: 'Le lundi, je travaille',      pt: 'Na segunda-feira, trabalho',    note: 'Le + dia da semana = todo(a) [dia]' },
    { fr: 'Aujourd\'hui c\'est mercredi', pt: 'Hoje é quarta-feira',          note: 'C\'est = é; aujourd\'hui do Módulo 5' },
    { fr: 'Demain c\'est vendredi',      pt: 'Amanhã é sexta-feira',          note: 'Demain do Módulo 5 + vendredi do Módulo 5' },
    { fr: 'J\'ai mal à la tête',         pt: 'Estou com dor de cabeça',       note: 'Literal: "Tenho dor na cabeça"; tête do Módulo 8' },
    { fr: 'Je lave mes mains',           pt: 'Lavo minhas mãos',              note: 'Mes = meus/minhas (plural); mains do Módulo 8' },
    { fr: 'Le dimanche, ma famille se réunit', pt: 'No domingo, minha família se reúne', note: 'Se réunit = verbo reflexivo no presente' },
    { fr: 'Hier c\'était samedi',        pt: 'Ontem era sábado',              note: 'C\'était = era (passado de c\'est)' },
    { fr: 'Je porte une chemise bleue',  pt: 'Uso uma camisa azul',           note: 'Porter = usar/vestir; chemise do M9 + bleue do M3' },
    { fr: 'Mon chat dort sur le lit',    pt: 'Meu gato dorme na cama',        note: 'Dort = dorme; chat do M7, lit do M10' },
    { fr: 'Je mange du pain le matin',   pt: 'Como pão de manhã',             note: 'Manger = comer; pain do M6; le matin = de manhã' },
  ],

  // ── Intermediário ──────────────────────────────

  m16: [
    { fr: 'Aller',   pt: 'Ir',         note: 'Verbo irregular — je vais, tu vas, il va' },
    { fr: 'Faire',   pt: 'Fazer',       note: 'Muito versátil: faire du sport, faire la cuisine' },
    { fr: 'Être',    pt: 'Ser / Estar', note: 'Verbo mais importante do francês' },
    { fr: 'Avoir',   pt: 'Ter',         note: 'Usado também em expressões de idade e sensações' },
    { fr: 'Vouloir', pt: 'Querer',      note: 'Je veux = quero; je voudrais = gostaria' },
    { fr: 'Pouvoir', pt: 'Poder',       note: 'Je peux = eu posso' },
    { fr: 'Savoir',  pt: 'Saber',       note: 'Diferente de connaître (conhecer uma pessoa)' },
    { fr: 'Venir',   pt: 'Vir',         note: 'Je viens = eu venho' },
    { fr: 'Prendre', pt: 'Pegar / Tomar', note: 'Prendre le bus = pegar o ônibus' },
    { fr: 'Parler',  pt: 'Falar',       note: 'Verbo regular -er: je parle, tu parles' },
  ],

  m17: [
    { fr: 'École',      pt: 'Escola',         note: null },
    { fr: 'Classe',     pt: 'Turma / Sala',   note: null },
    { fr: 'Professeur', pt: 'Professor(a)',   note: null },
    { fr: 'Élève',      pt: 'Aluno(a)',       note: null },
    { fr: 'Livre',      pt: 'Livro',          note: null },
    { fr: 'Cahier',     pt: 'Caderno',        note: null },
    { fr: 'Stylo',      pt: 'Caneta',         note: null },
    { fr: 'Crayon',     pt: 'Lápis',          note: null },
    { fr: 'Sac',        pt: 'Mochila',        note: null },
    { fr: 'Devoir',     pt: 'Dever de casa',  note: 'Plural: les devoirs' },
  ],

  m18: [
    { fr: 'Voiture', pt: 'Carro',       note: null },
    { fr: 'Bus',     pt: 'Ônibus',      note: null },
    { fr: 'Train',   pt: 'Trem',        note: null },
    { fr: 'Avion',   pt: 'Avião',       note: null },
    { fr: 'Vélo',    pt: 'Bicicleta',   note: null },
    { fr: 'Métro',   pt: 'Metrô',       note: null },
    { fr: 'Taxi',    pt: 'Táxi',        note: null },
    { fr: 'Bateau',  pt: 'Barco',       note: null },
    { fr: 'À pied',  pt: 'A pé',        note: 'Aller à pied = ir a pé' },
    { fr: 'Gare',    pt: 'Estação',     note: 'Gare = estação de trem; aéroport = aeroporto' },
  ],

  m19: [
    { fr: 'Printemps',    pt: 'Primavera',    note: null },
    { fr: 'Été',          pt: 'Verão',         note: 'Acento circunflexo: été' },
    { fr: 'Automne',      pt: 'Outono',        note: null },
    { fr: 'Hiver',        pt: 'Inverno',       note: null },
    { fr: 'Soleil',       pt: 'Sol',           note: 'Il fait soleil = está ensolarado' },
    { fr: 'Pluie',        pt: 'Chuva',         note: 'Il pleut = está chovendo' },
    { fr: 'Neige',        pt: 'Neve',          note: 'Il neige = está nevando' },
    { fr: 'Vent',         pt: 'Vento',         note: 'Il fait du vent = está ventando' },
    { fr: 'Nuage',        pt: 'Nuvem',         note: null },
    { fr: 'Température',  pt: 'Temperatura',   note: 'Quelle température fait-il? = Que temperatura está?' },
  ],

  m20: [
    { fr: 'Grand',    pt: 'Grande',    note: 'Feminino: grande' },
    { fr: 'Petit',    pt: 'Pequeno',   note: 'Feminino: petite' },
    { fr: 'Beau',     pt: 'Bonito',    note: 'Feminino: belle' },
    { fr: 'Laid',     pt: 'Feio',      note: 'Feminino: laide' },
    { fr: 'Rapide',   pt: 'Rápido',    note: 'Invariável para fem./masc.' },
    { fr: 'Lent',     pt: 'Lento',     note: 'Feminino: lente' },
    { fr: 'Chaud',    pt: 'Quente',    note: 'Il fait chaud = está quente' },
    { fr: 'Froid',    pt: 'Frio',      note: 'Il fait froid = está frio' },
    { fr: 'Nouveau',  pt: 'Novo',      note: 'Feminino: nouvelle' },
    { fr: 'Vieux',    pt: 'Velho',     note: 'Feminino: vieille' },
  ],

  // ── Intermediário 2 ────────────────────────────

  m21: [
    { fr: 'Travail',     pt: 'Trabalho',    note: null },
    { fr: 'Bureau',      pt: 'Escritório',  note: 'Também pode ser "escrivaninha"' },
    { fr: 'Réunion',     pt: 'Reunião',     note: null },
    { fr: 'Collègue',    pt: 'Colega',      note: null },
    { fr: 'Patron',      pt: 'Chefe',       note: null },
    { fr: 'Salaire',     pt: 'Salário',     note: null },
    { fr: 'Vacances',    pt: 'Férias',      note: 'Sempre no plural em francês' },
    { fr: 'Entreprise',  pt: 'Empresa',     note: null },
    { fr: 'Email',       pt: 'E-mail',      note: 'Também: courriel (forma mais francesa)' },
    { fr: 'Téléphone',   pt: 'Telefone',    note: null },
  ],

  m22: [
    { fr: 'Heureux',   pt: 'Feliz',        note: 'Feminino: heureuse' },
    { fr: 'Triste',    pt: 'Triste',       note: 'Invariável' },
    { fr: 'Fâché',     pt: 'Bravo / Irritado', note: 'Feminino: fâchée' },
    { fr: 'Surpris',   pt: 'Surpreso',     note: 'Feminino: surprise' },
    { fr: 'Peur',      pt: 'Medo',         note: 'J\'ai peur = tenho medo' },
    { fr: 'Amour',     pt: 'Amor',         note: null },
    { fr: 'Joie',      pt: 'Alegria',      note: null },
    { fr: 'Calme',     pt: 'Calmo',        note: 'Invariável para fem./masc.' },
    { fr: 'Fatigué',   pt: 'Cansado',      note: 'Feminino: fatiguée' },
    { fr: 'Inquiet',   pt: 'Preocupado',   note: 'Feminino: inquiète' },
  ],

  m23: [
    { fr: 'Médecin',     pt: 'Médico',      note: null },
    { fr: 'Hôpital',     pt: 'Hospital',    note: null },
    { fr: 'Médicament',  pt: 'Remédio',     note: null },
    { fr: 'Douleur',     pt: 'Dor',         note: 'J\'ai une douleur = estou com dor' },
    { fr: 'Fièvre',      pt: 'Febre',       note: 'J\'ai de la fièvre = estou com febre' },
    { fr: 'Rhume',       pt: 'Resfriado',   note: null },
    { fr: 'Blessure',    pt: 'Ferimento',   note: null },
    { fr: 'Allergie',    pt: 'Alergia',     note: null },
    { fr: 'Santé',       pt: 'Saúde',       note: 'À votre santé! = Saúde! (brinde)' },
    { fr: 'Rendez-vous', pt: 'Consulta',    note: 'Aussi: encontro, reunião marcada' },
  ],

  m24: [
    { fr: 'Film',      pt: 'Filme',      note: null },
    { fr: 'Musique',   pt: 'Música',     note: null },
    { fr: 'Sport',     pt: 'Esporte',    note: 'Faire du sport = praticar esporte' },
    { fr: 'Jeu',       pt: 'Jogo',       note: 'Plural: les jeux' },
    { fr: 'Voyage',    pt: 'Viagem',     note: null },
    { fr: 'Cuisine',   pt: 'Culinária',  note: 'Aussi: cozinha (local)' },
    { fr: 'Dessin',    pt: 'Desenho',    note: null },
    { fr: 'Danse',     pt: 'Dança',      note: null },
    { fr: 'Lecture',   pt: 'Leitura',    note: 'Aimer la lecture = gostar de ler' },
    { fr: 'Jardinage', pt: 'Jardinagem', note: null },
  ],

  m25: [
    { fr: 'Rue',        pt: 'Rua',         note: null },
    { fr: 'Quartier',   pt: 'Bairro',      note: null },
    { fr: 'Place',      pt: 'Praça',       note: 'La place principale = a praça principal' },
    { fr: 'Magasin',    pt: 'Loja',        note: null },
    { fr: 'Pharmacie',  pt: 'Farmácia',    note: null },
    { fr: 'Musée',      pt: 'Museu',       note: null },
    { fr: 'Banque',     pt: 'Banco',       note: null },
    { fr: 'Hôtel',      pt: 'Hotel',       note: null },
    { fr: 'Parc',       pt: 'Parque',      note: null },
    { fr: 'Mairie',     pt: 'Prefeitura',  note: 'Sede do governo municipal' },
  ],

  m30: [
    { fr: 'Onze',      pt: 'Onze',       note: null },
    { fr: 'Douze',     pt: 'Doze',       note: null },
    { fr: 'Treize',    pt: 'Treze',      note: null },
    { fr: 'Quatorze',  pt: 'Catorze',    note: null },
    { fr: 'Quinze',    pt: 'Quinze',     note: null },
    { fr: 'Seize',     pt: 'Dezesseis',  note: null },
    { fr: 'Dix-sept',  pt: 'Dezessete',  note: 'Hífen obrigatório' },
    { fr: 'Dix-huit',  pt: 'Dezoito',    note: null },
    { fr: 'Dix-neuf',  pt: 'Dezenove',   note: null },
    { fr: 'Vingt',     pt: 'Vinte',      note: 'Vingt et un = 21' },
  ],

  m31: [
    { fr: 'Je',     pt: 'Eu',                  note: null },
    { fr: 'Tu',     pt: 'Você (informal)',      note: 'Com amigos e crianças' },
    { fr: 'Il',     pt: 'Ele',                 note: null },
    { fr: 'Elle',   pt: 'Ela',                 note: null },
    { fr: 'Nous',   pt: 'Nós',                 note: null },
    { fr: 'Vous',   pt: 'Vocês / O senhor',    note: 'Plural ou formal singular' },
    { fr: 'Ils',    pt: 'Eles',                note: 'Masculino ou misto' },
    { fr: 'Elles',  pt: 'Elas',                note: 'Só feminino' },
    { fr: 'On',     pt: 'A gente',             note: 'Informal para "nós" na fala cotidiana' },
    { fr: 'Moi',    pt: 'Eu (enfático)',        note: 'Após preposições: "pour moi"' },
  ],

  m32: [
    { fr: 'Médecin',     pt: 'Médico(a)',       note: null },
    { fr: 'Infirmier',   pt: 'Enfermeiro(a)',   note: 'Feminino: infirmière' },
    { fr: 'Professeur',  pt: 'Professor(a)',    note: null },
    { fr: 'Étudiant',    pt: 'Estudante',       note: 'Feminino: étudiante' },
    { fr: 'Cuisinier',   pt: 'Cozinheiro(a)',   note: 'Feminino: cuisinière' },
    { fr: 'Avocat',      pt: 'Advogado(a)',      note: 'Feminino: avocate' },
    { fr: 'Ingénieur',   pt: 'Engenheiro(a)',   note: null },
    { fr: 'Acteur',      pt: 'Ator / Atriz',    note: 'Feminino: actrice' },
    { fr: 'Journaliste', pt: 'Jornalista',      note: 'Invariável' },
    { fr: 'Pompier',     pt: 'Bombeiro',        note: null },
  ],

  m26: [
    { fr: 'Janvier',   pt: 'Janeiro',   note: null },
    { fr: 'Février',   pt: 'Fevereiro', note: null },
    { fr: 'Mars',      pt: 'Março',     note: null },
    { fr: 'Avril',     pt: 'Abril',     note: null },
    { fr: 'Mai',       pt: 'Maio',      note: null },
    { fr: 'Juin',      pt: 'Junho',     note: null },
    { fr: 'Juillet',   pt: 'Julho',     note: 'Pronuncia-se "juiê"' },
    { fr: 'Août',      pt: 'Agosto',    note: 'O "t" final é pronunciado' },
    { fr: 'Septembre', pt: 'Setembro',  note: null },
    { fr: 'Octobre',   pt: 'Outubro',   note: null },
    { fr: 'Novembre',  pt: 'Novembro',  note: null },
    { fr: 'Décembre',  pt: 'Dezembro',  note: null },
  ],

  m27: [
    { fr: 'Je ne sais pas',         pt: 'Eu não sei',              note: 'ne...pas = negação básica' },
    { fr: 'Il ne mange pas',        pt: 'Ele não come',            note: null },
    { fr: "Je n'aime pas ça",       pt: 'Eu não gosto disso',      note: "n' antes de vogal" },
    { fr: 'Je ne comprends pas',    pt: 'Eu não entendo',          note: null },
    { fr: 'Je ne veux pas',         pt: 'Eu não quero',            note: null },
    { fr: "Il n'y a pas de pain",   pt: 'Não tem pão',             note: "Il n'y a pas = não há" },
    { fr: 'Je ne fais jamais ça',   pt: 'Eu nunca faço isso',      note: 'ne...jamais = nunca' },
    { fr: "Je n'ai plus faim",      pt: 'Não estou mais com fome', note: 'ne...plus = não mais' },
    { fr: 'Je ne vois rien',        pt: 'Não vejo nada',           note: 'ne...rien = nada' },
    { fr: "Ce n'est pas possible",  pt: 'Não é possível',          note: null },
  ],

  m28: [
    { fr: "J'ai mangé",                pt: 'Eu comi',              note: 'avoir + particípio passado' },
    { fr: 'Il a parlé',                pt: 'Ele falou',            note: null },
    { fr: 'Elle est arrivée',          pt: 'Ela chegou',           note: 'verbos de movimento usam être' },
    { fr: "J'ai vu un film",           pt: 'Eu vi um filme',       note: null },
    { fr: 'Nous avons mangé',          pt: 'Nós comemos',          note: null },
    { fr: 'Tu as dormi ?',             pt: 'Você dormiu?',         note: null },
    { fr: "J'ai pris le bus",          pt: 'Eu peguei o ônibus',   note: 'prendre → pris (irregular)' },
    { fr: 'Il a fait du sport',        pt: 'Ele fez esporte',      note: 'faire → fait (irregular)' },
    { fr: "Je suis allé(e) au marché", pt: 'Eu fui ao mercado',    note: 'aller → allé, usa être' },
    { fr: 'Nous sommes partis',        pt: 'Nós partimos',         note: 'partir → parti, usa être' },
  ],

  m29: [
    { fr: 'Je me lève',           pt: 'Eu me levanto',        note: 'se lever = levantar-se' },
    { fr: 'Je me couche',         pt: 'Eu me deito',          note: 'se coucher = deitar-se' },
    { fr: 'Je me lave',           pt: 'Eu me lavo',           note: 'se laver = lavar-se' },
    { fr: "Il s'appelle Pierre",  pt: 'Ele se chama Pierre',  note: "s' antes de vogal" },
    { fr: "Je m'habille",         pt: 'Eu me visto',          note: "s'habiller = vestir-se" },
    { fr: 'Elle se coiffe',       pt: 'Ela se penteia',       note: 'se coiffer = pentear-se' },
    { fr: 'Nous nous réveillons', pt: 'Nós acordamos',        note: 'se réveiller = acordar-se' },
    { fr: 'Tu te dépêches',       pt: 'Você se apressa',      note: 'se dépêcher = apressar-se' },
    { fr: 'Je me promène',        pt: 'Eu passeio',           note: 'se promener = passear' },
    { fr: 'Il se repose',         pt: 'Ele descansa',         note: 'se reposer = descansar' },
  ],

  // ── Intermediário 3 ────────────────────────────────────────────────────────

  m33: [
    { fr: 'Je vais manger',          pt: 'Eu vou comer',          note: 'aller + infinitivo = futuro próximo' },
    { fr: 'Tu vas partir',           pt: 'Você vai partir',       note: null },
    { fr: 'Il va venir demain',      pt: 'Ele vai vir amanhã',    note: null },
    { fr: 'Nous allons voyager',     pt: 'Nós vamos viajar',      note: null },
    { fr: 'Vous allez étudier',      pt: 'Vocês vão estudar',     note: null },
    { fr: 'Ils vont arriver',        pt: 'Eles vão chegar',       note: null },
    { fr: 'Je vais me coucher',      pt: 'Eu vou me deitar',      note: 'futuro + reflexivo' },
    { fr: 'Elle va se marier',       pt: 'Ela vai se casar',      note: null },
    { fr: 'On va sortir ce soir',    pt: 'A gente vai sair hoje', note: null },
    { fr: 'Je ne vais pas manger',   pt: 'Eu não vou comer',      note: 'ne...pas envolve o verbo aller' },
  ],

  m34: [
    { fr: 'Mange !',           pt: 'Come!',               note: 'Imperativo tu — sem "s" final' },
    { fr: 'Parle !',           pt: 'Fala!',               note: null },
    { fr: 'Écoute !',          pt: 'Escuta!',             note: null },
    { fr: 'Viens ici !',       pt: 'Vem aqui!',           note: 'venir → viens (irregular)' },
    { fr: 'Allez-y !',         pt: 'Vá em frente!',       note: 'Imperativo vous com hífen' },
    { fr: 'Asseyez-vous !',    pt: 'Sentem-se!',          note: 'asseoir (reflexivo) imperativo' },
    { fr: 'Ne parle pas !',    pt: 'Não fale!',           note: 'ne...pas no imperativo negativo' },
    { fr: 'Soyez prudent !',   pt: 'Seja cuidadoso!',     note: 'être → soyez (irregular)' },
    { fr: 'Allons-y !',        pt: 'Vamos!',              note: 'Imperativo nous — convite' },
    { fr: 'Fais attention !',  pt: 'Presta atenção!',     note: 'faire → fais (irregular)' },
  ],

  m35: [
    { fr: 'Plus grand que',    pt: 'Maior que',           note: 'plus + adjetivo + que' },
    { fr: 'Moins cher que',    pt: 'Mais barato que',     note: 'moins + adjetivo + que' },
    { fr: 'Aussi rapide que',  pt: 'Tão rápido quanto',   note: 'aussi + adjetivo + que' },
    { fr: 'Le plus beau',      pt: 'O mais bonito',       note: 'le/la/les + plus + adjetivo' },
    { fr: 'La meilleure',      pt: 'A melhor',            note: 'bon → meilleur (irregular)' },
    { fr: 'Pire que',          pt: 'Pior que',            note: 'mauvais → pire (irregular)' },
    { fr: 'Plus de travail',   pt: 'Mais trabalho',       note: 'plus de + substantivo' },
    { fr: 'Moins de temps',    pt: 'Menos tempo',         note: 'moins de + substantivo' },
    { fr: 'Autant que',        pt: 'Tanto quanto',        note: null },
    { fr: 'Le moins cher',     pt: 'O mais barato',       note: 'superlativo com moins' },
  ],

  m36: [
    { fr: 'Sur',           pt: 'Sobre / Em cima de',  note: null },
    { fr: 'Sous',          pt: 'Embaixo de',           note: null },
    { fr: 'Dans',          pt: 'Dentro de',            note: null },
    { fr: 'Devant',        pt: 'Na frente de',         note: null },
    { fr: 'Derrière',      pt: 'Atrás de',             note: null },
    { fr: 'À côté de',     pt: 'Ao lado de',           note: null },
    { fr: 'Entre',         pt: 'Entre',                note: null },
    { fr: 'Loin de',       pt: 'Longe de',             note: null },
    { fr: 'Près de',       pt: 'Perto de',             note: null },
    { fr: 'En face de',    pt: 'Em frente a',          note: null },
  ],

  m37: [
    { fr: 'Beaucoup de',   pt: 'Muito(a/s)',            note: 'Não muda com gênero/número' },
    { fr: 'Peu de',        pt: 'Pouco(a/s)',            note: null },
    { fr: 'Assez de',      pt: 'Bastante / Suficiente', note: null },
    { fr: 'Trop de',       pt: 'Demais / Em excesso',   note: null },
    { fr: 'Combien de',    pt: 'Quantos / Quantas',     note: null },
    { fr: 'Quelques',      pt: 'Alguns / Algumas',      note: null },
    { fr: 'Plusieurs',     pt: 'Vários / Várias',       note: null },
    { fr: 'Tout',          pt: 'Todo / Tudo',           note: 'Feminino: toute; plural: tous/toutes' },
    { fr: 'Chaque',        pt: 'Cada',                  note: 'Invariável' },
    { fr: 'Aucun(e)',      pt: 'Nenhum / Nenhuma',      note: 'Sempre com ne: il n\'y a aucun' },
  ],

  m38: [
    { fr: 'Je voudrais',         pt: 'Eu gostaria',           note: 'vouloir — condicional' },
    { fr: "J'aimerais",          pt: 'Eu adoraria',           note: 'aimer — condicional' },
    { fr: 'Je pourrais',         pt: 'Eu poderia',            note: 'pouvoir — condicional' },
    { fr: 'Il faudrait',         pt: 'Seria necessário',      note: 'falloir — impessoal' },
    { fr: 'Ce serait bien',      pt: 'Seria bom',             note: 'être — condicional' },
    { fr: "J'irais",             pt: 'Eu iria',               note: 'aller — condicional' },
    { fr: 'Tu devrais',          pt: 'Você deveria',          note: 'devoir — condicional (conselho)' },
    { fr: 'Nous pourrions',      pt: 'Nós poderíamos',        note: null },
    { fr: 'Ce serait parfait',   pt: 'Seria perfeito',        note: null },
    { fr: "J'aurais besoin de",  pt: 'Eu precisaria de',      note: 'avoir besoin de — condicional' },
  ],

  // ── Intermediário 4 ────────────────────────────────────────────────────────

  m39: [
    { fr: 'Téléphone portable',  pt: 'Celular',              note: null },
    { fr: 'Ordinateur',          pt: 'Computador',           note: null },
    { fr: 'Application',         pt: 'Aplicativo',           note: null },
    { fr: 'Message',             pt: 'Mensagem',             note: null },
    { fr: 'Réseau social',       pt: 'Rede social',          note: null },
    { fr: 'Mot de passe',        pt: 'Senha',                note: 'Literal: "palavra de passe"' },
    { fr: 'Télécharger',         pt: 'Baixar / Descarregar', note: null },
    { fr: 'Envoyer',             pt: 'Enviar',               note: null },
    { fr: 'Rechercher',          pt: 'Pesquisar',            note: null },
    { fr: 'Se connecter',        pt: 'Conectar-se / Fazer login', note: null },
  ],

  m40: [
    { fr: 'Argent',              pt: 'Dinheiro',             note: null },
    { fr: 'Prix',                pt: 'Preço',                note: null },
    { fr: 'Facture',             pt: 'Nota fiscal / Conta',  note: null },
    { fr: 'Carte de crédit',     pt: 'Cartão de crédito',    note: null },
    { fr: 'Monnaie',             pt: 'Troco / Moeda',        note: null },
    { fr: 'Soldes',              pt: 'Liquidação',           note: 'Sempre plural em francês' },
    { fr: 'Réduction',           pt: 'Desconto',             note: null },
    { fr: 'Dépenser',            pt: 'Gastar',               note: null },
    { fr: 'Économiser',          pt: 'Economizar',           note: null },
    { fr: 'Acheter',             pt: 'Comprar',              note: null },
  ],

  m41: [
    { fr: 'Passeport',           pt: 'Passaporte',           note: null },
    { fr: 'Valise',              pt: 'Mala',                 note: null },
    { fr: 'Réservation',         pt: 'Reserva',              note: null },
    { fr: 'Vol',                 pt: 'Voo',                  note: 'Também significa "roubo"' },
    { fr: 'Billet',              pt: 'Passagem / Bilhete',   note: null },
    { fr: 'Guide touristique',   pt: 'Guia turístico',       note: null },
    { fr: 'Carte',               pt: 'Mapa / Cartão',        note: null },
    { fr: 'Frontière',           pt: 'Fronteira',            note: null },
    { fr: 'Douane',              pt: 'Alfândega',            note: null },
    { fr: 'Office de tourisme',  pt: 'Centro de turismo',    note: null },
  ],

  m42: [
    { fr: 'Forêt',               pt: 'Floresta',             note: null },
    { fr: 'Montagne',            pt: 'Montanha',             note: null },
    { fr: 'Rivière',             pt: 'Rio',                  note: 'Fleuve = rio que desemboca no mar' },
    { fr: 'Mer',                 pt: 'Mar',                  note: null },
    { fr: 'Plage',               pt: 'Praia',                note: null },
    { fr: 'Arbre',               pt: 'Árvore',               note: null },
    { fr: 'Fleur',               pt: 'Flor',                 note: null },
    { fr: 'Environnement',       pt: 'Meio ambiente',        note: null },
    { fr: 'Pollution',           pt: 'Poluição',             note: null },
    { fr: 'Recyclage',           pt: 'Reciclagem',           note: 'Recycler = reciclar' },
  ],

  m43: [
    { fr: 'Nager',               pt: 'Nadar',                note: null },
    { fr: 'Courir',              pt: 'Correr',               note: null },
    { fr: 'Jouer au football',   pt: 'Jogar futebol',        note: 'jouer à + esporte' },
    { fr: 'Faire du vélo',       pt: 'Andar de bicicleta',   note: 'faire de + atividade' },
    { fr: 'Faire de la gym',     pt: 'Fazer academia',       note: null },
    { fr: "S'étirer",            pt: 'Alongar-se',           note: null },
    { fr: 'Être en forme',       pt: 'Estar em forma',       note: null },
    { fr: 'Perdre du poids',     pt: 'Perder peso',          note: null },
    { fr: 'Se reposer',          pt: 'Descansar',            note: null },
    { fr: 'Rester actif',        pt: 'Manter-se ativo',      note: null },
  ],

  m44: [
    { fr: 'Je pense que',        pt: 'Eu acho que',          note: 'penser que + indicativo' },
    { fr: 'Je crois que',        pt: 'Eu acredito que',      note: null },
    { fr: 'À mon avis',          pt: 'Na minha opinião',     note: null },
    { fr: 'Je suis d\'accord',   pt: 'Concordo',             note: null },
    { fr: 'Je ne suis pas d\'accord', pt: 'Discordo',        note: null },
    { fr: 'C\'est important',    pt: 'É importante',         note: null },
    { fr: 'Ça dépend',           pt: 'Depende',              note: null },
    { fr: 'Selon moi',           pt: 'Segundo minha opinião', note: null },
    { fr: 'Malheureusement',     pt: 'Infelizmente',         note: null },
    { fr: 'Heureusement',        pt: 'Felizmente',           note: null },
  ],

  // ── Avançado ───────────────────────────────────────────────────────────────

  m45: [
    { fr: 'Je mangeais',                pt: 'Eu comia',                  note: 'Imparfait — hábito ou descrição no passado' },
    { fr: 'Il faisait beau',            pt: 'Estava bonito (o tempo)',   note: 'Clima sempre no imparfait' },
    { fr: 'Quand j\'étais enfant',      pt: 'Quando eu era criança',     note: 'Situação duradoura no passado' },
    { fr: 'Elle lisait souvent',        pt: 'Ela lia frequentemente',    note: 'Ação repetida = imparfait' },
    { fr: 'Nous habitions à Paris',     pt: 'Morávamos em Paris',        note: null },
    { fr: 'Tu dormais encore',          pt: 'Você ainda dormia',         note: null },
    { fr: 'Ils jouaient ensemble',      pt: 'Eles brincavam juntos',     note: null },
    { fr: 'Je pensais à toi',           pt: 'Eu pensava em você',        note: null },
    { fr: 'C\'était magnifique',        pt: 'Era magnífico',             note: 'être no imparfait: j\'étais, c\'était' },
    { fr: 'Il pleuvait beaucoup',       pt: 'Chovia muito',              note: null },
  ],

  m46: [
    { fr: 'Il faut que je parte',       pt: 'É preciso que eu parta',    note: 'falloir que → sempre subjonctif' },
    { fr: 'Je veux que tu viennes',     pt: 'Quero que você venha',      note: 'vouloir que → subjonctif' },
    { fr: 'Bien que ce soit difficile', pt: 'Embora seja difícil',       note: 'bien que → sempre subjonctif' },
    { fr: 'Pour que tu comprennes',     pt: 'Para que você entenda',     note: 'pour que → subjonctif' },
    { fr: 'Je doute qu\'il soit là',    pt: 'Duvido que ele esteja lá',  note: 'douter que → subjonctif' },
    { fr: 'Je suis content que tu sois là', pt: 'Estou feliz que você esteja aqui', note: 'emoção + que → subjonctif' },
    { fr: 'À moins qu\'il ne pleuve',   pt: 'A menos que chova',         note: 'à moins que → subjonctif' },
    { fr: 'Je regrette que tu partes',  pt: 'Lamento que você parta',    note: null },
    { fr: 'Il est important qu\'on fasse attention', pt: 'É importante que prestemos atenção', note: null },
    { fr: 'C\'est dommage qu\'il ne puisse pas', pt: 'É uma pena que ele não possa', note: 'pouvoir → puisse (irregular)' },
  ],

  m47: [
    { fr: 'Il dit qu\'il est fatigué',         pt: 'Ele diz que está cansado',        note: 'presente → presente no discurso indireto' },
    { fr: 'Elle a dit qu\'elle viendrait',     pt: 'Ela disse que viria',             note: 'presente → condicional no passado' },
    { fr: 'Il m\'a demandé si j\'aimais',      pt: 'Ele me perguntou se eu gostava', note: 'si transforma em imparfait' },
    { fr: 'Je lui ai dit de partir',           pt: 'Eu disse a ele para partir',      note: 'imperativo → de + infinitivo' },
    { fr: 'Il a demandé ce que je faisais',    pt: 'Ele perguntou o que eu fazia',    note: 'qu\'est-ce que → ce que' },
    { fr: 'Elle a expliqué qu\'elle ne savait pas', pt: 'Ela explicou que não sabia', note: null },
    { fr: 'Il a annoncé qu\'il démissionnait', pt: 'Ele anunciou que iria demitir',   note: null },
    { fr: 'Elle m\'a demandé où j\'habitais',  pt: 'Ela me perguntou onde eu morava', note: 'où se mantém no indireto' },
    { fr: 'Il a répondu qu\'il n\'était pas sûr', pt: 'Ele respondeu que não tinha certeza', note: null },
    { fr: 'Je lui ai dit que j\'avais faim',   pt: 'Eu disse que estava com fome',    note: 'j\'ai faim → j\'avais faim' },
  ],

  m48: [
    { fr: 'J\'avais mangé',                    pt: 'Eu tinha comido',             note: 'avoir/être imparfait + particípio' },
    { fr: 'Elle était déjà partie',            pt: 'Ela já tinha partido',        note: 'être + parti(e) — verbo de movimento' },
    { fr: 'Il avait déjà fini',                pt: 'Ele já tinha terminado',      note: null },
    { fr: 'Nous avions oublié',                pt: 'Tínhamos esquecido',          note: null },
    { fr: 'Tu avais dit que…',                 pt: 'Você tinha dito que…',        note: null },
    { fr: 'Ils étaient arrivés avant moi',     pt: 'Eles tinham chegado antes de mim', note: null },
    { fr: 'Elle avait préparé le repas',       pt: 'Ela tinha preparado a refeição', note: null },
    { fr: 'Je n\'avais pas compris',           pt: 'Eu não tinha entendido',      note: null },
    { fr: 'Il avait vécu à Paris',             pt: 'Ele havia vivido em Paris',   note: 'vivre → vécu' },
    { fr: 'Quand je suis arrivé, il était déjà parti', pt: 'Quando cheguei, ele já tinha ido', note: 'uso clássico do plus-que-parfait' },
  ],

  m49: [
    { fr: 'Cependant',              pt: 'Contudo / Porém',              note: 'adversativo formal' },
    { fr: 'Néanmoins',              pt: 'Todavia / No entanto',         note: 'mais forte que "mais"' },
    { fr: 'Par conséquent',         pt: 'Por conseguinte / Portanto',   note: 'conclusão lógica' },
    { fr: 'En revanche',            pt: 'Em contrapartida',             note: null },
    { fr: 'Puisque',                pt: 'Já que / Uma vez que',         note: 'causa evidente' },
    { fr: 'Afin de',                pt: 'A fim de / Para',              note: 'finalidade + infinitivo' },
    { fr: 'Bien que',               pt: 'Embora',                       note: 'concessão + subjonctif' },
    { fr: 'En outre',               pt: 'Além disso / Ademais',         note: 'adição formal' },
    { fr: 'D\'une part… d\'autre part', pt: 'Por um lado… por outro',  note: 'estrutura de dissertação' },
    { fr: 'À condition que',        pt: 'Desde que / Contanto que',     note: 'condição + subjonctif' },
  ],

  m50: [
    { fr: 'Avoir le cafard',        pt: 'Estar deprimido / Na fossa',   note: 'lit: ter a barata' },
    { fr: 'Il pleut des cordes',    pt: 'Está chovendo muito',          note: 'lit: chove cordas' },
    { fr: 'Poser un lapin',         pt: 'Dar um bolo / Não aparecer',   note: 'lit: colocar um coelho' },
    { fr: 'Casser les pieds',       pt: 'Chatear / Irritar',            note: 'lit: quebrar os pés' },
    { fr: 'Avoir d\'autres chats à fouetter', pt: 'Ter coisas mais urgentes', note: 'lit: ter outros gatos para chicotear' },
    { fr: 'Mettre les pieds dans le plat', pt: 'Meter os pés pelas mãos', note: 'lit: colocar os pés no prato' },
    { fr: 'Donner sa langue au chat', pt: 'Desistir de adivinhar',      note: 'lit: dar a língua ao gato' },
    { fr: 'Casser la croûte',       pt: 'Comer algo rápido',            note: 'lit: quebrar a casca' },
    { fr: 'Avoir le bras long',     pt: 'Ter influência / Ser poderoso', note: 'lit: ter o braço comprido' },
    { fr: 'Prendre la poudre d\'escampette', pt: 'Fugir / Sumir',      note: 'lit: tomar o pó da fuga' },
  ],

  // ── Avançado 2 ─────────────────────────────────────────────────────────────

  m51: [
    { fr: 'Candidature',            pt: 'Candidatura',                  note: null },
    { fr: 'Entretien d\'embauche',  pt: 'Entrevista de emprego',        note: null },
    { fr: 'Contrat',                pt: 'Contrato',                     note: null },
    { fr: 'Prime',                  pt: 'Bônus / Gratificação',         note: null },
    { fr: 'Licenciement',           pt: 'Demissão',                     note: 'Démission = pedido de demissão' },
    { fr: 'Promotion',              pt: 'Promoção',                     note: null },
    { fr: 'Formation',              pt: 'Treinamento / Formação',       note: null },
    { fr: 'Délai',                  pt: 'Prazo',                        note: null },
    { fr: 'Bilan',                  pt: 'Balanço / Relatório',          note: null },
    { fr: 'Négociation',            pt: 'Negociação',                   note: null },
  ],

  m52: [
    { fr: 'Gouvernement',           pt: 'Governo',                      note: null },
    { fr: 'Élection',               pt: 'Eleição',                      note: null },
    { fr: 'Démocratie',             pt: 'Democracia',                   note: null },
    { fr: 'Citoyen',                pt: 'Cidadão',                      note: 'Feminino: citoyenne' },
    { fr: 'Loi',                    pt: 'Lei',                          note: null },
    { fr: 'Droits',                 pt: 'Direitos',                     note: 'Droit (singular) = direito / direção' },
    { fr: 'Égalité',                pt: 'Igualdade',                    note: 'Devise da França: Liberté, Égalité, Fraternité' },
    { fr: 'Liberté',                pt: 'Liberdade',                    note: null },
    { fr: 'Immigration',            pt: 'Imigração',                    note: null },
    { fr: 'Manifestation',          pt: 'Manifestação / Protesto',      note: 'Familiar: "manif"' },
  ],

  m53: [
    { fr: 'Tableau',                pt: 'Quadro / Pintura',             note: null },
    { fr: 'Sculpture',              pt: 'Escultura',                    note: null },
    { fr: 'Exposition',             pt: 'Exposição',                    note: null },
    { fr: 'Chef-d\'œuvre',          pt: 'Obra-prima',                   note: 'Plural: chefs-d\'œuvre' },
    { fr: 'Patrimoine',             pt: 'Patrimônio',                   note: null },
    { fr: 'Littérature',            pt: 'Literatura',                   note: null },
    { fr: 'Poésie',                 pt: 'Poesia',                       note: null },
    { fr: 'Spectacle',              pt: 'Espetáculo',                   note: null },
    { fr: 'Galerie',                pt: 'Galeria',                      note: null },
    { fr: 'Critique',               pt: 'Crítica / Crítico',            note: null },
  ],

  m54: [
    { fr: 'Il convient de',         pt: 'Convém / É adequado',          note: 'formal — convenir de + infinitivo' },
    { fr: 'Suite à',                pt: 'Em decorrência de / Após',     note: 'formal' },
    { fr: 'Dans le cadre de',       pt: 'No âmbito de',                 note: null },
    { fr: 'À cet égard',            pt: 'A esse respeito',              note: null },
    { fr: 'En ce qui concerne',     pt: 'No que diz respeito a',        note: null },
    { fr: 'Il s\'avère que',        pt: 'Verifica-se que / Resulta que', note: null },
    { fr: 'Compte tenu de',         pt: 'Levando em conta',             note: null },
    { fr: 'Ainsi',                  pt: 'Assim / Dessa forma',          note: 'conectivo conclusivo formal' },
    { fr: 'Toutefois',              pt: 'Contudo / Entretanto',         note: 'adversativo formal' },
    { fr: 'En définitive',          pt: 'Em definitivo / No final',     note: null },
  ],

  m55: [
    { fr: 'Le bœuf bourguignon',    pt: 'Boeuf bourguignon',            note: 'Ensopado de carne com vinho tinto' },
    { fr: 'La quiche lorraine',     pt: 'Quiche lorraine',              note: 'Torta salgada com bacon e nata' },
    { fr: 'Le croissant',           pt: 'Croissant',                    note: 'Símbolo da padaria francesa' },
    { fr: 'La crêpe',               pt: 'Crepe',                        note: 'Doce ou salgada — Bretanha' },
    { fr: 'Le coq au vin',          pt: 'Frango ao vinho',              note: 'Prato tradicional francês' },
    { fr: 'La baguette',            pt: 'Baguete',                      note: 'Pão francês típico — 250g, 65cm' },
    { fr: 'La soupe à l\'oignon',   pt: 'Sopa de cebola',              note: 'Prato clássico da culinária francesa' },
    { fr: 'Le foie gras',           pt: 'Foie gras',                    note: 'Fígado de pato ou ganso — iguaria' },
    { fr: 'La ratatouille',         pt: 'Ratatouille',                  note: 'Ensopado de legumes da Provence' },
    { fr: 'Le macaron',             pt: 'Macaron',                      note: 'Biscoito de amêndoa — não confundir com macaroon' },
  ],

  m56: [
    { fr: 'Qui ne risque rien n\'a rien',   pt: 'Quem não arrisca, não petisca',   note: 'Provérbio — coragem recompensada' },
    { fr: 'Mieux vaut tard que jamais',     pt: 'Antes tarde do que nunca',        note: null },
    { fr: 'Les absents ont toujours tort',  pt: 'Os ausentes estão sempre errados', note: 'Quem não está não se defende' },
    { fr: 'Vouloir c\'est pouvoir',         pt: 'Querer é poder',                  note: null },
    { fr: 'Après la pluie, le beau temps',  pt: 'Depois da tempestade, a bonança', note: null },
    { fr: 'Chacun voit midi à sa porte',    pt: 'Cada um cuida do seu',            note: 'lit: cada um vê o meio-dia à sua porta' },
    { fr: 'Nul n\'est prophète en son pays', pt: 'Ninguém é profeta em sua terra', note: null },
    { fr: 'Il ne faut pas vendre la peau de l\'ours avant de l\'avoir tué', pt: 'Não venda a pele do urso antes de matá-lo', note: 'Equivale a "não conte com o ovo antes de botar"' },
    { fr: 'Les chiens aboient, la caravane passe', pt: 'Os cães ladram, a caravana passa', note: 'Indiferença às críticas' },
    { fr: 'Petit à petit, l\'oiseau fait son nid', pt: 'Devagar se vai ao longe',  note: 'lit: pouco a pouco o pássaro faz seu ninho' },
  ],

  // ── Avançado 3 ─────────────────────────────────────────────────────────────

  m57: [
    { fr: 'Bien qu\'il ait réussi',              pt: 'Embora ele tenha conseguido',     note: 'subjonctif passé = avoir/être subjonctif + particípio' },
    { fr: 'Je suis contente qu\'elle soit venue', pt: 'Estou feliz que ela tenha vindo', note: 'être ao subjonctif: je sois, tu sois, il soit' },
    { fr: 'Il est dommage que tu n\'aies pas mangé', pt: 'É uma pena que você não tenha comido', note: null },
    { fr: 'Je doute qu\'elle ait compris',        pt: 'Duvido que ela tenha entendido',  note: null },
    { fr: 'Bien que nous ayons essayé',           pt: 'Embora tenhamos tentado',         note: null },
    { fr: 'À moins qu\'il ne soit parti',         pt: 'A menos que ele tenha partido',   note: null },
    { fr: 'Quoiqu\'il ait dit',                   pt: 'Apesar do que ele tenha dito',    note: 'quoique = quoi que = embora' },
    { fr: 'Je suis surpris qu\'il soit arrivé en avance', pt: 'Estou surpreso que ele tenha chegado cedo', note: null },
    { fr: 'Il est bizarre qu\'elle ait menti',    pt: 'É estranho que ela tenha mentido', note: null },
    { fr: 'Pour qu\'il ait pu réussir',           pt: 'Para que ele tenha conseguido',   note: 'pouvoir → puisse (pres.) / ait pu (passé)' },
  ],

  m58: [
    { fr: 'Le livre a été écrit par l\'auteur',   pt: 'O livro foi escrito pelo autor',  note: 'passiva = être conjugado + particípio passado' },
    { fr: 'La maison est construite',             pt: 'A casa está sendo construída',    note: 'passiva no presente' },
    { fr: 'Le rapport sera présenté demain',      pt: 'O relatório será apresentado amanhã', note: 'passiva no futuro' },
    { fr: 'La décision a été prise hier',         pt: 'A decisão foi tomada ontem',      note: null },
    { fr: 'Les résultats sont publiés',           pt: 'Os resultados são publicados',    note: null },
    { fr: 'Le projet avait été approuvé',         pt: 'O projeto havia sido aprovado',   note: 'passiva no plus-que-parfait' },
    { fr: 'La réunion a été annulée',             pt: 'A reunião foi cancelada',         note: null },
    { fr: 'Les portes seront ouvertes à 9h',      pt: 'As portas serão abertas às 9h',  note: null },
    { fr: 'Le voleur a été arrêté',               pt: 'O ladrão foi preso',             note: null },
    { fr: 'Ce film est très regardé',             pt: 'Este filme é muito assistido',    note: null },
  ],

  m59: [
    { fr: 'En mangeant',                          pt: 'Enquanto come / Comendo',         note: 'gérondif = en + participe présent' },
    { fr: 'En travaillant',                       pt: 'Trabalhando / Ao trabalhar',      note: null },
    { fr: 'En marchant, il réfléchit',            pt: 'Caminhando, ele reflete',         note: 'ação simultânea' },
    { fr: 'Tout en parlant',                      pt: 'Mesmo falando',                   note: 'tout en = concessão ou simultaneidade' },
    { fr: 'En ayant de la patience',              pt: 'Tendo paciência',                 note: null },
    { fr: 'En arrivant à l\'heure',               pt: 'Chegando no horário',             note: null },
    { fr: 'En faisant attention',                 pt: 'Prestando atenção',               note: null },
    { fr: 'En étudiant chaque jour',              pt: 'Estudando todos os dias',         note: null },
    { fr: 'C\'est en forgeant qu\'on devient forgeron', pt: 'É praticando que se aprende', note: 'provérbio clássico com gérondif' },
    { fr: 'Un homme souriant',                    pt: 'Um homem sorridente',             note: 'participe présent como adjetivo (invariável)' },
  ],

  m60: [
    { fr: 'Si j\'avais su, je ne serais pas venu', pt: 'Se eu soubesse, não teria vindo', note: 'si + plus-que-parfait → condicionnal passé' },
    { fr: 'Si elle était là, je lui parlerais',   pt: 'Se ela estivesse aqui, eu falaria', note: 'si + imparfait → conditionnel présent' },
    { fr: 'Si tu avais travaillé, tu aurais réussi', pt: 'Se tivesse trabalhado, teria conseguido', note: null },
    { fr: 'Si j\'étais riche, je voyagerais',     pt: 'Se eu fosse rico, viajaria',       note: null },
    { fr: 'Si nous avions le temps, nous viendrions', pt: 'Se tivéssemos tempo, viraríamos', note: null },
    { fr: 'Si seulement je pouvais',              pt: 'Se ao menos eu pudesse',           note: 'si seulement = lamento' },
    { fr: 'Au cas où il viendrait',               pt: 'Caso ele venha',                  note: 'au cas où + conditionnel' },
    { fr: 'Si c\'était possible, je le ferais',   pt: 'Se fosse possível, eu faria',     note: null },
    { fr: 'Si j\'avais de l\'argent, j\'achèterais', pt: 'Se eu tivesse dinheiro, compraria', note: null },
    { fr: 'Si tu m\'avais écouté',                pt: 'Se você tivesse me escutado',     note: null },
  ],

  m61: [
    { fr: 'C\'est pourquoi',        pt: 'É por isso que / Por conseguinte', note: 'causa → consequência' },
    { fr: 'Car',                    pt: 'Pois / Porque',                    note: 'formal; usado após a consequência' },
    { fr: 'En effet',               pt: 'Com efeito / De fato',             note: 'confirma o que foi dito' },
    { fr: 'À cause de',             pt: 'Por causa de',                     note: 'causa negativa' },
    { fr: 'Grâce à',                pt: 'Graças a',                         note: 'causa positiva' },
    { fr: 'Donc',                   pt: 'Então / Portanto',                 note: 'conclusão lógica' },
    { fr: 'Si bien que',            pt: 'De modo que / Tanto que',          note: 'consequência intensificada' },
    { fr: 'C\'est la raison pour laquelle', pt: 'É a razão pela qual',      note: 'formal' },
    { fr: 'Étant donné que',        pt: 'Dado que / Uma vez que',           note: null },
    { fr: 'Il en résulte que',      pt: 'Resulta que / Disso resulta que',  note: 'formal/científico' },
  ],

  m62: [
    { fr: 'Même si',                pt: 'Mesmo se / Mesmo que',             note: 'concessão com indicativo' },
    { fr: 'En dépit de',            pt: 'Apesar de',                        note: '+ substantivo ou infinitivo' },
    { fr: 'Malgré',                 pt: 'Apesar de',                        note: '+ substantivo (sans verbe)' },
    { fr: 'Or',                     pt: 'Ora / Porém',                      note: 'adversativo lógico — início de frase' },
    { fr: 'Pourtant',               pt: 'No entanto / Porém',               note: null },
    { fr: 'Alors que',              pt: 'Enquanto que / Ao passo que',      note: 'oposição ou simultâneidade' },
    { fr: 'Tandis que',             pt: 'Enquanto / Ao passo que',          note: null },
    { fr: 'Certes',                 pt: 'Certamente (mas…)',                note: 'concede algo antes de contradizer' },
    { fr: 'Sauf que',               pt: 'Exceto que / A não ser que',       note: null },
    { fr: 'Quoique',                pt: 'Embora',                           note: '+ subjonctif — mais formal que bien que' },
  ],

  m63: [
    { fr: 'Bouffer',                pt: 'Comer (gíria)',                    note: 'familiar — nível coloquial' },
    { fr: 'Boulot',                 pt: 'Trabalho (gíria)',                 note: 'familiar — nível coloquial' },
    { fr: 'Fric',                   pt: 'Grana / Dinheiro (gíria)',         note: 'familiar' },
    { fr: 'Sympa',                  pt: 'Simpático / Legal',                note: 'familiar — abreviação de sympathique' },
    { fr: 'Chouette',               pt: 'Bacana / Legal',                   note: 'familiar' },
    { fr: 'Nonobstant',             pt: 'Não obstante / Apesar disso',      note: 'soutenu — nível culto/formal' },
    { fr: 'Susmentionné',           pt: 'Supracitado / Acima mencionado',   note: 'administrativo/jurídico' },
    { fr: 'Ci-joint',               pt: 'Anexo / Em anexo',                note: 'administrativo — em e-mails formais' },
    { fr: 'Il appert que',          pt: 'Consta que / É evidente que',      note: 'soutenu/jurídico' },
    { fr: 'Veuillez agréer…',       pt: 'Atenciosamente… (fórmula de encerramento)', note: 'correspondência formal francesa' },
  ],

  // ── Avançado 4 ─────────────────────────────────────────────────────────────

  m64: [
    { fr: 'Recherche',              pt: 'Pesquisa',                         note: null },
    { fr: 'Expérience',             pt: 'Experimento / Experiência',        note: null },
    { fr: 'Hypothèse',              pt: 'Hipótese',                         note: null },
    { fr: 'Données',                pt: 'Dados',                            note: 'Sempre plural neste sentido' },
    { fr: 'Résultat',               pt: 'Resultado',                        note: null },
    { fr: 'Diagnostic',             pt: 'Diagnóstico',                      note: null },
    { fr: 'Chirurgie',              pt: 'Cirurgia',                         note: null },
    { fr: 'Symptôme',               pt: 'Sintoma',                          note: null },
    { fr: 'Vaccin',                 pt: 'Vacina',                           note: null },
    { fr: 'Essai clinique',         pt: 'Ensaio clínico',                   note: null },
  ],

  m65: [
    { fr: 'Marché',                 pt: 'Mercado',                          note: null },
    { fr: 'Croissance',             pt: 'Crescimento',                      note: null },
    { fr: 'Inflation',              pt: 'Inflação',                         note: null },
    { fr: 'Investissement',         pt: 'Investimento',                     note: null },
    { fr: 'Dette',                  pt: 'Dívida',                           note: null },
    { fr: 'Budget',                 pt: 'Orçamento',                        note: null },
    { fr: 'Bourse',                 pt: 'Bolsa de valores',                 note: null },
    { fr: 'Mondialisation',         pt: 'Globalização',                     note: null },
    { fr: 'Crise économique',       pt: 'Crise econômica',                  note: null },
    { fr: 'Taux d\'intérêt',        pt: 'Taxa de juros',                    note: null },
  ],

  m66: [
    { fr: 'Réchauffement climatique', pt: 'Aquecimento global',             note: null },
    { fr: 'Émissions de CO2',       pt: 'Emissões de CO₂',                 note: null },
    { fr: 'Énergie renouvelable',   pt: 'Energia renovável',               note: null },
    { fr: 'Déforestation',          pt: 'Desmatamento',                     note: null },
    { fr: 'Biodiversité',           pt: 'Biodiversidade',                   note: null },
    { fr: 'Développement durable',  pt: 'Desenvolvimento sustentável',      note: null },
    { fr: 'Empreinte carbone',      pt: 'Pegada de carbono',               note: null },
    { fr: 'Catastrophe naturelle',  pt: 'Catástrofe natural',              note: null },
    { fr: 'Espèce menacée',         pt: 'Espécie ameaçada',                note: null },
    { fr: 'Transition écologique',  pt: 'Transição ecológica',             note: null },
  ],

  m67: [
    { fr: 'Conscience',             pt: 'Consciência',                      note: null },
    { fr: 'Raison',                 pt: 'Razão',                            note: null },
    { fr: 'Existence',              pt: 'Existência',                       note: null },
    { fr: 'Vérité',                 pt: 'Verdade',                          note: null },
    { fr: 'Justice',                pt: 'Justiça',                          note: null },
    { fr: 'Éthique',                pt: 'Ética',                            note: null },
    { fr: 'Valeur',                 pt: 'Valor',                            note: null },
    { fr: 'Doute',                  pt: 'Dúvida',                           note: 'Descartes: "Je pense, donc je suis"' },
    { fr: 'Absurde',                pt: 'Absurdo',                          note: 'Camus: filosofia do absurdo' },
    { fr: 'Liberté de pensée',      pt: 'Liberdade de pensamento',         note: null },
  ],

  m68: [
    { fr: 'Journal',                pt: 'Jornal',                           note: null },
    { fr: 'Article',                pt: 'Artigo',                           note: null },
    { fr: 'Reporter',               pt: 'Repórter',                         note: null },
    { fr: 'Titre',                  pt: 'Título / Manchete',                note: null },
    { fr: 'Source',                 pt: 'Fonte',                            note: null },
    { fr: 'Désinformation',         pt: 'Desinformação / Fake news',        note: null },
    { fr: 'Presse',                 pt: 'Imprensa',                         note: null },
    { fr: 'Reportage',              pt: 'Reportagem',                       note: null },
    { fr: 'Débat',                  pt: 'Debate',                           note: null },
    { fr: 'Censure',                pt: 'Censura',                          note: null },
  ],

  m69: [
    { fr: 'Accord',                 pt: 'Acordo',                           note: null },
    { fr: 'Traité',                 pt: 'Tratado',                          note: null },
    { fr: 'Alliance',               pt: 'Aliança',                          note: null },
    { fr: 'Diplomatie',             pt: 'Diplomacia',                       note: null },
    { fr: 'Ambassade',              pt: 'Embaixada',                        note: null },
    { fr: 'Conflit',                pt: 'Conflito',                         note: null },
    { fr: 'Sanction',               pt: 'Sanção',                           note: null },
    { fr: 'Sommet',                 pt: 'Cúpula (reunião de líderes)',      note: null },
    { fr: 'Organisation internationale', pt: 'Organização internacional',  note: null },
    { fr: 'Coopération',            pt: 'Cooperação',                       note: null },
  ],

  m70: [
    { fr: 'L\'ineffable',           pt: 'O inefável / O indizível',         note: 'aquilo que não pode ser expresso em palavras' },
    { fr: 'La mélancolie',          pt: 'A melancolia',                     note: null },
    { fr: 'L\'éphémère',            pt: 'O efêmero / O passageiro',         note: null },
    { fr: 'Le sublime',             pt: 'O sublime',                        note: null },
    { fr: 'L\'ennui',               pt: 'O tédio profundo',                 note: 'Baudelaire — diferente de simples aborrecimento' },
    { fr: 'La nostalgie',           pt: 'A nostalgia',                      note: null },
    { fr: 'Le dénouement',          pt: 'O desfecho / O desenlace',         note: 'resolução final de uma narrativa' },
    { fr: 'Le protagoniste',        pt: 'O protagonista',                   note: null },
    { fr: 'La vraisemblance',       pt: 'A verossimilhança',                note: 'aparência de verdade numa obra literária' },
    { fr: 'La quintessence',        pt: 'A quintessência / A essência pura', note: null },
  ],

  // ── Módulos Situacionais ──────────────────────────────────────────────────────

  m71: [
    { fr: 'Je voudrais une table pour deux',     pt: 'Quero uma mesa para dois',          note: 'je voudrais = condicional educado de vouloir' },
    { fr: 'La carte, s\'il vous plaît',          pt: 'O cardápio, por favor',             note: null },
    { fr: 'Je vais prendre le poulet',           pt: 'Vou pegar o frango',                note: 'prendre = pegar/tomar' },
    { fr: 'C\'est délicieux',                    pt: 'Está delicioso',                    note: null },
    { fr: 'L\'addition, s\'il vous plaît',       pt: 'A conta, por favor',                note: 'l\'addition = a conta' },
    { fr: 'Je suis végétarien',                  pt: 'Sou vegetariano',                   note: 'vegetarienne no feminino' },
    { fr: 'Avez-vous une table libre',           pt: 'Vocês têm uma mesa disponível',     note: null },
    { fr: 'Un verre d\'eau, s\'il vous plaît',   pt: 'Um copo d\'água, por favor',        note: null },
    { fr: 'Quelle est la spécialité',            pt: 'Qual é a especialidade',            note: 'do restaurante' },
    { fr: 'Je voudrais réserver une table',      pt: 'Gostaria de reservar uma mesa',     note: null },
  ],

  m72: [
    { fr: 'J\'ai mal à la tête',                 pt: 'Estou com dor de cabeça',           note: 'avoir mal à = ter dor de' },
    { fr: 'J\'ai de la fièvre',                  pt: 'Estou com febre',                   note: null },
    { fr: 'Je cherche un médicament',            pt: 'Estou procurando um remédio',       note: null },
    { fr: 'Avez-vous quelque chose contre',      pt: 'Você tem algo contra',              note: 'para dor, tosse, etc.' },
    { fr: 'Où est la pharmacie',                 pt: 'Onde fica a farmácia',              note: null },
    { fr: 'L\'ordonnance',                       pt: 'A receita médica',                  note: 'necessária para certos remédios' },
    { fr: 'Le comprimé',                         pt: 'O comprimido',                      note: null },
    { fr: 'Le sirop',                            pt: 'O xarope',                          note: null },
    { fr: 'Le pansement',                        pt: 'O curativo / O band-aid',           note: null },
    { fr: 'Je suis allergique à',                pt: 'Sou alérgico a',                    note: 'allergique au = masc., allergique à la = fem.' },
  ],

  m73: [
    { fr: 'Excusez-moi, où est',                 pt: 'Com licença, onde fica',            note: 'forma polida de pedir direções' },
    { fr: 'Tournez à gauche',                    pt: 'Vire à esquerda',                   note: 'tournez = imperativo de tourner' },
    { fr: 'Tournez à droite',                    pt: 'Vire à direita',                    note: null },
    { fr: 'Allez tout droit',                    pt: 'Vá em frente',                      note: 'tout droit = direto/em frente' },
    { fr: 'C\'est loin d\'ici',                  pt: 'É longe daqui',                     note: null },
    { fr: 'C\'est à deux minutes à pied',        pt: 'Fica a dois minutos a pé',          note: null },
    { fr: 'Prenez le bus',                       pt: 'Pegue o ônibus',                    note: 'prenez = imperativo de prendre' },
    { fr: 'À côté de la gare',                   pt: 'Ao lado da estação',                note: 'à côté de = ao lado de' },
    { fr: 'En face du supermarché',              pt: 'Em frente ao supermercado',         note: 'en face de = em frente a' },
    { fr: 'Au bout de la rue',                   pt: 'No final da rua',                   note: null },
  ],

  m74: [
    { fr: 'Je voudrais réserver une chambre',    pt: 'Gostaria de reservar um quarto',    note: null },
    { fr: 'Une chambre double',                  pt: 'Um quarto de casal',                note: 'double = para duas pessoas' },
    { fr: 'Une chambre simple',                  pt: 'Um quarto individual',              note: null },
    { fr: 'Le petit-déjeuner est inclus',        pt: 'O café da manhã está incluído',     note: null },
    { fr: 'À quelle heure est le check-in',      pt: 'A que horas é o check-in',          note: null },
    { fr: 'Pouvez-vous me réveiller à',          pt: 'Pode me acordar às',               note: 'wake-up call' },
    { fr: 'La climatisation ne fonctionne pas',  pt: 'O ar-condicionado não funciona',    note: null },
    { fr: 'La clé de la chambre',                pt: 'A chave do quarto',                 note: null },
    { fr: 'Je pars demain matin',                pt: 'Saio amanhã de manhã',              note: null },
    { fr: 'Le service de chambre',               pt: 'O serviço de quarto',               note: null },
  ],

  m75: [
    { fr: 'Où est le vol pour Paris',            pt: 'Onde fica o voo para Paris',        note: null },
    { fr: 'L\'embarquement',                     pt: 'O embarque',                        note: 'gate = porte d\'embarquement' },
    { fr: 'Le retard',                           pt: 'O atraso',                          note: 'mon vol est en retard = meu voo está atrasado' },
    { fr: 'Le vol est annulé',                   pt: 'O voo foi cancelado',               note: null },
    { fr: 'Les bagages',                         pt: 'As bagagens',                       note: 'bagage à main = bagagem de mão' },
    { fr: 'Le passeport',                        pt: 'O passaporte',                      note: null },
    { fr: 'Le contrôle des passeports',          pt: 'O controle de passaportes',         note: 'imigração' },
    { fr: 'La sortie de secours',                pt: 'A saída de emergência',             note: null },
    { fr: 'Le décollage',                        pt: 'A decolagem',                       note: null },
    { fr: 'L\'atterrissage',                     pt: 'O pouso',                           note: null },
  ],

  m76: [
    { fr: 'C\'est combien',                      pt: 'Quanto custa',                      note: 'forma mais direta' },
    { fr: 'Je voudrais essayer ce vêtement',     pt: 'Gostaria de experimentar esta roupa', note: null },
    { fr: 'Avez-vous cela en grande taille',     pt: 'Você tem isso em tamanho grande',   note: 'petit = pequeno, moyen = médio, grand = grande' },
    { fr: 'C\'est trop cher',                    pt: 'É muito caro',                      note: null },
    { fr: 'Je vais le prendre',                  pt: 'Vou levar',                         note: 'le = masc., la = fem.' },
    { fr: 'Le remboursement',                    pt: 'O reembolso / A devolução',         note: null },
    { fr: 'Les soldes',                          pt: 'A liquidação / As promoções',       note: 'período de saldos na França' },
    { fr: 'La caisse',                           pt: 'O caixa',                           note: 'onde se paga' },
    { fr: 'Vous acceptez la carte bancaire',     pt: 'Vocês aceitam cartão',              note: null },
    { fr: 'La facture',                          pt: 'A nota fiscal',                     note: null },
  ],
}

// ── Module definitions ─────────────────────────────────────────────────────────

const DEFS = [
  // ── Iniciante 1 ────────────────────────────────────────────────────────────
  { id:'m1',  number:1,  title:'Apresentações',      description:'Como se apresentar e cumprimentar',            icon:'👋', color:'#58CC02', vocabKey:'m1'  },
  { id:'m2',  number:2,  title:'Números 1 a 10',     description:'Conte de 1 a 10 em francês',                  icon:'🔢', color:'#1CB0F6', vocabKey:'m2'  },
  { id:'m3',  number:3,  title:'Cores',              description:'As cores do arco-íris em francês',            icon:'🎨', color:'#FF4B4B', vocabKey:'m3'  },
  { id:'m4',  number:4,  title:'Família',            description:'Os membros da família em francês',            icon:'👨‍👩‍👧‍👦', color:'#CE82FF', vocabKey:'m4'  },
  { id:'m5',  number:5,  title:'Dias da Semana',     description:'Os dias + hoje, amanhã e ontem',              icon:'📅', color:'#FF9600', vocabKey:'m5'  },
  { id:'m16', number:6,  title:'Verbos Essenciais',  description:'Os verbos mais usados no francês',            icon:'⚡', color:'#FF9600', vocabKey:'m16' },
  { id:'m30', number:7,  title:'Números 11 a 20',    description:'Continue contando em francês',                icon:'🔟', color:'#1CB0F6', vocabKey:'m30' },
  // ── Iniciante 2 ────────────────────────────────────────────────────────────
  { id:'m6',  number:8,  title:'Comida e Bebidas',   description:'O vocabulário da mesa em francês',            icon:'🍽️', color:'#FF9600', vocabKey:'m6'  },
  { id:'m7',  number:9,  title:'Animais',            description:'Os animais mais comuns em francês',           icon:'🐾', color:'#58CC02', vocabKey:'m7'  },
  { id:'m8',  number:10, title:'Corpo Humano',       description:'As partes do corpo em francês',               icon:'🦴', color:'#1CB0F6', vocabKey:'m8'  },
  { id:'m9',  number:11, title:'Roupas',             description:'O vestuário em francês',                      icon:'👗', color:'#CE82FF', vocabKey:'m9'  },
  { id:'m10', number:12, title:'Em Casa',            description:'Os cômodos e objetos da casa',                icon:'🏠', color:'#FF4B4B', vocabKey:'m10' },
  { id:'m26', number:13, title:'Meses do Ano',       description:'Os doze meses do ano em francês',             icon:'📆', color:'#FF9600', vocabKey:'m26' },
  { id:'m31', number:14, title:'Pronomes Pessoais',  description:'Je, tu, il, elle — os sujeitos em francês',   icon:'👤', color:'#CE82FF', vocabKey:'m31' },
  // ── Iniciante 3 ────────────────────────────────────────────────────────────
  { id:'m11', number:15, title:'Me Apresentando',    description:'Frases para se apresentar em francês',        icon:'🙋', color:'#58CC02', vocabKey:'m11' },
  { id:'m12', number:16, title:'No Restaurante',     description:'Frases para pedir comida e bebida',           icon:'🍷', color:'#FF9600', vocabKey:'m12' },
  { id:'m13', number:17, title:'Falando da Família', description:'Frases sobre os membros da família',          icon:'💬', color:'#CE82FF', vocabKey:'m13' },
  { id:'m14', number:18, title:'Descrevendo Coisas', description:'Combine cores, animais, roupas e lugares',    icon:'🖌️', color:'#1CB0F6', vocabKey:'m14' },
  { id:'m15', number:19, title:'Rotina Diária',      description:'Frases sobre o dia a dia com o que aprendeu', icon:'🗓️', color:'#FF4B4B', vocabKey:'m15' },
  { id:'m32', number:20, title:'Profissões',         description:'As profissões mais comuns em francês',        icon:'👔', color:'#58CC02', vocabKey:'m32' },
  // ── Intermediário ──────────────────────────────────────────────────────────
  { id:'m17', number:21, title:'Na Escola',          description:'Vocabulário do ambiente escolar',             icon:'🏫', color:'#58CC02', vocabKey:'m17' },
  { id:'m18', number:22, title:'Transportes',        description:'Como se locomover em francês',                icon:'🚆', color:'#1CB0F6', vocabKey:'m18' },
  { id:'m19', number:23, title:'Tempo e Estações',   description:'Clima, estações do ano e o tempo',            icon:'☀️', color:'#FFC800', vocabKey:'m19' },
  { id:'m20', number:24, title:'Adjetivos',          description:'Descreva tudo com os adjetivos certos',       icon:'🎨', color:'#CE82FF', vocabKey:'m20' },
  { id:'m27', number:25, title:'Negação',            description:'Como dizer "não", "nunca" e "nada"',          icon:'🚫', color:'#58CC02', vocabKey:'m27' },
  { id:'m28', number:26, title:'Passado (Passé Composé)', description:'Fale sobre o que já aconteceu',          icon:'⏮️', color:'#1CB0F6', vocabKey:'m28' },
  // ── Intermediário 2 ────────────────────────────────────────────────────────
  { id:'m21', number:27, title:'No Trabalho',        description:'Vocabulário profissional em francês',         icon:'💼', color:'#1CB0F6', vocabKey:'m21' },
  { id:'m22', number:28, title:'Emoções',            description:'Expresse como você se sente em francês',      icon:'😊', color:'#FF4B4B', vocabKey:'m22' },
  { id:'m23', number:29, title:'Saúde',              description:'Vocabulário médico e de bem-estar',           icon:'🏥', color:'#58CC02', vocabKey:'m23' },
  { id:'m24', number:30, title:'Lazer',              description:'Hobbies e atividades de lazer',               icon:'🎭', color:'#CE82FF', vocabKey:'m24' },
  { id:'m25', number:31, title:'A Cidade',           description:'Navegue pela cidade em francês',              icon:'🏙️', color:'#FF9600', vocabKey:'m25' },
  { id:'m29', number:32, title:'Verbos Reflexivos',  description:'Ações que você faz a si mesmo',               icon:'↩️', color:'#CE82FF', vocabKey:'m29' },
  // ── Intermediário 3 ────────────────────────────────────────────────────────
  { id:'m33', number:33, title:'Futuro Próximo',     description:'Fale sobre o que vai acontecer em breve',     icon:'🔮', color:'#58CC02', vocabKey:'m33' },
  { id:'m34', number:34, title:'Imperativo',         description:'Dê ordens e faça pedidos em francês',         icon:'📢', color:'#FF4B4B', vocabKey:'m34' },
  { id:'m35', number:35, title:'Comparativos',       description:'Compare coisas usando mais, menos e igual',   icon:'⚖️', color:'#1CB0F6', vocabKey:'m35' },
  { id:'m36', number:36, title:'Preposições de Lugar', description:'Indique onde as coisas estão',              icon:'📍', color:'#FF9600', vocabKey:'m36' },
  { id:'m37', number:37, title:'Quantidades',        description:'Expresse quantidade em francês',              icon:'🔢', color:'#CE82FF', vocabKey:'m37' },
  { id:'m38', number:38, title:'Condicional',        description:'Fale sobre possibilidades e desejos',         icon:'💭', color:'#FFC800', vocabKey:'m38' },
  // ── Intermediário 4 ────────────────────────────────────────────────────────
  { id:'m39', number:39, title:'Tecnologia',         description:'Vocabulário digital e da internet',           icon:'💻', color:'#1CB0F6', vocabKey:'m39' },
  { id:'m40', number:40, title:'Compras e Dinheiro', description:'Vocabulário de lojas e finanças',             icon:'🛍️', color:'#58CC02', vocabKey:'m40' },
  { id:'m41', number:41, title:'Viagens',            description:'Vocabulário essencial para viagens',          icon:'✈️', color:'#FF9600', vocabKey:'m41' },
  { id:'m42', number:42, title:'Natureza',           description:'A natureza e o meio ambiente em francês',     icon:'🌿', color:'#58CC02', vocabKey:'m42' },
  { id:'m43', number:43, title:'Esportes e Saúde',   description:'Atividades físicas e bem-estar',              icon:'🏃', color:'#FF4B4B', vocabKey:'m43' },
  { id:'m44', number:44, title:'Opiniões',           description:'Expresse ideias e pontos de vista',           icon:'💬', color:'#CE82FF', vocabKey:'m44' },
  // ── Avançado ───────────────────────────────────────────────────────────────
  { id:'m45', number:45, title:'Imparfait',          description:'Descreva hábitos e situações no passado',     icon:'🕰️', color:'#58CC02', vocabKey:'m45' },
  { id:'m46', number:46, title:'Subjonctif',         description:'Expresse dúvida, desejo e necessidade',       icon:'🔀', color:'#FF4B4B', vocabKey:'m46' },
  { id:'m47', number:47, title:'Discurso Indireto',  description:'Relate o que alguém disse',                   icon:'🗣️', color:'#1CB0F6', vocabKey:'m47' },
  { id:'m48', number:48, title:'Plus-que-parfait',   description:'Ações passadas antes de outra ação passada',  icon:'⏪', color:'#FF9600', vocabKey:'m48' },
  { id:'m49', number:49, title:'Conectores Lógicos', description:'Cependant, néanmoins, par conséquent…',       icon:'🔗', color:'#CE82FF', vocabKey:'m49' },
  { id:'m50', number:50, title:'Expressões Idiomáticas', description:'Expressões típicas do francês falado',   icon:'🦉', color:'#FFC800', vocabKey:'m50' },
  // ── Avançado 2 ─────────────────────────────────────────────────────────────
  { id:'m51', number:51, title:'Negócios e Carreiras', description:'Vocabulário profissional avançado',         icon:'💼', color:'#1CB0F6', vocabKey:'m51' },
  { id:'m52', number:52, title:'Política e Sociedade', description:'Vocabulário cívico e social',               icon:'🏛️', color:'#58CC02', vocabKey:'m52' },
  { id:'m53', number:53, title:'Arte e Cultura',     description:'O universo artístico e cultural francês',     icon:'🎨', color:'#FF4B4B', vocabKey:'m53' },
  { id:'m54', number:54, title:'Vocabulário Formal', description:'Expressões formais e de registro culto',      icon:'📜', color:'#CE82FF', vocabKey:'m54' },
  { id:'m55', number:55, title:'Gastronomia Francesa', description:'Os pratos e iguarias da França',            icon:'🍽️', color:'#FF9600', vocabKey:'m55' },
  { id:'m56', number:56, title:'Provérbios',         description:'A sabedoria popular em francês',              icon:'📖', color:'#FFC800', vocabKey:'m56' },
  // ── Avançado 3 ─────────────────────────────────────────────────────────────
  { id:'m57', number:57, title:'Subjonctif Passé',   description:'O passado do subjuntivo em francês',          icon:'🔀', color:'#58CC02', vocabKey:'m57' },
  { id:'m58', number:58, title:'Voz Passiva',        description:'Como usar a voz passiva em francês',          icon:'🔄', color:'#FF4B4B', vocabKey:'m58' },
  { id:'m59', number:59, title:'Gérondif',           description:'Ações simultâneas com en + participe',        icon:'⚙️', color:'#1CB0F6', vocabKey:'m59' },
  { id:'m60', number:60, title:'Condicionais com Si', description:'Hipóteses reais e irreais com si',           icon:'🔮', color:'#FF9600', vocabKey:'m60' },
  { id:'m61', number:61, title:'Causa e Consequência', description:'Conectores de causa e resultado',           icon:'⚡', color:'#CE82FF', vocabKey:'m61' },
  { id:'m62', number:62, title:'Concessão e Oposição', description:'Malgré, pourtant, alors que…',             icon:'⚖️', color:'#FFC800', vocabKey:'m62' },
  { id:'m63', number:63, title:'Registros de Língua', description:'Familiar, corrente e culto em francês',     icon:'🎭', color:'#58CC02', vocabKey:'m63' },
  // ── Avançado 4 ─────────────────────────────────────────────────────────────
  { id:'m64', number:64, title:'Medicina e Ciência', description:'Vocabulário científico e médico avançado',    icon:'🔬', color:'#1CB0F6', vocabKey:'m64' },
  { id:'m65', number:65, title:'Economia',           description:'Vocabulário econômico e financeiro',          icon:'📈', color:'#FF9600', vocabKey:'m65' },
  { id:'m66', number:66, title:'Meio Ambiente',      description:'Ecologia, clima e sustentabilidade',          icon:'🌍', color:'#58CC02', vocabKey:'m66' },
  { id:'m67', number:67, title:'Filosofia',          description:'Conceitos filosóficos em francês',            icon:'🧠', color:'#CE82FF', vocabKey:'m67' },
  { id:'m68', number:68, title:'Mídia e Jornalismo', description:'Vocabulário da comunicação e imprensa',       icon:'📰', color:'#FF4B4B', vocabKey:'m68' },
  { id:'m69', number:69, title:'Relações Internacionais', description:'Diplomacia e política mundial',          icon:'🌐', color:'#1CB0F6', vocabKey:'m69' },
  { id:'m70', number:70, title:'Expressões Literárias', description:'Vocabulário culto e literário em francês', icon:'✒️', color:'#FFC800', vocabKey:'m70' },
  // ── Situações do Dia a Dia ─────────────────────────────────────────────────
  { id:'m71', number:71, title:'No Restaurante',    description:'Peça comida, reserve mesa e pague a conta', icon:'🍽️', color:'#FF9600', vocabKey:'m71' },
  { id:'m72', number:72, title:'Na Farmácia',       description:'Descreva sintomas e encontre remédios',     icon:'💊', color:'#58CC02', vocabKey:'m72' },
  { id:'m73', number:73, title:'Pedindo Direções',  description:'Navegue pela cidade em francês',            icon:'🗺️', color:'#1CB0F6', vocabKey:'m73' },
  { id:'m74', number:74, title:'No Hotel',          description:'Reserve, faça check-in e resolva problemas', icon:'🏨', color:'#CE82FF', vocabKey:'m74' },
  { id:'m75', number:75, title:'No Aeroporto',      description:'Voos, embarque e situações no aeroporto',   icon:'✈️', color:'#FF4B4B', vocabKey:'m75' },
  { id:'m76', number:76, title:'Fazendo Compras',   description:'Pergunte preços, tente roupas e pague',     icon:'🛍️', color:'#FFC800', vocabKey:'m76' },
]

export const CATEGORIES = [
  {
    id:       'beginner',
    name:     'Iniciante',
    subtitle: 'A1 — vocabulário e primeiras frases',
    icon:     '🌱',
    color:    '#58CC02',
    levelIds: ['beginner-1', 'beginner-2', 'beginner-3'],
  },
  {
    id:       'situational',
    name:     'Situações',
    subtitle: 'Frases reais para o dia a dia',
    icon:     '🗺️',
    color:    '#1CB0F6',
    levelIds: ['situational-1'],
  },
  {
    id:       'intermediate',
    name:     'Intermediário',
    subtitle: 'A2/B1 — gramática e temas do cotidiano',
    icon:     '🌿',
    color:    '#FF9600',
    levelIds: ['intermediate-1', 'intermediate-2', 'intermediate-3', 'intermediate-4'],
  },
  {
    id:       'advanced',
    name:     'Avançado',
    subtitle: 'B2/C1 — fluência e cultura francesa',
    icon:     '🏆',
    color:    '#FFC800',
    levelIds: ['advanced', 'advanced-2', 'advanced-3', 'advanced-4'],
  },
]

export const LEVELS = [
  {
    id: 'beginner-1',
    name: 'Iniciante',
    subtitle: 'Vocabulário A1 essencial + verbos básicos',
    icon: '🌱',
    color: '#58CC02',
    premium: false,
    moduleIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm16', 'm30'],
  },
  {
    id: 'beginner-2',
    name: 'Iniciante 2',
    subtitle: 'Vocabulário A1 + meses, pronomes e mais',
    icon: '📗',
    color: '#1CB0F6',
    premium: false,
    moduleIds: ['m6', 'm7', 'm8', 'm9', 'm10', 'm26', 'm31'],
  },
  {
    id: 'beginner-3',
    name: 'Iniciante 3',
    subtitle: 'Primeiras frases + profissões',
    icon: '💬',
    color: '#CE82FF',
    premium: false,
    moduleIds: ['m11', 'm12', 'm13', 'm14', 'm15', 'm32'],
  },
  {
    id: 'situational-1',
    name: 'Situações',
    subtitle: 'Restaurante, farmácia, direções, hotel, aeroporto e compras',
    icon: '🗺️',
    color: '#1CB0F6',
    premium: false,
    moduleIds: ['m71', 'm72', 'm73', 'm74', 'm75', 'm76'],
  },
  {
    id: 'intermediate-1',
    name: 'Intermediário',
    subtitle: 'Vocabulário A2 + gramática (negação, passado)',
    icon: '🌿',
    color: '#FF9600',
    premium: false,
    moduleIds: ['m17', 'm18', 'm19', 'm20', 'm27', 'm28'],
  },
  {
    id: 'intermediate-2',
    name: 'Intermediário 2',
    subtitle: 'Vocabulário A2 + verbos reflexivos',
    icon: '🌳',
    color: '#FF4B4B',
    premium: true,
    moduleIds: ['m21', 'm22', 'm23', 'm24', 'm25', 'm29'],
  },
  {
    id: 'intermediate-3',
    name: 'Intermediário 3',
    subtitle: 'Futuro, imperativo, comparativos e condicional',
    icon: '🌲',
    color: '#58CC02',
    premium: true,
    moduleIds: ['m33', 'm34', 'm35', 'm36', 'm37', 'm38'],
  },
  {
    id: 'intermediate-4',
    name: 'Intermediário 4',
    subtitle: 'Tecnologia, viagens, natureza e opiniões',
    icon: '🌐',
    color: '#1CB0F6',
    premium: true,
    moduleIds: ['m39', 'm40', 'm41', 'm42', 'm43', 'm44'],
  },
  {
    id: 'advanced',
    name: 'Avançado',
    subtitle: 'Gramática B2: imparfait, subjonctif, discurso indireto',
    icon: '🏆',
    color: '#FFC800',
    premium: true,
    moduleIds: ['m45', 'm46', 'm47', 'm48', 'm49', 'm50'],
  },
  {
    id: 'advanced-2',
    name: 'Avançado 2',
    subtitle: 'Negócios, política, cultura e gastronomia francesa',
    icon: '👑',
    color: '#CE82FF',
    premium: true,
    moduleIds: ['m51', 'm52', 'm53', 'm54', 'm55', 'm56'],
  },
  {
    id: 'advanced-3',
    name: 'Avançado 3',
    subtitle: 'Gramática C1: subjonctif passé, passiva, condicionais',
    icon: '🎓',
    color: '#58CC02',
    premium: true,
    moduleIds: ['m57', 'm58', 'm59', 'm60', 'm61', 'm62', 'm63'],
  },
  {
    id: 'advanced-4',
    name: 'Avançado 4',
    subtitle: 'Ciência, economia, filosofia e cultura avançada',
    icon: '🔭',
    color: '#1CB0F6',
    premium: true,
    moduleIds: ['m64', 'm65', 'm66', 'm67', 'm68', 'm69', 'm70'],
  },
]

const MODULE_META = {
  m1: {
    grammarNote: 'Em francês, "vous" pode ser plural ou tratamento formal. Use "tu" com amigos e "vous" com desconhecidos ou superiores.',
  },
  m3: {
    grammarNote: 'Adjetivos de cor concordam com o substantivo em gênero e número. Exceções invariáveis: "orange" e "marron" nunca mudam.',
  },
  m4: {
    grammarNote: 'Possessivos: mon/ma (meu/minha), ton/ta (teu/tua), son/sa (seu/sua). Antes de vogal, use sempre "mon" mesmo no feminino: "mon amie".',
  },
  m5: {
    grammarNote: '"Le" + dia da semana indica repetição habitual: "le lundi" = toda segunda-feira. Sem artigo indica um dia específico.',
  },
  m11: {
    hasOrdering: true,
    grammarNote: 'Para se apresentar: s\'appeler (nome), avoir + número + ans (idade), être + adjetivo (nacionalidade — concorda em gênero).',
  },
  m12: {
    hasOrdering: true,
    grammarNote: '"Je voudrais" (condicional de vouloir) é mais educado que "je veux" para fazer pedidos num restaurante.',
  },
  m13: {
    hasOrdering: true,
    grammarNote: 'Mon/ma concordam com o substantivo: "mon père" (masc.), "ma mère" (fem.). Antes de vogal, sempre "mon": "mon amie".',
  },
  m14: {
    hasOrdering: true,
    grammarNote: 'Em francês, o adjetivo geralmente vem DEPOIS do substantivo: "une robe rouge". Exceções que vêm antes: bon, grand, petit, beau, joli.',
  },
  m15: {
    hasOrdering: true,
    grammarNote: 'O presente do indicativo (présent) cobre ações habituais, fatos gerais e ações em curso — equivale ao "faço" e "estou fazendo" do português.',
  },
  m27: { hasOrdering: true,
    grammarNote: 'A negação básica envolve dois elementos: "ne" antes do verbo e "pas" depois. Antes de vogal, "ne" vira "n\'".',
  },
  m28: { hasOrdering: true,
    grammarNote: 'O passé composé usa auxiliar (avoir ou être) + particípio passado. Verbos de movimento usam être: aller → allé.',
  },
  m29: { hasOrdering: true,
    grammarNote: 'Verbos reflexivos têm um pronome reflexivo (me, te, se, nous, vous) antes do verbo: "je me lève" = eu me levanto.',
  },
  m33: { hasOrdering: true,
    grammarNote: 'O futuro próximo é formado por: conjugação de "aller" + infinitivo. Ex: "je vais manger" = eu vou comer.',
  },
  m34: { hasOrdering: true,
    grammarNote: 'O imperativo tem 3 formas: tu (sem "s" em -er), nous (vamos) e vous. Negativa: ne + verbo + pas.',
  },
  m35: { hasOrdering: true,
    grammarNote: 'Comparativo: plus/moins/aussi + adjetivo + que. Superlativo: le/la/les + plus/moins + adjetivo.',
  },
  // ── Situacionais ──
  m71: {
    hasOrdering: true, hasBlank: true,
    grammarNote: '"Je voudrais" (condicional) é mais educado que "je veux" para pedir no restaurante. "L\'addition, s\'il vous plaît" é como pedir a conta.',
  },
  m72: {
    hasOrdering: true, hasBlank: true,
    grammarNote: 'Para descrever sintomas: "J\'ai mal à + artigo + parte do corpo". Exemplo: "J\'ai mal à la tête" = Estou com dor de cabeça.',
  },
  m73: {
    hasOrdering: true, hasBlank: true,
    grammarNote: 'Direções básicas: gauche (esquerda), droite (direita), tout droit (em frente). "Tournez" é o imperativo de "tourner" (virar).',
  },
  m74: {
    hasOrdering: true, hasBlank: true,
    grammarNote: 'No hotel: "Je voudrais réserver une chambre" = quero reservar. "Chambre double" = quarto de casal, "chambre simple" = individual.',
  },
  m75: {
    hasOrdering: true, hasBlank: true,
    grammarNote: 'No aeroporto: "embarquement" = embarque, "décollage" = decolagem, "atterrissage" = pouso. "Retard" = atraso, "annulé" = cancelado.',
  },
  m76: {
    hasOrdering: true, hasBlank: true,
    grammarNote: '"C\'est combien ?" é a forma mais direta de perguntar o preço. "Je vais le prendre" = vou levar. "C\'est trop cher" = é muito caro.',
  },
  m16: {
    grammarNote: 'Verbos irregulares não seguem padrão e devem ser memorizados. Être, avoir, aller e faire são a base de quase toda comunicação em francês.',
    conjugation: [
      {
        verb: 'Être — Ser / Estar',
        rows: [
          { pr: 'Je',           form: 'suis'   },
          { pr: 'Tu',           form: 'es'     },
          { pr: 'Il / Elle',    form: 'est'    },
          { pr: 'Nous',         form: 'sommes' },
          { pr: 'Vous',         form: 'êtes'   },
          { pr: 'Ils / Elles',  form: 'sont'   },
        ],
      },
      {
        verb: 'Avoir — Ter',
        rows: [
          { pr: 'Je',           form: 'ai'     },
          { pr: 'Tu',           form: 'as'     },
          { pr: 'Il / Elle',    form: 'a'      },
          { pr: 'Nous',         form: 'avons'  },
          { pr: 'Vous',         form: 'avez'   },
          { pr: 'Ils / Elles',  form: 'ont'    },
        ],
      },
      {
        verb: 'Aller — Ir',
        rows: [
          { pr: 'Je',           form: 'vais'   },
          { pr: 'Tu',           form: 'vas'    },
          { pr: 'Il / Elle',    form: 'va'     },
          { pr: 'Nous',         form: 'allons' },
          { pr: 'Vous',         form: 'allez'  },
          { pr: 'Ils / Elles',  form: 'vont'   },
        ],
      },
      {
        verb: 'Faire — Fazer',
        rows: [
          { pr: 'Je',           form: 'fais'    },
          { pr: 'Tu',           form: 'fais'    },
          { pr: 'Il / Elle',    form: 'fait'    },
          { pr: 'Nous',         form: 'faisons' },
          { pr: 'Vous',         form: 'faites'  },
          { pr: 'Ils / Elles',  form: 'font'    },
        ],
      },
    ],
  },
  m31: {
    grammarNote: 'Os pronomes pessoais são: je (eu), tu (você/informal), il/elle (ele/ela), nous (nós), vous (vocês/formal), ils/elles (eles/elas).',
    conjugation: [
      {
        verb: 'Parler — Falar (modelo -ER regular)',
        rows: [
          { pr: 'Je',           form: 'parle'   },
          { pr: 'Tu',           form: 'parles'  },
          { pr: 'Il / Elle',    form: 'parle'   },
          { pr: 'Nous',         form: 'parlons' },
          { pr: 'Vous',         form: 'parlez'  },
          { pr: 'Ils / Elles',  form: 'parlent' },
        ],
      },
      {
        verb: 'Finir — Terminar (modelo -IR regular)',
        rows: [
          { pr: 'Je',           form: 'finis'     },
          { pr: 'Tu',           form: 'finis'     },
          { pr: 'Il / Elle',    form: 'finit'     },
          { pr: 'Nous',         form: 'finissons' },
          { pr: 'Vous',         form: 'finissez'  },
          { pr: 'Ils / Elles',  form: 'finissent' },
        ],
      },
    ],
  },
}

export const MODULES = DEFS.map(def => {
  const vocab = VOCAB[def.vocabKey]
  const meta  = MODULE_META[def.id] ?? {}
  const gens  = genMixedExercises(vocab)
  return {
    id:          def.id,
    number:      def.number,
    title:       def.title,
    description: def.description,
    icon:        def.icon,
    color:       def.color,
    vocab: {
      id:          `${def.id}-vocab`,
      type:        'vocab',
      title:       def.title,
      vocabulary:  vocab,
      grammarNote: meta.grammarNote ?? null,
      conjugation: meta.conjugation ?? null,
    },
    exercises: gens.map((ex, i) => ({
      id:        `${def.id}-ex${i + 1}`,
      type:      'exercise',
      number:    ex.number,
      title:     ex.title,
      subtitle:  ex.subtitle,
      xpReward:  10,
      questions: ex.questions,
    })),
    evaluation: {
      id:        `${def.id}-eval`,
      type:      'evaluation',
      title:     'Avaliação',
      xpReward:  20,
      questions: genEvalQuestions(vocab),
    },
  }
})

// ── Utilitários de revisão ─────────────────────────────────────────────────────

export function getAllVocab() {
  return DEFS.flatMap(def => VOCAB[def.vocabKey])
}

export function buildDailyItem(dateStr) {
  const all  = getAllVocab()
  const seed = parseInt(dateStr.replace(/-/g, ''), 10)
  const pick = (arr, n) => {
    const out = [], seen = new Set()
    for (let i = 0; out.length < n && i < arr.length * 3; i++) {
      const idx = (seed * 1664525 + i * 22695477 + 1013904223) % arr.length
      if (!seen.has(idx)) { seen.add(idx); out.push(arr[Math.abs(idx)]) }
    }
    return out
  }
  const items     = pick(all, 8)
  const questions = shuffle([
    ...items.slice(0, 3).map(item => makeQ(all, item, 'fr-pt')),
    ...items.slice(3, 6).map(item => makeQ(all, item, 'pt-fr')),
    ...items.slice(6).map(item => makeListeningQ(all, item)),
  ])
  return {
    id:       `daily-${dateStr}`,
    type:     'daily',
    title:    'Missão do Dia',
    xpReward: 50,
    exercises: [{
      number:   1,
      title:    'Missão do Dia',
      subtitle: '8 questões · +50 XP bônus',
      questions,
    }],
  }
}

export function buildReviewItem(wrongWords) {
  const all   = getAllVocab()
  const items = shuffle(wrongWords.map(fr => all.find(v => v.fr === fr)).filter(Boolean)).slice(0, 10)
  if (!items.length) return null
  const questions = shuffle([
    ...items.slice(0, 5).map(item => makeQ(all, item, 'fr-pt')),
    ...items.slice(5).map(item => makeListeningQ(all, item)),
  ]).slice(0, 10)
  return {
    id: 'review',
    type: 'review',
    title: 'Revisão',
    xpReward: Math.max(5, items.length),
    exercises: [{
      number: 1,
      title: 'Revisão Rápida',
      subtitle: `${items.length} palavras selecionadas`,
      questions,
    }],
  }
}
