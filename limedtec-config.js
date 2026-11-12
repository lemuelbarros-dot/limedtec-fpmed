/* LIMEDTEC — ACESSO AO CONFIG DO CLIENTE.  Molde puro: nao conhece nenhum cliente.
 *
 * Dois arquivos, de proposito:
 *   cliente.config.js  = DADO   (muda por cliente; e o unico que o cria_cliente.js reescreve)
 *   limedtec-config.js = LOGICA (igual pra todo mundo; nunca e editado por cliente)
 * Se a logica morasse dentro do config, cada cliente teria a sua copia dela - e no dia de corrigir
 * um bug seria corrigir N vezes, que e exatamente o custo que a produtizacao existe pra matar.
 *
 * >>> A DECISAO QUE MAIS IMPORTA AQUI: `banco()` NAO TEM VALOR-PADRAO. Era tentador escrever
 *     `cfg.banco.url || 'https://...globalmed...'` pra "nao quebrar". So que o cliente 003 que
 *     esquecesse o config nao veria erro nenhum: veria o sistema funcionando lindamente,
 *     lendo o BANCO DA GLOBALMED. Preco, fornecedor e cliente de outra empresa na tela dele.
 *     Isso e a violacao exata que o COMPLIANCE.md proibe, e ela chegaria disfarcada de sucesso.
 *     Entao: sem config, explode na cara de quem instalou, com o nome do arquivo que falta.
 *     Falhar alto e barato; vazar dado entre empresas nao tem desfazer.
 */
(function (raiz) {
  'use strict';

  function cfg() {
    var c = raiz.LIMEDTEC_CLIENTE;
    if (!c) throw new Error('LIMEDTEC: cliente.config.js não foi carregado. '
      + 'Ele precisa vir ANTES deste arquivo no <head>.');
    return c;
  }

  function banco() {
    var b = cfg().banco;
    // O PLACEHOLDER CONTA COMO AUSENTE. O cria_cliente.js escreve "https://PREENCHER.supabase.co",
    // que e uma string preenchida e passaria numa checagem de vazio — o sistema abriria e so
    // falharia la na frente, com erro de rede, longe da causa. Aqui ele para na hora, dizendo o
    // que falta.
    var falta = !b || !b.url || !b.anonKey
      || /PREENCHER/i.test(String(b.url)) || /PREENCHER/i.test(String(b.anonKey));
    if (falta) {
      throw new Error('LIMEDTEC: cliente.config.js está sem `banco.url` ou `banco.anonKey` '
        + '(ou ainda com o texto PREENCHER). Coloque o Supabase DESTE cliente — não existe valor '
        + 'padrão de propósito, para que uma instalação incompleta nunca leia o banco de outra empresa.');
    }
    return b;
  }

  // atalhos usados pelas telas
  function urlBanco() { return banco().url; }
  function chaveBanco() { return banco().anonKey; }
  // Cabecalho de LEITURA de dado protegido por RLS (A_515): token da SESSAO de gente (gm-auth),
  // nunca a chave anonima no Authorization — com ela a RLS devolve 0 linhas e a tela fica vazia.
  // Sem sessao, cai na anonima (o servidor responde o que a RLS permitir).
  function cabecalhosDados() {
    var tok = null;
    try { var s = JSON.parse(raiz.localStorage.getItem('gm_session') || 'null'); tok = s && s.access_token; } catch (e) {}
    return { apikey: chaveBanco(), Authorization: 'Bearer ' + (tok || chaveBanco()) };
  }
  function edge(nome) { return banco().url + '/functions/v1/' + nome; }
  function rest(caminho) { return banco().url + '/rest/v1/' + caminho; }

  function nome() { return cfg().nome || ''; }
  function tituloJanela(sufixo) {
    var p = (cfg().marca && cfg().marca.produto) || 'LIMEDTEC';
    return p + ' — ' + nome() + (sufixo ? ' · ' + sufixo : '');
  }

  // ── OS DADOS DA EMPRESA, POR NOME ───────────────────────────────────────────────────────────
  // Um so lugar de leitura pra tela, pro PDF e pro WhatsApp. Chave desconhecida devolve string
  // VAZIA e nao 'undefined': documento que sai pro hospital nao pode carregar a palavra undefined
  // por causa de um campo que o config daquele cliente nao tem.
  function emp(campo) {
    var e = cfg().empresa || {};
    if (campo === 'nome') return nome();
    if (campo === 'nomeCompleto') return cfg().nomeCompleto || nome();
    if (campo === 'descritor') return (cfg().marca && cfg().marca.descritor) || '';
    if (campo === 'logo') {
      var l = (cfg().marca && cfg().marca.logo) || {};
      return ((l.antes || '') + (l.destaque || '')) || nome().toUpperCase();
    }
    var v = e[campo];
    return v == null ? '' : String(v);
  }

  // ── A MARCA ESCRITA NA TELA, DECLARADA PELA TELA ────────────────────────────────────────────
  // A tela escreve <span data-limedtec="razaoSocial"></span> e o molde preenche. O sentido disso
  // e o mesmo do data-exige da sessao: quem sabe o que quer mostrar e a TELA; quem sabe o VALOR e
  // o config. Lista central de "onde aparece o nome da empresa" e exatamente o que a tela nova
  // esquece de atualizar.
  //   data-limedtec="logo"  ganha o corte em dois pedacos (o segundo em <span>, cor de destaque),
  //   porque e assim que a logo de texto e desenhada em todas as telas.
  function pintaMarca(onde) {
    if (typeof document === 'undefined') return 0;
    var alvo = onde || document;
    var n = 0;
    // O TITULO DA JANELA e o unico texto de marca que nao esta no corpo: ele e o <title>, e a aba
    // do navegador nao le var() nem <span>. A tela declara so o SUFIXO dela
    // (<title data-limedtec-titulo="Sistema Interno">) e o molde monta "LIMEDTEC — {cliente} · ...".
    var t = alvo.querySelector ? alvo.querySelector('title[data-limedtec-titulo]') : null;
    if (t) { document.title = tituloJanela(t.getAttribute('data-limedtec-titulo') || ''); n++; }
    var els = alvo.querySelectorAll('[data-limedtec]');
    Array.prototype.forEach.call(els, function (el) {
      var campo = el.getAttribute('data-limedtec');
      if (campo === 'logo') {
        var l = (cfg().marca && cfg().marca.logo) || {};
        var a = l.antes == null ? nome().toUpperCase() : String(l.antes);
        var d = l.destaque == null ? '' : String(l.destaque);
        el.textContent = a;
        if (d) { var s = document.createElement('span'); s.textContent = d; el.appendChild(s); }
      } else {
        el.textContent = emp(campo);
      }
      n++;
    });
    // <span data-limedtec-tela="busca"> recebe o NOME DA TELA. Mesma ideia do data-limedtec: a
    // tela diz ONDE o nome entra, o molde diz QUAL e. Serve pro texto estatico que nao passa por
    // JavaScript nenhum (um <p class="desc"> de explicacao, por exemplo) e que por isso ficaria
    // com o nome de uma pessoa escrito dentro pra sempre.
    // <img data-limedtec-alt="nomeCompleto"> recebe o texto alternativo da imagem.
    var alts = alvo.querySelectorAll ? alvo.querySelectorAll('[data-limedtec-alt]') : [];
    for (var ai = 0; ai < alts.length; ai++) alts[ai].setAttribute('alt', emp(alts[ai].getAttribute('data-limedtec-alt')));
    var telas = alvo.querySelectorAll ? alvo.querySelectorAll('[data-limedtec-tela]') : [];
    Array.prototype.forEach.call(telas, function (el) {
      el.textContent = tela(el.getAttribute('data-limedtec-tela'));
      n++;
    });
    // <select data-limedtec-equipe> ganha um <option> por pessoa do config. A tela diz ONDE quer a
    // lista; quem sabe QUEM esta na equipe e o config. Escrever os nomes no <select> punha as
    // pessoas de um cliente dentro do molde — e deixava de fora quem entrasse depois delas.
    var listas = alvo.querySelectorAll ? alvo.querySelectorAll('[data-limedtec-equipe]') : [];
    Array.prototype.forEach.call(listas, function (sel) {
      var eq = cfg().equipe || {};
      // ordena pelo NOME e nao pelo e-mail: e o nome que aparece na lista.
      Object.keys(eq).map(function (k) { return eq[k]; })
        .filter(function (v, i, a) { return v && a.indexOf(v) === i; })
        .sort(function (a, b) { return String(a).localeCompare(String(b), 'pt-BR'); })
        .forEach(function (nomePessoa) {
          if (sel.querySelector('option[value="' + String(nomePessoa).replace(/"/g, '') + '"]')) return;
          var o = document.createElement('option');
          o.value = nomePessoa; o.textContent = nomePessoa;
          sel.appendChild(o);
        });
      n++;
    });
    return n;
  }

  // ── TEMA: as cores do cliente viram variaveis CSS ───────────────────────────────────────────
  // Roda como script BLOQUEANTE no <head>, antes do corpo pintar - senao a tela aparece com a cor
  // do molde e troca na frente do usuario. E so ESCREVE as variaveis: a folha de estilo de cada
  // tela continua sendo a dona do layout.
  //
  // >>> POR QUE O PREFIXO --lt-, E POR QUE ISSO NAO E ENFEITE (05/08, corrigindo um bug no ar):
  //     a primeira versao escrevia os nomes CURTOS (--bg, --borda, --txt) direto no <html>. Como
  //     e style INLINE no proprio elemento que o `:root{}` da folha casa, o inline VENCE - e
  //     venceu em telas que ja usavam `--bg` com o sentido OPOSTO. O globalmed_sistema_final e o
  //     globalmed_vendedora sao CLAROS (`--bg:#EDF1F6`, `body{background:var(--bg);
  //     color:var(--texto)}`): o tema pintou o fundo de #0A141C e deixou o texto em #1a2e1a.
  //     Contraste 1,3:1 - texto invisivel, medido no navegador, nao suposto.
  //     A causa nao era a cor: era o molde escrever num NOME COMUM dentro do escopo global de
  //     uma tela que ele nao conhece. Nome de variavel global sem prefixo e colisao esperando
  //     acontecer, e o molde e justamente quem nao pode saber o que cada cliente ja usa.
  //     Agora o molde OFERECE (--lt-*) e cada tela ESCOLHE:  --bg: var(--lt-bg, #0f1620);
  //     Tela que nao quer o tema simplesmente nao pede, e nada por baixo dela muda.
  //     A catraca disso e o assert 12/13 do tests/testa_produtizacao.js.
  // >>> `textoForte` ENTROU EM 17/09/2026, e o motivo e concreto: `texto` (--lt-txt) e o tom de
  //     APOIO (#8FA4B4 no cliente 001) — rotulo, legenda, o que fica em segundo plano. O tom do
  //     CORPO, o que a pessoa realmente le, e outro (#EAF1F7 no desenho), e ele nao tinha nome
  //     nenhum aqui. Resultado medido: cada tela escrevia o proprio branco a mao — o Sistema
  //     interno tinha #EAF1F7, o limedtec-tokens.css tinha #ffffff, e ninguem sabia qual valia.
  //     Duas cores de texto em dois arquivos e o ralo 1: uma ia envelhecer.
  //     ⛔ Cliente que nao declarar `textoForte` NAO MUDA EM NADA: o token continua com o valor do
  //        limedtec-tokens.css, porque o laco abaixo so escreve o que o config traz (`if (c[k])`).
  var CORES = { bg: '--lt-bg', painel: '--lt-panel', painel2: '--lt-panel2',
    destaque: '--lt-ciano', destaque2: '--lt-ciano2', acao: '--lt-acao',
    texto: '--lt-txt', textoForte: '--lt-txt-forte', borda: '--lt-borda',
    // >>> O BRILHO DA PORTA DE ENTRADA. O portal e o portao de login tem o mesmo fundo do desenho:
    //     um brilho radial da cor da marca, saindo de cima, sobre um preto mais fundo que o da
    //     pagina. Sao as DUAS primeiras telas que qualquer pessoa ve — deixar essa cor escrita
    //     nelas mandaria a marca da GlobalMed para a tela de entrada do proximo cliente.
    portalBrilho: '--lt-portal-brilho', portalFundo: '--lt-portal-fundo' };

  function aplicaTema() {
    if (typeof document === 'undefined') return;
    var m = cfg().marca || {}, c = m.cores || {};
    var el = document.documentElement;
    Object.keys(CORES).forEach(function (k) { if (c[k]) el.style.setProperty(CORES[k], c[k]); });
    if (m.produto) el.setAttribute('data-limedtec-produto', m.produto);
    // A barra do navegador/PWA e a MESMA cor do config. Ela nao entende var(--lt-bg): o valor tem
    // que estar escrito no atributo, entao quem escreve e daqui. O manifest recebe a mesma cor por
    // tools/gera_manifest.js - dois consumidores, uma fonte.
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc && c.bg) tc.setAttribute('content', c.bg);
  }

  // ── OS MODELOS DE IA, DECLARADOS UMA VEZ ────────────────────────────────────────────────────
  // Ler pedido, ler espelho e ler cotacao chamavam a MESMA dupla de modelos escrita a mao em 5
  // lugares (3 na giovana, 2 no sistema_final). Trocar de modelo era achar os 5 — e a tela que
  // ficasse pra tras leria pedido com um modelo e espelho com outro, sem ninguem perceber.
  // Isto e do MOLDE e nao do cliente: o modelo e o mesmo em toda instalacao. Por isso mora aqui,
  // e nao no cliente.config.js — la seria uma copia por cliente pra manter.
  // O RESERVA existe pro caso do principal responder not_found (modelo retirado): a tela cai nele
  // em vez de devolver "erro da IA" pra quem esta com o pedido na mao.
  // 06/08: principal atualizado de claude-opus-4-5 para claude-opus-5 (decisao do Lemuel).
  // O reserva continua o Haiku 4.5, agora pelo APELIDO e nao pelo id com data: os dois apontam
  // pro mesmo modelo, e o apelido nao precisa ser trocado quando sair um snapshot novo.
  // O reserva NAO subiu de familia de proposito: ele existe pro caso de o principal responder
  // not_found, e um reserva do mesmo tamanho do principal nao e reserva de nada — se o Opus
  // estiver indisponivel pra conta, o Haiku e o que ainda responde.
  var IA = { principal: 'claude-opus-5', reserva: 'claude-haiku-4-5' };
  function ia(qual) { return IA[qual || 'principal'] || IA.principal; }

  // ── O TEXTO DA RESPOSTA DA IA, VENHA ELE NO BLOCO QUE VIER ──────────────────────────────────
  // >>> ISTO DERRUBOU A LEITURA DE PEDIDO POR IMAGEM (07/08). As quatro telas que chamam a IA
  //     liam `data.content[0].text`, ou seja: "o primeiro bloco da resposta e o texto". Isso era
  //     verdade com o modelo anterior. O `claude-opus-5` responde com DOIS blocos —
  //     [thinking, text] — e o primeiro NAO tem `.text`.
  //     Efeito medido com uma foto de pedido de verdade: a IA leu os itens certinho (442 chars,
  //     10 produtos) e a tela recebeu string vazia, caindo na mensagem
  //     "Nenhum produto encontrado no arquivo" — ou seja, o sistema apontou o dedo pro ARQUIVO
  //     do cliente por um defeito que era de leitura da resposta.
  // >>> POR ISSO MORA AQUI, e nao em cada tela: eram QUATRO copias da mesma suposicao, e as
  //     quatro quebraram no mesmo dia. Tela nova que chamar IA ja nasce lendo certo.
  //     Junta TODOS os blocos de texto: se um dia vierem dois, nenhum se perde.
  function iaTexto(data) {
    var c = data && data.content;
    if (!c || !c.length) return '';
    var partes = [];
    for (var i = 0; i < c.length; i++) {
      if (c[i] && c[i].type === 'text' && typeof c[i].text === 'string') partes.push(c[i].text);
    }
    return partes.join('\n');
  }

  // ── O NOME DAS TELAS (do MOLDE: igual em todo cliente) ──────────────────────────────────────
  // A tela de busca de preco se chama "globalmed_giovana.html" porque foi feita PARA a Giovana,
  // que trabalhava na GlobalMed. O nome do ARQUIVO nao da pra trocar sem quebrar link, favorito e
  // historico — mas o nome que a PESSOA LE nao tem nada a ver com o arquivo, e um cliente 003
  // lendo "Use a tela da Giovana" esta lendo o nome de uma funcionaria de outra empresa.
  // >>> ISTO E DO MOLDE E NAO DO CLIENTE, pela mesma razao do modelo de IA: o nome da FUNCAO
  //     ("busca de precos") e o mesmo em toda instalacao. Se fosse pro cliente.config.js, seria
  //     uma copia por cliente pra manter, e a primeira a ficar pra tras nao teria como avisar.
  var TELAS = { busca: 'Busca de Preços' };
  function tela(chave) { return TELAS[chave] || String(chave || ''); }

  // ── O NOME DE QUEM ENTROU ───────────────────────────────────────────────────────────────────
  // As tabelas guardam o NOME na coluna `vendedora`; quem entra e identificado pelo e-mail.
  // Sem correspondencia devolve o PROPRIO e-mail, nunca o nome de outra pessoa: um padrao como
  // "cai na Isadora" faria o prospect de um funcionario novo aparecer na carteira dela.
  function quemE(email) {
    var e = String(email || '').toLowerCase().trim();
    if (!e) return '';
    var eq = cfg().equipe || {};
    return eq[e] || e;
  }

  // ── QUEM AUTORIZA O QUE PASSA DO TETO ───────────────────────────────────────────────────────
  // A mensagem que o vendedor le quando esbarra no limite de desconto precisa dizer PARA QUEM
  // pedir. Esse nome e dado do CLIENTE, e por isso ele nao pode estar escrito na tela: as telas
  // sao MOLDE e a proxima empresa herdaria o nome do dono desta. E o mesmo motivo que tirou a
  // lista `equipe` de dentro do globalmed_vendedora.html em 05/08.
  // Config sem o campo devolve a frase neutra da casa — nunca 'undefined' na cara de ninguem.
  function quemAutoriza() { return cfg().autorizaDesconto || 'quem administra o sistema'; }

  // A MESMA cor, pra quem monta HTML em JavaScript (janela de impressao, relatorio, e-mail).
  // Documento aberto com window.open NAO herda as variaveis CSS desta pagina - la o var(--lt-bg)
  // nao resolve e a cor sai vazia. Nesses lugares o valor tem que viajar como TEXTO, e o unico
  // lugar de onde ele pode sair continua sendo o config.
  function cor(nome, reserva) {
    var c = (cfg().marca || {}).cores || {};
    return c[nome] || reserva || '';
  }

  raiz.LIMEDTEC = { cfg: cfg, banco: banco, urlBanco: urlBanco, chaveBanco: chaveBanco, cabecalhosDados: cabecalhosDados,
    edge: edge, rest: rest, nome: nome, tituloJanela: tituloJanela, aplicaTema: aplicaTema,
    cor: cor, emp: emp, pintaMarca: pintaMarca, ia: ia, iaTexto: iaTexto, quemE: quemE, tela: tela,
    quemAutoriza: quemAutoriza };

  // ── OS AFAZERES ENTRAM SOZINHOS EM TODA TELA (Lemuel, 10/08) ────────────────────────────────
  // >>> A CAIXINHA NAO E FUNCAO DE TELA NENHUMA. Ela segue o E-MAIL LOGADO, nao a pagina: a
  //     cotacao (e qualquer outra) apenas RECEBE a caixinha por estar dentro do sistema.
  // >>> POR ISSO A INJECAO MORA AQUI, e nao numa tag <script> por tela. Com a tag, tela NOVA so
  //     ganha a caixinha se alguem lembrar de colocar — e "lembrar" e exatamente o que falha. Este
  //     arquivo ja e o primeiro script de toda tela do molde; quem carrega o config ganha os
  //     afazeres, inclusive as telas que ainda nem foram escritas.
  // >>> defer: o componente espera o gm-auth por conta propria (gmQuandoPronto). Carregar cedo nao
  //     adianta e atrasar a tela, sim, atrapalha.
  (function injetaAfazeres() {
    try {
      if (typeof document === 'undefined') return;
      if (document.querySelector('script[src*="limedtec-afazeres.js"]')) return;
      var s = document.createElement('script');
      s.src = 'limedtec-afazeres.js';
      s.defer = true;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) { /* uma caixinha que nao carrega nao pode derrubar a tela */ }
  })();

  // ── O CAMINHO DE VOLTA (melhoria vinda da instalacao FPMED, Lemuel 11/08) ───────────────────
  // >>> A VARREDURA ANTES DO CODIGO acho o tamanho real do problema: das 16 telas do repo, o UNICO
  //     link entre telas era o "Cotacao" do sistema_final apontando pra giovana. NENHUMA tela
  //     tinha volta. Quem abria a Viabilidade, o Painel, a Prospeccao ou o Estoque so saia pelo
  //     endereco ou pela seta do navegador. Nao era uma tela reclamada — eram todas.
  // >>> MORA AQUI, e nao numa tag por tela, pela mesma razao dos afazeres: com tag, a proxima tela
  //     so ganha o botao se alguem LEMBRAR, e lembrar e o que falha.
  // >>> HREF, NUNCA history.back(): a seta do navegador devolve a pagina pelo BFCACHE, e o
  //     sistema_final ja teve que ganhar um 'pageshow' justamente porque uma pagina restaurada
  //     reaparece com o boot que falhou. Um link e sempre carga nova — nao tem esse problema pra
  //     ter, e ainda funciona com o botao do meio e o "abrir em nova aba".
  // >>> O MENU E O index.html, e e o UNICO nome de tela que este arquivo conhece — de proposito.
  //     Este e o MOLDE: ele roda em cliente cujas telas eu nunca vi, e a suite de produtizacao
  //     reprova qualquer nome de cliente escrito aqui (foi ela que pegou a 1a versao desta funcao,
  //     que trazia o nome do arquivo do "Sistema Completo" da casa). O index existe em toda
  //     instalacao; o resto se descobre em tempo de execucao.
  // >>> E CADA UMA VOLTA PRA ONDE VEIO, SEM LISTA NENHUMA: a 2a volta e o REFERRER. Quem chegou
  //     pelo Sistema volta pro Sistema; quem chegou de outra tela volta pra ela. O rotulo sai do
  //     proprio endereco de onde a pessoa veio, com a marca do cliente removida em tempo de
  //     execucao ("..._sistema_final.html" -> "Sistema final"). Sem referrer (link direto, PWA,
  //     F5) fica so a volta pro menu, que sempre serve.
  (function caminhoDeVolta() {
    try {
      if (typeof document === 'undefined') return;
      var MENU = 'index.html';
      var arq = (location.pathname.split('/').pop() || MENU).toLowerCase();
      if (!arq || arq.indexOf('.') < 0) arq = MENU;                 // servido como "/" = o menu
      // "globalmed_sistema_final.html" -> "Sistema final". Tira a marca do cliente (que vem do
      // config, nao daqui) e o prefixo do molde, troca separador por espaco e capitaliza.
      var rotulo = function (nomeArq) {
        var s = nomeArq.replace(/\.html?$/, '').replace(/[_-]+/g, ' ').trim();
        var marca = '';
        try { marca = String(nome() || '').toLowerCase().replace(/[^a-z0-9]/g, ''); } catch (e) {}
        s = s.split(/\s+/).filter(function (w) {
          var k = w.toLowerCase().replace(/[^a-z0-9]/g, '');
          return k && k !== 'limedtec' && !(marca && k === marca);
        }).join(' ');
        if (!s) return 'Voltar';
        if (s.length > 22) s = s.slice(0, 21).trim() + '…';
        return s.charAt(0).toUpperCase() + s.slice(1);
      };
      var monta = function () {
        if (!document.body || document.querySelector('[data-limedtec-voltar]')) return;
        // a tela se declara HUB ou FLUXO e nao ganha botao (o menu nao volta pra si mesmo)
        if (document.documentElement.hasAttribute('data-limedtec-sem-voltar')
            || document.body.hasAttribute('data-limedtec-sem-voltar')) return;
        var destinos = [];
        if (arq !== MENU) destinos.push(['← Menu', MENU]);
        var ref = '';
        try {                                   // so mesma origem: referrer de fora nao vira botao
          var u = document.referrer ? new URL(document.referrer, location.href) : null;
          if (u && u.origin === location.origin) ref = (u.pathname.split('/').pop() || '').toLowerCase();
        } catch (e) {}
        if (ref && ref !== arq && ref !== MENU && /\.html?$/.test(ref)) {
          destinos.push(['← ' + rotulo(ref), ref]);
        }
        if (!destinos.length) return;
        if (!document.getElementById('limedtec-voltar-css')) {
          var st = document.createElement('style'); st.id = 'limedtec-voltar-css';
          // O BOTAO TRAZ O PROPRIO FUNDO — a licao do amarelo dos afazeres (10/08). Ele roda em
          // tela CLARA (painel, calculadora) e ESCURA (cotacao); amarrar a cor ao tema da pagina
          // daria um botao legivel num lugar e apagado no outro, e quem some nao serve de saida.
          // #dbe9f2 sobre #14202b = 13,1:1 em qualquer tela (minimo AA pra texto pequeno: 4,5:1).
          st.textContent = '[data-limedtec-voltar]{position:fixed;top:8px;left:8px;z-index:2147482500;'
            + 'display:flex;gap:6px;font:600 12px Inter,system-ui,"Segoe UI",Arial,sans-serif}'
            + '[data-limedtec-voltar] a{background:#14202b;color:#dbe9f2;text-decoration:none;'
            + 'border:1px solid rgba(219,233,242,.28);border-radius:16px;padding:5px 12px;'
            + 'box-shadow:0 3px 12px rgba(0,0,0,.28);white-space:nowrap;line-height:1.3}'
            + '[data-limedtec-voltar] a:hover{background:#1d2f3f;border-color:rgba(219,233,242,.55)}'
            // ═══ O PISO DE TOQUE NO CELULAR (fase 2, fatia 5 — 13/08/2026) ═════════════════════
            // Medido em 390px no Sistema interno: o "← Menu" saiu com 27px de altura. Ele e a
            // SAIDA da tela — errar o alvo aqui e ficar preso numa tela que nao e a que se queria,
            // que e o pior lugar pra um botao pequeno estar.
            // >>> `display:flex;align-items:center` vem junto porque `min-height` sozinho num <a>
            //     levanta a caixa e deixa o texto colado no topo: o alvo cresceria e a peca
            //     ficaria torta. O flex recentra sem mexer no `padding` que ja estava escrito.
            // >>> Reserva `, 44px` obrigatoria: este arquivo pinta antes do limedtec-tokens.css.
            + '@media (max-width:480px){[data-limedtec-voltar] a{'
            + 'min-height:var(--lt-toque-min, 44px);display:flex;align-items:center}}';
          (document.head || document.documentElement).appendChild(st);
        }
        var d = document.createElement('nav');
        d.setAttribute('data-limedtec-voltar', arq);
        // ENFEITE INTERNO: a regra generica de impressao (logo abaixo) alcanca este atributo e o
        // botao nunca sai no PDF da proposta.
        d.setAttribute('data-limedtec-interno', 'voltar');
        d.setAttribute('aria-label', 'voltar');
        destinos.forEach(function (x) {
          var a = document.createElement('a');
          a.href = x[1]; a.textContent = x[0]; a.title = 'voltar para ' + x[0].replace(/^←\s*/, '');
          d.appendChild(a);
        });
        document.body.appendChild(d);
        // PUBLICA A PROPRIA ALTURA, como a tarja de licenca faz com --limedtec-rodape. Medido em
        // 11/08: o botao nao tapa CONTROLE nenhum em tela alguma (medido com elementFromPoint nas
        // 12 telas), mas em 6 delas ele fica por cima do TEXTO da marca no cabecalho. Reservar
        // espaco por conta propria (mexer no padding do body) quebraria cabecalho fixo e layout de
        // 100vh — coisas que este arquivo nao pode conhecer, porque e MOLDE. Entao ele publica a
        // medida e quem quiser recuar usa UMA linha:  padding-top: var(--lt-voltar, 0px)
        try {
          document.documentElement.style.setProperty('--lt-voltar',
            (Math.ceil(d.getBoundingClientRect().height) + 12) + 'px');
        } catch (e) {}
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta);
      else monta();
    } catch (e) { /* um botao que nao aparece nao pode derrubar a tela */ }
  })();

  // ── ENFEITE INTERNO NAO SAI NO PAPEL DO CLIENTE (Lemuel, 10/08) ─────────────────────────────
  // >>> O CASO QUE ABRIU ISTO: Ctrl+P numa proposta e a caixinha de afazeres SAIU IMPRESSA, com o
  //     texto da tarefa interna legivel no documento que foi pro cliente. A varredura achou mais
  //     tres flutuantes na mesma situacao — a barra de sessao (com o e-mail do vendedor), a faixa
  //     e o botao "Instalar" do PWA. A tarja de licenca ja tinha a regra, e foi dela que veio o
  //     formato: um data-atributo que o elemento poe em si mesmo.
  // >>> A REGRA MORA AQUI, UMA VEZ, e cada flutuante se DECLARA. O contrario — listar os ids aqui —
  //     obriga quem escrever o proximo widget a lembrar de vir editar este arquivo, e "lembrar" e
  //     exatamente o que falha (a mesma razao da injecao dos afazeres logo acima).
  // >>> O QUE NAO ENTRA, DE PROPOSITO: os overlays de BLOQUEIO (limedtec-bloqueio, gm-auth-overlay).
  //     Eles cobrem a tela inteira porque a pessoa NAO PODE ver aquilo. Esconde-los na impressao
  //     deixaria imprimir o conteudo que eles estao tapando — seria trocar um vazamento visual por
  //     um vazamento de permissao.
  (function naoImprimeEnfeiteInterno() {
    try {
      if (typeof document === 'undefined') return;
      var SEL = '[data-limedtec-interno],[data-limedtec-aviso]';
      if (!document.getElementById('limedtec-print-css')) {
        var st = document.createElement('style'); st.id = 'limedtec-print-css';
        st.textContent = '@media print{[data-limedtec-interno],[data-limedtec-interno] *,'
          + '[data-limedtec-aviso],[data-limedtec-aviso] *{display:none!important}}';
        (document.head || document.documentElement).appendChild(st);
      }
      // cinto e suspensorio: ha navegador que gera o PDF sem avaliar @media print de folha
      // INJETADA por script. O display inline nao depende de folha nenhuma.
      var alterna = function (sim) {
        var l = document.querySelectorAll(SEL);
        for (var i = 0; i < l.length; i++) {
          if (sim) l[i].style.setProperty('display', 'none', 'important');
          else l[i].style.removeProperty('display');     // remover, nunca chutar um valor
        }
      };
      window.addEventListener('beforeprint', function () { alterna(true); });
      window.addEventListener('afterprint', function () { alterna(false); });
      var mq = window.matchMedia && window.matchMedia('print');   // Safari/iOS nao dao beforeprint
      if (mq) {
        var h = function (e) { alterna(!!e.matches); };
        if (mq.addEventListener) mq.addEventListener('change', h);
        else if (mq.addListener) mq.addListener(h);
      }
    } catch (e) { /* protecao de impressao nunca derruba a tela */ }
  })();

  // A tela nao precisa lembrar de chamar. Ela declara o data-limedtec e o molde preenche assim que
  // o corpo existir - inclusive nas telas que ainda nem foram escritas. Lembrar e o que falha.
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { pintaMarca(); });
    } else { pintaMarca(); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = raiz.LIMEDTEC;
})(typeof window !== 'undefined' ? window : globalThis);
