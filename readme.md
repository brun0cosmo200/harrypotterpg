🏰 Hogwarts — Guerra dos Olimpianos
RPG de navegador ambientado no universo de Harry Potter. O jogador descobre sua casa pelo Chapéu Seletor e parte para uma aventura por 10 zonas de Hogwarts, enfrentando inimigos escaláveis, comprando equipamentos e aprendendo magias novas.
---
📁 Estrutura de arquivos
```
hogwarts/
├── index.html   ← Estrutura HTML de todas as telas do jogo
├── style.css    ← Todos os estilos e temas das casas
├── data.js      ← Dados estáticos (perguntas, casas, inimigos, loja, zonas)
├── save.js      ← Sistema de save com checksum anti-trapaça
└── game.js      ← Toda a lógica do jogo
```
---
🚀 Como rodar
Abra o `index.html` diretamente no navegador — nenhum servidor ou instalação necessária.
> **Dica no VS Code:** instale a extensão **Live Server** (ritwickdey.liveserver), clique com o botão direito em `index.html` e selecione *Open with Live Server*. Isso evita problemas com módulos e garante hot-reload ao editar os arquivos.
---
🎮 Funcionalidades
Quiz do Chapéu Seletor
5 perguntas com opções embaralhadas aleatoriamente
O resultado define a casa e o tema visual do jogo
4 casas disponíveis: Gryffindor, Slytherin, Ravenclaw e Hufflepuff
Sistema de Combate
Cada casa tem 4 feitiços únicos
Magias aprendidas na loja são adicionadas ao grid de combate (borda dourada)
Inimigos regeneram 5 MP para o jogador a cada ataque recebido
Chance de 50% de fuga bem-sucedida
Progressão
XP e ouro ganhos após cada vitória
Level-up aumenta HP máximo (+20), MP máximo (+10) e cura completamente
Fórmula de XP para próximo nível: `nivel_atual × 110`
Zonas (10 no total)
Zona	Nível Mínimo	Inimigos
Corredores	1	Fantasma, Armadura
Biblioteca Proibida	1	Sombra, Livro Maldito
Floresta Proibida	2	Aragog, Centauro
Lago Negro	3	Grindylow, Sereia Negra
Masmorras	4	Troll, Dementor
Cemitério de Little Hangleton	5	Inferi, Peter Pettigrew
Câmara Secreta	6	Basilisco, Tom Riddle
Ministério da Magia	7	Auror Sombrio, Acromantula
Azkaban	8	Senhor dos Dementores, Bellatrix
Torre do Mago	10	Lord Voldemort
Escalonamento de inimigos
Todos os inimigos têm seus stats multiplicados com base no nível do jogador:
```
fator = 1 + (nivel - 1) × 0.18
hpMax = base.hpMax × fator
atk   = base.atk × fator
xp    = base.xp × (1 + (nivel - 1) × 0.10)
```
Loja do Ollivander
Poções (consumíveis):
Item	Preço	Efeito	Nível
Poção de Cura	20 🪙	+40 HP	1
Poção de Mana	28 🪙	+30 MP	1
Poção Grande	55 🪙	+80 HP	2
Elixir da Força	110 🪙	+60 HP e +40 MP	4
Poção Mestra	250 🪙	HP e MP cheios	6
Equipamentos (permanentes, 1 de cada):
Item	Preço	Efeito	Nível
Amuleto Protetor	70 🪙	+15 HP máximo	2
Pergaminho do Sábio	90 🪙	+10 MP máximo	3
Varinha Reforçada	80 🪙	+10 dano permanente	1
Varinha Ancestral	300.000 🪙	+25 dano permanente	5
Varinha das Varinhas	500.000 🪙	+50 dano permanente	8
> As varinhas precisam ser compradas em ordem (tier 1 → tier 2 → tier 3).
Pergaminhos de Magia (aprendidas permanentemente):
Magia	Preço	Dano	MP	Nível
Bombarda	10.000 🪙	35–55	30	3
Confringo	15.000 🪙	40–60	35	4
Cruciatus	25.000 🪙	45–70	40	5
Fiendfyre	30.000 🪙	55–80	50	6
Priori Incantatem	50.000 🪙	60–90	55	7
Tempestade Arcana	60.000 🪙	70–100	60	8
Marca Negra	80.000 🪙	80–110	70	9
---
💾 Sistema de Save
O progresso é salvo automaticamente no `localStorage` do navegador após cada vitória e compra.
Proteção anti-trapaça
O save usa três camadas de proteção:
Checksum FNV-1a — hash gerado a partir dos campos críticos + chave secreta. Se alguém editar o localStorage manualmente, o hash não bate e o save é descartado.
Sanitização de valores — ao carregar, os dados são validados contra limites máximos razoáveis (HP, MP, ouro, nível, bônus de dano).
Coerência lógica — o HP/MP máximo é checado contra o nível declarado, e o bônus de dano é verificado contra as varinhas registradas como compradas.
> Se qualquer verificação falhar, o save é apagado e o jogador vê um aviso vermelho na tela inicial.
Para invalidar todos os saves antigos (ex: após uma atualização que muda a progressão), altere a constante `_SECRET` em `save.js`.
---
🎨 Temas das casas
Casa	Classe CSS	Fundo	Texto
Gryffindor	`.th-g`	`#2a0a0a`	`#f5d78e`
Slytherin	`.th-s`	`#061a10`	`#b8dfc0`
Ravenclaw	`.th-r`	`#080f2a`	`#bdd0f0`
Hufflepuff	`.th-h`	`#1a1200`	`#ffe99a`
Neutro	`.th-d`	`#12101e`	`#e0d5c5`
---
🛠️ Como expandir
Adicionar um novo inimigo
Em `data.js`, adicione uma entrada em `INIMIGOS_BASE`:
```js
meu_inimigo: { nome: "Nome", art: "🔥", hpMax: 200, atk: [20, 35], xp: 90, ouro: 45 }
```
Depois adicione o id no array `inimigos` da zona desejada.
Adicionar uma nova zona
Em `data.js`, adicione uma entrada em `ZONAS`:
```js
{ id: "minha_zona", nome: "Nome", icon: "🏔️", desc: "Descrição",
  inimigos: ["inimigo1", "inimigo2"], xp: 100, ouro: 50, nivelMin: 5 }
```
Adicionar um novo item à loja
Em `data.js`, adicione em `LOJA_ITENS` com `tipo: "consumivel"`, `"permanente"` ou `"varinha"`. Depois adicione o comportamento em `usarItem()` ou `comprar()` em `game.js`.
Adicionar uma nova magia aprendível
Em `data.js`, adicione em `MAGIAS_LOJA`. O restante é automático — a magia aparece na loja e no grid de combate ao ser comprada.
---
📦 Dependências externas
Apenas fontes do Google Fonts (carregadas via CDN):
Cinzel — títulos e nomes
EB Garamond — texto principal
Nenhum framework, nenhum npm, nenhum build step necessário.
