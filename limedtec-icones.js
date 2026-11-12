/* ═══════════════════════════════════════════════════════════════════════════════════════════
   LIMEDTEC — CONJUNTO DE ICONES.  Peca de MOLDE: a FPMED herda este arquivo.
   Fase 2, fatia 1 (12/08/2026). Substitui o emoji-como-icone, que o D11 proibe.

   >>> POR QUE O EMOJI TINHA QUE SAIR, e nao e birra de manual: emoji NAO FORMA CONJUNTO. Cada um
       e desenhado por um fabricante diferente, com peso, grade e cor propria — e muda de cara
       entre Windows, Android e iPhone. Na barra lateral do sistema interno ha doze deles lado a
       lado, e o resultado parece doze produtos empilhados. Um icone de verdade herda a cor de
       quem o contem (`currentColor`), tem UMA grade (24) e UM traco (1.5), e por isso doze
       parecem um so.

   >>> ELE E INERTE, IGUAL AO ARQUIVO DE TOKENS. Incluir o <script> numa tela NAO muda nada:
       ele so injeta um sprite escondido. O icone so aparece onde alguem escrever `<use>` ou
       chamar `LIMEDTEC_ICONES.svg(...)`. Da pra por o script nas 12 telas hoje, e nenhuma muda.

   >>> DESENHADOS AQUI, SEM CDN E SEM DEPENDENCIA DE TERCEIRO. Mesma grade 24x24, mesmo traco,
       `fill:none` e `stroke:currentColor` — as tres coisas que fazem um conjunto ser conjunto.
       (No projeto irmao a regra pedia Lucide; aqui o conjunto e da casa, o que cumpre o que a
       regra QUER — um conjunto so — e evita licenca de terceiro. Decisao registrada, nao
       improvisada.)

   USO:
     no HTML     <svg class="lt-icone" aria-hidden="true"><use href="#lt-i-busca"></use></svg>
     no JS       LIMEDTEC_ICONES.svg('busca')            -> a marcacao pronta (pra innerHTML)
                 LIMEDTEC_ICONES.svg('busca', 'lt-icone meu-modificador')
     textContent LIMEDTEC_ICONES.escreve(el,'alerta','Erro: '+msg)
                 >>> USE ESTA onde o codigo hoje faz `el.textContent = '⚠️ ...'`. textContent
                     ESCREVE a marcacao em vez de interpreta-la, e trocar pra innerHTML abriria
                     injecao quando o texto vem de fora. Ver o comentario da funcao.
     conferir    LIMEDTEC_ICONES.tem('busca')            -> true/false
                 LIMEDTEC_ICONES.nomes()                 -> a lista

   >>> NOME QUE NAO EXISTE NAO VIRA ICONE INVISIVEL: `svg()` devolve string vazia E avisa no
       console. Icone que some calado e pior que icone errado — ninguem procura o que nao viu
       faltar.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  /* Os desenhos. Cada valor e o MIOLO do <symbol> — sem <svg>, sem cor, sem tamanho.
     A ordem e a do dominio (o que o sistema faz), nao alfabetica. */
  var D = {
    // — navegacao e busca —
    busca:      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    filtro:     '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    menu:       '<path d="M4 7h16M4 12h16M4 17h16"/>',
    voltar:     '<path d="M15 5l-7 7 7 7"/>',
    externo:    '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    // — as telas do portal —
    sistema:    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    /* A 1a versao deste desenho era um arco fechado e limpo — e no teste do bater o olho ele lia
       como GOTA, nao como chama. A diferenca esta na base ondulada e na lingua interna: sem elas,
       "Ofertas da Semana" ganhava um icone de agua. */
    ofertas:    '<path d="M12 3c.5 3 2.5 4 3.8 6.2A6 6 0 0 1 12 21a6 6 0 0 1-3.8-11C9 8 9.5 6.5 12 3z"/>'
                + '<path d="M12 21a2.8 2.8 0 0 1-1.6-5c.3-1 .8-1.6 1.6-2.4.7 1.2 2.8 2.3 2.8 4.6A2.8 2.8 0 0 1 12 21z"/>',
    balanca:    '<path d="M12 4v16M7 20h10M6 8h12"/><path d="M6 8l-3 6h6zM18 8l-3 6h6z"/>',
    painel:     '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    telefone:   '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    caixa:      '<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    pessoas:    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M17 20a5 5 0 0 0-1-3"/>',
    // — documento e proposta —
    doc:        '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    salvar:     '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    abrir:      '<path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-8l-2-3H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z"/>',
    imprimir:   '<path d="M7 9V3h10v6"/><path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="15" width="10" height="6"/>',
    baixar:     '<path d="M12 4v11"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/>',
    enviar:     '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
    copiar:     '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    // — acao —
    mais:       '<path d="M12 5v14M5 12h14"/>',
    lixo:       '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    editar:     '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>',
    atualizar:  '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
    check:      '<path d="M5 12l5 5 9-11"/>',
    fechar:     '<path d="M6 6l12 12M18 6L6 18"/>',
    // — estado e aviso —
    alerta:     '<path d="M12 3l9 16H3z"/><path d="M12 9v5M12 17h.01"/>',
    info:       '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    relogio:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    estrela:    '<path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17l-5.6 3.2 1.2-6.2L3 9.6l6.3-.8z"/>',
    // — negocio —
    predio:     '<path d="M3 21h18"/><path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16"/><path d="M14 21V10h4a1 1 0 0 1 1 1v10"/><path d="M8 8h3M8 12h3M8 16h3"/>',
    dinheiro:   '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    etiqueta:   '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><path d="M7.5 7.5h.01"/>',
    grafico:    '<path d="M4 19h16"/><path d="M6 15l4-5 3 3 5-7"/>',
    chave:      '<circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M18 4l2 2M15 7l2 2"/>',
    sair:       '<path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/>',

    /* ───────────────────────────────────────────────────────────────────────────────────────
       12/08 — A SEGUNDA LEVA. Ela nasceu de UMA medicao, e nao tela a tela de proposito:
       tools/classifica_emoji.js + a varredura dos DISTINTOS mostrou que as 440 ocorrencias de
       icone das 11 telas que faltam usam 80 emoji diferentes.
       >>> POR QUE DE UMA VEZ SO, e nao a conta-gotas: um conjunto montado tela a tela vira ONZE
           conjuntos parecidos — que e exatamente o defeito do emoji com outro nome. Desenhar os
           80 juntos e o que permite decidir que 🔍 e 🔎 sao O MESMO icone, que 🔽 ja tinha
           desenho (`filtro`, o funil) e que 🔥 e o `ofertas` que ja existia.
       >>> E POR ISSO ELE NAO CRESCEU 80: 41 dos 80 CAIRAM em desenho que ja existia. O conjunto
           ganhou 39 nomes novos, e cada um responde a um substantivo do negocio (industria,
           espelho/recibo, PMVG do governo, familia de produto) — nao a um pictograma bonito. */

    // — o pipeline comercial (Novo -> Contatado -> Negociando -> Proposta -> Ganho/Perdido) —
    novo:       '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    /* 🤝 no sistema NAO e "parabens": e o estagio **Negociando** do funil. O desenho e a troca
       (duas setas em sentido contrario), nao um aperto de mao — aperto de mao a 1.5 de traco
       vira borrao em 20px, e "negociar" e o que a palavra do funil diz. */
    negociar:   '<path d="M3 9h14"/><path d="M14 6l3 3-3 3"/><path d="M21 15H7"/><path d="M10 18l-3-3 3-3"/>',
    alvo:       '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trofeu:     '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H5.5a2.5 2.5 0 0 0 0 5H8M16 5h2.5a2.5 2.5 0 0 1 0 5H16"/>'
                + '<path d="M12 13v4M9 21h6M10 17h4"/>',
    medalha:    '<circle cx="12" cy="14.5" r="6.5"/><path d="M8.5 8.8L6.5 3h11l-2 5.8"/>'
                + '<path d="M12 11.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z"/>',
    topo:       '<path d="M5 4h14"/><path d="M12 21V8"/><path d="M7 13l5-5 5 5"/>',

    // — contato —
    celular:    '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    balao:      '<path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',
    email:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/>',
    local:      '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    pessoa:     '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    familia:    '<circle cx="8" cy="6" r="2.5"/><circle cx="16" cy="6" r="2.5"/>'
                + '<path d="M4 14a4 4 0 0 1 8 0M12 14a4 4 0 0 1 8 0"/>'
                + '<circle cx="12" cy="15" r="2"/><path d="M8.5 21a3.5 3.5 0 0 1 7 0"/>',

    // — o que a empresa e (e de onde vem o preco) —
    industria:  '<path d="M2 21h20"/><path d="M4 21V11l5 3.5V11l5 3.5V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v13"/>',
    hospital:   '<path d="M3 21h18"/><path d="M5 21V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15"/><path d="M12 9v6M9 12h6"/>',
    governo:    '<path d="M3 21h18"/><path d="M12 3l9 5H3z"/><path d="M4 10h16"/><path d="M6 10v9M10 10v9M14 10v9M18 10v9"/>',
    casa:       '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    globo:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    carrinho:   '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>'
                + '<path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6"/>',
    maleta:     '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 12h18"/>',

    // — o produto —
    /* O `transform` e GEOMETRIA do desenho (a capsula e um retangulo deitado, girado 45 graus),
       nao tamanho nem cor — as duas coisas que o conjunto proibe. */
    pilula:     '<g transform="rotate(-45 12 12)"><rect x="2" y="8.5" width="20" height="7" rx="3.5"/>'
                + '<path d="M12 8.5v7"/></g>',
    material:   '<g transform="rotate(-45 12 12)"><rect x="2" y="8" width="20" height="8" rx="4"/>'
                + '<path d="M8 8v8M16 8v8"/>'
                + '<path d="M10.5 10.5h.01M13.5 10.5h.01M10.5 13.5h.01M13.5 13.5h.01"/></g>',
    molecula:   '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="17" r="2"/>'
                + '<path d="M10.7 6.7L6.3 15.3M13.3 6.7l4.4 8.6M7 17h10"/>',
    codigo:     '<path d="M4 6v12M7 6v12M10 6v12M13 6v12M17 6v12M20 6v12"/>',

    // — documento e papelada (cada um e um SUBSTANTIVO diferente do sistema) —
    lista:      '<path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/>'
                + '<rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h4"/>',
    nota:       '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/><path d="M8 9h5M8 13h4"/>'
                + '<path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L15 12l-3.5.5.5-3.5z"/>',
    recibo:     '<path d="M5 3h14v18l-2.3-1.5-2.3 1.5-2.4-1.5L9.7 21l-2.3-1.5L5 21z"/><path d="M9 8h6M9 12h6"/>',
    anexo:      '<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8l7.9-7.9"/>',
    imagem:     '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/>'
                + '<path d="M21 16l-5-5-6 6-3-3-4 4"/>',
    importar:   '<path d="M4 13l2-8a1 1 0 0 1 1-.8h10a1 1 0 0 1 1 .8l2 8"/>'
                + '<path d="M4 13h4l1.2 2.4a1 1 0 0 0 .9.6h3.8a1 1 0 0 0 .9-.6L16 13h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    regua:      '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
    barras:     '<path d="M3 21h18"/><rect x="5" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/>'
                + '<rect x="15" y="15" width="4" height="6"/>',

    // — inteligencia e estado —
    ia:         '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>'
                + '<path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    ideia:      '<path d="M9 18h6M10 21h4"/>'
                + '<path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.8.6 1.3V16h5.8v-.8c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3z"/>',
    cadeado:    '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    bloqueado:  '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    repetir:    '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>'
                + '<path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    /* O ESTADO VAZIO PRECISA PARECER VAZIO, e nao "deu erro": uma caixa aberta e sem nada dentro.
       Hoje as telas usam 😕 — uma CARA TRISTE, que culpa o usuario por uma lista que so nao tem
       resultado. (D13: nada de emoji espalhado; e L: o estado vazio e uma tela de projeto, nao
       um acidente.) */
    vazio:      '<path d="M3 9l2.2-4.4a1 1 0 0 1 .9-.6h11.8a1 1 0 0 1 .9.6L21 9"/>'
                + '<path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9z"/><path d="M9.5 13.5h5"/>',

    /* O PONTO DE STATUS e o unico desenho do conjunto que e CHEIO, e o motivo esta escrito aqui
       pra ninguem "consertar" depois: 🔴🟡🟢 nas telas de hoje sao SEMAFORO (verde/amarelo/
       vermelho da competitividade, do funil e do prazo). Um anel vazado le como "pendente" — e
       inverteria o significado justo no lugar em que ele decide dinheiro.
       >>> ELE CONTINUA SEM COR PROPRIA: `currentColor` herda de quem o contem, entao quem pinta
           e a classe da tela (--lt-ok-txt / --lt-atencao-txt / --lt-erro-txt), nao este arquivo. */
    ponto:      '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>',
    /* O par do `ponto`: vazado = **nao tem**. Nas telas de hoje e o ⚪ de "SEM cotacao no banco".
       Cheio x vazado diz "tem x nao tem" sem depender de o leitor distinguir dois tons. */
    circulo:    '<circle cx="12" cy="12" r="6"/>',

    /* ─────────────────────────────────────────────────────────────────────────────────────────
       A TERCEIRA LEVA — e ela so existe porque a REGUA estava errada. Ao trocar a lista de
       faixas de codepoint escrita a mao pela propriedade `Extended_Pictographic` do Unicode,
       apareceram 192 ocorrencias que nunca tinham sido contadas: so o ✅ sao 67 e o ❌, 39.
       (O detalhe esta em tools/classifica_emoji.js, junto da regua.) */
    erro:       '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    /* `fechar` (o X pelado) fecha um painel; `erro` (o X dentro do circulo) diz que algo NAO deu
       certo. Sao o mesmo risco em dois papeis, e por isso sao dois desenhos: um X pelado num
       resultado de busca le como "clique pra fechar". */
    iniciar:    '<path d="M7 4l12 8-12 8z"/>',
    pausa:      '<path d="M9 5v14M15 5v14"/>',
    parar:      '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    pular:      '<path d="M5 5l9 7-9 7z"/><path d="M18 5v14"/>',
    selecionar: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/>',
    desfazer:   '<path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>',
    /* ⏰ e 🕐 nao sao a mesma coisa no sistema: o relogio marca QUANDO, o despertador marca
       ATRASADO ("Follow-ups Atrasados"). Dar o mesmo desenho aos dois apagaria a unica
       informacao que o segundo carrega. */
    alarme:     '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 1.5"/><path d="M5 4L2.5 6.5M19 4l2.5 2.5"/>',

    /* ─── A VOZ (21/08/2026, pelo Assistente da Cotacao) ──────────────────────────────────────
       Dois desenhos, nao um: `microfone` e FALAR (o que a pessoa manda pra dentro) e `som` e
       OUVIR (o que a maquina devolve). Sao os dois lados do mesmo dialogo, e dar um desenho so
       aos dois faria o botao de ditar e o de ler em voz alta parecerem o mesmo botao — que e
       exatamente a confusao que o `fechar` x `erro` daqui de cima ja evitou uma vez.
       >>> ELES NAO EXISTIAM, e a alternativa era escrever emoji num painel novo: 🎤 e 🔊 sao
           justamente o que o assert 36 da testa_icones proibe, e o painel entraria na tela
           quebrando a catraca no mesmo dia em que nasceu. */
    microfone:  '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/>'
                + '<path d="M12 18v3M9 21h6"/>',
    som:        '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5a4 4 0 0 1 0 5"/>'
  };

  var PREFIXO = 'lt-i-';
  var injetado = false;

  function sprite() {
    var s = '';
    for (var n in D) if (Object.prototype.hasOwnProperty.call(D, n)) {
      s += '<symbol id="' + PREFIXO + n + '" viewBox="0 0 24 24">' + D[n] + '</symbol>';
    }
    return s;
  }

  function injeta() {
    if (injetado || typeof document === 'undefined') return;
    var alvo = document.body || document.documentElement;
    if (!alvo) return;
    var el = document.createElement('div');
    // fora do fluxo e fora do leitor de tela: e um deposito, nao conteudo
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><defs>' + sprite() + '</defs></svg>';
    alvo.appendChild(el);
    injetado = true;
  }

  var API = {
    /* A marcacao pronta, pra quem monta HTML em JS (que e a maioria das nossas telas).
       >>> NOME ERRADO NAO VIRA ICONE INVISIVEL: devolve '' e avisa. Icone que some calado e pior
           que icone errado — ninguem procura o que nao viu faltar. */
    svg: function (nome, classe) {
      if (!Object.prototype.hasOwnProperty.call(D, nome)) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[limedtec-icones] icone inexistente: "' + nome + '". Nomes: ' + API.nomes().join(', '));
        }
        return '';
      }
      return '<svg class="' + (classe || 'lt-icone') + '" aria-hidden="true"><use href="#'
        + PREFIXO + nome + '"></use></svg>';
    },
    /* ═══ `escreve(el, nome, texto)` — ICONE + TEXTO SEM ABRIR INJECAO ═══════════════════════
       >>> ELA EXISTE POR UM ERRO QUE QUASE ENTROU: nas 12 telas ha 100 linhas que escrevem o
           rotulo por `.textContent`, e `textContent` NAO interpreta marcacao — ele ESCREVE.
           Trocar o emoji por `<svg>` ali poria o usuario lendo `<svg class="lt-icone"...>`
           dentro do botao. Sao coisas opostas:
               innerHTML   -> o navegador INTERPRETA  -> vira desenho
               textContent -> o navegador ESCREVE     -> vira literal na tela
       >>> E "ENTAO USA innerHTML" NAO SERVE COMO REGRA. Metade dessas linhas concatena dado que
           vem de fora: `st.textContent = '❌ Erro da IA: ' + data.error.message`. Trocar por
           innerHTML abriria injecao numa tela que exibe nome de fornecedor, de cliente e
           mensagem de servidor. Numa tela que fecha proposta de hospital, isso nao e detalhe.
       >>> O QUE ELA FAZ: a MARCACAO vem so do nosso proprio arquivo (constante, nunca de fora),
           e o TEXTO continua entrando por `createTextNode` — ou seja, a propriedade de seguranca
           do textContent fica INTACTA, e o icone aparece. */
    escreve: function (el, nome, texto) {
      if (!el) return el;
      el.textContent = '';
      if (Object.prototype.hasOwnProperty.call(D, nome)) {
        var caixa = document.createElement('span');
        caixa.innerHTML = API.svg(nome);           // marcacao CONSTANTE, deste arquivo
        if (caixa.firstChild) el.appendChild(caixa.firstChild);
        // o espaco entre desenho e palavra, que no emoji vinha escrito na string
        el.appendChild(document.createTextNode(' '));
      }
      if (texto != null) el.appendChild(document.createTextNode(String(texto)));
      return el;
    },
    tem: function (nome) { return Object.prototype.hasOwnProperty.call(D, nome); },
    nomes: function () { return Object.keys(D); },
    prefixo: PREFIXO,
    injeta: injeta
  };

  raiz.LIMEDTEC_ICONES = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injeta);
    else injeta();
  }
})(typeof window !== 'undefined' ? window : globalThis);
