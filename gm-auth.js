/* ══════════════════════════════════════════════════════════════════════════
   GlobalMed — Portão de login (Supabase Auth · Nível 1)
   Uso: incluir <script src="gm-auth.js"></script> no <head> de cada sistema.
   - Mostra um overlay de login até haver sessão válida (email + senha).
   - Guarda a sessão no localStorage e renova pelo refresh_token.
   - Expõe window.gmAuth = { user, isAdmin(), logout(), trocarSenha() }.
   - Nível 1: é PORTÃO DE ACESSO (não é RLS). Dados seguem via anon key.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  // ── O BANCO VEM DO CONFIG DO CLIENTE, e SEM VALOR-PADRAO (LIMEDTEC, 05/08) ──────────────────
  // Antes estavam aqui a URL e a chave anon da GlobalMed, escritas na mao. Num produto vendido
  // pra varias empresas isso e o pior defeito possivel: o cliente 003 que esquecesse de trocar
  // nao veria erro nenhum — veria o sistema funcionando, lendo o banco da GlobalMed. Preco,
  // fornecedor e cliente de outra empresa na tela dele, sem nenhum sinal de que algo esta errado.
  // O LIMEDTEC.banco() explode com o nome do arquivo que falta. Falhar alto e barato.
  var SB   = window.LIMEDTEC.urlBanco();
  var ANON = window.LIMEDTEC.chaveBanco();
  var K = 'gm_session';

  // ── Controle de acesso por sistema ───────────────────────────────────────────
  // role 'giovana_only' só entra na globalmed_giovana.html; nos outros sistemas é bloqueado.
  // admin, vendedora e demais = acesso total.
  var _blocked = false;
  function _paginaGiovana(){ return /giovana/i.test(location.pathname || location.href || ''); }
  // NOME DA TELA pra TEXTO que a pessoa le. O nome do ARQUIVO continua o mesmo (trocar quebra
  // link, favorito e historico); o que sai do config e o rotulo. Com reserva, porque o gm-auth e
  // carregado por telas antigas e uma tela de login que quebra e uma tela sem entrada.
  function _telaBusca(){
    try { return (window.LIMEDTEC && LIMEDTEC.tela) ? LIMEDTEC.tela('busca') : 'Busca de Preços'; }
    catch(e){ return 'Busca de Preços'; }
  }
  function _pagPermitida(role){
    if(role === 'giovana_only') return _paginaGiovana();
    return true;
  }

  function getSess(){ try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch(e){ return null; } }
  // F02 (N109): dado de tela guardado com hora (limedtec-cache.js, chaves gm_*cache*) é da conta
  // que o guardou. Sai da conta ou entra outra no mesmo navegador = apaga tudo (lê-se do servidor).
  function limpaCachesDeTela(){
    try{
      var ks = []; for(var i = 0; i < sessionStorage.length; i++) ks.push(sessionStorage.key(i));
      ks.forEach(function(k){ if(/^gm_.*cache/.test(k || '')) sessionStorage.removeItem(k); });
    }catch(e){}
  }
  function setSess(s){
    var antes = getSess();
    if(!antes || !antes.user || !s || !s.user || String(antes.user.id) !== String(s.user.id)) limpaCachesDeTela();
    localStorage.setItem(K, JSON.stringify(s));
  }
  function clearSess(){ limpaCachesDeTela(); localStorage.removeItem(K); }

  // ── E1 (Nível 2): manda o JWT do usuário logado nas chamadas de DADOS (/rest/v1/) ──
  // Assim, quando a RLS for ligada, as requisições dos sistemas contam como "authenticated".
  // NÃO mexe em /auth/v1/ (login/refresh) nem /functions/v1/ (ler-pedido). Token lido a cada
  // chamada (cobre o refresh). Enquanto a RLS está OFF, funciona igual (anon e authenticated valem).
  var _origFetch = window.fetch.bind(window);
  var _refreshing = null;
  // Garante token válido ANTES de cada chamada de dados: renova se expirado (single-flight).
  async function _tokenFresco(){
    var s = getSess();
    if(!s || !s.access_token) return s;
    if(s.expires_at && s.expires_at < Date.now() + 60000){   // expirado ou < 60s p/ expirar
      if(!_refreshing) _refreshing = refreshEstado().finally(function(){ _refreshing = null; });
      var estado = await _refreshing;
      if(estado === 'morta'){                                 // o servidor recusou: limpa e re-login (sem loop)
        try{ clearSess(); }catch(e){}
        try{ if(ov && !ov.parentNode) (document.documentElement||document.body).appendChild(ov); showLogin('Sua sessão expirou — entre novamente.'); }catch(e){}
        return null;
      }
      // 'rede': a sessão CONTINUA VÁLIDA — só não deu pra renovar agora. Seguimos com o token
      // que temos. Se ele já venceu, o PostgREST responde 401 e o tratamento abaixo cuida;
      // derrubar o usuário aqui seria deslogar por causa de uma piscada de Wi-Fi.
      s = getSess();
    }
    return s;
  }
  // 401/403 do PostgREST com sessão: pode ser token vencido (relógio fora, token revogado) ou
  // falta de permissão real. Sem isto, cada tela imprime o status cru — e "401 permission denied
  // ... GRANT SELECT ON public.X TO anon" na tela vira "o banco sumiu" pra quem lê.
  function _pareceSessao(status, corpo){
    if(status !== 401 && status !== 403) return false;
    return /42501|PGRST301|JWT|permission denied|expired/i.test(String(corpo || ''));
  }
  // Consulta de identidade antes de um lote de escrita: não retorna nem registra tokens.
  async function validarSessaoEscrita(){
    if(_blocked) throw new Error('Sem permissão para gravar nesta página.');
    var s = await _tokenFresco();
    if(!s || !s.access_token || !s.user || !s.user.id)
      throw new Error('Sessão ausente ou expirada. Entre novamente antes de importar.');
    var r = await _origFetch(SB + '/auth/v1/user', {
      method: 'GET', headers: { apikey: ANON, Authorization: 'Bearer ' + s.access_token }
    });
    if(!r.ok) throw new Error(r.status === 401 || r.status === 403
      ? 'Sessão não validada pelo servidor. Entre novamente; nenhuma importação foi iniciada.'
      : 'Não foi possível validar a sessão (HTTP ' + r.status + '). Nenhuma importação foi iniciada.');
    var u = await r.json();
    if(!u || String(u.id) !== String(s.user.id)) throw new Error('Identidade da sessão não confirmada. Entre novamente.');
    return true; // identidade válida não dispensa RLS; toda escrita ainda precisa ser confirmada
  }
  window.fetch = async function(input, init){
    var ehDados = false;
    try{
      if(typeof input === 'string' && input.indexOf('/rest/v1/') >= 0){
        ehDados = true;
        // bloqueio de acesso: usuário sem permissão nesta página NÃO carrega dados
        if(_blocked){ return new Response('[]', { status: 403, headers: { 'Content-Type': 'application/json' } }); }
        var s = await _tokenFresco();
        if(s && s.access_token){
          init = Object.assign({}, init || {});
          var h = new Headers((init && init.headers) || {});
          h.set('Authorization', 'Bearer ' + s.access_token);
          if(!h.has('apikey')) h.set('apikey', ANON);
          init.headers = h;
        }
      }
    }catch(e){ /* qualquer erro no patch: segue com o fetch original */ }
    var resp = await _origFetch(input, init);
    // ── 2ª CHANCE: token recusado pelo servidor mesmo achando a gente que estava bom ──
    // Renova UMA vez e repete a chamada. Sem isto, a tela pinta um erro de banco e o operador
    // recarrega a página no escuro. Com sessão morta de verdade, cai no overlay de login —
    // que é a mensagem certa, em vez de "GRANT SELECT ... TO anon" numa caixa vermelha.
    if(ehDados && resp && (resp.status === 401 || resp.status === 403) && getSess()){
      var corpo = '';
      try{ corpo = await resp.clone().text(); }catch(e){}
      if(_pareceSessao(resp.status, corpo)){
        try{
          if(!_refreshing) _refreshing = refreshEstado().finally(function(){ _refreshing = null; });
          var estado2 = await _refreshing;
          if(estado2 === 'ok'){
            var s2 = getSess();
            init = Object.assign({}, init || {});
            var h2 = new Headers((init && init.headers) || {});
            h2.set('Authorization', 'Bearer ' + s2.access_token);
            if(!h2.has('apikey')) h2.set('apikey', ANON);
            init.headers = h2;
            return _origFetch(input, init);          // repete UMA vez só — sem laço
          }
          if(estado2 === 'morta'){
            try{ clearSess(); }catch(e){}
            try{ if(ov && !ov.parentNode) (document.documentElement||document.body).appendChild(ov); showLogin('Sua sessão expirou — entre novamente.'); }catch(e){}
          }
          // 'rede': devolve o 401 original. A tela mostra o erro dela, a sessão fica de pé,
          // e a próxima tentativa do usuário funciona sozinha quando a rede voltar.
        }catch(e){ /* nunca deixar o patch derrubar a chamada */ }
      }
    }
    return resp;
  };

  function saveFromToken(d){
    var s = {
      access_token:  d.access_token,
      refresh_token: d.refresh_token,
      expires_at:    Date.now() + (d.expires_in || 3600) * 1000,
      user: { id: d.user && d.user.id, email: d.user && d.user.email,
              role: (d.user && d.user.user_metadata && d.user.user_metadata.role) || 'vendedora' }
    };
    setSess(s); return s;
  }

  async function login(email, senha){
    var r = await fetch(SB + '/auth/v1/token?grant_type=password', {
      method:'POST', headers:{ apikey:ANON, 'Content-Type':'application/json' },
      body: JSON.stringify({ email: email, password: senha })
    });
    var d = await r.json();
    if(!r.ok) throw new Error(d.error_description || d.msg || d.error || 'Falha no login');
    return saveFromToken(d);
  }
  // >>> PORTADO DA FPMED em 06/08/2026 (melhoria de CÓDIGO, que atravessa nas duas direções).
  //     Lá o sintoma era "o sistema perde o banco de vez em quando, com uma mensagem vermelha
  //     dizendo que as tabelas não estão lá". Aqui o MESMO defeito existia, linha por linha, e
  //     só não tinha se manifestado: esta função devolvia `false` para DUAS coisas diferentes —
  //       (a) o servidor RECUSOU o refresh_token  = a sessão morreu de verdade;
  //       (b) não consegui FALAR com o servidor   = piscada de rede, sessão intacta.
  //     Quem chama tratava os dois como "sessão morta". Uma oscilação de Wi-Fi de 2 segundos no
  //     instante do refresh (que acontece a cada ~1h, em CADA aba aberta) derrubava a sessão.
  //     Dali em diante toda consulta ia como `anon` e o PostgREST respondia 401
  //     "permission denied ... GRANT SELECT ON public.X TO anon" — que na tela vira uma mensagem
  //     vermelha com cara de "as tabelas sumiram / o banco caiu". O banco nunca esteve fora.
  //
  // >>> E O TIMEOUT: não havia nenhum. Como o `_tokenFresco` é aguardado ANTES de cada consulta,
  //     um refresh pendurado trava a TELA INTEIRA pelo tempo que a rede levar pra desistir.
  //
  // Devolve: 'ok' | 'morta' | 'rede'.  Só 'morta' pode derrubar alguém pro login.
  var REFRESH_TIMEOUT_MS = 12000;
  // ── FREIO NO RETRY (17/09/2026): falhou 2x seguidas, para de bater no servidor ──────────────
  // Sem isto, sessão morta + tela que consulta em loop = 126 chamadas de refresh em 30s no GoTrue.
  // _refreshFalhas conta tentativas SEM SUCESSO desde o último 'ok'; na 3ª, nem liga pro servidor
  // — devolve 'morta' direto, o chamador limpa a sessão (clearSess) e o loop acaba ali.
  var _refreshFalhas = 0;
  var REFRESH_FALHAS_MAX = 2;
  async function refreshEstado(){
    var s = getSess(); if(!s || !s.refresh_token) return 'morta';
    if(_refreshFalhas >= REFRESH_FALHAS_MAX) return 'morta';   // freio: já tentou, já falhou, para
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var to = ctrl ? setTimeout(function(){ ctrl.abort(); }, REFRESH_TIMEOUT_MS) : null;
    try{
      var r = await fetch(SB + '/auth/v1/token?grant_type=refresh_token', {
        method:'POST', headers:{ apikey:ANON, 'Content-Type':'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
        signal: ctrl ? ctrl.signal : undefined
      });
      var d = null; try{ d = await r.json(); }catch(e){ d = null; }
      if(r.ok && d && d.access_token){ _refreshFalhas = 0; saveFromToken(d); return 'ok'; }
      // 5xx é servidor com problema, não credencial errada: manter a sessão e tentar depois.
      if(r.status >= 500){ _refreshFalhas++; return 'rede'; }
      _refreshFalhas++;
      return 'morta';                      // 400/401 do GoTrue = o refresh_token não vale mais
    }catch(e){
      _refreshFalhas++;
      return 'rede';                       // abort/offline/DNS/TLS — NÃO é sessão inválida
    }finally{ if(to) clearTimeout(to); }
  }
  // compatibilidade: quem só quer saber "renovou?" continua chamando refresh()
  async function refresh(){ return (await refreshEstado()) === 'ok'; }
  async function trocarSenha(nova){
    var s = getSess(); if(!s || !s.access_token) throw new Error('Sessão expirada');
    var r = await fetch(SB + '/auth/v1/user', {
      method:'PUT', headers:{ apikey:ANON, 'Content-Type':'application/json', Authorization:'Bearer '+s.access_token },
      body: JSON.stringify({ password: nova })
    });
    var d = await r.json();
    if(!r.ok) throw new Error(d.error_description || d.msg || 'Não foi possível trocar a senha');
    return true;
  }
  function logout(){ clearSess(); location.reload(); }
  // O endereco de volta do link de recuperacao e DO CLIENTE (cliente.config.js > auth.retornoSenha).
  // Sem valor-padrao: instalacao sem ele explode, nao manda o link para o dominio de outra empresa.
  function retornoSenha(){
    var a = window.LIMEDTEC.cfg().auth || {};
    if(!a.retornoSenha) throw new Error('LIMEDTEC: cliente.config.js esta sem `auth.retornoSenha` (endereco da tela de redefinir senha).');
    return a.retornoSenha;
  }
  async function recuperar(email){
    var r = await fetch(SB + '/auth/v1/recover?redirect_to=' + encodeURIComponent(retornoSenha()), {
      method:'POST', headers:{ apikey:ANON, 'Content-Type':'application/json' },
      body: JSON.stringify({ email: email })
    });
    if(!r.ok){ var d = await r.json().catch(function(){ return {}; }); throw new Error(d.msg || d.error_description || d.error || ('HTTP '+r.status)); }
    return true;
  }

  // Nunca imprimir a barra de login / overlay no PDF client-facing
  var _pst = document.createElement('style');
  _pst.textContent = '@media print{#gm-auth-bar,#gm-auth-overlay{display:none !important}}'
    // ═══ O PISO DE TOQUE NO CELULAR (fase 2, fatia 5 — 13/08/2026) ═══════════════════════════
    // ESTA BARRA E A ALAVANCA DA FATIA, e por isso o conserto e aqui e nao em cada tela: ela se
    // monta em TODA tela do sistema, entao os dois botoes pequenos que ela tinha (#gm-troca com
    // 31x24 e #gm-sair com 45x22, medidos em 390px) apareciam doze vezes, uma por tela. Consertar
    // no arquivo de cada tela seria escrever a mesma regra doze vezes e esquece-la na decima
    // terceira.
    // >>> `min-height` E NAO `height`: o botao ja tem `padding` proprio, e altura fixa cortaria o
    //     texto de quem usa fonte maior no sistema. O piso levanta o chao sem baixar o teto.
    // >>> A RESERVA `, 44px` E OBRIGATORIA AQUI, e a razao e a mesma do degrau de texto: este
    //     arquivo pinta ANTES (e as vezes SEM) o limedtec-tokens.css. Um `var()` que nao resolve
    //     nao vira 44px — vira declaracao invalida, e o botao volta calado ao tamanho pequeno.
    // >>> `min-width` JUNTO, E ELE FALTAVA NA PRIMEIRA VOLTA — a medicao depois do publish pegou.
    //     Com so `min-height`, o #gm-troca (que e o botao de trocar senha, e so tem um icone
    //     dentro) passou de 31x24 pra 31x44: virou uma tira alta e ESTREITA, e continuou abaixo do
    //     piso. Alvo de toque tem DOIS lados, e botao de icone e o caso em que o lado esquecido e
    //     sempre a largura — o texto e que costuma dar largura de graca, e icone nao tem texto.
    + '@media (max-width:480px){#gm-auth-bar button,#gm-auth-overlay button{'
    + 'min-height:var(--lt-toque-min, 44px);min-width:var(--lt-toque-min, 44px)}'
    + '#gm-auth-overlay input{min-height:var(--lt-toque-min, 44px)}}';
  (document.head || document.documentElement).appendChild(_pst);

  // ── Overlay ────────────────────────────────────────────────────────────────
  var ov = document.createElement('div');
  ov.id = 'gm-auth-overlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:var(--lt-fundo,#0f1620);color:var(--lt-txt,#e6edf3);display:flex;align-items:center;justify-content:center;font-family:system-ui,\'Segoe UI\',Arial,sans-serif;';
  ov.innerHTML = '<div style="opacity:.65;font-size:14px"><svg class="lt-icone" aria-hidden="true"><use href="#lt-i-cadeado"></use></svg> Carregando…</div>';
  (document.documentElement || document.body).appendChild(ov);

  function esc(x){ return (x==null?'':String(x)).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function showLogin(msg, tipo){
    // ═══ O LOGIN, IGUAL AO DESENHO (rodada visual 2, 17/09/2026) ═══════════════════════════
    // Ordem do dono: "quero sistema igual o design visual" · "quero exatamente o que esta la".
    // Cada valor daqui foi COPIADO do design\LIMEDTEC-Sistema-standalone.html (o HTML dele mora
    // escapado dentro do JS; foi desescapado e lido): o fundo em radial-gradient, o logo de 58px
    // com raio 16, "LIMEDTEC" em Space Grotesk 24px/700 com letter-spacing .08em, o subtitulo em
    // #8FA4B4, os campos em #070C11 com borda #1A242E e raio 10, o botao em degrade
    // #4FD3EA -> #2BA6C0 com texto #04181E, e o rodape da licenca.
    // ⛔ ROUPA: nenhuma linha de autenticacao foi tocada — os ids gm-email/gm-pass/gm-btn/gm-forgot
    //    continuam os mesmos, e quem loga continua sendo a mesma funcao de sempre.
    ov.style.background = 'radial-gradient(1100px 620px at 50% -15%, var(--lt-portal-brilho,#0C2C36) 0%, var(--lt-portal-fundo,#06090D) 62%)';
    ov.innerHTML =
      '<div style="width:100%;max-width:392px;display:flex;flex-direction:column;align-items:center;gap:22px;font-family:\'Manrope\',sans-serif;color:var(--lt-txt-forte,#EAF1F7);padding:32px 20px;box-sizing:border-box">' +
        '<img src="limedteclockupescuro.png" alt="LIMEDTEC" style="width:58px;height:58px;border-radius:16px;object-fit:contain;box-shadow:0 10px 34px rgba(43,166,192,.26)">' +
        '<div style="text-align:center">' +
          '<div style="font-family:\'Space Grotesk\',sans-serif;font-size:24px;font-weight:700;letter-spacing:.08em;color:#fff">LIMEDTEC</div>' +
          '<div style="font-size:13px;color:var(--lt-txt,#8FA4B4);margin-top:7px">Plataforma de distribuição farmacêutica</div>' +
        '</div>' +
        '<div style="width:100%;display:flex;flex-direction:column;gap:14px">' +
          '<label style="display:flex;flex-direction:column;gap:7px">' +
            '<span style="font-size:12px;color:var(--lt-txt,#8FA4B4);letter-spacing:.1em;text-transform:uppercase">E-mail</span>' +
            '<input id="gm-email" type="email" autocomplete="username" style="box-sizing:border-box;background:var(--lt-portal-fundo,#070C11);border:1px solid var(--lt-panel2,#1A242E);border-radius:10px;padding:12px 13px;font:500 13px/1 \'Manrope\',sans-serif;color:#fff;outline:none">' +
          '</label>' +
          '<label style="display:flex;flex-direction:column;gap:7px">' +
            '<span style="font-size:12px;color:var(--lt-txt,#8FA4B4);letter-spacing:.1em;text-transform:uppercase">Senha</span>' +
            '<input id="gm-pass" type="password" autocomplete="current-password" style="box-sizing:border-box;background:var(--lt-portal-fundo,#070C11);border:1px solid var(--lt-panel2,#1A242E);border-radius:10px;padding:12px 13px;font:500 13px/1 \'Manrope\',sans-serif;color:#fff;outline:none">' +
          '</label>' +
          '<div id="gm-msg" style="min-height:16px;font-size:12px;text-align:center;color:'+(tipo==='ok'?'var(--lt-ok-txt,#3DDC97)':'var(--lt-erro-txt,#FF6B6B)')+'">'+esc(msg||'')+'</div>' +
          '<button id="gm-btn" style="margin-top:2px;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,var(--lt-ciano2,#4FD3EA),var(--lt-acao,#2BA6C0));color:#04181E;border:none;border-radius:11px;padding:13px 16px;font:700 13.5px/1 \'Manrope\',sans-serif;cursor:pointer;box-shadow:0 6px 22px rgba(69,201,224,.24)">Entrar</button>' +
          '<div style="display:flex;align-items:center;gap:8px;justify-content:center;font-size:12px;color:var(--lt-txt,#8FA4B4);margin-top:2px">' +
            '<span style="color:var(--lt-ok-txt,#3DDC97)">&#10003;</span> acesso protegido por papel e RLS' +
          '</div>' +
          '<div style="text-align:center"><a id="gm-forgot" href="#" style="color:var(--lt-txt,#8FA4B4);font-size:12px;text-decoration:none">Esqueci minha senha</a></div>' +
        '</div>' +
        '<div style="font-size:12px;color:#65798A">&copy; LIMEDTEC · licença válida até 31/12/2027</div>' +
      '</div>';
    // O overlay e MONTADO agora, depois do DOMContentLoaded — o preenchimento automatico do
    // molde ja passou. Quem monta HTML depois pede o preenchimento do pedaco que montou.
    try { if (window.LIMEDTEC && LIMEDTEC.pintaMarca) LIMEDTEC.pintaMarca(ov); } catch(e){}
    var emailEl = ov.querySelector('#gm-email'), passEl = ov.querySelector('#gm-pass'),
        btn = ov.querySelector('#gm-btn'), msgEl = ov.querySelector('#gm-msg');
    var lastEmail = (getSess()||{}).__lastEmail; if(lastEmail) emailEl.value = lastEmail;
    (lastEmail ? passEl : emailEl).focus();
    async function tentar(){
      var email = (emailEl.value||'').trim().toLowerCase(), senha = passEl.value||'';
      if(!email || !senha){ msgEl.style.color='var(--lt-erro-txt,#f87171)'; msgEl.textContent='Preencha email e senha.'; return; }
      btn.disabled = true; btn.textContent = 'Entrando…'; msgEl.style.color='var(--lt-txt-fraco,#9fb3c4)'; msgEl.textContent='';
      try{
        var s = await login(email, senha);
        s.__lastEmail = email; setSess(s);
        // Recarrega após login "do zero": garante que a app re-inicialize já autenticada
        // (os sistemas disparam a carga de dados no load; com RLS ligada, precisa da sessão presente).
        location.reload();
      }catch(e){
        btn.disabled = false; btn.textContent = 'Entrar';
        msgEl.style.color='var(--lt-erro-txt,#f87171)'; msgEl.textContent = /invalid|grant|credentials/i.test(e.message) ? 'Email ou senha incorretos.' : e.message;
        passEl.value=''; passEl.focus();
      }
    }
    btn.onclick = tentar;
    passEl.addEventListener('keydown', function(e){ if(e.key==='Enter') tentar(); });
    ov.querySelector('#gm-forgot').onclick = async function(e){
      e.preventDefault();
      var email = (emailEl.value||'').trim().toLowerCase();
      if(!email){ msgEl.style.color='var(--lt-erro-txt,#f87171)'; msgEl.textContent='Digite seu email acima primeiro, depois clique aqui.'; emailEl.focus(); return; }
      msgEl.style.color='var(--lt-txt-fraco,#9fb3c4)'; msgEl.textContent='Enviando link de recuperação…';
      try{ await recuperar(email); msgEl.style.color='var(--lt-ok-txt,#34d399)'; msgEl.textContent='Link enviado! Verifique seu email (e a caixa de spam).'; }
      catch(err){ msgEl.style.color='var(--lt-erro-txt,#f87171)'; msgEl.textContent='Erro: '+err.message; }
    };
  }

  // ══ A FAIXA DO CHIP SE DECLARA (fase 2, fatia 7 — 14/08/2026) ══════════════════════════════
  // >>> O DEFEITO: este chip é `position:fixed` e passa POR CIMA do topo de quem o carrega. Quem
  //     queria se defender dele ESCREVIA A MEDIDA NA MÃO — `globalmed_giovana.html` reservava
  //     `padding-right:310px`. Trezentos e dez é um número num arquivo medindo uma peça que mora
  //     em OUTRO arquivo: ninguém nunca mediu, e nada avisa no dia em que o chip muda de tamanho
  //     (e ele muda — o e-mail cabe até 150px, os rótulos acompanham a fonte do tema).
  // >>> MEDIDO EM 14/08, com a tela pintada: o chip ocupa 193px da direita. A reserva era 310.
  //     Cento e dezessete pixels de faixa vazia no topo da Cotação, em todo monitor, todo dia.
  // >>> O CONSERTO É INVERTER O SENTIDO: quem TEM a peça publica a medida, quem quer se defender
  //     PEDE. Este arquivo mede o chip depois de montado e escreve `--gm-chip-faixa` (a faixa da
  //     direita) e `--gm-chip-alt` (a de cima) no <html>. A tela vira `var(--gm-chip-faixa, 310px)`
  //     — e a reserva do var() é o número velho DE PROPÓSITO: sem sessão não há chip, não há o que
  //     medir, e o comportamento continua exatamente o de hoje.
  // >>> A FAIXA SÓ CRESCE, NUNCA ENCOLHE. A largura do chip depende de fonte e de ícone, que
  //     chegam depois; um número publicado cedo demais e menor que o real deixaria o chip cobrindo
  //     conteúdo — o defeito exato que a reserva existe pra impedir. Publicar sempre o MAIOR já
  //     visto erra pro lado seguro, que é o único lado em que se pode errar aqui.
  // >>> E ELA POUSA NA GRADE DE 8. O resto do sistema respira de 8 em 8 (fatia 3); uma faixa de
  //     201px seria a única medida fora da grade, e a de cima cai em 48px — exatamente o que a
  //     tela já escrevia à mão. Nesse eixo, nada muda de lugar.
  var _faixaMax = 0, _altMax = 0;
  var GM_FOLGA = 8;
  function _grade8(n){ return Math.ceil(n / 8) * 8; }
  // >>> O try/catch NÃO É MEDO GENÉRICO, e ele custa caro: catch engole defeito junto. Está aqui
  //     por causa de ONDE esta função roda — `injectBar()` é chamado dentro do `reveal()`, ANTES
  //     do `gm-auth-ready`. Uma exceção aqui não deixa um enfeite torto: ela impede o evento de
  //     sair, e o sistema inteiro abre em branco. Faixa mal medida é um topo feio; boot que não
  //     acontece é a tela não existir. O preço do catch é pago pelo assert 14 do
  //     `testa_gmauth_sessao`, que cobra o NÚMERO publicado — se a medição parar, ele avisa.
  function publicaFaixa(bar){
    try{
      var r = bar.getBoundingClientRect();
      if(!r.width || !r.height) return;        // ainda não pintou: não se publica número de mentira
      var raiz = document.documentElement;
      var faixa = _grade8((raiz.clientWidth - r.left) + GM_FOLGA);
      var alt   = _grade8(r.bottom + GM_FOLGA);
      if(faixa > _faixaMax){ _faixaMax = faixa; raiz.style.setProperty('--gm-chip-faixa', faixa + 'px'); }
      if(alt   > _altMax  ){ _altMax   = alt;   raiz.style.setProperty('--gm-chip-alt',   alt   + 'px'); }
    }catch(e){ /* o topo fica com a reserva antiga do var(); o boot segue */ }
  }

  function injectBar(){
    if(document.getElementById('gm-auth-bar')) return;
    var s = getSess() || {}; var email = (s.user && s.user.email) || '';
    var bar = document.createElement('div');
    bar.id = 'gm-auth-bar';
    // ENFEITE INTERNO: não sai no papel do cliente. O chip traz o e-mail de quem está logado, e
    // uma proposta impressa com o e-mail do vendedor no canto é informação nossa no documento
    // dele. A regra mora no limedtec-config.js; aqui o elemento só se declara.
    bar.setAttribute('data-limedtec-interno', 'sessao');
    bar.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483000;display:flex;gap:var(--lt-e-8, 8px);align-items:center;font-family:system-ui,\'Segoe UI\',Arial,sans-serif;font-size:var(--lt-txt-1, 12px);';
    // CHIP CURTO: só a parte antes do @ (o domínio é sempre o mesmo da casa e não identifica
    // ninguém), com o e-mail INTEIRO no title pro hover. Este chip é position:fixed no canto
    // superior direito e passa POR CIMA do cabeçalho das telas — quanto mais estreito, menos
    // ele cobre. Na giovana ele escondia o "Supabase Online · X cotações", que é o indicador
    // que avisa se a busca vai rodar sobre banco vazio.
    var curto = (email.split('@')[0] || email);
    if (curto.length > 18) curto = curto.slice(0, 17) + '…';
    bar.innerHTML =
      '<span title="'+esc(email)+'" style="background:var(--lt-superficie,#161f2b);color:var(--lt-txt,#e6edf3);border:1px solid var(--lt-borda,#22384a);border-radius:20px;padding:var(--lt-e-4, 4px) var(--lt-e-8, 8px);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><svg class="lt-icone" aria-hidden="true"><use href="#lt-i-pessoa"></use></svg> '+esc(curto)+'</span>' +
      '<button id="gm-troca" title="Trocar minha senha" style="background:var(--lt-superficie-2,#141b26);color:var(--lt-txt,#e6edf3);border:1px solid var(--lt-borda-forte,#476f8d);border-radius:20px;padding:var(--lt-e-4, 4px) var(--lt-e-8, 8px);cursor:pointer;font-size:var(--lt-txt-1, 12px)"><svg class="lt-icone" aria-hidden="true"><use href="#lt-i-chave"></use></svg></button>' +
      '<button id="gm-sair" style="background:var(--lt-erro,#b91c1c);color:var(--lt-txt-forte,var(--lt-txt-forte,#ffffff));border:none;border-radius:20px;padding:var(--lt-e-4, 4px) var(--lt-e-12, 12px);cursor:pointer;font-size:var(--lt-txt-1, 12px)">Sair</button>';
    document.body.appendChild(bar);
    // e AGORA a faixa se declara. Duas vezes de propósito: já, pra quem lê o topo no primeiro
    // quadro; e outra quando as fontes assentam, porque o rótulo "Sair" e o desenho do ícone
    // mudam de largura quando a fonte do tema troca a do sistema — e a segunda medição só
    // atravessa se for MAIOR (ver `publicaFaixa`).
    publicaFaixa(bar);
    try{ if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ publicaFaixa(bar); }); }catch(e){}
    bar.querySelector('#gm-sair').onclick = function(){ if(confirm('Sair do sistema?')) logout(); };
    bar.querySelector('#gm-troca').onclick = async function(){
      var nova = prompt('Nova senha (mínimo 6 caracteres):'); if(nova==null) return;
      if((nova||'').length < 6){ alert('Senha muito curta (mínimo 6).'); return; }
      try{ await trocarSenha(nova); alert('✅ Senha alterada com sucesso!'); }
      catch(e){ alert('❌ ' + e.message); }
    };
  }

  function showSemPermissao(s){
    var email = (s.user && s.user.email) || '';
    if(ov && !ov.parentNode) (document.documentElement || document.body).appendChild(ov);
    ov.innerHTML =
      '<div style="width:360px;max-width:92vw;background:var(--lt-superficie,#161f2b);border:1px solid var(--lt-borda,#22384a);border-radius:16px;padding:var(--lt-e-32, 32px) var(--lt-e-24, 24px);text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)">' +
        '<div style="font-size:30px;margin-bottom:var(--lt-e-8, 8px)"><svg class="lt-icone lt-icone-32" aria-hidden="true"><use href="#lt-i-cadeado"></use></svg></div>' +
        '<div style="font-weight:800;font-size:17px;margin-bottom:var(--lt-e-8, 8px)">Sem permissão</div>' +
        // o NOME DA TELA vem do config (LIMEDTEC.tela): o arquivo continua globalmed_giovana.html,
        // mas quem le a mensagem nao tem por que ler o nome de uma funcionaria de outra empresa.
        '<div style="color:var(--lt-txt,#e6edf3);font-size:13px;line-height:1.5;margin-bottom:var(--lt-e-20, 20px)">Sua conta ('+esc(email)+') tem acesso apenas a <b>'+esc(_telaBusca())+'</b>. Este sistema não está liberado para você.</div>' +
        '<button id="gm-ir-busca" style="width:100%;padding:var(--lt-e-12, 12px);border:none;border-radius:9px;background:var(--lt-acento-forte,#2f7688);color:var(--lt-txt-forte,var(--lt-txt-forte,#ffffff));font-weight:700;font-size:14px;cursor:pointer;margin-bottom:var(--lt-e-8, 8px)">Ir para '+esc(_telaBusca())+'</button>' +
        '<button id="gm-sair2" style="width:100%;padding:var(--lt-e-12, 12px);border:1px solid var(--lt-borda-forte,#476f8d);border-radius:9px;background:var(--lt-superficie-2,#141b26);color:var(--lt-txt,#e6edf3);font-size:13px;cursor:pointer">Sair</button>' +
      '</div>';
    ov.querySelector('#gm-ir-busca').onclick = function(){ location.href = 'globalmed_giovana.html'; };
    ov.querySelector('#gm-sair2').onclick = function(){ logout(); };
  }

  // ══ O GUARDA DE BOOT ═══════════════════════════════════════════════════════════════════════
  // >>> ISTO CUSTOU UM DIA DE ENTREGA (achado pela sessao da FPMED, 07/08). As telas chamavam
  //     `iniciar()` DIRETO no fim do script. O boot() daqui e ASSINCRONO — quando o token precisa
  //     renovar (a cada ~1h e em toda reabertura), o `window.fetch` ainda NAO tinha sido trocado
  //     no instante em que a tela disparava as consultas. Elas saiam como ANON, a RLS nao devolvia
  //     nada, e o dashboard ficava em "Carregando..." pra sempre.
  // >>> E FALHAVA CALADO: com grant pro anon, a resposta e 200 com lista vazia — "banco vazio",
  //     nao "voce nao esta autenticado". Revogar o anon nao cria o defeito, so tira o silencio.
  // >>> POR QUE MORA AQUI E NAO EM CADA TELA: tela nova nasce obedecendo. Uma copia por tela e uma
  //     regra que a proxima tela vai esquecer — e o modo de falha do esquecimento aqui e um
  //     sistema que abre vazio sem uma linha de erro.
  //     Uso:  gmQuandoPronto(function(){ iniciar(); });
  var _fnsPronto = [], _prontoJaFoi = false, _prontoTimer = null;
  var GM_BOOT_TIMEOUT_MS = 12000;
  function _dispararPronto(porQue){
    if(_prontoJaFoi) return;                 // BOOT UNICO: duas cargas paralelas brigam pelo mesmo estado
    _prontoJaFoi = true;
    if(_prontoTimer){ clearTimeout(_prontoTimer); _prontoTimer = null; }
    var fns = _fnsPronto; _fnsPronto = [];
    fns.forEach(function(f){ try{ f(porQue); }catch(e){ console.error('[gm-auth] carga inicial:', e); } });
  }
  window.gmQuandoPronto = function(fn){
    if(typeof fn !== 'function') return;
    if(window.gmAuth){ try{ fn('ja-pronto'); }catch(e){ console.error('[gm-auth] carga inicial:', e); } return; }
    _fnsPronto.push(fn);
    if(_prontoTimer) return;
    // REDE DE SEGURANCA: o portao nao pode virar tranca. Se em 12s nada resolveu, a tela carrega
    // assim mesmo e o erro aparece na cara — melhor que um "Carregando..." eterno.
    // >>> SO NAO DISPARA COM A TELA DE LOGIN NA FRENTE: ali o certo e esperar a pessoa entrar (o
    //     login recarrega a pagina), e disparar consulta anon atras do overlay so produziria um
    //     erro que ninguem pediu.
    _prontoTimer = setTimeout(function(){
      _prontoTimer = null;
      var pedindoSenha = !!(ov && ov.parentNode && ov.querySelector && ov.querySelector('#gm-email'));
      if(pedindoSenha) return;               // login na frente: quem dispara e o reveal(), depois
      _dispararPronto('rede-de-seguranca-12s');
    }, GM_BOOT_TIMEOUT_MS);
  };

  function reveal(){
    var sg = getSess() || {};
    var roleg = sg.user && sg.user.role;
    if(!_pagPermitida(roleg)){ _blocked = true; showSemPermissao(sg); return; }  // giovana_only fora da giovana
    if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
    var s = getSess() || {};
    window.gmAuth = {
      user: s.user || null,
      validarSessaoEscrita: validarSessaoEscrita,
      // UM LUGAR SO (decisao 150, 21/10): admin = papel 'admin' no metadata (legado) OU gestor_geral
      // ativo na tabela perfis (a mesma regua do banco, lida pelo LimedtecSessao). Antes so o
      // metadata valia e a socia Isadora (gestor_geral, metadata vendedora) ficava de fora.
      isAdmin: function(){
        if(s.user && s.user.role === 'admin') return true;
        try{
          var L = window.LimedtecSessao, p = L && L.perfil && L.perfil();
          return !!(p && p.papel === 'gestor_geral' && p.ativo !== false);
        }catch(e){ return false; }
      },
      logout: logout,
      trocarSenha: trocarSenha
    };
    if(document.body) injectBar();
    else document.addEventListener('DOMContentLoaded', injectBar);
    document.dispatchEvent(new CustomEvent('gm-auth-ready', { detail: window.gmAuth }));
    // e SO AGORA as telas podem consultar o banco: o window.fetch ja esta trocado e o token ja vai
    // junto. Antes disto, toda consulta sairia como anon.
    _dispararPronto('gm-auth-ready');
  }

  async function boot(){
    var s = getSess();
    if(s && s.access_token && s.expires_at && s.expires_at > Date.now() + 15000){ reveal(); return; }
    if(s && s.refresh_token){
      var estado = await refreshEstado();
      if(estado === 'ok'){ reveal(); return; }
      // 'rede' no boot: NÃO pedir senha por causa de rede. A sessão guardada continua valendo
      // (o servidor não disse o contrário) e a 2ª chance do fetch renova sozinha quando voltar.
      // Pedir login aqui é o pior momento possível: o operador digita senha achando que foi
      // deslogado, quando na verdade o Wi-Fi piscou.
      if(estado === 'rede' && s.access_token){ reveal(); return; }
    }
    showLogin();
  }
  boot();
})();
