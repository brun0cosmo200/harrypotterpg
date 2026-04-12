<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Hogwarts RPG</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>

<div id="notif-box"></div>

<!-- MODAL DE EVENTOS / NARRATIVA / BOSS -->
<div id="modal-evento" style="display:none">
  <div class="modal-overlay" onclick="fecharModal()"></div>
  <div class="modal-box">
    <div class="modal-titulo" id="modal-titulo"></div>
    <div class="modal-msg"   id="modal-msg"></div>
    <button class="btn btn-center" id="modal-btn" onclick="fecharModal()">OK</button>
  </div>
</div>

<div id="happ" class="th-d">
  <div class="save-ind" id="save-ind"></div>
  <div id="xp-boost-timer" style="display:none;position:absolute;top:12px;right:48px;font-size:10px;font-family:'Cinzel',serif;background:rgba(255,200,0,.15);border:1px solid rgba(255,200,0,.3);padding:3px 8px;border-radius:12px;color:#ffd07d"></div>
  <button id="btn-som" onclick="toggleSom()" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:16px;cursor:pointer;opacity:.5">🔊</button>

  <!-- ══ INTRO ══ -->
  <div id="s-intro" class="screen active">
    <h1>HOGWARTS</h1>
    <h2>Escola de Magia e Bruxaria</h2>
    <span class="crest">🏰</span>
    <p class="subtitle">
      Bem-vindo, jovem bruxo.<br>
      O Chapéu Seletor revelará sua casa.<br>
      Após isso, sua aventura começa.
    </p>
    <div id="continue-section"></div>
    <button class="btn btn-center" id="start-btn" onclick="startQuiz()">Colocar o Chapéu</button>
  </div>

  <!-- ══ QUIZ ══ -->
  <div id="s-quiz" class="screen">
    <div class="progress-bar" id="prog"></div>
    <div class="qbox" id="qcontainer"></div>
  </div>

  <!-- ══ RESULTADO DA CASA ══ -->
  <div id="s-result" class="screen">
    <div id="result-html"></div>
  </div>

  <!-- ══ MAPA / HUB ══ -->
  <div id="s-map" class="screen">
    <div class="status-bar" id="status-top"></div>
    <h3 style="text-align:center;margin-bottom:.6rem">— Onde você vai? —</h3>
    <div class="map-scroll">
      <div class="map-grid" id="map-zones"></div>
    </div>
    <div class="hub-btns">
      <button class="btn hub-btn" onclick="go('s-inv'); renderInv()">🎒 Inventário</button>
      <button class="btn hub-btn" onclick="go('s-shop'); renderShop()">🏪 Loja</button>
      <button class="btn hub-btn" onclick="go('s-magic'); renderMagicShop()">📖 Magia</button>
      <button class="btn hub-btn" onclick="go('s-rest'); renderRestShop()">🛏️ Descanso</button>
      <button class="btn hub-btn" onclick="go('s-missoes'); renderMissoes()">📋 Missões</button>
      <button class="btn hub-btn" onclick="go('s-conquistas'); renderConquistas()">🏆 Troféus</button>
      <button class="btn hub-btn" onclick="go('s-stats'); renderStats()">📊 Stats</button>
    </div>
  </div>

  <!-- ══ COMBATE ══ -->
  <div id="s-battle" class="screen">
    <div class="status-bar" id="status-battle"></div>
    <div class="enemy-box" id="enemy-box"></div>
    <div class="log-box" id="log"></div>
    <div class="spells-scroll">
      <div class="spells-grid" id="spells"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn" onclick="tryFlee()">🏃 Fugir</button>
      <button class="btn" onclick="go('s-inv'); renderInv()">🎒 Itens</button>
    </div>
  </div>

  <!-- ══ INVENTÁRIO ══ -->
  <div id="s-inv" class="screen">
    <h2>Inventário</h2>
    <div class="status-bar" id="status-inv"></div>
    <h3>Itens</h3>
    <div class="inv-grid" id="inv-items"></div>
    <br>
    <button class="btn btn-center" onclick="voltarDoBolso()">← Voltar</button>
  </div>

  <!-- ══ LOJA PRINCIPAL ══ -->
  <div id="s-shop" class="screen">
    <h2>🏪 Loja do Ollivander</h2>
    <div class="status-bar" id="status-shop"></div>
    <div id="shop-items"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Sair da loja</button>
  </div>

  <!-- ══ LOJA DE MAGIA ══ -->
  <div id="s-magic" class="screen">
    <h2>📖 Livraria das Artes Negras</h2>
    <div class="status-bar" id="status-magic"></div>
    <div id="magic-items"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Voltar ao mapa</button>
  </div>

  <!-- ══ LOJA DE DESCANSO ══ -->
  <div id="s-rest" class="screen">
    <h2>🛏️ Pousada do Bruxo</h2>
    <div class="status-bar" id="status-rest"></div>
    <div id="rest-content"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Voltar ao mapa</button>
  </div>

  <!-- ══ MISSÕES ══ -->
  <div id="s-missoes" class="screen">
    <h2>📋 Missões</h2>
    <div id="missoes-lista" style="max-height:380px;overflow-y:auto;padding-right:4px"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Voltar ao mapa</button>
  </div>

  <!-- ══ CONQUISTAS ══ -->
  <div id="s-conquistas" class="screen">
    <h2>🏆 Conquistas</h2>
    <div id="conquistas-lista" style="max-height:380px;overflow-y:auto;padding-right:4px"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Voltar ao mapa</button>
  </div>

  <!-- ══ ESTATÍSTICAS ══ -->
  <div id="s-stats" class="screen">
    <h2>📊 Estatísticas</h2>
    <div id="stats-content"></div>
    <br>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">← Voltar ao mapa</button>
  </div>

  <!-- ══ GAME OVER ══ -->
  <div id="s-gameover" class="screen">
    <span class="crest">💀</span>
    <h1>FIM DA JORNADA</h1>
    <p class="subtitle" id="go-msg"></p>
    <button class="btn btn-center" onclick="restartRpg()">Tentar Novamente</button>
    <button class="btn btn-center" onclick="go('s-intro'); resetAll()" style="opacity:.6;font-size:11px">Refazer o Teste</button>
  </div>

  <!-- ══ VITÓRIA ══ -->
  <div id="s-win" class="screen">
    <span class="crest">🏆</span>
    <h1>VITÓRIA!</h1>
    <p class="subtitle" id="win-msg"></p>
    <div class="status-bar" id="status-win"></div>
    <div id="level-up-banner"></div>
    <button class="btn btn-center" onclick="go('s-map'); renderMap()">Continuar Aventura</button>
    <button class="btn btn-center" onclick="go('s-intro'); resetAll()" style="opacity:.5;font-size:11px">Novo Jogo</button>
  </div>

</div><!-- #happ -->

<script src="data.js"></script>
<script src="save.js"></script>
<script src="game.js"></script>
</body>
</html>
