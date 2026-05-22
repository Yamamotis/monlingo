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

function genExercises(vocab) {
  return [
    {
      number: 1,
      title: 'Exercício 1',
      subtitle: 'Francês → Português',
      questions: shuffle(vocab.map(item => makeQ(vocab, item, 'fr-pt'))),
    },
    {
      number: 2,
      title: 'Exercício 2',
      subtitle: 'Português → Francês',
      questions: shuffle(vocab.map(item => makeQ(vocab, item, 'pt-fr'))),
    },
    {
      number: 3,
      title: 'Exercício 3',
      subtitle: 'Compreensão auditiva 🎧',
      questions: shuffle(vocab.map(item => makeListeningQ(vocab, item))),
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
    { fr: 'Bonjour',          pt: 'Olá / Bom dia',     note: 'Cumprimento mais comum, usado até ~18h' },
    { fr: 'Bonsoir',          pt: 'Boa tarde / noite',  note: 'Usado a partir do fim da tarde' },
    { fr: 'Bonne nuit',       pt: 'Boa noite',          note: 'Só ao se despedir para dormir' },
    { fr: 'Au revoir',        pt: 'Tchau / Até logo',   note: 'Despedida formal e informal' },
    { fr: 'Merci',            pt: 'Obrigado(a)',         note: null },
    { fr: "S'il vous plaît",  pt: 'Por favor',          note: 'Forma formal; "s\'il te plaît" é informal' },
    { fr: 'Oui',              pt: 'Sim',                note: null },
    { fr: 'Non',              pt: 'Não',                note: null },
    { fr: 'Excusez-moi',      pt: 'Com licença',        note: 'Também usado para pedir desculpa' },
    { fr: 'De rien',          pt: 'De nada',            note: 'Resposta para "Merci"' },
  ],
  m2: [
    { fr: 'Un',    pt: 'Um',    note: null },
    { fr: 'Deux',  pt: 'Dois',  note: null },
    { fr: 'Trois', pt: 'Três',  note: null },
    { fr: 'Quatre',pt: 'Quatro',note: null },
    { fr: 'Cinq',  pt: 'Cinco', note: null },
    { fr: 'Six',   pt: 'Seis',  note: null },
    { fr: 'Sept',  pt: 'Sete',  note: null },
    { fr: 'Huit',  pt: 'Oito',  note: null },
    { fr: 'Neuf',  pt: 'Nove',  note: null },
    { fr: 'Dix',   pt: 'Dez',   note: null },
  ],
  m3: [
    { fr: 'Rouge',  pt: 'Vermelho', note: null },
    { fr: 'Bleu',   pt: 'Azul',    note: null },
    { fr: 'Vert',   pt: 'Verde',   note: null },
    { fr: 'Jaune',  pt: 'Amarelo', note: null },
    { fr: 'Blanc',  pt: 'Branco',  note: null },
    { fr: 'Noir',   pt: 'Preto',   note: null },
    { fr: 'Rose',   pt: 'Rosa',    note: 'Também é a palavra para "rosa" (flor)' },
    { fr: 'Orange', pt: 'Laranja', note: 'Invariável — não muda com gênero' },
    { fr: 'Violet', pt: 'Roxo',    note: null },
    { fr: 'Marron', pt: 'Marrom',  note: 'Invariável — não muda com gênero' },
  ],
  m4: [
    { fr: 'Père',       pt: 'Pai',    note: null },
    { fr: 'Mère',       pt: 'Mãe',    note: null },
    { fr: 'Frère',      pt: 'Irmão',  note: null },
    { fr: 'Sœur',       pt: 'Irmã',   note: null },
    { fr: 'Grand-père', pt: 'Avô',    note: null },
    { fr: 'Grand-mère', pt: 'Avó',    note: null },
    { fr: 'Fils',       pt: 'Filho',  note: 'O "s" final é mudo' },
    { fr: 'Fille',      pt: 'Filha',  note: 'Também significa "menina"' },
    { fr: 'Oncle',      pt: 'Tio',    note: null },
    { fr: 'Tante',      pt: 'Tia',    note: null },
  ],
  m5: [
    { fr: 'Lundi',       pt: 'Segunda-feira', note: null },
    { fr: 'Mardi',       pt: 'Terça-feira',   note: null },
    { fr: 'Mercredi',    pt: 'Quarta-feira',  note: null },
    { fr: 'Jeudi',       pt: 'Quinta-feira',  note: null },
    { fr: 'Vendredi',    pt: 'Sexta-feira',   note: null },
    { fr: 'Samedi',      pt: 'Sábado',        note: 'Faz parte do week-end' },
    { fr: 'Dimanche',    pt: 'Domingo',       note: 'Faz parte do week-end' },
    { fr: "Aujourd'hui", pt: 'Hoje',          note: null },
    { fr: 'Demain',      pt: 'Amanhã',        note: null },
    { fr: 'Hier',        pt: 'Ontem',         note: null },
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
}

// ── Module definitions ─────────────────────────────────────────────────────────

const DEFS = [
  // ── Iniciante 1 ────────────────────────────────────────────────────────────
  { id:'m1',  number:1,  title:'Apresentações',      description:'Como se apresentar e cumprimentar',           icon:'👋', color:'#58CC02', vocabKey:'m1' },
  { id:'m2',  number:2,  title:'Números',             description:'Conte de 1 a 10 em francês',                 icon:'🔢', color:'#1CB0F6', vocabKey:'m2' },
  { id:'m3',  number:3,  title:'Cores',               description:'As cores do arco-íris em francês',           icon:'🎨', color:'#FF4B4B', vocabKey:'m3' },
  { id:'m4',  number:4,  title:'Família',             description:'Os membros da família em francês',           icon:'👨‍👩‍👧‍👦', color:'#CE82FF', vocabKey:'m4' },
  { id:'m5',  number:5,  title:'Dias da Semana',      description:'Os dias + hoje, amanhã e ontem',             icon:'📅', color:'#FF9600', vocabKey:'m5' },
  { id:'m16', number:6,  title:'Verbos Essenciais',   description:'Os verbos mais usados no francês',           icon:'⚡', color:'#FF9600', vocabKey:'m16' },
  // ── Iniciante 2 ────────────────────────────────────────────────────────────
  { id:'m6',  number:7,  title:'Comida e Bebidas',    description:'O vocabulário da mesa em francês',           icon:'🍽️', color:'#FF9600', vocabKey:'m6' },
  { id:'m7',  number:8,  title:'Animais',             description:'Os animais mais comuns em francês',          icon:'🐾', color:'#58CC02', vocabKey:'m7' },
  { id:'m8',  number:9,  title:'Corpo Humano',        description:'As partes do corpo em francês',              icon:'🦴', color:'#1CB0F6', vocabKey:'m8' },
  { id:'m9',  number:10, title:'Roupas',              description:'O vestuário em francês',                     icon:'👗', color:'#CE82FF', vocabKey:'m9' },
  { id:'m10', number:11, title:'Em Casa',             description:'Os cômodos e objetos da casa',               icon:'🏠', color:'#FF4B4B', vocabKey:'m10' },
  { id:'m26', number:12, title:'Meses do Ano',        description:'Os doze meses do ano em francês',            icon:'📆', color:'#FF9600', vocabKey:'m26' },
  // ── Iniciante 3 ────────────────────────────────────────────────────────────
  { id:'m11', number:13, title:'Me Apresentando',     description:'Frases para se apresentar em francês',       icon:'🙋', color:'#58CC02', vocabKey:'m11' },
  { id:'m12', number:14, title:'No Restaurante',      description:'Frases para pedir comida e bebida',          icon:'🍷', color:'#FF9600', vocabKey:'m12' },
  { id:'m13', number:15, title:'Falando da Família',  description:'Frases sobre os membros da família',         icon:'💬', color:'#CE82FF', vocabKey:'m13' },
  { id:'m14', number:16, title:'Descrevendo Coisas',  description:'Combine cores, animais, roupas e lugares',   icon:'🖌️', color:'#1CB0F6', vocabKey:'m14' },
  { id:'m15', number:17, title:'Rotina Diária',       description:'Frases sobre o dia a dia com o que aprendeu',icon:'🗓️', color:'#FF4B4B', vocabKey:'m15' },
  // ── Intermediário ──────────────────────────────────────────────────────────
  { id:'m17', number:18, title:'Na Escola',           description:'Vocabulário do ambiente escolar',            icon:'🏫', color:'#58CC02', vocabKey:'m17' },
  { id:'m18', number:19, title:'Transportes',         description:'Como se locomover em francês',               icon:'🚆', color:'#1CB0F6', vocabKey:'m18' },
  { id:'m19', number:20, title:'Tempo e Estações',    description:'Clima, estações do ano e o tempo',           icon:'☀️', color:'#FFC800', vocabKey:'m19' },
  { id:'m20', number:21, title:'Adjetivos',           description:'Descreva tudo com os adjetivos certos',      icon:'🎨', color:'#CE82FF', vocabKey:'m20' },
  { id:'m27', number:22, title:'Negação',             description:'Como dizer "não", "nunca" e "nada"',         icon:'🚫', color:'#58CC02', vocabKey:'m27' },
  { id:'m28', number:23, title:'Passado (Passé Composé)', description:'Fale sobre o que já aconteceu',          icon:'⏮️', color:'#1CB0F6', vocabKey:'m28' },
  // ── Intermediário 2 ────────────────────────────────────────────────────────
  { id:'m21', number:24, title:'No Trabalho',         description:'Vocabulário profissional em francês',        icon:'💼', color:'#1CB0F6', vocabKey:'m21' },
  { id:'m22', number:25, title:'Emoções',             description:'Expresse como você se sente em francês',     icon:'😊', color:'#FF4B4B', vocabKey:'m22' },
  { id:'m23', number:26, title:'Saúde',               description:'Vocabulário médico e de bem-estar',          icon:'🏥', color:'#58CC02', vocabKey:'m23' },
  { id:'m24', number:27, title:'Lazer',               description:'Hobbies e atividades de lazer',              icon:'🎭', color:'#CE82FF', vocabKey:'m24' },
  { id:'m25', number:28, title:'A Cidade',            description:'Navegue pela cidade em francês',             icon:'🏙️', color:'#FF9600', vocabKey:'m25' },
  { id:'m29', number:29, title:'Verbos Reflexivos',   description:'Ações que você faz a si mesmo',              icon:'↩️', color:'#CE82FF', vocabKey:'m29' },
]

export const LEVELS = [
  {
    id: 'beginner-1',
    name: 'Iniciante',
    subtitle: 'Vocabulário A1 essencial + verbos básicos',
    icon: '🌱',
    color: '#58CC02',
    moduleIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm16'],
  },
  {
    id: 'beginner-2',
    name: 'Iniciante 2',
    subtitle: 'Vocabulário A1 + horas, meses e mais',
    icon: '📗',
    color: '#1CB0F6',
    moduleIds: ['m6', 'm7', 'm8', 'm9', 'm10', 'm26'],
  },
  {
    id: 'beginner-3',
    name: 'Iniciante 3',
    subtitle: 'Primeiras frases em francês',
    icon: '💬',
    color: '#CE82FF',
    moduleIds: ['m11', 'm12', 'm13', 'm14', 'm15'],
  },
  {
    id: 'intermediate-1',
    name: 'Intermediário',
    subtitle: 'Vocabulário A2 + gramática (negação, passado)',
    icon: '🌿',
    color: '#FF9600',
    moduleIds: ['m17', 'm18', 'm19', 'm20', 'm27', 'm28'],
  },
  {
    id: 'intermediate-2',
    name: 'Intermediário 2',
    subtitle: 'Vocabulário A2 + verbos reflexivos',
    icon: '🌳',
    color: '#FF4B4B',
    moduleIds: ['m21', 'm22', 'm23', 'm24', 'm25', 'm29'],
  },
  {
    id: 'advanced',
    name: 'Avançado',
    subtitle: 'Em breve',
    icon: '🏆',
    color: '#FFC800',
    moduleIds: [],
  },
]

export const MODULES = DEFS.map(def => {
  const vocab = VOCAB[def.vocabKey]
  const gens  = genExercises(vocab)
  return {
    id:          def.id,
    number:      def.number,
    title:       def.title,
    description: def.description,
    icon:        def.icon,
    color:       def.color,
    vocab: {
      id:         `${def.id}-vocab`,
      type:       'vocab',
      title:      def.title,
      vocabulary: vocab,
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
