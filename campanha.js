// ══════════════════════════════════════════
//  campanha.js — v3 | Sistema de Campanha
//  Melhorias: feedback de relacionamentos em tempo real,
//             diário personalizado com escolhas,
//             banner com entrada limpa no mapa
// ══════════════════════════════════════════

let _inimigoCache = null;

// ── ESTADO INICIAL DA CAMPANHA ──
function campanhaInicial() {
  return {
    iniciada        : false,
    capitulo        : 0,
    cena            : 0,
    escolhas        : {},
    relacionamentos : {
      dumbledore : 0,
      snape      : 0,
      hermione   : 0,
      neville    : 0,
      luna       : 0,
      draco      : 0,
      ginny      : 0,
    },
    flagsAtivos     : [],
    inimigosVencidos: [],
    itensColetados  : [],
    diarioCampanha  : [],
    concluida       : false,
    finalObtido     : null,
  };
}

// ── CAPÍTULOS ──
const CAMPANHA = {

  prologo: {
    id: 'prologo',
    titulo: '☀️ Prólogo — O Convite',
    subtitulo: 'Após provar seu valor em Hogwarts, algo maior te aguarda.',
    cenas: [
      {
        id: 'p1',
        tipo: 'narrativa',
        art: '📜',
        texto: `Uma carta chega à sua mesa no café do Castelo. Sem remetente. O papel é antigo — tão antigo que fareja da era dos fundadores. Ao abri-la, uma única frase em tinta carmesim:

"A Ordem das Sombras acordou. Hogwarts precisa do seu Escolhido. Venha à Torre do Norte ao anoitecer."

Você olha ao redor. Ninguém mais parece ter recebido uma carta assim.`,
        avancar: true,
      },
      {
        id: 'p2',
        tipo: 'escolha',
        art: '🗼',
        texto: `É noite. A Torre do Norte está fria e quieta. Uma figura encapuzada te aguarda — ao retirar o capuz, você reconhece Minerva McGonagall, mais velha do que nunca pareceu.

"Há cinquenta anos, um estudante como você foi chamado assim. Ele não veio. O resultado foi Tom Riddle."

Ela estende a mão. Na palma, um medalhão com o brasão das quatro casas.`,
        opcoes: [
          {
            id: 'aceitar_chamado',
            texto: '✋ Aceitar o medalhão e o chamado',
            efeito: { rel: { dumbledore: +10, hermione: +5 }, flag: 'chamado_aceito' },
            resposta: 'McGonagall sorri — pela primeira vez em anos. "Sabia que você viria."',
            entradaDiario: 'Aceitei o chamado sem hesitar. O medalhão estava quente na minha palma — como se já me esperasse.',
          },
          {
            id: 'questionar_primeiro',
            texto: '🤔 Exigir explicações antes de aceitar',
            efeito: { rel: { dumbledore: +5, snape: +5 }, flag: 'chamado_cauteloso' },
            resposta: '"Prudência é uma virtude", ela concede. "Você tem direito de saber."',
            entradaDiario: 'Exigi respostas antes de me comprometer. McGonagall pareceu surpresa. Talvez seja isso que falta nessa história — alguém que pergunte.',
          },
          {
            id: 'recusar_temporariamente',
            texto: '🚫 Recusar por enquanto — isso parece grande demais',
            efeito: { rel: { dumbledore: -5, neville: +10 }, flag: 'chamado_hesitante' },
            resposta: '"A hesitação é humana. Mas a Ordem não pode esperar muito."',
            entradaDiario: 'Recusei o chamado. Não porque tenho medo — porque ainda não sei em que estou me metendo. Neville diria que isso é sabedoria.',
          },
        ],
      },
      {
        id: 'p3',
        tipo: 'narrativa',
        art: '🦉',
        texto: `McGonagall explica: a Ordem das Sombras é uma sociedade secreta que precedeu os Comensais da Morte — mais antiga, mais perigosa. Acreditava-se extinta desde Godric Gryffindor. Mas recentemente, três estudantes desapareceram sem rastro. E uma runa ancestral foi encontrada gravada na Câmara Secreta.

"Você é o bruxo mais poderoso neste castelo agora. Com ou sem o medalhão, o destino já escolheu você."`,
        avancar: true,
      },
    ],
  },

  cap1: {
    id: 'cap1',
    titulo: '🔍 Capítulo I — A Investigação',
    subtitulo: 'Três estudantes desaparecidos. Uma runa sem tradução. O relógio anda.',
    cenas: [
      {
        id: 'c1_1',
        tipo: 'narrativa',
        art: '🏫',
        texto: `Manhã seguinte. O corredor leste está lacrado com fita mágica. O estudante desaparecido mais recente era de Hufflepuff — Ernie MacMillan Jr., neto do original. No chão: um fragmento de pergaminho com símbolos que nem os professores reconhecem.

Hermione Granger (agora professora de Feitiços) te encontra no corredor.

"Eu... eu sei que não deveria ter feito isso, mas analisei o pergaminho. São runas Pré-Fundadoras. Desapareceram da literatura há quinhentos anos."`,
        avancar: true,
      },
      {
        id: 'c1_2',
        tipo: 'escolha',
        art: '📚',
        texto: `Hermione está claramente com medo — algo raro nela. Ela sussurra:

"Há um livro na Seção Restrita que pode ter a chave. O problema... ele foi requisitado recentemente por um professor. Eu não posso acusar um colega sem prova."

Você tem três caminhos.`,
        opcoes: [
          {
            id: 'investigar_biblioteca',
            texto: '🔍 Invadir a Seção Restrita à noite',
            efeito: { rel: { hermione: +15, snape: -10 }, flag: 'bibliotecaInvadida' },
            resposta: 'Hermione pisca. "Eu não vi nada. Seja cuidadoso."',
            entradaDiario: 'Invadi a Seção Restrita. Hermione fingiu não saber — mas vi seu sorriso quando virei as costas. Ela aprovou.',
          },
          {
            id: 'confrontar_professor',
            texto: '🗣️ Confrontar diretamente o professor suspeito',
            efeito: { rel: { snape: +20, hermione: -5, dumbledore: +10 }, flag: 'professorConfrontado' },
            resposta: '"Coragem ou imprudência?" ela murmura. "Às vezes são a mesma coisa."',
            entradaDiario: 'Confrontei o professor suspeito. Snape (do retrato) observava com algo próximo de aprovação. Hermione discordou — como sempre.',
          },
          {
            id: 'pedir_ajuda_neville',
            texto: '🌿 Pedir ajuda a Neville (agora professor de Herbologia)',
            efeito: { rel: { neville: +20, hermione: +5 }, flag: 'nevilleAliado' },
            resposta: 'Hermione sorri. "Neville conhece este castelo melhor do que qualquer um."',
            entradaDiario: 'Pedi ajuda ao Neville. Ele ficou vermelho, depois determinado. Ainda me surpreende como ele cresceu.',
          },
        ],
      },
      {
        id: 'c1_batalha',
        tipo: 'batalha_narrativa',
        art: '👤',
        texto: `Na Seção Restrita, uma sombra se materializa — não um ser vivo, mas uma Guardiã das Runas: uma entidade criada para proteger o conhecimento proibido.

Ela fala em idioma antigo, mas você entende magicamente: "Apenas os dignos verão o que buscam."`,
        inimigo: {
          id        : 'guardia_runas',
          nome      : 'Guardiã das Runas',
          art       : '🌑',
          hpMax     : 380,
          atk       : [28, 44],
          xp        : 0,
          ouro      : 0,
          habilidade: 'escudo',
          dificuldade: 4,
          boss      : true,
          fala      : 'O conhecimento tem um preço. Veja se você pode pagá-lo.',
        },
        vitoria: { flag: 'guardiaDerrotada', texto: 'A entidade se dissolve em partículas douradas. No chão, o livro que Hermione mencionava — aberto na página certa.' },
      },
      {
        id: 'c1_descoberta',
        tipo: 'narrativa',
        art: '📖',
        texto: `O livro revela algo perturbador: a Ordem das Sombras não é simplesmente uma organização. É um ritual de ligação — um bruxo por geração é escolhido involuntariamente para "alimentar" a magia ancestral do castelo.

Os três estudantes desaparecidos não estão mortos. Estão presos no espaço entre o mundo dos vivos e o dos mortos — o "Véu Interior" — servindo como âncoras para um feitiço que alguém está preparando.

E o feitiço precisará de um quarto. O mais poderoso de todos.

Você.`,
        avancar: true,
      },
    ],
  },

  cap2: {
    id: 'cap2',
    titulo: '🐍 Capítulo II — Aliados e Traidores',
    subtitulo: 'Nem todo inimigo usa capuz. Nem todo aliado sorri.',
    cenas: [
      {
        id: 'c2_1',
        tipo: 'narrativa',
        art: '🏛️',
        texto: `De volta ao Grande Salão, a atmosfera mudou. Professores sussurram. Alunos se afastam. Alguém dentro do castelo passou informações para a Ordem — e esse alguém sabe que você investiga.

Uma nota aparece embaixo do seu prato: "Confie no menos óbvio."

Snape (agora retrato vivo, por magia avançada) pisca para você pela primeira vez.`,
        avancar: true,
      },
      {
        id: 'c2_2',
        tipo: 'escolha',
        art: '🐉',
        texto: `Draco Malfoy — agora um Auror reformado em missão secreta em Hogwarts — aparece no seu quarto. Sem bater.

"Eu sei quem é o infiltrado. E não vou te dizer de graça."

Ele cruza os braços. No olhar: algo entre orgulho ferido e urgência genuína.`,
        opcoes: [
          {
            id: 'confiar_draco',
            texto: '🤝 Confiar nele — o que ele quer?',
            efeito: { rel: { draco: +25, snape: +10, hermione: -10 }, flag: 'dracoAliado' },
            resposta: '"Quero que, quando isso acabar, meu nome não esteja na lista dos vilões." Uma pausa. "Mais uma vez."',
            entradaDiario: 'Confiei no Draco. Hermione quase engoliu a língua quando contei. Mas havia algo real nele hoje — não vi aquilo desde que era estudante.',
          },
          {
            id: 'pressionar_draco',
            texto: '⚡ Usar Legilimência nele sem permissão',
            efeito: { rel: { draco: -20, snape: -15, dumbledore: -10 }, flag: 'dracoDesconfia' },
            resposta: 'Ele se afasta — mas não vai embora. "Então é assim. Tudo bem. Mas saiba que você vai precisar de mim."',
            entradaDiario: 'Usei Legilimência no Draco sem pedir. Vi mais do que esperava — incluindo o quanto aquilo o magoou. Não tenho certeza se foi a escolha certa.',
          },
          {
            id: 'ignorar_draco',
            texto: '🚪 Pedir que saia — não confiar em Malfoys',
            efeito: { rel: { draco: -30, neville: +15 }, flag: 'dracoAfastado' },
            resposta: 'Ele vai. Mas deixa um pedaço de papel na mesa: uma data, uma hora, e "Câmara Inferior".',
            entradaDiario: 'Mandei o Draco embora. Neville aprovou. Mas o papel que ele deixou ainda está na minha mesa. Não consigo jogar fora.',
          },
        ],
      },
      {
        id: 'c2_familia',
        tipo: 'escolha',
        art: '🏠',
        texto: `Uma missiva do Ministério da Magia chega: sua família mágica foi mencionada em documentos antigos da Ordem das Sombras. Isso significa proteção... ou suspeita.

O que você faz com essa informação?`,
        opcoes: [
          {
            id: 'familia_publica',
            texto: '📢 Tornar público — transparência total',
            efeito: { rel: { dumbledore: +20, draco: -10, neville: +10 }, flag: 'familiaPublica' },
            resposta: 'A escola murmura. Alguns te respeitam mais. Outros se afastam.',
            entradaDiario: 'Tornei pública a ligação da minha família com a Ordem. Dumbledore (do retrato) assentiu com aprovação. O castelo agora me olha diferente.',
          },
          {
            id: 'familia_secreta',
            texto: '🤫 Manter em segredo por ora',
            efeito: { rel: { snape: +15, hermione: -15 }, flag: 'familiaSecreta' },
            resposta: 'Snape te encontra depois: "Decisão sábia. Por enquanto."',
            entradaDiario: 'Guardei segredo sobre a minha família. Snape aprovou. Hermione suspeita que sei mais do que conto — ela não está errada.',
          },
          {
            id: 'familia_investigar',
            texto: '🔎 Investigar a conexão antes de qualquer coisa',
            efeito: { rel: { luna: +20, hermione: +10 }, flag: 'familiaInvestigada' },
            resposta: 'Luna Lovegood aparece. "Eu sabia que você viria. Encontrei algo interessante."',
            entradaDiario: 'Decidi investigar antes de qualquer coisa. Luna apareceu com um mapa que não deveria existir. Como ela sempre sabe?',
          },
        ],
      },
      {
        id: 'c2_luna',
        tipo: 'narrativa',
        art: '🌙',
        texto: `Luna (agora Magizoologista e consultora de Hogwarts) te mostra um mapa que rastreou por meses: pontos de energia ancestral concentrados em cinco locais do castelo. Quando conectados, formam o símbolo da Ordem.

"O interessante", ela diz com seu sorriso eterno, "é que o centro do símbolo é exatamente onde você dorme todo dia."

Seu dormitório. O ritual começou há muito mais tempo do que ninguém imaginava.`,
        avancar: true,
      },
      {
        id: 'c2_batalha',
        tipo: 'batalha_narrativa',
        art: '🕵️',
        texto: `O infiltrado age. Na saída do Grande Salão, um Auror corrompido — alguém que você reconhecia como confiável — conjura uma barreira e ataca sem aviso.

"A Ordem paga melhor do que o Ministério. Desculpe."`,
        inimigo: {
          id        : 'auror_corrompido',
          nome      : 'Auror Renegado',
          art       : '🕵️',
          hpMax     : 420,
          atk       : [30, 48],
          xp        : 0,
          ouro      : 200,
          habilidade: 'esquiva',
          dificuldade: 4,
          boss      : true,
          fala      : 'Você poderia ter ficado fora disso. Agora é tarde.',
        },
        vitoria: { flag: 'aurorDerrotado', texto: 'Ele cai. Antes de perder a consciência: "Há sete deles dentro do castelo. Sete."' },
      },
    ],
  },

  cap3: {
    id: 'cap3',
    titulo: '⚗️ Capítulo III — O Preço do Conhecimento',
    subtitulo: 'Algumas verdades não libertam. Aprisionam.',
    cenas: [
      {
        id: 'c3_snape',
        tipo: 'narrativa',
        art: '🖼️',
        texto: `O retrato de Snape te chama sozinho. Sua voz de tinta e encantamento parece mais pesada do que nunca.

"Eu servi dois mestres durante toda a minha vida. O terceiro me matou. Você está prestes a fazer o mesmo erro que eu — acreditar que pode servir a todos sem custo pessoal."

Ele pausa.

"O fundador que criou a Ordem das Sombras era de Slytherin. E seu objetivo original era proteção — não poder. Algo corrompeu a Ordem. E esse algo ainda está dentro deste castelo... em forma humana."`,
        avancar: true,
      },
      {
        id: 'c3_ritual',
        tipo: 'escolha',
        art: '🕯️',
        texto: `Você encontra a Câmara Inferior. Lá, a surpresa: os três estudantes desaparecidos estão presos em pilares de luz — vivos, mas congelados. E no centro da câmara, um altar com o Livro das Sombras.

Para libertá-los, o ritual exige um sacrifício de poder: o bruxo mais poderoso deve temporariamente ceder parte de sua magia.

Isso te enfraquecerá significativamente para o confronto final.`,
        opcoes: [
          {
            id: 'sacrificar_poder',
            texto: '💫 Fazer o sacrifício — libertar os três agora',
            efeito: { rel: { dumbledore: +30, neville: +25, hermione: +20 }, flag: 'sacrificioFeito', penalidade: { mpMax: -20, hpMax: -15 } },
            resposta: 'Uma onda de calor te varre. Você sente algo sair de você — mas os três caem livres. Vale.',
            entradaDiario: 'Fiz o sacrifício. Perdi algo que não sei se vai voltar. Mas os três estudantes estão livres. Neville me abraçou. Hermione chorou.',
          },
          {
            id: 'adiar_sacrificio',
            texto: '⏳ Esperar — precisa estar forte para o final',
            efeito: { rel: { dumbledore: -15, neville: -10, draco: +10 }, flag: 'sacrificioAdiado' },
            resposta: 'Os estudantes continuam presos. Neville te olha diferente agora.',
            entradaDiario: 'Não fiz o sacrifício. Neville me olhou como se eu fosse outra pessoa. Talvez seja. Mas preciso estar forte para o que vem.',
          },
          {
            id: 'buscar_alternativa',
            texto: '🔮 Procurar outra forma — não aceitar os termos do ritual',
            efeito: { rel: { luna: +30, snape: +20, hermione: +10 }, flag: 'alternativaBuscada' },
            resposta: 'Luna sussurra: "Há sempre outra forma. O livro é antigo, mas não infalível."',
            entradaDiario: 'Recusei os termos do ritual. Luna disse que havia outra forma. Snape (do retrato) disse que era a única escolha que ele teria feito diferente.',
          },
        ],
      },
      {
        id: 'c3_revelacao',
        tipo: 'narrativa',
        art: '😱',
        texto: `A verdade se revela de forma brutal:

O professor que requisitou o livro da Seção Restrita... é Neville Longbottom.

Não o Neville que você conhece. Algo assumiu seu lugar há semanas. O verdadeiro Neville está na câmara. Era o quarto estudante desaparecido. Eles não precisavam de você como âncora.

Precisavam de você como distração.

E funcionou.`,
        avancar: true,
      },
      {
        id: 'c3_batalha',
        tipo: 'batalha_narrativa',
        art: '🪬',
        texto: `O impostor-Neville abandona a disfarce. Não é um bruxo comum — é o Arauto da Ordem, um ser que habita corpos como outros habitam roupas.

Sua forma verdadeira é algo entre humano e sombra.

"Você foi brilhante. Para um instrumento."`,
        inimigo: {
          id        : 'arauto_ordem',
          nome      : 'Arauto da Ordem',
          art       : '👁️',
          hpMax     : 520,
          atk       : [36, 56],
          xp        : 0,
          ouro      : 500,
          habilidade: 'dreno_mp',
          dificuldade: 5,
          boss      : true,
          fala      : 'Cada escolha que você fez era uma peça minha. Livre-arbítrio é um conto de fadas.',
        },
        vitoria: { flag: 'arautoDerrrotado', texto: 'O Arauto se fragmenta em ecos. Do seu interior cai algo: uma chave de osso negro com o símbolo da Ordem.' },
      },
    ],
  },

  cap4: {
    id: 'cap4',
    titulo: '🌑 Capítulo IV — A Torre da Origem',
    subtitulo: 'Toda ordem tem um fundador. Todo fundador tem um preço.',
    cenas: [
      {
        id: 'c4_1',
        tipo: 'narrativa',
        art: '🗝️',
        texto: `A chave de osso abre uma porta que não existia antes — ou que sempre existiu, invisível, na base da Torre Norte. Você desce, não sobe. Abaixo de Hogwarts, mais fundo do que os calabouços, mais antigo do que os fundadores.

Uma câmara circular. Quatro tronos de pedra. Três estão vazios. No quarto, algo senta que não é exatamente vivo: o Guardião da Ordem, um feitiço feito consciência há mil anos.

"Você matou meu Arauto", ele diz, sem raiva. "Isso significa que está pronto para ouvir a verdade."`,
        avancar: true,
      },
      {
        id: 'c4_verdade',
        tipo: 'escolha',
        art: '⚖️',
        texto: `O Guardião explica: a Ordem das Sombras é um sistema de equilíbrio. A magia do mundo tem um custo. A cada geração, um bruxo extraordinário deve absorver o excesso de magia acumulado, ou o mundo mágico entraria em colapso.

Voldemort foi um candidato que recusou e tentou inverter o ritual. Os estudantes desaparecidos eram candidatos anteriores que falharam nos testes.

Você passou em todos.

"A escolha é sua. Sempre foi."`,
        opcoes: [
          {
            id: 'aceitar_fardo',
            texto: '✨ Aceitar o papel de Guardião desta geração',
            efeito: { rel: { dumbledore: +40 }, flag: 'fardoAceito', final: 'equilibrio' },
            resposta: 'O Guardião inclina a cabeça. "Finalmente. Em mil anos... finalmente."',
            entradaDiario: 'Aceitei ser o Guardião. Hogwarts respirou diferente quando disse sim. Sinto o castelo em mim agora — ou eu nele.',
          },
          {
            id: 'destruir_sistema',
            texto: '🔥 Destruir o ritual — a humanidade decide seu próprio destino',
            efeito: { rel: { draco: +30, luna: +20 }, flag: 'sistemaDestruido', final: 'luz' },
            resposta: 'O Guardião treme. "Você não sabe o que está fazendo. O equilíbrio vai—" Você não espera.',
            entradaDiario: 'Destruí o ritual. O Guardião implorou. Não me arrependo — mil anos de prisão disfarçada de destino. Draco sorriu quando contei.',
          },
          {
            id: 'assumir_controle',
            texto: '👑 Assumir o controle do sistema — reescrever as regras',
            efeito: { rel: { snape: +20, draco: +20 }, flag: 'controleAssumido', final: 'sombra' },
            resposta: 'O Guardião recua. Nunca viu isso antes. Ninguém tentou antes.',
            entradaDiario: 'Ninguém tentou reescrever o sistema antes. Agora fui eu. Snape disse que era o que ele teria feito. Não sei se isso é um elogio.',
          },
        ],
      },
      {
        id: 'c4_aliados',
        tipo: 'narrativa_condicional',
        art: '🧑‍🤝‍🧑',
        texto: `Antes do confronto final, seus aliados chegam. Quem aparece depende das escolhas que você fez ao longo da jornada.`,
        avancar: true,
      },
    ],
  },

  cap5: {
    id: 'cap5',
    titulo: '⚡ Capítulo V — O Confronto Final',
    subtitulo: 'Mil anos de história. Uma escolha. O mundo muda.',
    cenas: [
      {
        id: 'c5_inicio',
        tipo: 'narrativa',
        art: '🌌',
        texto: `A câmara se transforma. O Guardião precisa ser enfrentado em sua forma verdadeira antes que qualquer coisa mude. É o teste final, imposto pelo próprio feitiço:

"Nenhuma mudança vem sem luta. É a lei mais antiga."

As quatro paredes desaparecem. Você está em algum lugar entre Hogwarts e o além — o espaço onde o Véu Interior toca o mundo real.

Seus aliados enviam magia à distância. Você sente o calor deles.

É hora.`,
        avancar: true,
      },
      {
        id: 'c5_batalha_final',
        tipo: 'batalha_narrativa',
        art: '🌌',
        texto: `O Guardião da Ordem em forma verdadeira não é um homem. É uma tempestade com rosto — o acúmulo de toda magia residual de mil anos de bruxaria.

Ele não quer te matar. Quer te absorver.

E essa pode ser a distinção mais importante da sua vida.`,
        inimigo: {
          id        : 'guardiao_ordem',
          nome      : 'Guardião da Ordem — Forma Verdadeira',
          art       : '🌌',
          hpMax     : 700,
          atk       : [42, 65],
          xp        : 800,
          ouro      : 2000,
          habilidade: 'reflexo',
          dificuldade: 5,
          boss      : true,
          fala      : 'Mil anos de espera. Você é o mais digno que já veio. Por isso vai doer mais.',
        },
        vitoria: { flag: 'guardiaoFinalDerrotado', texto: 'A tempestade silencia. O espaço entre mundos para. Você ainda está de pé.' },
      },
      {
        id: 'c5_final',
        tipo: 'final',
        art: '✨',
        texto: `O que vem depois depende de quem você se tornou.`,
        avancar: false,
      },
    ],
  },
};

// ── FINAIS ──
const FINAIS = {
  equilibrio: {
    id    : 'equilibrio',
    titulo: '⚖️ O Guardião do Equilíbrio',
    art   : '⚖️',
    texto : `Você absorve o papel. Não desaparece — transforma-se. Uma parte de você é sempre Hogwarts agora. Uma parte de Hogwarts é sempre você.

Os três estudantes são libertados. Neville — o real — acorda com memórias completas mas sem explicação.

McGonagall te encontra no jardim ao amanhecer.

"Como você se sente?"

Você pensa um momento. O castelo respira ao seu redor — literalmente.

"Em casa."

Ela sorri. "Bem. Porque isso nunca vai embora."

E assim, silenciosamente, o maior segredo de Hogwarts encontra seu guardião desta geração. Não com batalha ou glória — mas com escolha. E isso faz toda a diferença.`,
    recompensa: { ouro: 5000, xp: 3000, titulo: '⚖️ Guardião do Equilíbrio' },
  },

  luz: {
    id    : 'luz',
    titulo: '☀️ O Libertador',
    art   : '☀️',
    texto : `O ritual explode em luz. Milênios de magia acumulada se dispersam pelo mundo — não concentrada em um guardião, mas livre, disponível a todos.

O custo é imediato: você fica sem magia por três dias. Três dias em que qualquer ataque poderia te matar.

Mas ninguém ataca. Porque todos viram o que você fez.

Draco aparece primeiro. Depois Luna. Depois Hermione. Então estudantes que você mal conhecia. Formam um círculo ao seu redor — não de proteção, mas de gratidão.

"Você quebrou uma prisão que nem sabíamos que tínhamos", diz Luna.

Sua magia volta lentamente. Diferente. Mais leve. Como se também fosse mais livre agora.`,
    recompensa: { ouro: 8000, xp: 4000, titulo: '☀️ O Libertador' },
  },

  sombra: {
    id    : 'sombra',
    titulo: '👑 Arquiteto das Sombras',
    art   : '👑',
    texto : `Você reescreve as regras. O ritual continua — mas em seus termos. O custo de poder deixa de recair em um único ser e é distribuído entre os mais poderosos de cada geração.

O Guardião, pela primeira vez em mil anos, parece genuinamente surpreso.

"Ninguém tentou isso antes."

"Eu sei."

O sistema não é destruído. É reformado. E você está no centro dele — não como vítima, não como ferramenta, mas como arquiteto.

Snape, do seu retrato, te olha por um longo momento.

"Isso", ele diz, "é o que eu teria feito. Se tivesse chegado até aqui."

Não é um elogio. É algo melhor: é reconhecimento.`,
    recompensa: { ouro: 6000, xp: 3500, titulo: '👑 Arquiteto das Sombras' },
  },
};

// ── FALAS CONTEXTUAIS DOS NPCs ──
const NPC_FALAS = {
  dumbledore: {
    alto   : '✨ "Você tem feito escolhas extraordinárias. Exatamente o que esperávamos."',
    medio  : '📜 "Continue. O caminho nunca é direto, mas sempre chega."',
    baixo  : '😔 "Estou... decepcionado. Mas ainda tenho fé."',
    critico: '⚠️ "Há escolhas que não podem ser desfeitas. Espero que saiba disso."',
  },
  hermione: {
    alto   : '📚 "Você pesquisou antes de agir. Estou impressionada — e aliviada."',
    medio  : '🤔 "Não concordo com tudo, mas entendo. Continue."',
    baixo  : '😤 "Às vezes sua impulsividade me preocupa mais do que os inimigos."',
    critico: '😠 "Isso foi irresponsável. Completamente irresponsável."',
  },
  snape: {
    alto   : '🖼️ "...Adequado. Não esperava menos. Mas não esperava mais."',
    medio  : '😒 "Mediano. Mas vivo. Suponho que isso seja suficiente."',
    baixo  : '💀 "Imbecil. Exatamente o que um estudante faria."',
    critico: '😡 "Você está determinado a me envergonhar mesmo após minha morte."',
  },
  neville: {
    alto   : '🌿 "Você é incrível. Sério. Fico feliz de estar do seu lado."',
    medio  : '😊 "Okay. Não sei se faria igual, mas confio em você."',
    baixo  : '😟 "Ei... tudo bem? Parece que você tá carregando tudo sozinho."',
    critico: '😰 "Preciso ser honesto — algumas das suas escolhas me assustam."',
  },
  luna: {
    alto   : '🌙 "As Estrelas Dançantes me disseram que você faria a escolha certa. Elas não erram."',
    medio  : '⭐ "Não é a escolha que eu faria, mas o universo tem muitos caminhos."',
    baixo  : '🌑 "Às vezes as sombras nos escolhem antes de nós escolhermos a luz."',
    critico: '🌀 "Cuidado. Os Nargletes são atraídos por quem está desequilibrado."',
  },
  draco: {
    alto   : '😏 "Não diria que você me surpreendeu. Mas... sim. Surpreendeu."',
    medio  : '😐 "Funcional. Não elegante, mas funcional."',
    baixo  : '🙄 "Esperava mais do bruxo mais poderoso de Hogwarts."',
    critico: '😤 "Se um Malfoy tivesse feito isso, ainda estaria ouvindo sobre isso."',
  },
  ginny: {
    alto   : '⚡ "Você tem o tipo de coragem que Harry teria adorado. Não é um elogio fácil de dar."',
    medio  : '😊 "Continue. Você está no caminho certo."',
    baixo  : '😬 "Harry cometeu erros assim também. Não acabou tão mal para ele."',
    critico: '😤 "Sabe o que ele teria dito? Nada. Ele teria só te olhado com aquele olhar."',
  },
};

function getFalaRel(npcId, valor) {
  const falas = NPC_FALAS[npcId];
  if (!falas) return null;
  if (valor >= 40)  return falas.alto;
  if (valor >= 10)  return falas.medio;
  if (valor >= -10) return falas.baixo;
  return falas.critico;
}

// ── FEEDBACK VISUAL DE RELACIONAMENTOS (MELHORIA) ──
// Mostra mini-toast com impacto da escolha
function mostrarFeedbackRelacionamento(efeitoRel) {
  if (!efeitoRel || Object.keys(efeitoRel).length === 0) return;

  const npcNames = {
    dumbledore:'Dumbledore', hermione:'Hermione', snape:'Snape',
    neville:'Neville', luna:'Luna', draco:'Draco', ginny:'Ginny'
  };
  const npcIcons = {
    dumbledore:'🌟', hermione:'📚', snape:'🖼️',
    neville:'🌿', luna:'🌙', draco:'🐉', ginny:'⚡'
  };

  const linhas = Object.entries(efeitoRel)
    .filter(([npc]) => npcNames[npc])
    .map(([npc, val]) => {
      const sinal = val > 0 ? `<span style="color:#7dff9a">+${val}</span>` : `<span style="color:#ff7d7d">${val}</span>`;
      return `${npcIcons[npc]} ${npcNames[npc]} ${sinal}`;
    })
    .join(' &nbsp;·&nbsp; ');

  const container = document.getElementById('rel-feedback-toast');
  if (!container) return;

  container.innerHTML = linhas;
  container.classList.add('visible');
  setTimeout(() => container.classList.remove('visible'), 2800);
}

// ══════════════════════════════════════════
//  CONTROLLER DA CAMPANHA
// ══════════════════════════════════════════

function iniciarCampanha() {
  if (G.nivel < 50) {
    notif('🔒 A Campanha requer Nível 50!');
    return;
  }
  if (!G.campanha) G.campanha = campanhaInicial();
  if (G.campanha.concluida) {
    mostrarFinalCampanha(G.campanha.finalObtido);
    return;
  }
  G.campanha.iniciada = true;
  G.campanha.capitulo = G.campanha.capitulo || 'prologo';
  G.campanha.cena     = G.campanha.cena     || 0;
  saveGame();
  go('s-campanha');
  renderCampanha();
}

function getCenasCapitulo(capId) {
  return CAMPANHA[capId]?.cenas || [];
}

function getCapituloAtual() {
  return CAMPANHA[G.campanha.capitulo];
}

function getCenaAtual() {
  const cap = getCapituloAtual();
  if (!cap) return null;
  return cap.cenas[G.campanha.cena] || null;
}

function avancarCena() {
  const cap = getCapituloAtual();
  if (!cap) return;

  if (G.campanha.cena + 1 < cap.cenas.length) {
    G.campanha.cena++;
  } else {
    const ordem = ['prologo','cap1','cap2','cap3','cap4','cap5'];
    const idx   = ordem.indexOf(G.campanha.capitulo);
    if (idx < 0 || idx >= ordem.length - 1) {
      concluirCampanha();
      return;
    }
    G.campanha.capitulo = ordem[idx + 1];
    G.campanha.cena     = 0;
  }

  // Checkpoint por cena — nunca perde progresso
  queueAutoSave(400);
  renderCampanha();
}

function processarEscolhaCampanha(opcaoId) {
  const cena = getCenaAtual();
  if (!cena || !cena.opcoes) return;

  const opcao = cena.opcoes.find(o => o.id === opcaoId);
  if (!opcao) return;

  G.campanha.escolhas[cena.id] = opcaoId;

  const ef = opcao.efeito || {};

  if (ef.rel) {
    for (const [npc, val] of Object.entries(ef.rel)) {
      G.campanha.relacionamentos[npc] = Math.max(-100, Math.min(100,
        (G.campanha.relacionamentos[npc] || 0) + val
      ));
    }
    // MELHORIA: Mostrar feedback visual imediatamente
    mostrarFeedbackRelacionamento(ef.rel);
  }

  if (ef.flag && !G.campanha.flagsAtivos.includes(ef.flag)) {
    G.campanha.flagsAtivos.push(ef.flag);
  }

  if (ef.penalidade) {
    if (ef.penalidade.mpMax) { G.mpMax = Math.max(40, G.mpMax + ef.penalidade.mpMax); G.mp = Math.min(G.mp, G.mpMax); }
    if (ef.penalidade.hpMax) { G.hpMax = Math.max(80, G.hpMax + ef.penalidade.hpMax); G.hp = Math.min(G.hp, G.hpMax); }
  }

  if (ef.final) G.campanha._finalPendente = ef.final;

  G.campanha.diarioCampanha.push({
    capitulo  : G.campanha.capitulo,
    cenaId    : cena.id,
    escolhaId : opcaoId,
    texto     : opcao.texto,
    ts        : Date.now(),
  });

  // MELHORIA: Adicionar entrada personalizada ao diário do jogo
  if (opcao.entradaDiario && typeof adicionarDiarioPersonalizado === 'function') {
    adicionarDiarioPersonalizado(opcao.entradaDiario);
  }

  mostrarRespostaEscolha(opcao.resposta, () => {
    avancarCena();
  });
}

// ── BATALHA DA CAMPANHA ──
function iniciarBatalhaCampanhaAtual() {
  if (!_inimigoCache) {
    notif('Erro: inimigo não encontrado.');
    return;
  }
  iniciarBatalhaCampanha(_inimigoCache);
}

function iniciarBatalhaCampanha(inimigo) {
  const f    = 1 + Math.log(Math.max(1, G.nivel)) * 0.4;
  const boss = {
    ...inimigo,
    hpMax : Math.floor(inimigo.hpMax * f),
    atk   : [Math.floor(inimigo.atk[0] * f), Math.floor(inimigo.atk[1] * f)],
  };
  boss.hp = boss.hpMax;

  G.inimigo  = { ...boss };
  G.inBattle = true;
  G._batalha_campanha = true;  // FIX: setado aqui, apenas aqui

  G.escudoArcanoAtivo     = getBonusHabilidades().escudoArcano > 0;
  G.ressurgirUsado        = false;
  G.ressurgirMascoteUsado = false;
  G.venenoTurnos          = 0;
  G.escudoInimigo         = false;
  G.esquivaInimigo        = false;
  G.transcendenciaAtiva   = false;
  G.momentumAtual         = 0;
  G.momentumCarregado     = false;

  go('s-battle');
  renderBattle();
  clearLog();
  addLog(`⚔️ Batalha da Campanha — ${boss.nome}!`, 'info');
  if (inimigo.fala) addLog(`"${inimigo.fala}"`, 'warn');
}

// FIX: checarVitoriaCampanha é chamado diretamente em vencerBatalha() no game.js
// não mais como patch externo
function vitoriaBatalhaCampanha() {
  const cena = getCenaAtual();
  if (!cena) return;

  const flag = cena.vitoria?.flag;
  if (flag && !G.campanha.flagsAtivos.includes(flag)) {
    G.campanha.flagsAtivos.push(flag);
  }

  if (G.inimigo?.ouro > 0) G.ouro += G.inimigo.ouro;

  G.inBattle = false;
  _inimigoCache = null;

  mostrarNarrativa(
    '⚔️ Vitória!',
    cena.vitoria?.texto || 'Você venceu.',
    () => {
      avancarCena();
      go('s-campanha');
      renderCampanha();
    }
  );
}

function concluirCampanha() {
  const finalId = G.campanha._finalPendente || determinarFinalAutomatico();
  G.campanha.concluida   = true;
  G.campanha.finalObtido = finalId;

  const final = FINAIS[finalId];
  if (final?.recompensa) {
    G.ouro += final.recompensa.ouro;
    G.xp   += final.recompensa.xp;
    if (typeof verificarLevelUp === 'function') verificarLevelUp();
  }

  if (!G.conquistasDesbloqueadas.includes('campanha_concluida')) {
    G.conquistasDesbloqueadas.push('campanha_concluida');
  }

  saveGame();
  mostrarFinalCampanha(finalId);
}

function determinarFinalAutomatico() {
  const rel  = G.campanha.relacionamentos;
  const luz  = (rel.dumbledore + rel.hermione + rel.neville + rel.ginny) / 4;
  const somb = (rel.snape + rel.draco) / 2;
  if (Math.abs(luz - somb) < 15) return 'equilibrio';
  return luz > somb ? 'luz' : 'sombra';
}

// ══════════════════════════════════════════
//  RENDERIZAÇÃO
// ══════════════════════════════════════════

function renderCampanha() {
  const c = G.campanha;
  if (!c || !c.iniciada) return;

  const cap  = getCapituloAtual();
  const cena = getCenaAtual();
  const el   = document.getElementById('campanha-content');
  if (!el) return;

  if (!cap || !cena) { concluirCampanha(); return; }

  const totalCenas = getCenasCapitulo(c.capitulo).length;
  const headerHTML = `
    <div class="cap-header">
      <div class="cap-kicker">${cap.titulo}</div>
      <div class="cap-subtitulo">${cap.subtitulo}</div>
      <div class="cap-progress">
        ${Array.from({ length: totalCenas }, (_, i) =>
          `<div class="cap-dot ${i < c.cena ? 'done' : i === c.cena ? 'atual' : ''}"></div>`
        ).join('')}
      </div>
    </div>`;

  // ── NARRATIVA ──
  if (cena.tipo === 'narrativa') {
    el.innerHTML = headerHTML + `
      <div class="cena-box">
        <div class="cena-art">${cena.art}</div>
        <div class="cena-texto">${cena.texto.replace(/\n/g, '<br>')}</div>
      </div>
      <button class="btn btn-center camp-btn" onclick="avancarCena()">Continuar →</button>`;
    return;
  }

  // ── NARRATIVA CONDICIONAL (aliados) ──
  if (cena.tipo === 'narrativa_condicional') {
    el.innerHTML = headerHTML + `
      <div class="cena-box">
        <div class="cena-art">${cena.art}</div>
        <div class="cena-texto">${cena.texto.replace(/\n/g, '<br>')}</div>
      </div>
      ${renderAliados()}
      <button class="btn btn-center camp-btn" style="margin-top:.8rem" onclick="avancarCena()">Continuar →</button>`;
    return;
  }

  // ── ESCOLHA ──
  if (cena.tipo === 'escolha') {
    const jaEscolheu = c.escolhas[cena.id];

    // MELHORIA: Mostrar prévia do impacto nos relacionamentos ao hover
    const opcoesHTML = cena.opcoes.map(op => {
      const efRel = op.efeito?.rel || {};
      const npcIcons = {dumbledore:'🌟',hermione:'📚',snape:'🖼️',neville:'🌿',luna:'🌙',draco:'🐉',ginny:'⚡'};
      const previewRel = Object.entries(efRel)
        .map(([npc, val]) => `${npcIcons[npc]||''}${val > 0 ? '+'+val : val}`)
        .join(' ');

      return `
        <button class="btn btn-full opcao-camp" onclick="processarEscolhaCampanha('${op.id}')">
          <div style="flex:1">${op.texto}</div>
          ${previewRel ? `<div class="opcao-rel-preview">${previewRel}</div>` : ''}
        </button>`;
    }).join('');

    el.innerHTML = headerHTML + `
      <div class="cena-box">
        <div class="cena-art">${cena.art}</div>
        <div class="cena-texto">${cena.texto.replace(/\n/g, '<br>')}</div>
      </div>
      ${jaEscolheu ? `
        <div class="escolha-feita">✅ Escolha registrada — avançando...</div>
        <button class="btn btn-center camp-btn" onclick="avancarCena()">Continuar →</button>
      ` : `
        <div class="opcoes-campanha">${opcoesHTML}</div>
      `}`;
    return;
  }

  // ── BATALHA NARRATIVA ──
  if (cena.tipo === 'batalha_narrativa') {
    _inimigoCache = cena.inimigo;

    const jaVenceu = c.flagsAtivos.includes(cena.vitoria?.flag);

    el.innerHTML = headerHTML + `
      <div class="cena-box">
        <div class="cena-art">${cena.art}</div>
        <div class="cena-texto">${cena.texto.replace(/\n/g, '<br>')}</div>
      </div>
      ${jaVenceu ? `
        <div class="batalha-concluida">⚔️ Batalha concluída.</div>
        <button class="btn btn-center camp-btn" onclick="avancarCena()">Continuar →</button>
      ` : `
        <div class="inimigo-preview">
          <span style="font-size:40px">${cena.inimigo.art}</span>
          <div class="inimigo-nome">${cena.inimigo.nome}</div>
          <div class="inimigo-stats">
            HP: ~${cena.inimigo.hpMax} escalado · ${'⭐'.repeat(cena.inimigo.dificuldade)}
          </div>
          <div class="inimigo-fala">"${cena.inimigo.fala}"</div>
        </div>
        <button class="btn btn-center camp-btn" onclick="iniciarBatalhaCampanhaAtual()">
          ⚔️ Entrar em Batalha
        </button>
      `}`;
    return;
  }

  // ── FINAL ──
  if (cena.tipo === 'final') {
    concluirCampanha();
  }
}

function renderAliados() {
  const rel  = G.campanha.relacionamentos;
  const npcs = [
    { id:'dumbledore', nome:'Dumbledore',  icon:'🌟' },
    { id:'hermione',   nome:'Hermione',    icon:'📚' },
    { id:'snape',      nome:'Snape',       icon:'🖼️' },
    { id:'neville',    nome:'Neville',     icon:'🌿' },
    { id:'luna',       nome:'Luna',        icon:'🌙' },
    { id:'draco',      nome:'Draco',       icon:'🐉' },
    { id:'ginny',      nome:'Ginny',       icon:'⚡' },
  ];

  const ativos = npcs.filter(n => (rel[n.id] || 0) > 10);

  return `
    <div class="aliados-box">
      <div class="aliados-label">Aliados presentes:</div>
      <div class="aliados-lista">
        ${ativos.length > 0
          ? ativos.map(n => {
            const v = rel[n.id] || 0;
            const pct = Math.max(0, Math.min(100, (v+100)/2));
            return `<div class="aliado-chip">
              ${n.icon} ${n.nome}
              <div class="rel-bar" style="width:${pct}%;background:${v>=0?'#7dff9a':'#ff7d7d'}"></div>
            </div>`;
          }).join('')
          : '<span style="opacity:.4;font-style:italic">Nenhum aliado forte neste momento.</span>'
        }
      </div>
    </div>`;
}

function mostrarRespostaEscolha(texto, callback) {
  document.getElementById('modal-titulo').textContent = '✨ Resultado';
  document.getElementById('modal-msg').textContent    = texto;
  const btn = document.getElementById('modal-btn');
  btn.textContent = 'Continuar →';
  btn.onclick = () => {
    fecharModal();
    btn.textContent = 'OK';
    btn.onclick = fecharModal;
    if (callback) callback();
  };
  document.getElementById('modal-evento').style.display = 'flex';
}

function mostrarFinalCampanha(finalId) {
  const final = FINAIS[finalId];
  if (!final) return;

  go('s-campanha-final');
  const el = document.getElementById('campanha-final-content');
  if (!el) return;

  const rel     = G.campanha.relacionamentos;
  const relNpcs = Object.entries(rel).filter(([, v]) => v !== 0).sort((a, b) => b[1] - a[1]);
  const npcNames = {
    dumbledore:'Dumbledore 🌟', hermione:'Hermione 📚', snape:'Snape 🖼️',
    neville:'Neville 🌿', luna:'Luna 🌙', draco:'Draco 🐉', ginny:'Ginny ⚡'
  };

  el.innerHTML = `
    <div class="final-wrap">
      <div class="final-art">${final.art}</div>
      <div class="final-titulo">${final.titulo}</div>
      <div class="final-texto">${final.texto.replace(/\n/g, '<br>')}</div>

      <div class="final-relacoes">
        <div class="rel-label">Relacionamentos ao fim:</div>
        ${relNpcs.map(([npc, val]) => {
          const pct = Math.max(0, Math.min(100, (val + 100) / 2));
          return `
            <div class="rel-row">
              <span class="rel-nome">${npcNames[npc] || npc}</span>
              <div class="rel-track">
                <div class="rel-fill" style="width:${pct}%;background:${val >= 0 ? '#7dff9a' : '#ff7d7d'}"></div>
              </div>
              <span class="rel-val">${val > 0 ? '+' : ''}${val}</span>
            </div>`;
        }).join('')}
      </div>

      <div class="final-recompensa">
        <div>🪙 +${final.recompensa.ouro.toLocaleString()}</div>
        <div>⭐ +${final.recompensa.xp.toLocaleString()} XP</div>
        <div>${final.recompensa.titulo}</div>
      </div>

      <button class="btn btn-center camp-btn" style="margin-top:1rem" onclick="go('s-map');renderMap()">
        ← Voltar ao Mapa
      </button>
    </div>`;
}

// ── Painel de status no mapa ──
function renderCampanhaStatus() {
  const c = G.campanha;
  if (!c || !c.iniciada) return '';
  const cap = CAMPANHA[c.capitulo];
  if (!cap) return '';
  const aliados = Object.values(c.relacionamentos).filter(v => v > 20).length;
  return `
    <div class="camp-status-bar">
      <span>📖 ${cap.titulo}</span>
      <span>🤝 ${aliados} aliados fortes</span>
      ${c.concluida
        ? `<span style="color:#7dff9a">✅ Concluída — ${FINAIS[c.finalObtido]?.titulo || ''}</span>`
        : ''}
    </div>`;
}

// ── Relacionamentos (modal) ──
function mostrarRelacionamentos() {
  if (!G.campanha) return;
  const rel  = G.campanha.relacionamentos;
  const npcs = [
    { id:'dumbledore', nome:'Dumbledore',  icon:'🌟' },
    { id:'hermione',   nome:'Hermione',    icon:'📚' },
    { id:'snape',      nome:'Snape',       icon:'🖼️' },
    { id:'neville',    nome:'Neville',     icon:'🌿' },
    { id:'luna',       nome:'Luna',        icon:'🌙' },
    { id:'draco',      nome:'Draco',       icon:'🐉' },
    { id:'ginny',      nome:'Ginny',       icon:'⚡' },
  ];

  document.getElementById('modal-titulo').textContent = '🤝 Relacionamentos';
  document.getElementById('modal-msg').innerHTML = `
    <div style="font-size:10px;opacity:.45;margin-bottom:.6rem;font-family:'Cinzel',serif;letter-spacing:1px">
      Suas escolhas definem quem estará ao seu lado.
    </div>
    ${npcs.map(n => {
      const val  = rel[n.id] || 0;
      const pct  = Math.max(0, Math.min(100, (val + 100) / 2));
      const fala = getFalaRel(n.id, val);
      return `
        <div style="margin-bottom:.7rem">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:13px">${n.icon}</span>
            <span style="font-family:'Cinzel',serif;font-size:11px">${n.nome}</span>
            <span style="font-size:10px;opacity:.4;margin-left:auto">${val > 0 ? '+' : ''}${val}</span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-bottom:3px">
            <div style="width:${pct}%;height:100%;background:${val >= 30 ? '#7dff9a' : val >= 0 ? '#ffd07d' : '#ff7d7d'};border-radius:3px;transition:width .4s"></div>
          </div>
          ${fala ? `<div style="font-size:11px;opacity:.6;font-style:italic;line-height:1.4">${fala}</div>` : ''}
        </div>`;
    }).join('')}`;
  document.getElementById('modal-btn').textContent = 'Fechar';
  document.getElementById('modal-btn').onclick = fecharModal;
  document.getElementById('modal-evento').style.display = 'flex';
}

// ── Diário da campanha (modal) ──
function mostrarDiarioCampanha() {
  if (!G.campanha) return;
  const logs = G.campanha.diarioCampanha || [];
  document.getElementById('modal-titulo').textContent = '📓 Diário da Campanha';
  document.getElementById('modal-msg').innerHTML = logs.length === 0
    ? '<p style="opacity:.4;font-style:italic">Nenhuma escolha registrada ainda.</p>'
    : `<div style="max-height:220px;overflow-y:auto;font-size:12px;line-height:1.7;text-align:left">
        ${[...logs].reverse().map(l => `
          <div style="margin-bottom:.7rem;padding-bottom:.5rem;border-bottom:1px solid rgba(255,255,255,.06)">
            <div style="font-family:'Cinzel',serif;font-size:9px;opacity:.35;margin-bottom:2px">
              ${CAMPANHA[l.capitulo]?.titulo || l.capitulo}
            </div>
            <div style="opacity:.8">${l.texto}</div>
            <div style="font-size:9px;opacity:.3;margin-top:2px">${new Date(l.ts).toLocaleString('pt-BR')}</div>
          </div>`).join('')}
      </div>`;
  document.getElementById('modal-btn').textContent = 'Fechar';
  document.getElementById('modal-btn').onclick = fecharModal;
  document.getElementById('modal-evento').style.display = 'flex';
}

const renderCena = renderCampanha;
