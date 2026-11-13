// limedtec-layout.js — A CASCA DO SISTEMA: barra lateral + cabecalho, IGUAL ao desenho.
//
// >>> ORDEM DO DONO, 17/09/2026: "quero sistema igual o design visual" · "quero exatamente o que
//     esta la". Alvo: design\LIMEDTEC-Sistema-standalone.html. Lei: LEI_VISUAL_IDENTICO.md.
//
// >>> DE ONDE SAIU CADA VALOR DAQUI: do proprio arquivo do Design. As telas dele estao guardadas
//     como TEXTO ESCAPADO dentro do JavaScript (o arquivo nao pinta sozinho), entao o HTML foi
//     desescapado e lido: 194 KB legiveis. ⛔ Nada aqui e "parecido de memoria" — e copia do que
//     esta escrito la (cores, tamanhos, espacos, letter-spacing, raios, sombras).
//
// >>> O LOGO: `limedteclockupescuro.png`, por ordem do dono — os 20 arquivos por UUID que o
//     Design referencia (logo, fontes) NAO vieram no repositorio.
//
// ⛔ ISTO E ROUPA. Nao ha conta aqui: nenhum preco, nenhuma margem, nenhum numero de banco.
// ⛔ A MURALHA: o seletor entra com UMA instancia so — a instancia 001 do config.

(function () {
  'use strict';

  // ── O MENU, exatamente como o Design declara (grupos, ordem, icone e rotulo) ────────────────
  // ⚠ Item que ainda NAO tem tela continua no menu e abre com "em construcao" DECLARADO —
  //   ordem do dono: "nunca clica e nao acontece nada, e nunca some do menu".
  var NAV = [
    { label: 'Principal', items: [
      { id: 'dashboard', ico: 'layout-dashboard', tit: 'Dashboard', href: 'limedtec-dashboard.html' },
    ]},
    { label: 'Banco de dados', items: [
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'fornecedores', ico: 'building-2', tit: 'Fornecedores', href: 'globalmed_sistema_final.html#fornecedores' },
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'catalogo',     ico: 'atom',       tit: 'Catálogo por PA', href: 'globalmed_sistema_final.html#catalogo-pa' },
      // ⛔⛔ 18/09 09:4x — RESTAURADO PELO CEO, POR ORDEM DIRETA DO DONO.
      //    Palavra dele: "voce tirou Cotacoes DEMAIS. A ordem era tirar Orcamento e Cotacoes do
      //    grupo COMERCIAL. Voce tirou tambem o Cotacoes do grupo BANCO DE DADOS, que tinha que
      //    ficar. Poe de volta, do jeito que estava, COM OS DADOS."
      //    ⛔ O ERRO FOI DO CEO, e esta escrito para nao se repetir: eu decidi "sigo o que ele
      //    NOMEOU, nao o grupo" — e ele tinha dito o GRUPO de proposito. Havia DOIS itens com o
      //    mesmo nome em grupos diferentes, e so um devia sair.
      { id: 'cotacoes', ico: 'file-text', tit: 'Cotações', href: 'globalmed_sistema_final.html#cotacoes' },
      { id: 'pedir-cotacao', ico: 'send', tit: 'Pedir cotação', href: 'limedtec-pedir-cotacao.html' },
    ]},
    // ⛔ 18/09 CAIXA_COTACOES_MENU_DO_DESENHO, ordem do dono (17/09 23:5x): SAIU do menu
    // "Orçamento" (limedtec-orcamento.html), do grupo COMERCIAL — SÓ sumiu do menu, nenhum
    // arquivo foi apagado.
    //
    // ⛔⛔ E A LEI QUE NASCEU DO ERRO DE HOJE, 18/09 — ORDEM DO DONO:
    //    "é para dar apenas uma roupagem, vc tirou e sumiu os dados?"
    //    ███ ITEM DE MENU APONTA PARA A TELA QUE TEM O DADO. ███
    //    Vestir é trocar a ROUPA de uma tela que funciona — ⛔ NUNCA trocar a tela que tem dado
    //    por uma tela nova vazia com a roupa bonita. Roupa sem dado é tela quebrada.
    //    ⚠ Onde a tela nova ainda não carrega o dado, o item aponta para
    //      globalmed_sistema_final.html#<pagina> (o roteador por hash existe desde o commit
    //      39d4a36 de hoje) — e só volta para a tela nova quando ela mostrar o MESMO dado.
    { label: 'Comercial', items: [
      { id: 'ofertas',     ico: 'tag',            tit: 'Ofertas da semana', href: 'globalmed_vendas.html' },
      { id: 'prospeccao',  ico: 'target',         tit: 'Prospecção',        href: 'globalmed_vendedora.html' },
      // ⛔ Esta tela JA EXISTIA (5 KPIs, lista e painel de detalhe, lendo o banco). A tela nova que
      //    eu tinha criado era a MESMA coisa pela segunda vez — ralo 1. Apaguei a minha.
      // B_182, 21/09 — item TIRADO DO MENU por ordem do dono: dashboard_clientes.html:174 tinha
      // const DATA com 33 clientes chumbados no arquivo (soma R$ 3.721.382,22 == o "R$ 3,72M" da
      // tela), 0 ocorrencias de supabase/.from(, e a tela se declarava "prototipo". Medicao em
      // auditoria/CEO_21-09_O_3_72_MILHOES.md. O ARQUIVO NAO FOI APAGADO — so saiu do menu.
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'itens',       ico: 'inbox',          tit: 'Itens a cotar', href: 'globalmed_sistema_final.html#itens-a-cotar' },
      // ⛔⛔ 18/09 09:4x — CEO. A tela nova dizia "assim que a tabela existir no banco" e isso
      //    ESTA ERRADO: a tabela `pedidos_compra` JA EXISTE e JA E LIDA em
      //    globalmed_sistema_final.html:3411  ->  sbGet('pedidos_compra', 'status=eq.concluido...')
      //    e a pagina #pedidos-compra (linha 1965) ja mostra os dados.
      //    ⛔ Apontar o menu para a tela vazia foi o que fez o dono ver "Pedidos de compra" sem dado.
      { id: 'pedidos',     ico: 'shopping-cart',  tit: 'Pedidos de compra', href: 'globalmed_sistema_final.html#pedidos-compra' },
      // ⛔ Mesmo caso: a calculadora de comissao ja era a tela de Comissoes. Nao se faz duas.
      { id: 'comissoes',   ico: 'percent',        tit: 'Comissões', href: 'calculadora_comissao_globalmed.html' },
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'externas',    ico: 'globe',          tit: 'Vendas externas', href: 'globalmed_sistema_final.html#vendas-externas' },
      // ⛔ 18/09 — DEVOLVIDO PELO CEO. Ordem do dono: "e so pegar o sistema antigo, tudo
      //    dele, os dados, e colocar nesse". Esta pagina EXISTE no sistema interno e ficou
      //    SEM CAMINHO quando a barra lateral propria saiu na rodada visual.
      { id: 'compras-cliente', ico: 'history', tit: 'Compras por cliente', href: 'globalmed_sistema_final.html#compras-cliente' },
      // ⛔ 18/09 — DEVOLVIDO PELO CEO. Ordem do dono: "e so pegar o sistema antigo, tudo
      //    dele, os dados, e colocar nesse". Esta pagina EXISTE no sistema interno e ficou
      //    SEM CAMINHO quando a barra lateral propria saiu na rodada visual.
      { id: 'oportunidades', ico: 'trending-up', tit: 'Oportunidades de venda', href: 'globalmed_sistema_final.html#oportunidades' },
      // ⛔ 28/10, decisao 199 (A_502): 'Cotacao para cliente' saiu do MENU. A pagina #page-cotacao-cliente
      //    do globalmed_sistema_final.html NAO foi apagada. Desfazer = voltar a linha:
      //    { id: 'cotacao-cliente', ico: 'file-plus', tit: 'Cotação para cliente', href: 'globalmed_sistema_final.html#cotacao-cliente' },
      // ⛔ 18/09 — DEVOLVIDO PELO CEO. Ordem do dono: "e so pegar o sistema antigo, tudo
      //    dele, os dados, e colocar nesse". Esta pagina EXISTE no sistema interno e ficou
      //    SEM CAMINHO quando a barra lateral propria saiu na rodada visual.
      { id: 'autorizacoes', ico: 'badge-check', tit: 'Autorizações de desconto', href: 'globalmed_sistema_final.html#autorizacoes' },
    ]},
    { label: 'Análise', items: [
      { id: 'atualizacao-precos', ico: 'history', tit: 'Atualização de preços', href: 'globalmed_sistema_final.html#atualizacao-precos' },
      { id: 'comparativo',     ico: 'columns-3',  tit: 'Comparativo fornec.', href: 'globalmed_sistema_final.html#comparativo' },
      { id: 'competitividade', ico: 'crosshair',  tit: 'Competitividade',     href: 'globalmed_sistema_final.html#competitividade' },
      { id: 'viabilidade',     ico: 'scale',      tit: 'Viabilidade de compra', href: 'globalmed_viabilidade.html' },
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'alvos',           ico: 'factory',    tit: 'Alvos de compra direta', href: 'globalmed_sistema_final.html#alvos-compra-direta' },
      { id: 'relatorios',      ico: 'line-chart', tit: 'Relatórios',          href: 'globalmed_painel.html' },
    ]},
    { label: 'Dados e acessos', items: [
      // ⛔ 18/09, ordem do dono: rotulo "Importar cotacao" -> "Cotacao" (SO o rotulo). O arquivo
      // globalmed_giovana.html nao foi aberto nem editado — o dono esta trabalhando nele.
      { id: 'importar', ico: 'upload',  tit: 'Cotação', href: 'globalmed_giovana.html' },
      { id: 'garimpo',  ico: 'percent', tit: 'Chegou promoção',  href: 'globalmed_garimpo.html' },
      { id: 'bionexo',  ico: 'send',    tit: 'Bionexo',          href: 'globalmed_bionexo.html' },
      { id: 'apoio',    ico: 'send',    tit: 'Apoio',            href: 'globalmed_apoio.html' },
      // ⛔ 18/09 — ordem do dono: "roupagem nova nunca apaga funcionalidade". A tela nova
      //    dizia "sem dado ainda"; o dado vive na pagina abaixo, no sistema interno.
      //    ⛔ O arquivo limedtec-* NAO foi apagado: so deixou de ser o destino do menu.
      { id: 'espelho',  ico: 'receipt', tit: 'Importar espelho', href: 'globalmed_sistema_final.html#importar-espelho' },
      // ⛔⛔ 18/09 09:4x — CEO. Ordem do dono: "VOCE APAGOU A TELA DE IMPORTAR ESTOQUE GLOBAL".
      //    Medido: a tela NAO foi apagada — sao DUAS. A rica e a pagina #estoque-global (linha
      //    1604 do globalmed_sistema_final.html), que tem o bloco "ITENS AGUARDANDO CHEGAR
      //    (pedidos de compra x estoque GLOBAL)" na linha 1744. A limedtec-estoque.html NUNCA
      //    teve esse bloco (conferido em 5 versoes do git + 2 backups).
      //    ⛔ O menu levava para a pobre. Volta para a que tem o dado.
      { id: 'estoque',  ico: 'package', tit: 'Estoque GLOBAL',   href: 'globalmed_sistema_final.html#estoque-global' },
      { id: 'usuarios', ico: 'users-2', tit: 'Usuários e acessos', href: 'limedtec-usuarios.html' },
    ]},
  ];

  // ── AS CORES DA CASCA ───────────────────────────────────────────────────────────────────────
  // ⛔ ELAS NAO MORAM AQUI. Quem manda na cor da casa e o cliente.config.js: o
  //    LIMEDTEC.aplicaTema() escreve --lt-bg, --lt-panel, --lt-ciano, --lt-acao e --lt-txt no
  //    <html>, e a casca so PERGUNTA. O hexadecimal ao lado de cada var() e RESERVA, para o caso
  //    de o config nao ter carregado — nunca a fonte da verdade.
  // >>> POR QUE ISSO IMPORTA (ralo 1 da LEI_AMARRACAO): a casca aparece em TODAS as telas. Se ela
  //     escrevesse a cor a mao, trocar a cor da casa seria trocar em dois lugares — e um dia os
  //     dois iam discordar, com a barra lateral de uma cor e o conteudo de outra. Agora e um.
  // >>> Os tons que NAO existem no config (lateral, hover, marcado, divisoria) sao derivados do
  //     desenho e ficam aqui de proposito: eles nao sao cor de marca, sao profundidade da casca.
  var C = {
    lateral:  '#04070A',                      // fundo da barra lateral (mais fundo que a pagina)
    linha:    '#141D25',                      // divisoria
    fundo:    'var(--lt-bg, #0A1117)',        // fundo da pagina e dos campos — DO CONFIG
    borda:    '#17222B',                      // borda de campo
    borda2:   '#1A242E',
    txt:      'var(--lt-txt, #8FA4B4)',       // texto normal — DO CONFIG
    txtForte: 'var(--lt-txt-forte, #e6f1f8)',
    branco:   '#fff',
    ciano:    'var(--lt-ciano, #45C9E0)',     // a cor da marca — DO CONFIG
    hover:    '#0F1720',
    marcado:  '#0D1C24',
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function css() {
    if (document.getElementById('lt-casca-css')) return;
    var s = document.createElement('style');
    s.id = 'lt-casca-css';
    s.textContent = [
      // ⛔ ███ O "TREM BRANCO" (18/09) ███ — medido: as telas antigas nascem com `body{display:flex}`
      //    (do tempo do menu antigo, um `.sidebar` fixo + `.main{flex:1}`). A casca move TUDO pra
      //    dentro de `.lt-corpo` e diz `.lt-casca{width:100%}` — mas width:100% de um FLEX ITEM
      //    e so a base do calculo: se sobrar QUALQUER outro filho do body (gm-auth-bar, selo de
      //    versao, botao do assistente — nem sempre fixed no instante em que carregam), o
      //    flex-shrink do body reparte a largura entre os dois, e a casca (e o cabecalho junto,
      //    corta na MESMA marca porque os dois moram dentro dela) para no meio da tela — o "trem
      //    branco". Reproduzido em `.tmp_repro_trembranco.html` com um filho comum do body.
      //    ⛔ A casca faz a propria flexbox (aside+corpo) — o body NAO precisa mais ser flex.
      'html,body{display:block!important;}',
      '.lt-casca{display:flex;min-height:100vh;width:100%;background:' + C.fundo + ';}',
      '.lt-aside{background:' + C.lateral + ';border-right:1px solid ' + C.linha + ';display:flex;',
      '  flex-direction:column;position:sticky;top:0;height:100vh;min-width:0;width:232px;flex:0 0 auto;}',
      '.lt-marca{padding:16px 14px 12px;border-bottom:1px solid ' + C.linha + ';display:flex;',
      '  flex-direction:column;gap:12px;min-width:0;}',
      '.lt-marca-topo{display:flex;align-items:center;gap:10px;min-width:0;}',
      '.lt-logo{width:30px;height:30px;border-radius:9px;flex:0 0 auto;object-fit:contain;',
      '  box-shadow:0 2px 10px rgba(43,166,192,.22);}',
      '.lt-nome{font-family:"Space Grotesk",sans-serif;font-size:15.5px;font-weight:700;',
      '  letter-spacing:.06em;color:' + C.branco + ';}',
      '.lt-sub{font-size:12px;color:' + C.txt + ';letter-spacing:.2em;text-transform:uppercase;margin-top:3px;}',
      '.lt-inst{display:flex;align-items:center;gap:9px;background:' + C.fundo + ';border:1px solid ' + C.borda + ';',
      '  border-radius:9px;padding:7px 9px;min-width:0;}',
      '.lt-inst-ico{width:20px;height:20px;border-radius:6px;background:' + C.marcado + ';display:flex;',
      '  align-items:center;justify-content:center;flex:0 0 auto;color:' + C.ciano + ';}',
      '.lt-inst-nome{font-size:12px;font-weight:600;color:' + C.txtForte + ';overflow:hidden;',
      '  text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;}',
      '.lt-inst-num{font-family:"JetBrains Mono",monospace;font-size:12px;color:' + C.txt + ';}',
      '.lt-busca-cx{padding:12px 12px 8px;}',
      '.lt-busca{display:flex;align-items:center;gap:8px;background:' + C.fundo + ';border:1px solid ' + C.borda + ';',
      '  border-radius:9px;padding:8px 10px;}',
      '.lt-busca input{background:transparent;border:0;outline:0;flex:1;min-width:0;font-size:12.5px;',
      '  color:' + C.txtForte + ';font-family:inherit;}',
      '.lt-busca input::placeholder{color:' + C.txt + ';}',
      '.lt-atalho{font-family:"JetBrains Mono",monospace;font-size:12px;color:' + C.txt + ';',
      '  border:1px solid ' + C.borda2 + ';border-radius:4px;padding:1px 5px;}',
      '.lt-nav{flex:1;overflow-y:auto;padding:2px 12px 12px;display:flex;flex-direction:column;gap:14px;min-width:0;}',
      '.lt-grupo{display:flex;flex-direction:column;gap:1px;min-width:0;}',
      '.lt-grupo-tit{font-size:12px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;',
      '  color:' + C.txt + ';padding:6px 8px;}',
      '.lt-item{display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;',
      '  font-size:12.5px;color:' + C.txt + ';min-width:0;text-decoration:none;',
      '  transition:background .13s,color .13s;}',
      '.lt-item:hover{background:' + C.hover + ';color:' + C.txtForte + ';}',
      '.lt-item.lt-ativo{background:' + C.marcado + ';color:' + C.txtForte + ';font-weight:600;}',
      '.lt-item span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.lt-item .lt-ico{width:15px;height:15px;flex:0 0 auto;}',
      '.lt-corpo{flex:1;min-width:0;display:flex;flex-direction:column;}',
      '.lt-header{display:flex;align-items:center;gap:14px;padding:14px 20px;',
      '  border-bottom:1px solid ' + C.linha + ';background:' + C.lateral + ';}',
      '.lt-eyebrow{font-size:12px;letter-spacing:.17em;text-transform:uppercase;color:' + C.txt + ';}',
      '.lt-titulo{font-family:"Space Grotesk",sans-serif;font-size:22px;font-weight:700;',
      '  color:' + C.txtForte + ';line-height:1.15;}',
      '.lt-obra{margin:auto;padding:40px;text-align:center;color:' + C.txt + ';font-size:13px;}',
      '.lt-obra b{display:block;font-family:"Space Grotesk",sans-serif;font-size:19px;',
      '  color:' + C.txtForte + ';margin-bottom:8px;}',
      '@media(max-width:820px){.lt-aside{display:none;}}',
      // A_521: a faixa fica ABAIXO dos botoes fixos do topo (#gm-auth-bar publica --gm-chip-alt); antes ficava em y=0 por baixo deles.
      '.lt-robos{display:flex;justify-content:flex-end;gap:18px;padding:var(--gm-chip-alt, 48px) 14px 6px;flex-wrap:wrap;position:relative;z-index:1;}',
      '.lt-rb{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:12px;padding:4px 12px 4px 8px;}',
      '.lt-rb{display:flex;align-items:center;gap:6px;font-size:11px;line-height:1.15;color:#64748b;}',
      '.lt-rb-tx{display:flex;flex-direction:column;}.lt-rb-tx b{font-size:11px;color:#334155;}.lt-rb-tx i{font-style:normal;opacity:.7;font-size:10px;}',
      '.lt-rb-verde .lt-rb-ant{animation:lt-pisca 1.4s infinite;}.lt-rb-verde .lt-rb-olho{animation:lt-olha 3s infinite;}',
      '@keyframes lt-pisca{50%{opacity:.2}}@keyframes lt-olha{0%,100%{transform:translateX(0)}50%{transform:translateX(1.2px)}}',
      '@media print{.lt-robos{display:none;}}',

      // ⛔ O "← Menu" FLUTUANTE SOME ONDE A CASCA ESTA — MEDIDO, NAO SUPOSTO.
      //    Print de 17/09 (auditoria/VISUAL2_dashboard.png): ele fica em cima da logo LIMEDTEC e
      //    corta o nome para "IEDTEC". E ele e um menu de VOLTAR numa tela que agora tem o menu
      //    INTEIRO do lado — dois menus e o ralo 1 da LEI_AMARRACAO, e o de baixo tapa o de cima.
      //    ⛔ Nao se apagou o botao: ele continua existindo e valendo nas telas SEM casca (e por
      //       isso a regra e `.lt-casca ~ [data-limedtec-voltar]`, e nao `display:none` geral).
      '.lt-casca ~ [data-limedtec-voltar], .lt-casca [data-limedtec-voltar]{display:none !important;}',

      // ⛔ E O SELO DE VERSAO (#gm-selo-versao) SAI DE CIMA DO MENU, sem sumir. Ele e fixo em
      //    left:8px — nasceu quando nenhuma tela tinha barra lateral — e agora cai por cima do
      //    ultimo item do menu (medido: ele fica em 8,872 e o menu vai ate 232px de largura).
      //    ⛔ Nao se esconde: a data da versao e o que diz se a pessoa esta vendo a tela de hoje
      //       ou uma guardada no cache do navegador. Ele so ANDA para o lado.
      // ⛔ DOIS SELETORES, E NAO E ENFEITE: o flutuante pode acabar IRMAO da casca (quando o
      //    limedtec-config.js o cria depois) ou DENTRO dela (quando ele ja existia e o
      //    montaLayout o levou junto para o .lt-corpo). Medido na giovana: ele estava dentro,
      //    e a regra so com `~` nao pegava — o botao continuou em left:16px, em cima do menu.
      '.lt-casca ~ #gm-selo-versao, .lt-casca #gm-selo-versao{left:244px !important;}',

      // ⛔ E O BOTAO DO ASSISTENTE (#lt-assist-abre) tambem sai de cima do menu, pelo mesmo motivo:
      //    ele e fixo na esquerda e nasceu numa tela sem barra lateral. No print da giovana ele
      //    tapava o item "Alvos de compra direta". ⛔ Nao some — ele e a porta do Assistente, e o
      //    dono ja pagou para ele estar a mao. So anda para o lado da casca.
      '.lt-casca ~ #lt-assist-abre, .lt-casca #lt-assist-abre{left:244px !important;}',

      // ⛔ A FAIXA DE SESSAO (#gm-auth-bar: quem esta logado, trocar senha, Sair) e position:fixed
      //    no canto superior direito e passa POR CIMA do cabecalho. Medido no mesmo print: ela
      //    cobria o botao de acao da tela. A casca nao pode mexer nela (e de outro arquivo), entao
      //    RECUA por conta propria: o cabecalho reserva a largura dela a direita.
      //    ⛔ A MEDIDA E DELA, NAO MINHA: o gm-auth.js publica `--gm-chip-faixa` com a largura que
      //       a faixa REALMENTE ocupou (ele remede quando a fonte assenta, e so aceita valor
      //       MAIOR). Chutar "uns 300px" aqui daria certo hoje e erraria no dia em que o e-mail
      //       de alguem for mais comprido. A reserva do var() e so para a tela sem faixa.
      '.lt-header{padding-right:calc(var(--gm-chip-faixa, 16px) + 16px);}',

      // ⛔ IMPRESSAO — ORDEM DO DONO, 18/09: "o PDF e FUNDO BRANCO, texto preto. O tema escuro e
      //    so da tela, nunca do PDF." A casca aparece em TODAS as telas, entao a regra de print
      //    mora AQUI (ralo 1) e nao em cada tela. Esconde a roupa da casca inteira (barra lateral,
      //    cabecalho, busca, os botoes fixos que a casca deslocou) e forca fundo branco / texto
      //    preto no que sobrar. O `.print-doc` (o documento de verdade) e outro arquivo e continua
      //    dono do seu proprio print-color-adjust:exact.
      '@media print{',
      '  .lt-aside,.lt-header,.lt-busca-cx,#lt-assist-abre,#gm-selo-versao,',
      '  [data-limedtec-voltar],#gm-auth-bar{display:none!important;}',
      '  html,body,.lt-casca,.lt-corpo{background:#fff!important;color:#000!important;}',
      '}',
    ].join('');
    document.head.appendChild(s);
  }

  // ── OS ICONES DO DESENHO ────────────────────────────────────────────────────────────────────
  // O desenho escreve `data-lucide="nome"` e deixa a biblioteca Lucide trocar por um <svg>. No
  // arquivo do desenho ela vinha embutida num anexo que nao veio junto, entao aqui ela vem do CDN
  // — o mesmo lugar de onde as telas ja pegam as fontes.
  // >>> ⛔ SEM ISTO O MENU FICA SEM ICONE NENHUM, e foi o que o print de 17/09 mostrou: 22 itens
  //     de texto puro. `data-lucide` sozinho nao desenha nada — ele e so um bilhete esperando
  //     alguem ler.
  // >>> E A TELA NAO PODE DEPENDER DISSO PRA FUNCIONAR: se o CDN nao responder, o menu continua
  //     inteiro, so sem os desenhinhos. Por isso nada aqui lanca erro, e o `onload` e a unica
  //     coisa que chama o desenhista.
  function icones() {
    // A FOLHA DE ESTILO DA CASA. Ela e INERTE de proposito (nao tem um unico seletor de elemento
    // nu — so `:root` e classes `.lt-*`), entao entrar numa tela nao muda pixel nenhum do que ja
    // estava la. Mas e nela que mora `.lt-icone{width:1.15em;height:1.15em}`.
    // >>> ⛔ SEM ELA O DEFEITO NAO E "ficou sem icone": o <svg><use> SEM TAMANHO cai no padrao do
    //     navegador, 300x150 px, e a faixa de sessao inchou para 547x163 e tapou o cabecalho.
    //     Medido no print de 17/09. Um icone sem folha de estilo nao fica pequeno — fica enorme.
    if (!document.querySelector('link[href*="limedtec-tokens"]')) {
      var tk = document.createElement('link');
      tk.rel = 'stylesheet'; tk.href = 'limedtec-tokens.css';
      document.head.appendChild(tk);
    }
    // o conjunto de icones DA CASA (<use href="#lt-i-...">), que a faixa de sessao e os avisos do
    // gm-auth.js usam.
    if (!document.querySelector('script[src*="limedtec-icones"]') && !document.getElementById('lt-icones-sprite')) {
      var sp = document.createElement('script');
      sp.src = 'limedtec-icones.js';
      document.head.appendChild(sp);
    }
    if (document.getElementById('lt-lucide')) return;
    var l = document.createElement('script');
    l.id = 'lt-lucide';
    l.src = 'https://cdn.jsdelivr.net/npm/lucide@0.460.0/dist/umd/lucide.min.js';
    l.onload = function () { try { window.lucide && window.lucide.createIcons(); } catch (e) {} };
    document.head.appendChild(l);
  }

  function fontes() {
    if (document.getElementById('lt-casca-fontes')) return;
    var l = document.createElement('link');
    l.id = 'lt-casca-fontes';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap';
    document.head.appendChild(l);
  }

  // svg do coracao/instancia, o mesmo caminho do desenho
  var SVG_INST = '<svg viewBox="0 0 32 28" width="13" height="12" aria-hidden="true">'
    + '<path d="M16 25C16 25 3 17.6 3 9.6C3 6 5.9 3.1 9.5 3.1C12 3.1 14.3 4.5 16 6.7C17.7 4.5 20 3.1 22.5 3.1C26.1 3.1 29 6 29 9.6C29 17.6 16 25 16 25Z"'
    + ' fill="none" stroke="currentColor" stroke-width="2.6"></path></svg>';

  function montaAside(ativo) {
    var h = ['<aside class="lt-aside">'];
    h.push('<div class="lt-marca"><div class="lt-marca-topo">');
    h.push('<img class="lt-logo" src="limedteclockupescuro.png" alt="LIMEDTEC">');
    h.push('<div style="min-width:0;display:flex;flex-direction:column;line-height:1.05;">');
    h.push('<b class="lt-nome">LIMEDTEC</b><span class="lt-sub">Plataforma</span>');
    h.push('</div></div>');
    // ⛔ UMA INSTANCIA SO — a MURALHA continua de pe. O segundo botao do prototipo NAO entra.
    var _cl = (window.LIMEDTEC && window.LIMEDTEC.cfg) ? window.LIMEDTEC.cfg() : {};
    h.push('<div class="lt-inst" title="' + (_cl.nome || '') + ' ' + (_cl.id || '') + ' — a unica instancia liberada">');
    h.push('<span class="lt-inst-ico">' + SVG_INST + '</span>');
    h.push('<div class="lt-inst-nome">' + (_cl.nome || '') + '</div>');
    h.push('<span class="lt-inst-num">' + (_cl.id || '') + '</span></div>');
    h.push('</div>');
    h.push('<div class="lt-busca-cx"><div class="lt-busca">');
    h.push('<i class="lt-ico" data-lucide="search" style="color:' + C.txt + ';"></i>');
    h.push('<input type="search" placeholder="Buscar…" aria-label="Buscar">');
    h.push('<span class="lt-atalho">⌘K</span></div></div>');
    // B_186 — os 4 avisos do menu antigo (bolinhas vermelhas). Molde copiado de
    // globalmed_sistema_antigo.html L351/358/376/385: mesmo id, mesmo estilo (tokens var(--lt-*)),
    // display:none no começo — quem decide aparecer é o JS que já existe (badge-*.js), não isto.
    var BADGE_POR_ITEM = {
      itens: '<span id="badge-iac" style="background:var(--lt-atencao);color:var(--lt-fundo);border-radius:10px;font-size:var(--lt-txt-1);font-weight:700;padding:1px var(--lt-e-8);margin-left:auto;display:none">0</span>',
      pedidos: '<span id="badge-pedidos" style="background:var(--lt-erro);color:white;border-radius:10px;font-size:var(--lt-txt-1);padding:1px var(--lt-e-8);margin-left:auto;display:none">0</span>',
      autorizacoes: '<span id="badge-autz" style="background:var(--lt-erro);color:var(--lt-txt-forte);border-radius:10px;font-size:var(--lt-txt-1);font-weight:700;padding:1px var(--lt-e-8);margin-left:auto;display:none" title="pedidos pendentes esperando você">0</span>',
      alvos: '<span id="badge-acd" style="background:var(--lt-erro);color:var(--lt-txt-forte);border-radius:10px;font-size:var(--lt-txt-1);font-weight:700;padding:1px var(--lt-e-8);margin-left:auto;display:none" title="fabricantes no ranking sem contato cadastrado">0</span>'
    };
    h.push('<nav class="lt-nav">');
    // 002: so os itens das paginas que existem neste site (pacote so-robos, decisao 207).
    var PAG = (window.LIMEDTEC_CLIENTE && window.LIMEDTEC_CLIENTE.paginas) || null;
    var NAVV = !PAG ? NAV : NAV.map(function (g) { return { label: g.label, items: g.items.filter(function (it) { return it.href && PAG.indexOf(String(it.href).split('#')[0]) >= 0; }) }; }).filter(function (g) { return g.items.length; });
    NAVV.forEach(function (g) {
      h.push('<div class="lt-grupo"><div class="lt-grupo-tit">' + esc(g.label) + '</div>');
      g.items.forEach(function (it) {
        var on = (it.id === ativo) ? ' lt-ativo' : '';
        var alvo = it.href ? esc(it.href) : ('#' + esc(it.id));
        var tit = it.href ? esc(it.tit) : (esc(it.tit) + ' — em construção');
        h.push('<a class="lt-item' + on + '" href="' + alvo + '" data-lt-id="' + esc(it.id) + '"'
          + (it.href ? '' : ' data-lt-obra="1"') + ' title="' + tit + '">'
          + '<i class="lt-ico" data-lucide="' + esc(it.ico) + '"></i><span>' + esc(it.tit) + '</span>'
          + (BADGE_POR_ITEM[it.id] || '') + '</a>');
      });
      h.push('</div>');
    });
    h.push('</nav></aside>');
    return h.join('');
  }

  // ⛔ Item sem tela DIZ que esta em construcao — ordem do dono: "nunca clica e nao acontece nada".
  function ligaEmObra() {
    document.querySelectorAll('.lt-item[data-lt-obra]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var nome = (a.querySelector('span') || {}).textContent || 'Esta tela';
        alert(nome + '\n\nEM CONSTRUÇÃO.\n\nEsta tela existe no desenho e ainda não foi construída.'
          + '\nEla continua no menu de propósito, para você saber que ela vem.');
      });
    });
  }

  // ⛔ B_189, 22/09 — O TITULO NAO SE REPETE. A casca e a UNICA que escreve o titulo da pagina
  //    (a barra `.lt-titulo` que acabamos de montar acima). Qualquer titulo velho que a propria
  //    pagina ja trazia por baixo (um `<h1>` solto tipo limedtec-usuarios.html, a barra antiga
  //    `#page-title`/`.header-title` do sistema interno, ou o card com icone de cada aba, tipo
  //    "Atualizar Estoque GLOBAL") fica ESCONDIDO, nunca apagado — so display:none, reversivel.
  //    UM lugar so (ralo 1): esta funcao roda para TODA tela que chama montaLayout, e o sistema
  //    interno (globalmed_sistema_final.html) chama ela de novo a cada troca de pagina, pelo
  //    _atualizaCascaAtiva(), porque o card de cada aba so existe quando aquela aba fica ativa.
  function escondeTituloDuplicado(titulo) {
    var alvo = String(titulo == null ? '' : titulo).replace(/\s+/g, ' ').trim().toLowerCase();
    if (!alvo) return;
    var corpo = document.querySelector('.lt-corpo') || document.body;
    var els = corpo.querySelectorAll('h1, h2, .header-title, #page-title');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest && el.closest('.lt-header')) continue; // e o titulo da casca — fica
      var texto = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!texto) continue;
      if (texto === alvo || texto.indexOf(alvo) !== -1) {
        el.setAttribute('data-lt-titulo-escondido', '1');
        el.style.display = 'none';
      }
    }
  }

  // ── A_519: ROBOZINHOS (Bionexo e Apoio) ─────────────────────────────────────────────────────
  // ⛔ A regra verde/amarelo/vermelho NAO mora aqui: vem pronta em `robo_batimento.estado`
  //    (gravada por tools/robo_atividade.cjs). A tela so DESENHA. Unica regra daqui: dado velho
  //    (mais velho que o vale_min da propria linha) ou ausente = CINZA "não sei" — nunca verde por omissão.
  var ROBO_COR = { verde: '#22c55e', amarelo: '#eab308', vermelho: '#ef4444', login: '#ef4444', cinza: '#94a3b8' };
  // A_522 (03/11, dono): a luz NUNCA diz "nao sei" — ou ligado ou desligado. Sem dado / dado velho = PC desligado
  // = robo desligado, em CINZA (nunca verde por omissao; vermelho fica so para "travou" de verdade).
  var ROBO_TXT = { verde: 'ligado', login: 'ligado, precisa de login', amarelo: 'desligado de propósito', vermelho: 'travou', cinza: 'desligado' };
  function leituraRobo(row, agoraMs) {
    if (!row || !row.lido_em) return { estado: 'cinza', texto: ROBO_TXT.cinza, hora: '' };
    var idade = (agoraMs - new Date(row.lido_em).getTime()) / 60000;
    var hh = new Date(row.lido_em); hh = ('0' + hh.getHours()).slice(-2) + ':' + ('0' + hh.getMinutes()).slice(-2);
    if (isNaN(idade) || idade > (row.vale_min || 30)) return { estado: 'cinza', texto: ROBO_TXT.cinza, hora: hh };
    var e = ROBO_COR[row.estado] ? row.estado : 'cinza';
    var t = ROBO_TXT[e];
    if ((e === 'verde' || e === 'vermelho') && row.detalhe) t += ' — ' + row.detalhe;
    return { estado: e, texto: t, hora: hh };
  }
  function svgRobo(estado) {
    var c = ROBO_COR[estado] || ROBO_COR.cinza;
    var olho = estado === 'amarelo'
      ? '<path d="M9 17h4M19 17h4" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>'
      : '<circle class="lt-rb-olho" cx="11" cy="17" r="2.2" fill="#1e293b"/><circle class="lt-rb-olho" cx="21" cy="17" r="2.2" fill="#1e293b"/>';
    var extra = estado === 'amarelo' ? '<text x="23" y="9" font-size="7" font-weight="700" fill="' + c + '">zZ</text>'
      : (estado === 'vermelho' || estado === 'login') ? '<path d="M10 23q6-3 12 0" stroke="#1e293b" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      : '<path d="M10 22q6 3 12 0" stroke="#1e293b" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">'
      + '<line x1="16" y1="3" x2="16" y2="9" stroke="' + c + '" stroke-width="2"/><circle class="lt-rb-ant" cx="16" cy="3" r="2.2" fill="' + c + '"/>'
      + '<rect x="5" y="9" width="22" height="18" rx="6" fill="' + c + '"/><rect x="7.5" y="11.5" width="17" height="13" rx="4" fill="#f8fafc"/>'
      + olho + extra + '</svg>';
  }
  function htmlRobos(linhas, agoraMs) {
    var porNome = {}; (linhas || []).forEach(function (l) { porNome[l.robo] = l; });
    return [['bionexo', 'Bionexo'], ['apoio', 'Apoio']].map(function (p) {
      var L = leituraRobo(porNome[p[0]], agoraMs);
      var txt = L.estado === 'verde' ? L.texto : L.texto;
      return '<div class="lt-rb lt-rb-' + L.estado + '" title="' + esc(p[1] + ': ' + txt + (L.hora ? ' (dado das ' + L.hora + ')' : '')) + '">'
        + svgRobo(L.estado) + '<div class="lt-rb-tx"><b>' + p[1] + '</b><span>' + esc(txt) + '</span>' + (L.hora ? '<i>' + L.hora + '</i>' : '') + '<a href="limedtec-fpmed://login/' + p[0] + '" style="display:block;font-size:12px;color:#075985;text-decoration:underline;margin-top:4px" title="Abre o login na maquina onde o robo FPMED esta instalado">Entrar no robô</a></div></div>';
    }).join('');
  }
  function tokenSessao() {
    try { var s = JSON.parse(window.localStorage.getItem('gm_session_002') || 'null'); return (s && s.access_token) || ''; } catch (e) { return ''; }
  }
  function ligaRobos(conteudo) {
    var cfg = (window.LIMEDTEC && window.LIMEDTEC.cfg) ? window.LIMEDTEC.cfg() : null;
    var box = document.createElement('div'); box.className = 'lt-robos'; box.setAttribute('data-lt-robos', '1');
    box.innerHTML = htmlRobos([], Date.now());
    conteudo.insertBefore(box, conteudo.firstChild);
    function atualiza() {
      if (!cfg || !cfg.banco) return;
      // A_520: RLS "authenticated" — sem o token da sessao logada o anonimo recebe [] e o robo fica cinza.
      var tok = tokenSessao();
      var hd = { apikey: cfg.banco.anonKey };
      if (tok) hd.Authorization = 'Bearer ' + tok;
      fetch(cfg.banco.url + '/rest/v1/robo_batimento?select=robo,estado,detalhe,vale_min,lido_em', { headers: hd })
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
        .then(function (l) { box.innerHTML = htmlRobos(Array.isArray(l) ? l : [], Date.now()); });
    }
    atualiza(); setInterval(atualiza, 60000);
  }

  function montaLayout(op) {
    op = op || {};
    css(); fontes(); icones();
    var alvo = document.body;
    var conteudo = document.createElement('div');
    conteudo.className = 'lt-corpo';
    while (alvo.firstChild) conteudo.appendChild(alvo.firstChild);

    var casca = document.createElement('div');
    casca.className = 'lt-casca';
    casca.innerHTML = montaAside(op.ativo || '');
    casca.appendChild(conteudo);

    if (op.titulo) {
      var hd = document.createElement('div');
      hd.className = 'lt-header';
      hd.innerHTML = '<div><div class="lt-eyebrow">' + esc(op.eyebrow || '') + '</div>'
        + '<div class="lt-titulo">' + esc(op.titulo) + '</div></div>';
      conteudo.insertBefore(hd, conteudo.firstChild);
    }
    try { ligaRobos(conteudo); } catch (e) {}
    alvo.appendChild(casca);
    ligaEmObra();
    try { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); } catch (e) {}
    escondeTituloDuplicado(op.titulo);
  }

  window.LIMEDTEC = window.LIMEDTEC || {};
  window.LIMEDTEC.montaLayout = montaLayout;
  window.LIMEDTEC.robozinho = { leitura: leituraRobo, html: htmlRobos };
  window.LIMEDTEC.escondeTituloDuplicado = escondeTituloDuplicado;
  window.LIMEDTEC.NAV = NAV;
})();
