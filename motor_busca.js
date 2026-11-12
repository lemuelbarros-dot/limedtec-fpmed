// ⚠️ GERADO por tools/gera_motor_busca.js — NÃO EDITE À MÃO.
// Espelho verbatim do MOTOR de globalmed_giovana.html (fonte única). Guard: tests/testa_motor_modulo.js.
;(function (global) {
  'use strict';
  let cotacoes = [];
  let _bmCmed = new Map();
  let _bmClasseB = new Set();
  /* ═══ A REGRA DE "ESGOTADO" VEM DA PEÇA COMUM, E ELA PRECISA RESOLVER NOS DOIS MUNDOS ═══════
     >>> POR QUE ESTE SHIM EXISTE (13/08): o `incluiNaBusca` passou a perguntar pro
         `limedtec-esgotado.js` em vez de ter a própria cópia de "o que conta como esgotado". No
         NAVEGADOR isso resolve sozinho (a tela carrega o arquivo antes). Mas este módulo também é
         carregado por ~30 ferramentas em node, e lá `LT_ESGOTADO` seria uma variável solta —
         quebrando na primeira busca, longe de onde a mudança foi feita.
     >>> E O DEFEITO SERIA CALADO NO PIOR LUGAR: o guard `testa_motor_modulo` compara o motor com
         a giovana VERBATIM e continuaria verde, porque o texto bate. Quem descobriria seria uma
         ferramenta de diagnóstico, no meio de uma investigação de preço. */
  const LT_ESGOTADO = (typeof global !== 'undefined' && global.LT_ESGOTADO)
    || (typeof require === 'function' ? require('./limedtec-esgotado.js') : null);
  // A_493: mesmo shim, para a regra de cotação vencida (limedtec-cotacao-vencida.js, uma regra só)
  const LT_VENCIDA = (typeof global !== 'undefined' && global.LT_COTACAO_VENCIDA)
    || (typeof require === 'function' ? require('./limedtec-cotacao-vencida.js') : null);
  // B_614: a fatia B da giovana agora delega pv/incluiNaBusca ao módulo comum (decisão 183); mesmo shim, para o node
  const LT_VISIVEL = (typeof global !== 'undefined' && global.LT_VISIVEL)
    || (typeof require === 'function' ? require('./limedtec-visivel.js') : null);
  // CAIXA_A (28/09): mesmo shim do LT_ESGOTADO acima, pra MKP_FORNECEDOR — a fatia A copiada
  // abaixo lê `MKP_FORNECEDOR` (ver globalmed_giovana.html, `const MKP = ...`), e este módulo
  // roda em node, onde a variável não existe sem require.
  const MKP_FORNECEDOR = (typeof global !== 'undefined' && global.MKP_FORNECEDOR)
    || (typeof require === 'function' ? require('./limedtec-mkp-fornecedor.js') : null);
  // B_623: dependencia que falta = erro ALTO com o NOME DO ARQUIVO (antes: TypeError vago em 'criar', ou
  // busca que seguia sem filtrar esgotado/vencido, calada). LT_VISIVEL ausente = throw na carga (o motor
  // nao funciona sem ele). ESGOTADO/VENCIDA ausentes = console.error alto na carga, SEM throw: ferramentas
  // de node (bionexo_*, casador) carregam o motor em vm sem esses modulos e dependem de ele nascer.
  // MKP_FORNECEDOR segue com o aviso proprio (console.error + faixa na tela).
  [['LT_ESGOTADO', LT_ESGOTADO, 'limedtec-esgotado.js', false], ['LT_COTACAO_VENCIDA', LT_VENCIDA, 'limedtec-cotacao-vencida.js', false], ['LT_VISIVEL', LT_VISIVEL, 'limedtec-visivel.js', true]].forEach(function (d) {
    if (!d[1]) {
      var msg = 'motor_busca.js: faltou carregar ' + d[2] + ' (' + d[0] + ') ANTES do motor_busca.js nesta tela.' + (d[3] ? ' Busca de preco desligada.' : ' Filtro desta regra DESLIGADO.');
      if (typeof console !== 'undefined' && console.error) console.error(msg);
      if (d[3]) throw new Error(msg);
    }
  });
/* ==MOTOR-A-BEGIN== */
function _undNum(und){ const m = String(und||'').match(/\d+/); if(!m) return 0; const n=parseInt(m[0]); return (n>=1 && n<=5000)?n:0; }
// qtd da embalagem lida SÓ do NOME (sem und)
function _qtdDoNome(produto){
  // Descrições extensas de fornecedores usam CAIXA/COMPRIMIDOS, não só CX/CPR.
  // Normalizar apenas palavras de embalagem preserva as guardas de dose, volume e acessórios.
  const nome = String(produto || '').toUpperCase()
    .replace(/\bCAIXAS?\s*(?:COM\s*|C\/\s*)?(?=\d)/g, 'CX ')
    .replace(/\bCOMPRIMIDOS\b/g, (palavra, i, texto) => /\bPORTA[\s-]*$/.test(texto.slice(0, i)) ? palavra : 'CPR')
    .replace(/\bC[ÁA]PSULAS\b/g, 'CAPS');
  // Blísteres com N comprimidos CADA: a contagem é o produto, não só o nº de blísteres.
  const mBlister = nome.match(/(\d{1,3})\s*BL[IÍ]ST(?:ERES|ERS|ER)\s*(?:DE\s*)?(\d{1,3})\s*(?:CPR|CAPS)\b[^+.;]*?\bCADA\b/);
  if (mBlister) { const n = parseInt(mBlister[1]) * parseInt(mBlister[2]); if (n > 1 && n <= 5000) return n; }
  const mX = nome.match(/(\d{1,4})\s*X\s*\d+(?:[.,]\d+)?\s*ML\b/);        if (mX) { const n=parseInt(mX[1]); if(n>1&&n<=5000) return n; }  // NxM ML (50X100ML)
  const mXc = nome.match(/(\d{1,3})\s*X\s*(\d{1,3})\s*(?:CPR|COMP|CAP|CAPS|COM|DRG)\b/); if (mXc) { const n=parseInt(mXc[1])*parseInt(mXc[2]); if(n>1&&n<=5000) return n; }  // NxM CPR (10X10=100, 24X10=240)
  // C/N, CX/N. Os 2 lookaheads impedem ler MEDIDA como contagem: (?![\d.,]) trava o backtracking
  // ("C/240ML" nao pode casar so "24") e o segundo barra numero colado em unidade de medida
  // ("FR C/240ML" = 1 frasco de 240ml, nao 240 unidades; "PCT 50G" = 1 pacote de 50g), em
  // COMPRIMENTO ("EXTENSOR C/02 MTS" = 2 METROS de extensor, nao 2 extensores) e em contagem de
  // DOSE ("FR 6ML C/120 DOSES" = 1 frasco de spray que da 120 borrifadas).
  // >>> CASO REAL 05/08 (BUSONID 50MCG SUS FR 6ML C/120 DOSES): lido como pack 120, o frasco de
  //     R$ 53,53 virou uma "caixa" de R$ 6.423,12 no orcamento. Dose e APRESENTACAO do
  //     dispositivo, nao quantidade dentro da embalagem — o pack so vem de CX/N, PCT/N e afins.
  //     O "C/02 MTS" e da MESMA familia e ja tinha guarda no importador da MCW, mas NAO aqui: a
  //     regra estava num lugar so, e quem monta o preco do orcamento e esta linha.
  // >>> BURACO ACHADO E FECHADO EM 02/09/2026 (A_029): faltava ACIONAMENTOS. Medido chamando esta
  //     funcao de verdade: "ANDROGEL 16,2MG/G C/60 ACIONAMENTOS 88G" saia com pack 60, e a palavra
  //     sozinha respondia por 11 das 36 linhas com preco na base errada medidas na B_028 (SPIOLTO,
  //     DUAKLIR, EKLIRA, ZOLFEST, MONAX, VENTUS, AMOME, MOMATE). Acionamento e a mesma coisa que
  //     dose: quantas vezes o dispositivo dispara, nao quantas coisas vem dentro da caixa.
  //     A lista de dose abaixo e COPIA LITERAL de `tools/lib_unidade_nao_contagem.js` (aqui nao da
  //     pra `require`: isto roda no navegador) e `tests/testa_pack_dose_leitores.js` compara as duas
  //     byte a byte — copia sem regua e o mesmo que nao ter fonte unica.
  // C/NxM sem sufixo (DIPIRONA ... C/24X10 EMS = 240): so multiplica se o segundo numero NAO for
  // medida (senao "C/10X5ML" contaria os 5ML como pack, quando e so o volume do frasco).
  // >>> ACHADO DO AUDITOR (PONTE_AUDITOR 16/09, ponto 3), corrigido na FONTE em 26/09 (CAIXA_D
  //     item 33): "C/7 APLICADORES" / "C/7 APL" contava como 7 unidades. Aplicador é ACESSÓRIO
  //     (mesma família de ACIONAMENTOS/DOSES/JATOS — não é "quantas coisas vêm na caixa"), não
  //     remédio: TIOCONAZOL+TINIDAZOL C/7 APLICADORES e GINO-COLON 45G C/7 APL são cada um 1
  //     unidade (1 bisnaga/tubo com 7 aplicadores de brinde), nao 7.
  const mCx = nome.match(/(?:C\/|CX\/|CX|PCT\/?)\s*(\d{1,3})\s*X\s*(\d{1,3})(?![\d.,])(?!\s*(?:ML|MG|MCG|UI|G|L|GR|GRS|KG|M|MT|MTS|METRO|METROS|DOSES?|JATOS?|PUFFS?|APLICA(?:C|Ç)(?:AO|ÃO|OES|ÕES)|APLICADORES?|APL\b|ATUA(?:C|Ç)(?:AO|ÃO|OES|ÕES)|BORRIFADAS?|DISPAROS?|ACIONAMENTOS?)\b)/); if (mCx) { const n=parseInt(mCx[1])*parseInt(mCx[2]); if(n>1&&n<=5000) return n; }
  const mC = nome.match(/(?:C\/|CX\/|CX|PCT\/?)\s*(\d{1,4})(?![\d.,])(?!\s*(?:ML|MG|MCG|UI|G|L|GR|GRS|KG|M|MT|MTS|METRO|METROS|DOSES?|JATOS?|PUFFS?|APLICA(?:C|Ç)(?:AO|ÃO|OES|ÕES)|APLICADORES?|APL\b|ATUA(?:C|Ç)(?:AO|ÃO|OES|ÕES)|BORRIFADAS?|DISPAROS?|ACIONAMENTOS?)\b)/); if (mC) { const n=parseInt(mC[1]); if(n>1&&n<=5000) return n; }
  const mU = nome.match(/(\d{1,4})\s*(?:CPR|CAPS|CAP|CPS|CP|COMP|DRG|AMP|FR|ENV|BLS|UND|UN|PASTILHA|PAST|SACHES|SACHE)\b/); if (mU) { const n=parseInt(mU[1]); if(n>1&&n<=5000) return n; }  // N CPR/AMP...
  // RECIPIENTE: "10 SER", "50FA", "6 BOLS", "5 AMPOLAS", "5 REFIS", "4 CAN". Pega o PRIMEIRO recipiente e NUNCA soma
  // (MOUNJARO "4 SER 0,5ML+4CAN" = 4 canetas, não 8; TRESIBA "5 REFIS + 5 SIST" = 5). O "+" marca ACESSÓRIO e é
  // ignorado (Sandimmun "sol oral 50ML + 2 seringas dosadoras" = 1 frasco; as seringas não são o produto).
  const reR = /(\+\s*)?(\d{1,4})\s*(?:SERINGAS|SERINGA|SER|AMPOLAS|AMPOLA|BOLSAS|BOLSA|BOLS|CANETAS|CANETA|CAN|SISTEMAS|SISTEMA|SIST|REFIS|REFIL|FA)\b/g;
  let mR; while ((mR = reR.exec(nome))) { if (mR[1]) continue; const n=parseInt(mR[2]); if(n>1&&n<=5000) return n; }
  const m2 = nome.match(/(?:AMP|FR|CP|CPR|CAPS)\s*\/?\s*(\d+)\b(?!\s*(?:ML|MG|MCG|UI|G)\b)/); if (m2) { const n=parseInt(m2[1]); if(n>1) return n; }
  return 1;
}
// UNIÃO INTELIGENTE: und com número manda (import é confiável); senão nome; default 1.
// Se os dois divergem, o UND prevalece MAS loga no console (o card marca ⚠️ via qtdEmbDiv).
// memoizado (função pura dos dois textos): o pv() chama isto uma vez por cotação, por item do
// pedido. O aviso do console.warn sai só na 1ª vez de cada par — e é isso que se quer, porque na
// 2ª ele seria a mesma linha repetida 90 vezes.
function qtdEmbalagem(und, produto){
  return (typeof _bmMemo === 'function')
    ? _bmMemo('qe', String(und == null ? '' : und) + '' + String(produto == null ? '' : produto),
              () => qtdEmbalagemCalc(und, produto))
    : qtdEmbalagemCalc(und, produto);
}
function qtdEmbalagemCalc(und, produto){
  const u = _undNum(und), n = _qtdDoNome(produto);
  if (u >= 1){ if (n > 1 && n !== u) console.warn('[qtdEmb] und "'+String(und||'').trim()+'" ('+u+') diverge do nome ('+n+') — '+produto); return u; }
  return n;
}
// mensagem de divergência p/ o ⚠️ do card (ou null)
function qtdEmbDiv(und, produto){
  const u = _undNum(und); if (u < 1) return null; const n = _qtdDoNome(produto);
  return (n > 1 && n !== u) ? ('und "'+String(und||'').trim()+'" ('+u+') diverge do nome ('+n+')') : null;
}
// BLINDAGEM anti-estouro por PEER (mesma lógica do auditoria_precos.js): unit parece preço de CAIXA?
const _peMemo=new Map(); function _peMemoriza(tag,v,f){ const k=tag+String(v==null?'':v); let r=_peMemo.get(k); if(r===undefined){ r=f(v); if(_peMemo.size>400000) _peMemo.clear(); _peMemo.set(k,r); } return r; } /* B_569/B_619: puras do texto; chamadas 22.887x por item em _confPeerMediana */
function _peDoseKey(p){ return _peMemoriza('D',p,_peDoseKeyCalc); }
function _peDoseKeyCalc(p){ const m=(p||'').toUpperCase().match(/(\d+(?:[.,]\d+)?)\s*(MG\/ML|MCG\/ML|MG|MCG|G|UI|%)/g); return m?m.slice(0,2).join('+').replace(/\s+/g,''):''; }
function _pePaNorm(s){ return _peMemoriza('P',s,_pePaNormCalc); }
function _pePaNormCalc(s){ return (s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z0-9]/g,''); }
function pareceCaixaPeer(produto, und, pa, unit){
  unit=parseFloat(unit); if(!(unit>0)) return null;
  const qtd=qtdEmbalagem(und,produto)||1; if(qtd<=1) return null;
  const dk=_peDoseKey(produto), pk=_pePaNorm(pa); if(pk.length<3||!dk) return null;
  const fp=(typeof _bmForma==='function')?_bmForma(produto):null;   // FORMA (inj/oral/tópico...): formas diferentes nunca são peer
  const peers=(typeof cotacoes!=='undefined'?cotacoes:[]).filter(c=>!ehGlobal(c)&&_pePaNorm(c.principio_ativo)===pk&&_peDoseKey(c.produto)===dk&&(typeof _bmForma!=='function'||_bmForma(c.produto)===fp)).map(c=>parseFloat(c.compra_unit)).filter(x=>x>0&&x!==unit);
  if(peers.length<3) return null;
  const pmin=Math.min(...peers); const corr=+(unit/qtd).toFixed(4);
  if(unit/pmin>=3 && corr>=pmin*0.4 && corr<=pmin*2.5) return {qtd,pmin,corr};
  return null;
}
// BLINDAGEM peer-INDEPENDENT (sanidade absoluta): unit alto + ÷qtd barato p/ a forma/material = preço de CAIXA
// (pega o que NÃO tem peer: agulha/luva, S3MED "COM", genéricos sem peer). Espelha o auditoria_precos.js.
const _S_MATKW=['agulha','seringa','luva','gaze','swab','cateter','equipo','compressa','algodao','esparadrapo','atadura','sonda','scalp','lanceta','micropore','avental','touca','abaixador','espatula','garrote','eletrodo','preservativo','dreno','curativo','coletor','fralda','absorvente','lamina','capote','prope','clamp'];
function _sTemDose(p){ return /\d+\s*(mg|mcg|ui|g)\b|\d+\s*%/i.test((p||'').normalize('NFD').replace(/[̀-ͯ]/g,'')); }
function _sMaterial(p){ const t=' '+String(p||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim()+' '; return _S_MATKW.some(k=>t.includes(' '+k)) && !_sTemDose(p); }
const _S_LIMIAR={SOLIDO_ORAL:20,LIQUIDO_ORAL:20,INJETAVEL:50,TOPICO:40,OFTALMICO:40,SPRAY:60,MATERIAL:10};
const _S_TETO  ={SOLIDO_ORAL:12,LIQUIDO_ORAL:20,INJETAVEL:40,TOPICO:40,OFTALMICO:40,SPRAY:60,MATERIAL:5};
const _sGen = p => { const s=String(p||'').replace(/^[\s*#>+]+/,''); return /^G[.\s]/i.test(s)||/\bGEN\b|GENERICO/i.test(s); };  // genérico (G./GEN)
// Recipiente (bolsa/seringa/ampola/FA/refil/sistema/caneta) com N>1 no nome. Ignora o que vem depois de "+" (acessório).
function _sRecipiente(produto){
  const n=String(produto||'').toUpperCase();
  const re=/(\+\s*)?(\d{1,4})\s*(?:SERINGAS|SERINGA|SER|AMPOLAS|AMPOLA|BOLSAS|BOLSA|BOLS|FRASCOS|FRASCO|FR|CANETAS|CANETA|CAN|SISTEMAS|SISTEMA|SIST|REFIS|REFIL|FA)\b/g;
  let m; while((m=re.exec(n))){ if(m[1]) continue; if(parseInt(m[2])>1) return true; }
  return false;
}
function pareceCaixaSanidade(produto, und, unit, caixa){
  unit=parseFloat(unit); if(!(unit>0)) return null;
  const qtd=qtdEmbalagem(und,produto)||1; if(qtd<=1) return null;
  // RECIPIENTE CARO SEM CAIXA: "N BOLS/FR/AMP/FA/SER" + compra_caixa vazia + unit>=100. Buraco que o teto por forma
  // (abaixo) NÃO pega: numa bolsa/frasco caro o ÷qtd CONTINUA alto, então nunca cai no TETO. Ex.: FLUCAZOL IV
  // CX 6 BOLS unit 1230 (÷6=205) — o 205 não é "barato" p/ INJETAVEL, mas 1230 é a CAIXA. Peer-independente de
  // propósito: 26 dos 30 itens desse padrão não têm peer da mesma forma+dose no banco. É ALERTA, não auto-apply.
  const temCaixa = caixa!=null && caixa!=='' && parseFloat(caixa)>0;
  if(!temCaixa && unit>=100 && _sRecipiente(produto)) return {qtd, corr:+(unit/qtd).toFixed(4), forma:'RECIPIENTE'};
  const f = _sMaterial(produto) ? 'MATERIAL' : ((typeof _bmForma==='function')?_bmForma(produto):null);
  if(!f || !(f in _S_LIMIAR)) return null;
  const corr=+(unit/qtd).toFixed(4);
  // genérico sólido-oral: comprimido de genérico > R$3/un quase não existe -> limiar baixo pega os sub-20 (LOSARTANA, LEVOTIROXINA...)
  const lim = (f==='SOLIDO_ORAL' && _sGen(produto)) ? 3 : _S_LIMIAR[f];
  if(unit>=lim && corr<=_S_TETO[f]) return {qtd,corr,forma:f};
  return null;
}
// PACK DECLARADO: a embalagem foi DITA em algum lugar, ainda que valha 1? "FR 1", "CX1", "UN1" no
// campo und são declarações explícitas de embalagem unitária — diferente de silêncio. É o que
// separa "a caixa tem 1 unidade" (sabido) de "não sei quantas unidades tem" (chute).
function _packDeclarado(c){ return /\d/.test(String(c.und == null ? '' : c.und)); }
/* ═══ A EMBALAGEM, E SE A CASA SABE QUAL É — UM LUGAR SÓ (A_051, 09/09/2026) ═══════════════════
   >>> ORDEM DO DONO, palavras dele: "lá na cotação Giovana, colocando preço de unidade como se
       fosse o preço de caixa. Isso dá uma merda grande, porque meus representantes oferecem — e
       se fechar… imagina o buraco."
   >>> O DEFEITO, e ele estava no `|| 1`: `qtdEmbalagem` devolve 1 em DOIS casos que NÃO são a
       mesma coisa — "a caixa TEM 1 unidade" e "NÃO ACHEI o pack". A tela fazia
       `qtd_caixa = c._qtd_caixa || qtdEmbalagem(...) || 1` e logo abaixo
       `precoCx = precoUnit * qtd_caixa`, imprimindo "CX/1" e "R$ X/cx" nos dois casos. No segundo,
       o preço de UMA ampola sai na tela e no PDF rotulado como o preço da CAIXA INTEIRA.
       É a mesma doença que o `pv()` já tinha curado no ramo do `compra_caixa` (bug #3 da 68036) —
       só que lá o buraco era dividir por esse 1, e aqui é MULTIPLICAR por ele.
   >>> MEDIDO NA BASE INTEIRA em 09/09/2026 (`tools/sonda_unidade_como_caixa.js`, tabela `cotacoes`
       com 21.559 linhas, 21.133 entrando na busca):
         · 11.650 (55,1%) com pack declarado > 1 → /un e /cx são números DIFERENTES: o rótulo
           decide dinheiro;
         ·    382 ( 1,8%) com caixa de 1 DECLARADA → precoCx = precoUnit e é VERDADE;
         ·  9.101 (43,1%) MUDAS → ninguém declarou nada e a tela afirmava "CX/1" assim mesmo.
           Só nelas, R$ 561.018,35 de preços unitários saíam rotulados "Preço CAIXA".
   >>> O QUE ISTO **NÃO** FAZ: não muda conta nenhuma. `sabido:false` não mexe em preço, total nem
       gravação — o preço unitário sempre esteve certo. O que deixa de existir é o número de caixa
       INVENTADO ao lado dele. (Trava avisa, nunca bloqueia — regra do dono, 30/07.) */
// "CX1", "CT 1", "1 FA", "1 SER", "1 CAN" no nome são DECLARAÇÃO de caixa unitária, não silêncio.
// `_qtdDoNome` não as devolve porque TODAS as guardas dele exigem `n > 1` — então, sem esta
// leitura, 357 linhas boas (OCREVUS "CX1 FR AMP", PERJETA "CT 1 FA 14ML", SIMPONI "1 CAN APLIC")
// seriam acusadas de "não sei" com o preço certo na mão. Âncora genérica acusa o inocente (L15), e
// alarme falso mata a confiança no alarme verdadeiro.
const _RE_PACK_UM = [
  /\bCX\s*\/?\s*0*1\b(?!\d)/,      // CX1 · CX 1 · CX/01
  /\bCT\s*\/?\s*0*1\b(?!\d)/,      // CT 1  (cartucho com 1 — como a ANVISA escreve)
  /\bC\/\s*0*1\b(?!\d)/,           // C/1
  /\b0*1\s*(?:FA|FR|AMP|AMPOLA|SER|SERINGA|CAN|CANETA|BOLS|BOLSA|SIST|SISTEMA|REFIL|ENV|BLS|TB|TUBO|POTE|FLAC)\b/,
  // A_063 — CX/1FRS, CX1FR: o numero colado na letra, sem espaco (medido 15/09: 72 linhas na base
  // inteira, todas frasco/ampola unico de oncologico/injetavel, 0 falso-positivo contra "CX" seco).
  /\bCX\s*\/?\s*0*1\s*(?:FRS|FR|FA|AMP|AMPOLA|SER|SERINGA|CAN|CANETA|BOLS|BOLSA|SIST|SISTEMA|REFIL|ENV|BLS|TB|TUBO|POTE|FLAC)\b/
];
function _packUmNoNome(produto){
  const n = String(produto == null ? '' : produto).toUpperCase();
  return _RE_PACK_UM.some(r => r.test(n));
}
// A ÚNICA resposta da tela para "quantas unidades vêm na caixa, e eu sei disso?".
// `sabido` é o campo que não existia — e é ele que separa o fato do chute.
function _packInfo(c){
  const o = c || {};
  const gravado = parseFloat(o._qtd_caixa);
  if (gravado > 1) return { qtd: gravado, sabido: true, fonte: 'item' };
  const q = qtdEmbalagem(o.und, o.produto);
  if (q > 1) return { qtd: q, sabido: true, fonte: 'und/nome' };
  // caixa de 1 DITA — pelo campo (`_packDeclarado`, a MESMA pergunta que o `pv()` já faz: dois
  // leitores de embalagem discordando um dia é pior que um leitor imperfeito) ou pelo nome.
  if (_packDeclarado(o)) return { qtd: 1, sabido: true, fonte: 'und' };
  if (_packUmNoNome(o.produto)) return { qtd: 1, sabido: true, fonte: 'nome' };
  return { qtd: 1, sabido: false, fonte: 'nao declarada' };
}
/* ⚠ O RÓTULO NÃO MORA AQUI, E A RAZÃO É DE DESENHO — não de arrumação.
   ⛔ E ESTE COMENTÁRIO NÃO PODE ESCREVER A ÂNCORA FINAL DO MOTOR (a declaração do temporizador da
      busca, logo antes do bloco BUSCA). Escrevi o nome dela aqui na primeira versão e o
      `tools/gera_motor_busca.js` PAROU NESTA LINHA: a fatia A caiu para 156 linhas e o módulo
      nasceu sem `ehGlobalComEstoque`. Âncora é texto — citá-la é movê-la (lição 35).
   Daqui até aquela linha é o MOTOR, e o gerador copia esta faixa
   VERBATIM para o `motor_busca.js`, que roda em node dentro de ~30 ferramentas. Escrevi
   `_rotuloEmb`/`_embCard`/`_undPDF` aqui primeiro, e o guard do motor ficou vermelho com razão:
   elas chamam `fmtBRL` e montam HTML, coisas que NÃO existem no módulo — seriam código morto
   embarcado em trinta ferramentas, esperando alguém chamá-las e receber um ReferenceError.
   `_packInfo` FICA (é regra de embalagem, e é útil a quem mede pelo node); o que desenha foi
   para junto do `renderItens`, que é quem desenha. */
// MARKUP: quem manda é a COLUNA markup_venda da própria linha; o 1,32 aqui é só o piso de quem
// ainda não tem coluna (linha nova, banco antigo, teste). Era o contrário até 05/08 — o markup era
// esta constante, e só ela.
// >>> POR QUE MUDOU, e é a razão que importa: a view do vendedor entrega VENDA e esconde CUSTO,
//     mas a venda era custo × 1,32 e o 1,32 estava escrito aqui, em JS público. Quem soubesse
//     dividia a venda e chegava no custo. Isso é ARITMÉTICA, não vazamento de dado — nenhuma
//     coluna de custo saía do banco — mas também não é proteção, e chamar de proteção era o pior
//     dos mundos. Com o markup POR LINHA e guardado só no banco (a view publica a venda e NÃO
//     publica o markup), não existe um número único para dividir.
// >>> A LEITURA É `c.markup_venda || MKP` e não o contrário: quem lê `cotacoes` (gestor) recebe a
//     coluna; quem lê a view já recebe a venda pronta e nem passa por aqui. O fallback existe
//     para a linha que ainda não tem coluna — nunca para sobrepor a que tem.
// >>> FICA COLADO NO pv() DE PROPÓSITO: as suites extraem um BLOCO do arquivo (de _undNum até
//     searchTO) e rodam num Function isolado. Declarado lá no topo, ele ficava FORA do recorte e
//     12 suites quebraram com "MKP is not defined".
// >>> LÊ A CONSTANTE ÚNICA, SEM RESERVA (CAIXA_A, 28/09 — CEO 11:25 sobre o achado do Auditor,
//     PONTE_AUDITOR 10:33:41): o número não mora mais aqui, nem escondido num valor-padrão calado. Mora só
//     em limedtec-mkp-fornecedor.js (`window.MKP_FORNECEDOR`), carregado antes deste script. Se a
//     constante não chegar (script que não carregou), a tela AVISA (decisão 30: falha não vira
//     número calado) — nunca cai de volta num 1,32 escondido.
// >>> SUÍTE QUE RODA O RECORTE ISOLADO (sem o <script> da constante no scope): recebe
//     MKP_FORNECEDOR como parâmetro do Function que embrulha o bloco — não um 1,32 novo escrito
//     na suíte. Ver tests/testa_markup_fornecedor_giovana_b_c151.js.
const MKP = (typeof MKP_FORNECEDOR !== 'undefined' && MKP_FORNECEDOR)
  ? MKP_FORNECEDOR
  : (typeof console !== 'undefined' && console.error && console.error('MKP_FORNECEDOR não carregou (limedtec-mkp-fornecedor.js) — markup de fornecedor indisponível'), undefined);
// CAIXA_A (28/09, CEO 18:25 sobre o achado do Auditor, PONTE 18:02:21): a constante ausente não
// pode ficar só no console (decisão 30: falha não vira número calado/silêncio). `_avisaMkpAusente`
// acende um banner visível na tela, uma vez, e é chamada aqui e em qualquer outro ponto que
// descubra o mesmo buraco (ex.: suíte no navegador). `_mkp`/`pv` abaixo NUNCA multiplicam por MKP
// indefinido — sem override e sem constante, o preço de fornecedor sai 0 (mesma régua da linha
// 2050: preço que não se sabe não vira preço inventado no orçamento).
function _avisaMkpAusente(){
  if (typeof document === 'undefined') return; // suíte em Node (Function isolado): sem DOM, só o console acima
  const b = document.getElementById('aviso-mkp-fornecedor');
  if (b && b.style.display === 'none') {
    b.textContent = 'MKP_FORNECEDOR não carregou — preço de item de fornecedor sem markup próprio ficou indisponível (não é 0, é desconhecido). Recarregue a página.';
    b.style.display = 'flex';
  }
  if (!window._mkpAusenteToast && typeof toast === 'function') { window._mkpAusenteToast = true; toast('MKP_FORNECEDOR não carregou — preço de fornecedor sem markup próprio ficou indisponível', 'error'); }
}
if (typeof MKP === 'undefined') _avisaMkpAusente();
function _mkp(c){ const m = parseFloat(c && c.markup_venda); return (m > 0) ? m : MKP; }
// A CONTA MORA EM limedtec-visivel.js (decisão 183, ralo 1): a tela e a trava perguntam ao mesmo
// módulo. Aqui só entram as peças que dependem da tela (embalagem, GLOBAL, markup).
const _LTV = LT_VISIVEL.criar({
  qtdEmbalagem: (u, p) => qtdEmbalagem(u, p), ehGlobal: (c) => ehGlobal(c),
  packDeclarado: (c) => _packDeclarado(c), mkp: (c) => _mkp(c),
  avisaMkpAusente: () => _avisaMkpAusente(), esgotado: { ehEsgotado: (e) => LT_ESGOTADO.ehEsgotado(e) }
});
function pv(c) { return _LTV.pv(c); }
// A_540 (decisão 265): preço de 61-180 dias cota por ÚLTIMO (depois de estoque, mais barato, atualizados). 0 = atual, 1 = velho.
// resolve a regra de cotação vencida: no motor_busca.js ela se chama LT_VENCIDA (shim), na tela LT_COTACAO_VENCIDA (window). typeof protege: nome inexistente não pode derrubar a busca.
function _ltCV() { return (typeof LT_VENCIDA !== 'undefined' && LT_VENCIDA) || (typeof LT_COTACAO_VENCIDA !== 'undefined' && LT_COTACAO_VENCIDA) || null; }
function _velha(c) { const r = _ltCV(); return (r && r.ehVelhaCotavel(c)) ? 1 : 0; }
// A_541 (decisão 265): Supermédica em 2º, logo depois do estoque GLOBAL. 0 = Supermédica, 1 = outros.
function _super(c) { const r = _ltCV(); return r ? r.ehSupermedica(c) : 1; }
function semPack(c) { return _LTV.semPack(c); }
// selo da linha sem pack: mostra o preço da CAIXA como veio (custo) só para quem vê custo; sem preço por unidade (nunca assume 1)
// A_537: preço da EMBALAGEM como veio (nunca dividido nem multiplicado por pack inventado). Quem não vê custo vê a venda da caixa, se existir.
function _precoEmbSemPack(c){
  const v = parseFloat(c && c.venda_caixa_forn) || 0, k = parseFloat(c && c.compra_caixa) || 0;
  return ehRestrito() ? v : (k > 0 ? k : v);
}
function _seloSemPack(c){
  const p = _precoEmbSemPack(c);
  const sel = '<span class="badge" style="background:var(--lt-superficie-2);color:var(--muted)" title="A embalagem não está no nome: sem preço por unidade. Confirme o pack com o fornecedor.">sem pack</span>';
  return p > 0 ? '<strong style="color:var(--verde-escuro)">' + fmtBRL(p) + ' a embalagem</strong> <span style="color:var(--muted)">(qtd por caixa desconhecida)</span> ' + sel : sel;
}

// ═══ MARGEM SUGERIDA PELO MERCADO (A_082, 16/09/2026) ═══════════════════════════════════════
// >>> LEI: docs/arquiteto/LEI_MARGEM_SUGERIDA_PELO_MERCADO.md — "não quero que seja fixo isso aí… eu
//     quero que ele SUGIRA qual margem eu conseguiria vender". Mata o `custo × 1,32` como regra
//     viva: o 1,32 vira só PISO DE EMERGÊNCIA, usado apenas quando não há dado nenhum de mercado.
// >>> DUAS RÉGUAS, NUNCA MISTURADAS: A) mediana do CUSTO de mercado (`cotacoes`, o que os
//     concorrentes COMPRAM) · B) menor VENDA de concorrente (`mercado_concorrente`, o que eles
//     VENDEM). Tendo as duas, vale o TETO MAIS BAIXO (adendo 3: "na dúvida, o teto mais baixo —
//     preço que não vende é pior que margem menor"). A GLOBAL nunca entra em nenhuma das duas —
//     quem chama esta função já filtrou a própria linha da GLOBAL fora de peersCusto/vendasConcorrente.
// >>> A CONTA (adendo 2, ordem do dono corrigindo o próprio exemplo — "8,80 não, porque está
//     acima"): a sugestão NUNCA passa do teto; a folga é de CENTAVOS (o maior entre R$0,02 e
//     0,5% do teto), não de percentual — folga grande é dinheiro deixado na mesa.
// >>> CAIXA_D (24/09, item 20:00): O ADENDO 4 CAIU — a lei (CLAUDE.md, "A MARGEM NÃO É FIXA")
//     manda "mediana só com ≥3 preços de ≥2 fornecedores; menos que isso = NÃO SEI SUGERIR".
//     Abaixo do mínimo o pool inteiro (custo OU venda concorrente) é descartado e cai no próximo,
//     e sem nenhum pool que bata o mínimo devolve 'nao_sei' — não 'piso_emergencia' (esse é só
//     para quando NÃO HÁ preço nenhum de mercado, não para "tem preço mas é pouco").
//     'nao_sei' também vale quando o MEU custo é desconhecido — sem o meu lado da conta não há
//     margem para calcular.
const MIN_PRECOS = 3, MIN_FORNECEDORES = 2;
function _msFornecedores(pool){ return new Set(pool.map(p => String(p.fornecedor))).size; }
function _msMediana(arr){ const a=arr.slice().sort((x,y)=>x-y); const n=a.length; if(!n) return null; const mid=Math.floor(n/2); return n%2 ? a[mid] : (a[mid-1]+a[mid])/2; }
function margemSugerida(opts){
  const o = opts || {};
  const custoMeu = parseFloat(o.custoMeu);
  // ⛔ custo inventado é proibido (venda ÷ 1,25 não é custo) — quem chama nunca deve passar isso
  //     aqui; esta função só confia no número que recebe como custoMeu.
  if (!(custoMeu > 0)) {
    return { preco_sugerido: null, margem_pct: null, regua: 'nao_sei', n_precos: 0, n_fornecedores: 0,
      data_mais_nova: null, motivo: 'meu custo é desconhecido ou inválido — sem o meu custo não dá para calcular margem' };
  }
  let peersCusto = (o.peersCusto || []).filter(p => p && parseFloat(p.custo) > 0);
  let vendasConc = (o.vendasConcorrente || []).filter(v => v && parseFloat(v.preco) > 0);
  // trava literal da lei: pool com menos de 3 preços de menos de 2 fornecedores não sustenta régua.
  if (peersCusto.length && (peersCusto.length < MIN_PRECOS || _msFornecedores(peersCusto) < MIN_FORNECEDORES)) peersCusto = [];
  if (vendasConc.length && (vendasConc.length < MIN_PRECOS || _msFornecedores(vendasConc) < MIN_FORNECEDORES)) vendasConc = [];
  const medA = peersCusto.length ? _msMediana(peersCusto.map(p => parseFloat(p.custo))) : null;
  const minB = vendasConc.length ? Math.min.apply(null, vendasConc.map(v => parseFloat(v.preco))) : null;
  let teto = null, regua = null, pool = [];
  if (minB != null && medA != null) { if (minB <= medA) { teto = minB; regua = 'B'; pool = vendasConc; } else { teto = medA; regua = 'A'; pool = peersCusto; } }
  else if (minB != null) { teto = minB; regua = 'B'; pool = vendasConc; }
  else if (medA != null) { teto = medA; regua = 'A'; pool = peersCusto; }

  if (teto == null) {
    const oPeers = (o.peersCusto || []).length, oVendas = (o.vendasConcorrente || []).length;
    if (oPeers > 0 || oVendas > 0) {
      return { preco_sugerido: null, margem_pct: null, regua: 'nao_sei', n_precos: Math.max(oPeers, oVendas),
        n_fornecedores: _msFornecedores(oPeers ? o.peersCusto : o.vendasConcorrente),
        data_mais_nova: null,
        motivo: 'menos de ' + MIN_PRECOS + ' preços de menos de ' + MIN_FORNECEDORES + ' fornecedores — mediana só com ≥' + MIN_PRECOS + ' preços de ≥' + MIN_FORNECEDORES + ' fornecedores (lei "A MARGEM NÃO É FIXA")' };
    }
    // MKP_FORNECEDOR não carregou: nada de multiplicar por undefined (NaN calado) — avisa e devolve
    // 'nao_sei' em vez de um piso de emergência inventado.
    if (!(MKP > 0)) {
      if (typeof _avisaMkpAusente === 'function') _avisaMkpAusente();
      return { preco_sugerido: null, margem_pct: null, regua: 'nao_sei', n_precos: 0, n_fornecedores: 0,
        data_mais_nova: null, motivo: 'MKP_FORNECEDOR não carregou — sem a constante não há piso de emergência para sugerir' };
    }
    const sugerido = +(custoMeu * MKP).toFixed(4);
    return { preco_sugerido: sugerido, margem_pct: +((MKP - 1) * 100).toFixed(1), regua: 'piso_emergencia',
      n_precos: 0, n_fornecedores: 0, data_mais_nova: null,
      motivo: 'sem nenhum preço de mercado (nem custo de fornecedor, nem venda de concorrente) — usando o piso de emergência ' + MKP + 'x, não é sugestão de mercado' };
  }
  // >>> "MAIOR" NÃO SERVE AQUI (conferido contra o exemplo numérico do próprio adendo 2 — SARCOPLEX,
  //     teto R$8,61 → folga R$0,02 → R$8,59): 0,5% de R$8,61 já dá R$0,0431, maior que os 2 centavos
  //     do exemplo. "Folga de centavos, não de porcento" só faz sentido pegando o MENOR dos dois —
  //     a folga cresce (em R$) só quando o item é tão barato que 0,5% vira menos que 2 centavos.
  const folga = Math.min(0.02, teto * 0.005);
  let sugerido = +(teto - folga).toFixed(4);
  if (sugerido > teto) sugerido = teto; // ⛔ a sugestão NUNCA passa do teto, nem um centavo (adendo 2)
  const margemPct = +(((sugerido - custoMeu) / custoMeu) * 100).toFixed(1);
  const fornecedores = new Set(pool.map(p => String(p.fornecedor))).size;
  const datas = pool.map(p => p.data).filter(Boolean).sort();
  const dataMaisNova = datas.length ? datas[datas.length - 1] : null;
  const selo = (pool.length >= 3 && fornecedores >= 2) ? 'FIRME' : 'MAGRA';
  const veredito = margemPct >= 25 ? 'boa compra' : (margemPct >= 12 ? 'compensa' : 'não compensa (abaixo do piso de 12%)');
  const origemTeto = regua === 'B' ? 'teto = menor venda de concorrente' : 'teto = mediana de custo de fornecedores do mercado';
  return {
    preco_sugerido: sugerido, margem_pct: margemPct, regua, n_precos: pool.length, n_fornecedores: fornecedores,
    data_mais_nova: dataMaisNova,
    motivo: origemTeto + ' · selo ' + selo + ' (' + pool.length + ' preço(s) de ' + fornecedores + ' fornecedor(es)) · ' + veredito,
  };
}

// GLOBAL = estoque próprio (fornecedor '1' ou tipo global). Com estoque>0 = prioridade absoluta na busca.
// >>> A PERGUNTA "É GLOBAL?" MORA AQUI, UMA VEZ SÓ (07/08). Ela estava copiada em 12 lugares como
//     `tipo==='global' || fornecedor==='1'`. Com a coluna `fornecedor` saindo da view do vendedor,
//     cada cópia passaria a responder com METADE da condição — e errado em silêncio: GLOBAL sem
//     estoque voltando a aparecer na busca, prioridade trocada, o GLOBAL entrando no próprio pool
//     de peers. Nada disso dá erro na tela; dá preço errado na proposta.
//     CONFERIDO NO BANCO ANTES DE ENCURTAR: tipo='global' → 577 · fornecedor='1' → 577 · as duas
//     juntas → 577. As duas metades dizem a mesma coisa; ficou a que o vendedor pode ver.
function ehGlobal(c){
  if (!c) return false;
  if (String(c.tipo||'').toLowerCase() === 'global') return true;
  // >>> E O `fornecedor==='1'` CONTINUA VALENDO PRA QUEM TEM A COLUNA. Eu tinha encurtado só pro
  //     `tipo` porque medi 577=577=577 — mas isso provava o estado de HOJE, não a regra. O
  //     testa_estoque_idade B7 cobra a regra: existe caminho de import que grava o código do
  //     estoque próprio SEM preencher o tipo, e essas linhas têm que contar como GLOBAL.
  //     O vendedor não recebe esta coluna (a view não a publica): pra ele a resposta sai do
  //     `tipo`, e as duas coincidem. Quem tem as duas informações usa as duas.
  return String(c.fornecedor||'') === '1';
}
function ehGlobalComEstoque(c){ return ehGlobal(c) && (parseInt(c.estoque)||0) > 0; }
// Filtro de carga: fornecedor precisa de preço (pv>0); GLOBAL precisa de preço E estoque>0 (sem estoque não aparece).
// DISTRIBUIDOR com estoque=0 EXPLÍCITO = "esgotou no fornecedor" (botão 🚫 do card, 22/07) -> fora da busca.
// null/'' = estoque não informado (a maioria das cotações) -> continua entrando só com pv>0, como sempre.
// Esgotado é ESTADO, não deleção: a cotação e o compra_unit ficam intactos (reimport/edição reverte).
function incluiNaBusca(c){ return _LTV.incluiNaBusca(c); }   // regra em limedtec-visivel.js

// ─── BUSCA ────────────────────────────────────────────────────────────────────
/* ==MOTOR-A-END== */
/* ==MOTOR-B-BEGIN== */
const _bmStrip = s => (s||'').normalize('NFD').replace(/\p{M}/gu,'');
// memoizado logo abaixo (_bmMemo): é chamado uma vez por cotação POR ITEM do pedido
const _bmNormCalc = s => _bmStrip((s||'').toLowerCase()).replace(/[^a-z0-9\s,.\/]/g,' ').replace(/\s+/g,' ').trim();
const _bmNorm  = s => _bmMemo('nm', String(s == null ? '' : s), () => _bmNormCalc(s));
// ── PRÉ-CÁLCULO POR COTAÇÃO (o "pré-índice", 04/08) ──────────────────────────────────────────
// MEDIDO, não suposto: uma busca em lote de 91 itens custava 169ms POR ITEM contra 21.393
// cotações — 15,4 segundos, e o número cresce junto com o banco. O gasto não estava na conta da
// dose (memoizar só ela devolveu 4ms): estava em RENORMALIZAR O MESMO TEXTO. Cada função de
// leitura — forma, volume, calibre, tipo de soro — é chamada uma vez por cotação POR ITEM do
// pedido, ou seja quase 2 milhões de vezes num pedido de 91 linhas, sempre sobre os mesmos textos.
// São todas funções PURAS de texto: o resultado nunca envelhece e não há o que invalidar.
// >>> O QUE ELAS DEVOLVEM É COMPARTILHADO — quem recebe SÓ LÊ. Nenhum caminho de hoje escreve num
//     Set devolvido por essas funções; se um dia precisar, copie antes de mexer.
const _BM_MEMO = new Map();
function _bmMemo(tag, txt, calc){
  // UM MAPA POR FUNÇÃO, com a chave sendo a STRING ORIGINAL — nada de concatenar tag+texto.
  // A 1ª versão montava a chave com `tag + ' ' + txt` e economizou só 4ms dos 169: o ganho ia
  // embora dentro do próprio memo, porque cada chamada CRIAVA uma string nova de ~60 caracteres e
  // o Map tinha que hashear tudo de novo. Reusando a string que já veio da linha do banco, o hash
  // dela já está calculado e o lookup sai de graça. Medir antes e depois foi o que mostrou isso.
  let m = _BM_MEMO.get(tag); if (!m) { m = new Map(); _BM_MEMO.set(tag, m); }
  const hit = m.get(txt); if (hit !== undefined) return hit;
  const v = calc();
  if (m.size < 120000) m.set(txt, v);
  return v;
}
const _bmNormF = s => _bmMemo('nf', String(s == null ? '' : s), () => _bmNormFCalc(s));
const _bmNormFCalc = s => {
  let t = _bmStrip((s||'').toLowerCase());
  t = t.replace(/\bfr?\s*[\/.\\]\s*a(mp)?\b/g, ' fa ');   // F/A, FR/A, F.A, FR.AMP -> 'fa' (frasco-ampola = injetável) ANTES de trocar a barra
  t = t.replace(/[^a-z0-9\s\/]/g,' ').replace(/\//g,' ').replace(/(\d)([a-z])/g,'$1 $2').replace(/([a-z])(\d)/g,'$1 $2');
  return ' ' + t.replace(/\s+/g,' ').trim() + ' ';
};

// ██ O VOCABULÁRIO DO DISPOSITIVO — MEDIDO NA A_030, **NÃO APLICADO**, E O MOTIVO FICA AQUI ██
//
// A insulina não se descreve como "injetável": ela se descreve pelo aparelho que a aplica —
// REFIL, CARPULE, CANETA, SERINGA PREENCHIDA, SIST APLIC. Sem essas palavras o `_bmForma` devolve
// `null`, e linha sem forma sai do jogo inteiro (sem forma não há grupo, sem grupo não há
// "normal", sem normal não há garimpo). Foi uma das duas causas de o casador da B_029 ter dado
// NENHUM para a Tresiba do dono. O conserto vale — mas NÃO com a guarda que se tinha em mãos.
//
// >>> A GUARDA PROPOSTA ERA ESTRUTURAL: quando o produto **É** o dispositivo o nome **COMEÇA**
//     com ele ("REFIL SABONETE LIQUIDO PHEBO 320ML", "SERINGA INS 0,3ML AGULHA 6X0,25MM"); quando
//     o dispositivo é só a embalagem, a palavra vem **DEPOIS** ("TRESIBA ... 5 REFIS 3ML"). Ela é
//     verdadeira, e sozinha descarta 183 nomes. **Só que ela não basta**, e isto foi MEDIDO nas
//     21.486 linhas do catálogo, não suposto:
//
//        122 linhas ganhariam INJETAVEL  ->  64 delas NÃO são injetáveis.
//          33  SABONETE / higiene   "SABONETE PROTEX BABY PELE DELICADA REFIL 180ML"
//          13  AGULHA para caneta   "AGULHA PARA CANETA DE INSULINA 31G 5MM CX C/100UN"
//           8  SERINGA DOSADORA     "CANABIDIOL 50MG/ML 30ML + SERINGA DOS", "TRILEPTAL 60MG 100ML + 2 SERINGAS"
//           6  TESTE de gravidez    "TESTE DE GRAVIDEZ CANETA Detect rapido"
//           3  REFIL de sachês      "NASOAR REFIL C/30 ENVELOPES"
//           1  KIT de glicemia      "KIT G-TECH FREE LITE MONITOR GLICOSE + ... + CANETA C/1"
//
//     O sabonete é o caso que fecha a questão: a guarda o pega quando o nome ABRE com "REFIL",
//     e o deixa passar quando o nome ABRE com "SABONETE" e o refil vem no fim. São 33 sabonetes
//     classificados como INJETÁVEL — mais da metade dos falsos positivos, e exatamente o que a
//     ordem da A_030 proibia em tarja: *"ganhar 813 e classificar sabonete como injetável é
//     trocar um defeito por um pior"*.
//
// >>> POR ISSO O PASSO NÃO ENTROU. Fechar o buraco exige uma segunda guarda — "o produto é OUTRA
//     coisa" (higiene, agulha, teste, kit, seringa dosadora de líquido oral) — e isso é dicionário
//     novo, ou seja MOLDE, e molde é do arquiteto (CLAUDE.md: "se o molde não couber, PARA e
//     RELATA"; lição 37: a régua discordar é informação, não constrangimento). As contagens, a
//     lista nominal das 122 e o controle das 183 estão em `RELATORIO_A_030.md` e em
//     `historico/_a030_forma_depois.json`. A medição se repete com
//     `node tools/mede_forma_dispositivo.js --antes` / `--depois`.
//
// >>> O QUE ENTROU DESTA RODADA foi só 'capsulas' (logo abaixo, em SOLIDO_ORAL): 698 linhas, sem
//     dispositivo nenhum no meio e sem depender de guarda — é o plural de uma palavra que já
//     estava na lista.
//
// 9 categorias de forma (ordem: específico -> geral). Categorias diferentes NUNCA casam.
const _BM_CATS = [
  ['SHAMPOO',       ['shampoo','xampu','shampo']],
  ['VAGINAL_RETAL', ['vaginal','supositorio','ovulo','enema','retal','pessario']],
  ['OFTALMICO',     ['colirio','oftalmico','oft','otologico','auricular','ocular','oftalmica']],
  ['ADESIVO',       ['adesivo','patch','transdermico','transderm']],
  ['SPRAY',         ['spray','aerossol','aerosol','aero','aer','inalacao','inalatorio','inal','nasal','jato']],
  // 'sol dil' (solução para diluição, oncológico) entra aqui de propósito: sem ele o "SOL" jogava
  // o item em LIQUIDO_ORAL e a barreira de FORMA matava o par ANTES da conta de dose (29/07).
  // Medido no banco: 0 linhas com "SOL DIL" hoje — não mexe em nada do que já existe.
  ['INJETAVEL',     ['injetavel','inj','sol inj','sol dil','solucao injetavel','susp inj','ampola','amp','ampolas','fa','fr amp','frasco ampola','liofilizado','liof','intravenoso','intramuscular','iv','im','sc','ev','epidural','c dil','s dil','diluente']],
  ['TOPICO',        ['creme','pomada','gel','locao','pasta','unguento','geleia','alcoolica','aquosa','degermante','topica','antisseptico']],
  ['LIQUIDO_ORAL',  ['xarope','xpe','suspensao','susp','solucao oral','sol oral','gotas','gts','elixir','sacaroleo','solucao','sol']],
  // 'capsulas' (A_030): o plural faltava. A lista tinha 'capsula', 'caps' e 'cap', e o casamento é
  // por palavra inteira (' '+kw+' ') — então "C/30 CAPSULAS" caía em `null` e a linha saía do jogo.
  // Medido no catálogo de 21.486 linhas: 766 escrevem "CAPSULAS" e 10 escrevem "CAPSULA".
  ['SOLIDO_ORAL',   ['comprimido','comprimidos','cpr','cp','comp','dragea','drageas','revestido','rev','capsula','capsulas','caps','cap','cps','pastilha','pilula','tablete','efervescente','lib prol','lp','xr','er','mr']],
];
// CLASSE terapêutica intercambiável derivada da CMED (PASSO 3 item 2, política do Lemuel:
// "sobreposição de classe B"). Hoje só COMPLEXO_B: complexos de vitamina B que compartilham o
// núcleo (tiamina+piridoxina+riboflavina+nicotinamida) casam entre si. Reconhece pela FRASE
// "complexo b" (pega CENTRIX COMPLEXO B, não pega COMPLEXO PROTROMBINICO) OU por marca no set
// _bmClasseB (Santiplex/Hyplex/Comple B... vindos da view). null quando não é classe conhecida.
function _bmClasseFam(texto){
  const t=' '+_bmNormF(texto)+' ';
  if(/\bcomplexo\s*b(?![a-z])/.test(t)) return 'COMPLEXO_B';   // "complexo b", "complexo b12", "complexo b 12"; NÃO "complexo protrombinico/bc"
  for(const marca of _bmClasseB){ if(marca && t.includes(' '+marca+' ')) return 'COMPLEXO_B'; }
  return null;
}
// SUB-FORMA oral (23530 caso 2): efervescente != liberação prolongada != normal. Barreira só quando
// os DOIS lados nomeiam e divergem (mesma filosofia dos discriminadores). null = não especificado.
function _bmSubFormaOral(texto){ const t=' '+_bmNormF(texto)+' ';
  if(/ eferv/.test(t)) return 'EFERV';
  if(/ lib\s*prol| liberacao\s*prol| retard| \d*\s*lp | xr | \bum dia\b/.test(t)) return 'LP';
  return null;
}
function _bmForma(texto){ const t=_bmNormF(texto); if(t.includes(' gel ') && /(caps|cps|capsula)\b/.test(t)) return 'SOLIDO_ORAL'; /* cápsula gelatinosa (CPS GEL / 21CAPS GEL DURA) é ORAL, não gel tópico */ for(const [cat,kws] of _BM_CATS) for(const kw of kws) if(t.includes(' '+kw+' ')) return cat; if(/\d\s+com\b/.test(t)) return 'SOLIDO_ORAL'; return null; }
const _BM_DOSE_CRIT = {SOLIDO_ORAL:1, INJETAVEL:1, LIQUIDO_ORAL:1};

// ── ARITMÉTICA DE CONCENTRAÇÃO (bug #5 da 68036) ──────────────────────────────────────────────
// Quatro notações que dizem A MESMA COISA e que o motor lia como coisas diferentes:
//    2%          ==  20MG/G  ==  20MG/ML     (1% = 1g em 100ml = 10mg/ml)
//    250MG/5ML   ==  50MG/ML                 (dose por volume -> concentração)
//    200+40MG/5ML == 40MG/ML + 8MG/ML        (a unidade escrita só no fim vale pros DOIS componentes)
// É CONTA, não dicionário: não há lista de sinônimos aqui, e por isso não precisa de manutenção
// quando entra produto novo — foi o critério do Lemuel ("aritmética e não dicionário").
//
// >>> E, no meio disso, um DEFEITO PURO de leitura de número: o separador de milhar era lido como
//     parte decimal. "1.200.000UI" virava 200UI, "600.000UI" virava 600UI e "5.000.000UI" virava
//     ZERO. Os dois lados da comparação erravam junto, então o casamento até funcionava por
//     acidente — mas doses distintas podiam colidir (20.000UI e 20UI davam o mesmo 20UI), e dose
//     errada é o tipo de erro que chega no paciente, não no total da proposta.
//     A guarda: só colapsa quando o primeiro grupo NÃO é zero, senão "0.125MG" (digoxina, decimal
//     escrito com ponto) viraria 125MG — mil vezes a dose.
function _bmNumTxt(n){ n = Math.round(n * 100000) / 100000; return String(n); }
// MEMÓRIA (não é otimização prematura, é o custo medido): numa busca em lote o MESMO texto de
// produto é normalizado uma vez por item do pedido — 21.393 candidatos × 91 itens. Com a
// aritmética nova o custo por item subiu de 105ms pra 141ms; com a memória ele volta a cair.
// São funções PURAS de texto, então o resultado nunca envelhece e não há o que invalidar.
const _BM_CANON_MEMO = new Map(), _BM_DOSES_MEMO = new Map();
function _bmDoseCanon(bruto){
  const k = String(bruto);
  const hit = _BM_CANON_MEMO.get(k); if (hit !== undefined) return hit;
  const r = _bmDoseCanonCalc(k);
  if (_BM_CANON_MEMO.size < 200000) _BM_CANON_MEMO.set(k, r);
  return r;
}
function _bmDoseCanonCalc(bruto){
  let up = _bmStrip(String(bruto).toUpperCase());
  up = up.replace(/\b([1-9]\d{0,2})((?:\.\d{3})+)(?!\d)/g, (m, a, b) => a + b.replace(/\./g, ''));  // milhar (ponto) ANTES da vírgula virar ponto
  up = up.replace(/,/g, '.');                                                                       // decimal brasileiro
  // A_531: "U" sozinho é UI no rótulo (vasopressina 20U/ML == 20UI/ML). Só com /ML; "U" solto não se mexe.
  up = up.replace(/(\d+(?:\.\d+)?)\s*U\s*\/\s*ML\b/g, '$1UI/ML');
  // >>> ASSOCIAÇÃO ESCRITA COM BARRA: "50/12,5MG" é LOSARTANA 50MG + HIDROCLOROTIAZIDA 12,5MG.
  //     Este é o bug #4 da 68036: o cliente pediu HIDROCLOROTIAZIDA 12,5MG PURA e recebeu
  //     "LOSARTANA POTASSICA HIDROCLOROTIAZIDA 50/12,5MG" — outro medicamento, com uma droga a
  //     mais que o paciente não deveria tomar. Essa linha não tem '+' em lugar nenhum e tem
  //     principio_ativo VAZIO, então a barreira de combo (que lê o '+' do PA) não a enxergava; e
  //     a dose lida era só "12,5MG" (o "50/" ficava órfão), que bate com a do pedido.
  //     Lendo os DOIS números, a dose vira {50MG, 12.5MG} e a barreira de dose que já existe
  //     rejeita sozinha — sem regra nova e sem dicionário de combos.
  //     O (?!\s*\/) deixa de fora "200/40MG/5ML", que é dose-por-volume e tem regra própria.
  up = up.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(MG|MCG|UI|G)\b(?!\s*\/)/g,
    (m, a, b, u) => a + u + ' + ' + b + u);
  // composto com a unidade só no fim: "200+40MG/5ML" -> "200MG/5ML + 40MG/5ML"; "4+0,5G" -> "4G + 0.5G"
  up = up.replace(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*(MG|MCG|UI|G)\b(\s*\/\s*(?:\d+(?:\.\d+)?\s*)?(?:ML|G)\b)?/g,
    (m, a, b, u, den) => { den = den || ''; return a + u + den + ' + ' + b + u + den; });
  // dose por volume -> concentração por ML: "250MG/5ML" -> "50MG/ML"; "1200000UI/4ML" -> "300000UI/ML"
  up = up.replace(/(\d+(?:\.\d+)?)\s*(MG|MCG|UI|G)\s*\/\s*(\d+(?:\.\d+)?)\s*(?:ML|G)\b/g,
    (m, a, u, n) => { const d = parseFloat(n); return d > 0 ? (_bmNumTxt(parseFloat(a) / d) + u + '/ML') : m; });
  up = up.replace(/(\d+(?:\.\d+)?)\s*%/g, (m, a) => _bmNumTxt(parseFloat(a) * 10) + 'MG/ML');        // 2% -> 20MG/ML
  // por GRAMA == por MILILITRO. SEM \b antes da unidade: em "20MG/G" o M vem colado no 0 (dois
  // caracteres de palavra), e ali NÃO existe fronteira — com \b esta linha nunca casava nada.
  up = up.replace(/(MG|MCG|UI)\s*\/\s*G\b/g, '$1/ML');
  return up;
}
// Dose canônica: converte MCG/G -> MG (50MCG/ML == 0.05MG/ML). Volume (ML) não é dose.
// O conjunto devolvido é COMPARTILHADO entre chamadas (memória) — quem recebe só LÊ. Ninguém
// escreve num Set de dose hoje; se um dia precisar, copie antes de mexer.
function _bmDoses(texto){
  const _k = String(texto);
  const _hit = _BM_DOSES_MEMO.get(_k); if (_hit !== undefined) return _hit;
  const _r = _bmDosesCalc(_k);
  if (_BM_DOSES_MEMO.size < 200000) _BM_DOSES_MEMO.set(_k, _r);
  return _r;
}
function _bmDosesCalc(texto){
  const up=_bmDoseCanon(texto);
  const re=/(\d+(?:\.\d+)?)\s*(MG\/ML|MCG\/ML|UI\/ML|MG|MCG|UI|G|%)(?![A-Z])/g;
  const set=new Set(); let m;
  while((m=re.exec(up))){ let n=parseFloat(m[1]),u=m[2]; const perML=u.endsWith('/ML'); u=u.replace('/ML','');
    if(u==='MCG'){n=n/1000;u='MG';} else if(u==='G'){n=n*1000;u='MG';}
    n=Math.round(n*100000)/100000; set.add(n+u+(perML?'/ML':'')); }
  // DOSE COMPOSTA com a unidade escrita SÓ NO FIM (28/07, caso real 63622/Eduardo): o banco grava
  // "4MG+500MG/ML" e o cliente escreve "4MG/ML + 500MG/ML" — é a MESMA dose, o "/ML" do fim vale
  // pros dois componentes. Adiciona a variante (aditivo: não tira nada do conjunto).
  const comp=up.match(/(\d+(?:\.\d+)?)\s*(MG|MCG|G)\s*\+\s*(\d+(?:\.\d+)?)\s*(MG|MCG|G)\s*\/\s*ML/);
  if(comp){ let n1=parseFloat(comp[1]), u1=comp[2];
    if(u1==='MCG'){n1=n1/1000;} else if(u1==='G'){n1=n1*1000;}
    const chave=(Math.round(n1*100000)/100000);
    set.delete(chave+'MG'); set.add(chave+'MG/ML'); }   // SUBSTITUI (o conjunto é comparado por igualdade)
  // ── A TRIPLA REDUNDANTE (pedido de oncologia, 03/08) ────────────────────────────────────────
  // O pedido de onco escreve a MESMA informação duas vezes: dose total + concentração + volume.
  //    "DOCETAXEL 20MG ... 20MG/ML ... C/1ML"      -> 20 × 1  = 20MG   (o total é redundante)
  //    "CISPLATINA 50MG ... 1MG/ML ... C/50ML"     -> 1 × 50  = 50MG
  // O banco cadastra só a concentração ("DOCETAXEL 20MG/ML F/A 1ML"), então o pedido saía com
  // DUAS doses no conjunto e o candidato com UMA — e a barreira de dose, que compara conjuntos
  // por igualdade, rejeitava. Não eram doses diferentes: era a mesma dose dita duas vezes.
  // Quando a conta fecha, o total sai e fica a concentração (que é a forma canônica do banco).
  // >>> A ÚNICA TOLERÂNCIA DO SISTEMA, e ela é declarada: 2%. O rótulo do paclitaxel escreve
  //     "6MG/ML C/16,7ML" e 6 × 16,7 = 100,2, não 100 — o 16,7 já é 16,666... arredondado. Isto
  //     NÃO é folga na comparação de produtos: é o reconhecimento de que UM MESMO pedido se
  //     contradiz na terceira casa. Se os números divergirem mais que isso, o conjunto fica com
  //     as duas doses e a barreira volta a rejeitar — a discordância vira barreira, não palpite.
  // A_531: AMPICILINA+SULBACTAM — o pedido escreve "0,5/1G" (2 doses) e o banco "1,5G" (a soma): é o mesmo frasco.
  // As duas doses em MG viram a SOMA, dos dois lados (2G+1G e 3G também fecham). Só com os dois nomes no texto.
  if (set.size === 2 && /AMPICILINA/.test(_bmStrip(String(texto).toUpperCase())) && /SULBACTAM/.test(_bmStrip(String(texto).toUpperCase()))) {
    const mgs = [...set].filter(d => /^\d+(?:\.\d+)?MG$/.test(d)).map(parseFloat);
    if (mgs.length === 2) { set.clear(); set.add(Math.round((mgs[0] + mgs[1]) * 100000) / 100000 + 'MG'); }
  }
  if (set.size === 2) {
    const arr = [...set];
    const mg = arr.find(d => /^\d+(?:\.\d+)?MG$/.test(d));
    const cc = arr.find(d => /^\d+(?:\.\d+)?MG\/ML$/.test(d));
    if (mg && cc) {
      const vols = [...(typeof _bmMl === 'function' ? _bmMl(texto) : new Set())].map(Number).filter(n => n > 0);
      const total = parseFloat(mg), conc = parseFloat(cc);
      if (vols.some(v => total > 0 && Math.abs(conc * v - total) / total <= 0.02)) set.delete(mg);
    }
  }
  return set;
}
function _bmDoseEq(a,b){ if(a.size!==b.size) return false; for(const d of a) if(!b.has(d)) return false; return true; }
// injetável reconstituído (pó/liofilizado + diluente): 40MG (pó) == 40MG/ML (reconstituído) — mesmo produto de força única
function _bmReconst(prod){ const t=_bmNormF(prod); return t.includes(' liof')||t.includes(' liofilizado')||t.includes(' diluente')||t.includes(' c dil')||t.includes(' s dil')||/ po\b/.test(t); }
function _bmDoseEqIgnMl(a,b){ const strip=s=>{const x=new Set(); s.forEach(d=>x.add(d.replace('/ML',''))); return x;}; return _bmDoseEq(strip(a),strip(b)); }
// DOSE TOTAL == CONCENTRAÇÃO × VOLUME (aprovado pelo Lemuel 29/07, caso dos oncológicos do 63622).
// O cliente escreve a dose TOTAL do frasco ("ATEZOLIZUMABE 1200MG FA C/20ML") e o banco cadastra
// CONCENTRAÇÃO × VOLUME ("60MG/ML SOL DIL 20ML") — é o MESMO produto, 60 × 20 = 1200.
// A REGRA, SEM FOLGA (é a barreira mais crítica do sistema): um lado tem SÓ massa absoluta, o outro
// SÓ concentração, os DOIS declaram volume, o volume é o MESMO e a conta fecha EXATA. Sem tolerância.
// Dose composta (2 componentes) e UI/% ficam de fora — só dose única em MG canônico.
function _bmDoseTotalEq(dosesA, mlA, dosesB, mlB){
  const volUnico = s => { const a=[...s].map(Number).filter(n=>n>0); return a.length===1 ? a[0] : null; };
  const vA = volUnico(mlA), vB = volUnico(mlB);
  if (vA === null || vB === null || vA !== vB) return false;      // os dois lados, e o MESMO volume
  const so = (s, re) => { const a=[...s]; return (a.length===1 && re.test(a[0])) ? parseFloat(a[0]) : null; };
  const massa = s => so(s, /^\d+(?:\.\d+)?MG$/);                  // 1200MG (absoluta)
  const conc  = s => so(s, /^\d+(?:\.\d+)?MG\/ML$/);              // 60MG/ML
  const arred = n => Math.round(n * 100000) / 100000;             // mesma casa que o _bmDoses usa
  const mA = massa(dosesA), cA = conc(dosesA), mB = massa(dosesB), cB = conc(dosesB);
  if (mA !== null && cB !== null) return arred(cB * vB) === arred(mA);
  if (mB !== null && cA !== null) return arred(cA * vA) === arred(mB);
  return false;
}
// >>> COMPLEMENTO (bug #5, caso do BROMETO DE PANCURONIO 4MG): a regra acima exige volume nos DOIS
//     lados — e um pedido normal NÃO declara volume, escreve só a dose total ("PANCURONIO 4MG").
//     Ou seja: a regra nunca podia disparar justamente no caso mais comum, que é o cliente pedir
//     pela dose total e o banco cadastrar concentração × volume (2MG/ML × 2ML = 4MG).
//     Aqui o lado da MASSA pode não declarar volume nenhum; quem manda é o volume do lado da
//     CONCENTRAÇÃO. A conta continua EXATA, sem tolerância.
//     A GUARDA CONTINUA: se o lado da concentração não declara volume, NÃO HÁ CONTA e nada casa —
//     é o que preserva "DIMORF 10MG != DIMORF 10MG/ML". E volume declarado e DIFERENTE barra.
function _bmDoseTotalEqSemVol(dosesA, mlA, dosesB, mlB){
  if (_bmDoseTotalEq(dosesA, mlA, dosesB, mlB)) return true;
  const volUnico = s => { const a=[...s].map(Number).filter(n=>n>0); return a.length===1 ? a[0] : null; };
  const so = (s, re) => { const a=[...s]; return (a.length===1 && re.test(a[0])) ? parseFloat(a[0]) : null; };
  const massa = s => so(s, /^\d+(?:\.\d+)?MG$/);
  const conc  = s => so(s, /^\d+(?:\.\d+)?MG\/ML$/);
  const arred = n => Math.round(n * 100000) / 100000;
  const vA = volUnico(mlA), vB = volUnico(mlB);
  const mA = massa(dosesA), cA = conc(dosesA), mB = massa(dosesB), cB = conc(dosesB);
  if (mA !== null && cB !== null && vB !== null && vA === null) return arred(cB * vB) === arred(mA);
  if (mB !== null && cA !== null && vA !== null && vB === null) return arred(cA * vA) === arred(mB);
  return false;
}
// pedido só tem CONCENTRAÇÃO (%, MG/ML) sem massa absoluta -> aí o VOLUME entra na comparação
function _bmSoConc(doses){ return doses.size>0 && [...doses].every(d=> d.endsWith('/ML') || d.endsWith('%')); }
// volume em ML (converte L->ML). Ignora a parte /ML de concentração (não tem dígito colado no ML).
function _bmVolume(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.');
  let vol=null, m;
  const reL=/(\d+(?:\.\d+)?)\s*(?:LTS|LT|L)\b(?![A-Z0-9])/g; while((m=reL.exec(up))){ vol=parseFloat(m[1])*1000; }
  // O lookbehind barra ML depois de "/" (concentração "MG/ML") e de letra. Faltava barrar depois
  // de DÍGITO e de PONTO: em "C/16.7ML" o motor pulava o "1" (que vem depois da barra) e casava a
  // partir do "6", lendo o volume como **6,7ML** em vez de 16,7ML. Numero truncado no meio.
  const re=/(?<![\/A-Z0-9.])(\d+(?:\.\d+)?)\s*ML\b/g; while((m=re.exec(up))){ vol=parseFloat(m[1]); }
  return vol;
}
// largura/dimensão em CM (atadura/gaze/campo: 15CM != 10CM)
function _bmCm(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.'); const s=new Set(); let m;
  const re=/(\d+(?:\.\d+)?)\s*CM/g; while((m=re.exec(up))){ s.add(String(parseFloat(m[1]))); }
  return s;
}
// TODOS os volumes em ML como CONJUNTO (68574): o _bmVolume ignora "C/100ML" (o lookbehind barra o
// "/") e o FIXADOR CITOLOGICO 100ML casava com o de 500ML. Aqui é set, igual _bmCm/_bmPeso.
function _bmMl(texto){ return _bmMemo('ml', String(texto == null ? '' : texto), () => _bmMlCalc(texto)); }
function _bmMlCalc(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.'); const s=new Set(); let m;
  const re=/(\d+(?:\.\d+)?)\s*ML\b/g; while((m=re.exec(up))){ s.add(String(parseFloat(m[1]))); }
  return s;
}
// ── O ML DA CONCENTRAÇÃO NÃO É O ML DO FRASCO (família B da 77520, 10/08) ───────────────────────
// O "5" de "250MG/5ML" é DOSE POR COLHER; o tamanho do frasco é o outro número. O _bmMl junta os
// dois no mesmo conjunto — e foi assim que a AMOXICILINA SUSPENSÃO 60ML recebeu o frasco de 150ML:
// os dois lados tinham {5, 60} e {5, 150}, o 5 era comum, a interseção não ficava vazia e a
// barreira de volume não barrava. O _bmVolume, que lê 60 e 150 CERTO, não salvava: o catálogo
// escreve "C/150ML" e o lookbehind dele ignora número depois de barra — o candidato virava mudo.
// _bmMlDen  = os denominadores de concentração (o que NÃO é frasco).
// _bmMlApres = o que sobra: o volume da APRESENTAÇÃO. Pode vir VAZIO, e vazio quer dizer "este
//              texto só traz concentração, não sei o tamanho do frasco" — quem chama tem que
//              tratar isso como MUDO, nunca como divergência (é o mesmo erro do _bmFormaCand).
function _bmMlDen(texto){ return _bmMemo('mld', String(texto == null ? '' : texto), () => {
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.'); const s=new Set(); let m;
  const re=/\d+(?:\.\d+)?\s*(?:MG|MCG|G|UI|U)\s*\/\s*(\d+(?:\.\d+)?)\s*ML\b/g;
  while((m=re.exec(up))){ s.add(String(parseFloat(m[1]))); }
  return s; }); }
function _bmMlApres(texto){
  const d=_bmMlDen(texto); const s=_bmMl(texto);
  if(!d.size) return s;
  return new Set([...s].filter(v=>!d.has(v)));
}
// METRAGEM em metros (68574): "4,5M" != "1,8M"; atadura/fita/rolo. A mesma medida aparece escrita
// em metro ou em centímetro colado ("1,80M" e "180MT" são a MESMA atadura) — por isso a comparação
// aceita equivalência ×100 em vez de chutar unidade. Não pega MM/ML/MG/MCG (o (?![A-Z]) garante).
function _bmMetros(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.'); const s=new Set(); let m;
  const re=/(\d+(?:\.\d+)?)\s*(?:MTS|MT|METROS|METRO|M)\b(?![A-Z])/g;
  while((m=re.exec(up))){ s.add(parseFloat(m[1])); }
  return s;
}
function _bmMetrosIgual(a, b){   // 1.8 ≡ 180 (metro x centímetro), 4.5 ≠ 1.8
  for(const x of a) for(const y of b){ if(x===y || x===y*100 || y===x*100) return true; }
  return false;
}
// NÚMERO ÓRFÃO (28/07): número que não tem unidade colada e não pertence a outro conceito.
// Nasceu de um buraco que EU abri ao tornar a barreira de CM aditiva: candidato que escreve a
// largura sem unidade ("ATADURA CREPOM 20 C/12") deixava de ser comparado e casava um pedido de
// 10CM. Tira do texto o que já tem dono — pack (C/12, CX30), medidas com unidade (500G, 13 FIOS,
// 4,5M) — e devolve o que sobrou. É por isso que "13 FIOS" e "C/500" não viram largura.
function _bmNumSolto(texto){
  var u=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.');
  u=u.replace(/\b(?:C\/|CX\/?|PCT\/?|EMB\/?|PC\/?)\s*\d+(?:\.\d+)?/g,' ');
  u=u.replace(/(\d+(?:\.\d+)?)\s*(?:CM|MM|MT|METROS?|METRO|ML|MG|MCG|UI|KG|GR|G|L|%|FIOS|FIO|F|UN|UND|UNID|CPR|COMP|CAPS|CPS|AMP|FA|FR|DOSES?)\b/g,' ');
  var s=new Set(), m, re=/(\d+(?:\.\d+)?)/g;
  while((m=re.exec(u))) s.add(String(parseFloat(m[1])));
  return s;
}
// DIMINUTIVO — DICIONÁRIO EXPLÍCITO, nunca regra de sufixo (decisão do Lemuel, 28/07: -inha/-inho
// genérico quebraria bolsinha, agulhinha e nome próprio de produto). Cresce um caso por vez, cada
// um com o seu assert na suíte.
const _BM_DIMINUTIVO={ escovinha:'escova' };
// ABREVIAÇÕES — mesma receita: dicionário explícito, NUNCA regra de prefixo (senão
// "DESCONGESTIONANTE" viraria "DESC"). Vale nos DOIS sentidos. Cresce um caso por vez.
const _BM_ABREV={ desc:'descartavel', descartavel:'desc', procedim:'procedimento', procedimento:'procedim' };
// SINÔNIMO DE MOLÉCULA (aprovado 28/07): butilbrometo de escopolamina = hioscina. É a MESMA
// substância, não é contexto — de-para direto nos dois sentidos.
// >>> PENICILINA (bug #5): "BENZILPENICILINA BENZATINA" é o nome oficial, "PENICILINA G BENZATINA"
//     é o nome antigo e "BENZETACIL" é a marca — a MESMA substância, escrita de três jeitos.
//     O valor pode ser lista: um nome oficial costuma ter mais de um apelido.
//     ESTE DE-PARA SÓ EXISTE COM A GUARDA _bmPeniSub LOGO ABAIXO. Sozinho, ele abriria a porta
//     pra benzatina virar cristalica ou procaína — que é erro clínico, não erro de preço.
const _BM_SINON_MOL={ escopolamina:'hioscina', hioscina:'escopolamina', butilescopolamina:'hioscina',
  benzilpenicilina:['penicilina','benzetacil'], benzetacil:['penicilina','benzilpenicilina'] };
function _bmSinonMol(p){
  const v=_BM_SINON_MOL[p]; const base = v ? (Array.isArray(v)?v:[v]) : [];
  // + o dicionário do BANCO (dicionario_marca_pa), que é evolutivo e vale nos DOIS sentidos.
  // O valor pode ser composto ("HEPARINA SODICA"): entra inteiro E pelo 1º token significativo,
  // porque o banco às vezes grava só "HEPARINA" e o _bmFuzzy compara palavra a palavra.
  const doBanco = _bmDic.get(p) || [];
  const out = base.slice();
  doBanco.forEach(s => { if (out.indexOf(s) < 0) out.push(s);
    const t = String(s).split(/\s+/)[0]; if (t && t.length >= 4 && out.indexOf(t) < 0) out.push(t); });
  return out;
}
// aviso da equivalência imperfeita (só existe quando a entrada do banco tem `aviso`)
function _bmDicAvisoDe(p){ return _bmDicAviso.get(p) || null; }
// ── DICIONÁRIO MARCA <-> PRINCÍPIO ATIVO, vindo do BANCO (tabela dicionario_marca_pa) ─────────
// Mora no banco, não no código, porque é EVOLUTIVO: cada pedido ensina uma marca nova, e um
// dicionário no código faria de cada marca nova um deploy.
// _bmDic é um Map bidirecional: TRANSAMIN -> [acido tranexamico] e ACIDO TRANEXAMICO -> [transamin],
// as duas direções gravadas na carga, porque o pedido tanto pode trazer a marca quanto o genérico.
// _bmDicAviso guarda o texto de alerta das equivalências IMPERFEITAS (LUMAZENIL é typo de
// FLUMAZENIL, não sinônimo) — essas casam, mas nunca caladas.
let _bmDic = new Map(), _bmDicAviso = new Map(), _bmPalCanon = new Map();
// DE-PARA DE PALAVRA (linhas tipo='palavra' da mesma tabela). Não é substância: é vocabulário —
// o MESMO objeto escrito com outra palavra. "DRENO SUCTOR" e "DRENO SUCÇÃO" são o mesmo dreno.
// Aplicado nos DOIS lados antes de comparar material, para o pedido e o cadastro falarem a mesma
// língua. Também iguala a vírgula decimal ao ponto: o pedido escreve "4.8" e o banco "4,8".
// ── BARREIRA DO NÚMERO DISCRIMINADOR (04/08) ─────────────────────────────────────────────────
// Em material, o número NÃO é detalhe: é o produto. Quatro casos reais de um pedido só:
//    SONDA FOLEY 24/3 VIAS   casava   SONDA DE FOLEY 2 VIAS N.14
//    LAMINA BISTURI N 15     casava   LAMINA BISTURI N.23
//    PAPEL LENCOL 50X70      casava   PAPEL LENCOL 50CMX50MT
//    DRENO SUCTOR 4.8/3.2    casavam  DRENO SUCCAO CANULA 6,4   (os três caíam na mesma linha)
// O motor lia esses números no PEDIDO (pra não confundir com quantidade) mas nunca os comparava
// com o candidato. Resultado: calibre, número de vias e medida viravam enfeite.
// TRÊS ESPÉCIES, comparadas separadamente — misturar faria "3 VIAS" barrar um calibre 3:
//   cal  = calibre     "N 15", "N.23", "Nº 20", "18G", e o decimal solto da cânula ("4,8")
//   vias = nº de vias  "3 VIAS"
//   med  = medida par  "50X70", "7,5 X 7,5"  (par ordenado, unidade ignorada: 50CMX50MT = 50x50)
// A barreira é dos DOIS LADOS, como todas as outras da casa: só barra quando o pedido E o
// candidato declaram a MESMA espécie e não têm nenhum valor em comum. Quem não declara não vota.
// DOSE TOTAL do frasco como chave: concentração × volume quando dá, senão a própria dose.
// Serve pra perguntar "são o mesmo produto?" sem depender de COMO a dose foi escrita —
// "200MG em 100ML" e "2MG/ML em 100ML" dão a mesma chave, porque são o mesmo frasco.
function _bmDoseTotKey(texto){
  const arr = [..._bmDoses(texto)];
  const ml = [..._bmMl(texto)].map(Number).filter(n => n > 0);
  const vol = (ml.length === 1) ? ml[0] : null;
  if (arr.length === 1 && vol) {
    const m = arr[0].match(/^(\d+(?:\.\d+)?)(MG|UI)\/ML$/);
    if (m) return (Math.round(parseFloat(m[1]) * vol * 100000) / 100000) + m[2];
  }
  return arr.sort().join('|');
}
function _bmDiscrim(texto, comDecimal){
  return _bmMemo(comDecimal ? 'dd1' : 'dd0', String(texto == null ? '' : texto), () => _bmDiscrimCalc(texto, comDecimal));
}
function _bmDiscrimCalc(texto, comDecimal){
  // NORMALIZAÇÃO PRÓPRIA, de propósito: o _bmNormF apaga pontuação e transforma "7,5" em "7 5" —
  // dois números soltos em vez de um decimal, e aí "7,5 X 7,5" virava a medida "5x7". Aqui a
  // vírgula decimal vira ponto e o ponto e a barra SOBREVIVEM, que é o que sustenta "4.8",
  // "N.23" e "24/3 VIAS".
  const t = ' ' + _bmStrip(String(texto == null ? '' : texto).toUpperCase()).toLowerCase()
    .replace(/(\d)\s*,\s*(\d)/g, '$1.$2')
    .replace(/[^a-z0-9.\/]+/g, ' ').replace(/\s+/g, ' ') + ' ';
  const cal = new Set(), vias = new Set(), med = new Set();
  let m;
  // DECIMAL SOLTO = calibre da cânula ("DRENO SUCTOR 4.8" x "CANULA 6,4"), tamanho da luva ("7.0").
  // Só em MATERIAL (comDecimal): em medicamento os decimais são dose e volume, e lê-los como
  // calibre criaria barreira falsa em cima de "1,8ML", "0,5%" e afins.
  if (comDecimal) { const reD = /\s(\d+\.\d+)(?![\d.\/])/g;
    while ((m = reD.exec(t))) cal.add(String(parseFloat(m[1]))); }
  const reN = /\s(?:n|no|nº|n°)\s*\.?\s*(\d+(?:\.\d+)?)(?![\d.])/g;   // N 15 · N.23 · Nº 20
  while ((m = reN.exec(t))) cal.add(String(parseFloat(m[1])));
  const reG = /\s(\d+(?:\.\d+)?)\s*g\b/g;                              // 18G (calibre de agulha/cateter)
  while ((m = reG.exec(t))) cal.add(String(parseFloat(m[1])));
  const reV = /\s(\d+)\s*\/?\s*(\d+)?\s*vias?\b/g;                     // "3 VIAS" e "24/3 VIAS"
  while ((m = reV.exec(t))) { if (m[2]) { cal.add(String(parseFloat(m[1]))); vias.add(String(parseFloat(m[2]))); }
                             else vias.add(String(parseFloat(m[1]))); }
  const reM = /\s(\d+(?:\.\d+)?)\s*(?:cm|mm|mt|m)?\s*x\s*(\d+(?:\.\d+)?)\s*(?:cm|mm|mt|m)?(?![\d.])/g;
  while ((m = reM.exec(t))) med.add(parseFloat(m[1]) + 'x' + parseFloat(m[2]));
  return { cal, vias, med };
}
// barra quando a MESMA espécie é declarada dos dois lados e não há valor em comum
function _bmDiscrimConflito(a, b, comDecimal){
  const da = _bmDiscrim(a, comDecimal), db = _bmDiscrim(b, comDecimal);
  const bate = (x, y) => !x.size || !y.size || [...x].some(v => y.has(v));
  return !bate(da.cal, db.cal) || !bate(da.vias, db.vias) || !bate(da.med, db.med);
}
// A_547: PORTAO LIBERACAO / ASSOCIACAO / TAMANHO. Pedido que declara exige candidato que bata; pedido calado nao barra.
//  liberacao: pedido LA/XR/SR/ER/CR/retard exige liberacao modificada no produto (sem marca = comum = barra).
//  associacao: pedido com clavulanato/sulbactam/tazobactam exige o inibidor no produto.
//  tamanho: P/M/G (luva): barra so quando os DOIS declaram e diferem.
function _bmPortaoLib(t){ t = String(t||''); const mat = /agulha|seringa|scalp|cateter|equipo|luva/i.test(t);   // A_548: em material, SR = seringa, XL/CR = tamanho/codigo, nao liberacao
  if (/succin/i.test(t) && /metoprolol/i.test(t)) return true;   // A_548: succinato de metoprolol e liberacao prolongada por natureza
  const rx = mat ? /(?:^|[^A-Za-z])(LA|ER|RETARD|LIB\.? ?PROLONG[A-Z]*|LIBERA[CÇ][AÃ]O PROLONGADA|LONG ?ACTING)(?![A-Za-z])/i : /(?:^|[^A-Za-z])(LA|XR|SR|ER|CR|MR|RETARD|LIB\.? ?PROLONG[A-Z]*|LIBERA[CÇ][AÃ]O PROLONGADA|LONG ?ACTING)(?![A-Za-z])/i;
  if (rx.test(t)) return true;
  return !mat && /(?:^|[^A-Za-z])XL(?![A-Za-z])/i.test(t) && /\d\s*(MG|MCG)/i.test(t); }   // XL so e liberacao em medicamento com dose
function _bmPortaoAssoc(t){ return /clavul|sulbactam|tazobactam|(?:^|[^a-z])clav(?![a-z])/i.test(String(t||'')); }   // A_548: CLAVUL. abreviado
function _bmPortaoTam(t){ t = String(t||''); const m = t.match(/\bTAM(?:ANHO)?\.?\s*(PP|XG|GG|P|M|G)(?![A-Za-z\/])/i); if (m) return m[1].toUpperCase(); if (!/luva|avental|camisa|touca|mascara|máscara|fralda|propé|prope|macacao|macacão|campo/i.test(t)) return null; const r = [...t.matchAll(/(?:^|[\s(,-])(PP|XG|GG|P|M|G)(?=$|[\s),.-])/gi)].filter(x => !/\d\s*$/.test(t.slice(0, x.index))); return r.length ? r[r.length-1][1].toUpperCase() : null; }   // A_548: G/M soltos so em vestuario/luva e nunca depois de numero (5 G = gramas)
function _bmPortaoConflito(pedido, prod){
  if (_bmPortaoLib(pedido) && !_bmPortaoLib(prod)) return true;
  if (_bmPortaoAssoc(pedido) && !_bmPortaoAssoc(prod)) return true;
  if (!_bmPortaoAssoc(pedido) && _bmPortaoAssoc(prod) && /amoxicilina|ampicilina|piperacilina|ticarcilina/i.test(String(pedido||''))) return true;   // A_565: sentido contrario: simples nao vira com inibidor
  const tp = _bmPortaoTam(pedido), tc = _bmPortaoTam(prod);
  return !!(tp && tc && tp !== tc);
}
// ── VIA DE ADMINISTRAÇÃO, DENTRO DE INJETÁVEL (IV x IM x SC) ─────────────────────────────────
// O _bmForma trata ampola IM e frasco-ampola IV como a MESMA forma (INJETAVEL) — é o certo pra
// forma, e é insuficiente pra decidir se dois nomes são o MESMO item de compra. Foi assim que a
// Competitividade comparou ARTRINID IV com cetoprofeno IM (+274%), e é assim que a comparação de
// duplicatas casou CETOPROFENO IV CX/50FR com CETOPROFENO 100MG IM (AMP).
// A regra é deliberadamente ESTREITA e simétrica, como todas as outras da casa: só decide quando
// OS DOIS nomes trazem marcador explícito. "IV/IM" é compatível com os dois — por isso é CONJUNTO
// e a comparação é INTERSEÇÃO, não igualdade. Nome sem marcador não vota.
// >>> MORA AQUI, NO MOTOR, DE PROPÓSITO (06/08): a regra nasceu dentro da tela de Competitividade
//     (_cpzVias) e agora a tela DELEGA pra cá. Duas cópias da mesma regra é o defeito que este
//     projeto já pagou pra aprender — a que grita menos vira a que ninguém atualiza.
const _BM_VIAS = [['IV',/\bIV\b|\bE\.?V\.?\b|\bINTRAVENOS/],['IM',/\bIM\b|\bINTRAMUSCULAR/],['SC',/\bSC\b|\bSUBCUT/]];
function _bmVia(nome){
  var t=' '+String(nome==null?'':nome).toUpperCase().replace(/[^A-Z0-9]/g,' ').replace(/\s+/g,' ')+' ';
  var out=[]; _BM_VIAS.forEach(function(p){ if(p[1].test(t)) out.push(p[0]); }); return out;
}
function _bmViaOk(viasA, viasB){
  if(!viasA.length || !viasB.length) return true;          // marcador ausente -> não filtra
  for(var i=0;i<viasA.length;i++) if(viasB.indexOf(viasA[i])>=0) return true;
  return false;
}
function _bmViaConflito(a, b){ return !_bmViaOk(_bmVia(a), _bmVia(b)); }
// ── VARIANTE DE MATERIAL (placa x rolo · slip x luer lock · saco x frasco · aberto x fechado) ──
// A MESMA RECEITA DA VIA, e pelo mesmo motivo: o substantivo casa ("curativo", "seringa",
// "coletor"), a dose casa, o preço é parecido — e o que chega ao cliente é OUTRO PRODUTO. Os cinco
// casamentos errados da proposta 77520 (família B) são todos desta família:
//    CURATIVO HIDROCOLOIDE C/ESPUMA 10X10  ->  CURATIVO em ROLO
//    SERINGA 20ML BICO SLIP                ->  SERINGA 20ML LUER LOCK
//    COLETOR URINA SACO (drenagem)         ->  COLETOR URINA 50ML TAMPA (frasco de amostra)
//    COLETOR URINA SISTEMA ABERTO          ->  COLETOR SISTEMA FECHADO 24HRS
//    COMPRIMIDO CX/200                     ->  FRASCO 5ML
// >>> "QUEM NÃO DECLARA NÃO VOTA" É O QUE TORNA ISTO VIÁVEL: a maioria dos nomes do catálogo não
//     diz o bico da seringa nem o formato do curativo. Barreira que exigisse a declaração mataria
//     metade do catálogo — e barreira que barra tudo também "acerta" os cinco, sem servir pra nada.
//     Só decide quando OS DOIS lados declaram a MESMA família e o valor difere.
// >>> DECLARAÇÃO AMBÍGUA TAMBÉM NÃO VOTA: nome que cita DOIS valores da mesma família ("saco com
//     tampa") não diz qual dos dois ele é — chutar aqui é o mesmo erro, só que ao contrário.
// >>> A 'TAMPA' ENTRA COMO RECIPIENTE RÍGIDO de propósito: foi o que separou o coletor de drenagem
//     do potinho de amostra de exame no caso real. Saco de urina não tem tampa; frasco tem.
//     'ESPUMA' fica no mesmo grupo de PLACA: as duas são curativo chato, e o que se quer separar
//     delas é o ROLO. Agrupar afrouxa (não barra espuma x placa) — o lado seguro do erro.
const _BM_VARIANTES = [
  ['formato',    [['placa','placas','pad','espuma','almofada'],['rolo','rolos','rl','bobina'],['spray','aerossol','aerosol'],['gel'],['pomada','creme','unguento']]],
  ['bico',       [['slip'],['lock']]],                                  // 'l lock' e 'luer lock' caem no mesmo token
  ['recipiente', [['saco','sacos','bolsa','bolsas'],['frasco','frascos','pote','potes','copo','copos','tampa']]],
  ['sistema',    [['aberto','aberta','abertos','abertas'],['fechado','fechada','fechados','fechadas']]],
];
function _bmVariante(texto){ return _bmMemo('vr', String(texto == null ? '' : texto), () => _bmVarianteCalc(texto)); }
function _bmVarianteCalc(texto){
  const t = _bmNormF(texto); const out = {};
  for (const [fam, grupos] of _BM_VARIANTES){
    let valor = null, n = 0;
    for (const g of grupos) if (g.some(k => t.includes(' '+k+' '))) { valor = g[0]; n++; }
    if (n === 1) out[fam] = valor;                 // 0 = não declara · >1 = ambíguo: nenhum dos dois vota
  }
  return out;
}
function _bmVarianteConflito(a, b){
  const va = _bmVariante(a), vb = _bmVariante(b);
  for (const fam in va) if (vb[fam] && vb[fam] !== va[fam]) return true;
  // SÓLIDO ORAL x VOLUME EM ML: comprimido nunca vem em frasco de 5 ml. O _bmForma não opinava
  // porque "FR 5ML" não é forma declarada — mas o candidato TEM o sinal, e é o volume. Só vale
  // quando um lado é sólido oral SEM ml e o outro traz ml: os dois mudos, ou os dois com volume,
  // seguem passando (a barreira de volume, que é outra, cuida desses).
  const sol = t => _bmForma(t) === 'SOLIDO_ORAL', ml = t => _bmMl(t).size > 0;
  if (sol(a) && !sol(b) && ml(b) && !ml(a)) return true;
  if (sol(b) && !sol(a) && ml(a) && !ml(b)) return true;
  return false;
}
// >>> DUAS COISAS AQUI SÃO POR CUSTO, não por gosto (medido no pedido cirúrgico, que é quase todo
//     material): esta função roda uma vez por cotação POR ITEM do pedido. A versão original
//     construía um `new RegExp` para CADA entrada do dicionário a cada chamada — 3 entradas ×
//     21 mil linhas × 37 itens = 2,3 milhões de regexes compiladas do zero.
//     (1) as regexes são compiladas UMA vez, quando o dicionário carrega (_bmPalRe);
//     (2) o resultado é memoizado por texto — e o cache é LIMPO quando o dicionário muda, senão
//         responderia com o vocabulário antigo, que é o jeito silencioso de errar.
// >>> AUTO-CORRIGÍVEL DE PROPÓSITO: a 1ª versão exigia que quem trocasse o dicionário chamasse
//     um "compila" — e a suíte pegou na hora o que isso custa. Um teste trocou o _bmPalCanon
//     direto e as regexes ficaram as antigas: o de-para simplesmente parou de agir, em silêncio.
//     Agora a compilação é LAZY e guarda QUAL Map compilou; se o Map for outro, recompila e joga
//     fora o cache. Ninguém precisa lembrar de chamar nada.
let _bmPalRe = [], _bmPalReSrc = null;
function _bmPalReGarante(){
  if (_bmPalReSrc === _bmPalCanon) return;
  _bmPalRe = [];
  _bmPalCanon.forEach((para, de) => _bmPalRe.push([new RegExp('(^|\\s)' + de + '(?=\\s|$)', 'g'), '$1' + para]));
  _bmPalReSrc = _bmPalCanon;
  if (typeof _BM_MEMO !== 'undefined' && _BM_MEMO.delete) _BM_MEMO.delete('cp');   // vocabulário novo, cache velho não vale
}
function _bmCanonPal(txt){ _bmPalReGarante(); return _bmMemo('cp', String(txt == null ? '' : txt), () => _bmCanonPalCalc(txt)); }
function _bmCanonPalCalc(txt){
  let t = _bmNormF(txt);
  for (let i = 0; i < _bmPalRe.length; i++) t = t.replace(_bmPalRe[i][0], _bmPalRe[i][1]);
  return t.replace(/(\d),(\d)/g, '$1.$2');
}
async function carregarDicMarcaPa(){
  try{
    const r = await fetch(`${SUPA_URL}/rest/v1/dicionario_marca_pa?select=tipo,de,para,aviso`,
      { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } });
    const rows = await r.json();
    if (!Array.isArray(rows)) return;
    const d = new Map(), av = new Map(), pc = new Map();
    const par = (a, b) => { const na=_bmNorm(a), nb=_bmNorm(b); if(!na||!nb) return;
      if(!d.has(na)) d.set(na, []); if(!d.has(nb)) d.set(nb, []);
      if(d.get(na).indexOf(nb)<0) d.get(na).push(nb);
      if(d.get(nb).indexOf(na)<0) d.get(nb).push(na); };
    rows.forEach(x => { par(x.de, x.para);
      if (x.aviso) { av.set(_bmNorm(x.de), x.aviso); av.set(_bmNorm(x.para), x.aviso); }
      // 'palavra' vira canonicalização de UMA direção (de -> para): as duas grafias viram a mesma
      if (x.tipo === 'palavra') { const de=_bmNorm(x.de), pa=_bmNorm(x.para);
        if (de && pa && de.indexOf(' ')<0 && pa.indexOf(' ')<0 && !pc.has(de)) pc.set(de, pa); } });
    _bmDic = d; _bmDicAviso = av; _bmPalCanon = pc;
  }catch(e){ /* o dicionário é aditivo: sem ele a busca funciona como antes */ }
}
// SUBTIPO DA PENICILINA: benzatina, procaína e cristalica/potássica são produtos DIFERENTES.
// Mesma forma da guarda de insulina: só age quando os DOIS lados nomeiam o subtipo.
function _bmPeniSub(t){ const u=' '+_bmNormF(t)+' ';
  if(!/ penicilina| benzetacil| benzilpenicilina/.test(u)) return null;
  if(/ benzatina | benz | benzet/.test(u)) return 'BENZATINA';
  if(/ procaina | proc /.test(u)) return 'PROCAINA';
  if(/ cristalica | cristalina | potassica | sodica /.test(u)) return 'CRISTALICA';
  return null;
}
// SORO: RINGER SIMPLES != RINGER COM LACTATO, e FISIOLÓGICO != GLICOSADO != GLICOFISIOLÓGICO.
// A 68036 pede RINGER SIMPLES e o estoque só tem LACTATO — são soluções diferentes, e o de-para
// de nome (cloreto de sódio <-> soro fisiológico) não pode virar vale-tudo entre soros.
// ÁCIDO FOLÍNICO ≠ ÁCIDO FÓLICO — NUNCA, nem como alternativa (pedido de oncologia, 03/08).
// Folinato de cálcio / leucovorin (resgate de metotrexato, modulador do 5-FU) não tem nada a ver
// com ácido fólico (vitamina B9). O pedido pede 300MG e o "AFOLIMAX SOL 0,2MG/ML 30ML (ACIDO
// FOLICO)" do banco tem 6MG no frasco — 50 vezes menos. Uma letra separa os dois nomes, e é
// exatamente o tipo de par que um fuzzy de 1-2 letras aproxima: por isso a guarda é EXPLÍCITA e
// roda ANTES de qualquer fuzzy. Aqui o sem-match estava certo e continua certo.
function _bmFolinico(t){ const u=' '+_bmNormF(t)+' ';
  if(/ folinic| folinat| leucovorin/.test(u)) return 'FOLINICO';
  if(/ folico | folic /.test(u)) return 'FOLICO';
  return null;
}
function _bmSoroTipo(t){ const u=' '+_bmNormF(t)+' ';
  if(/ glicofisiologic/.test(u)) return 'GLICOFISIO';
  if(/ ringer/.test(u)) return / lactat|hartmann/.test(u) ? 'RINGER_LACT' : 'RINGER_SIMPLES';
  return null;
}
// tamanhos de material (P/M/G/GG/XG/EG). Remove abreviações "P/ C/ S/ N/" antes p/ não confundir.
function _bmTamanhos(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/\b[A-Z]\//g,' '); const s=new Set();
  (up.match(/\b(PP|GG|XG|EG|XGG|XXG)\b/g)||[]).forEach(x=>s.add(x.toLowerCase()));
  (up.match(/\b[PMG]\b/g)||[]).forEach(x=>s.add(x.toLowerCase()));
  return s;
}
// com/sem genérico (S/AGULHA≠C/AGULHA; S/CLOR≠C/CLORANFENICOL). Extrai todos os "c/x" e "s/x".
function _bmComSem(texto){
  const t=_bmNormF(texto); const arr=[]; let m;
  const skip=new Set(['ml','un','uni','de','da','do','em','no','na','os','as','cx','ou','ao']);
  const re=/\b(com|sem|c|s)\s+([a-z]{2,})/g;   // aceita abreviação de 2 letras (AG = agulha) c/ guard
  while((m=re.exec(t))){ if(!skip.has(m[2])) arr.push({sig:(m[1][0]==='c'?'c':'s'), w:m[2]}); }
  return arr;
}
// peso em GRAMAS (algodão/curativo: 500GR != 25G). "(G)" de genérico não conta (sem dígito).
function _bmPeso(texto){
  const up=_bmStrip(String(texto).toUpperCase()).replace(/,/g,'.'); const s=new Set(); let m;
  const re=/(\d+(?:\.\d+)?)\s*GR?\b(?![A-Z])/g; while((m=re.exec(up))){ s.add(String(parseFloat(m[1]))); }
  return s;
}
const _BM_GLOVE=['nitrilica','latex','vinil','borracha'];
// luva cirúrgica (estéril, tam numérico 6,5/7/8) != luva de procedimento (P/M/G)
function _bmLuvaTipo(texto){ const t=_bmNormF(texto); if(t.includes(' cirurgic')||t.includes(' cir ')) return 'cir'; if(t.includes(' procedimento')||t.includes(' proced')||t.includes(' proc ')) return 'proc'; return null; }
// esterilidade: só relevante quando o pedido especifica (estéril x não-estéril de gaze/compressa/campo)
function _bmEsteril(texto){ const t=_bmNormF(texto); if(/ (nao|n) est/.test(t)) return 'nao'; if(/ esteril/.test(t)||/ est /.test(t)) return 'sim'; return null; }
// conflito com/sem: pedido "s/X" vs candidato "c/X" (ou vice-versa), casando por prefixo
function _bmNegConflito(reqText, candText){
  const rcs=_bmComSem(reqText), ccs=_bmComSem(candText);
  for(const r of rcs) for(const c of ccs){ if(r.sig!==c.sig && (r.w.startsWith(c.w)||c.w.startsWith(r.w))) return true; }
  return false;
}

const _BM_SAIS=new Set(['malato','tosilato','cloridrato','sulfato','acetato','fosfato','succinato','fumarato','cloreto','brometo','citrato','besilato','mesilato','tartarato','maleato','lactato','gluconato','dicloridrato','hidrocloreto','estearato','sodico','potassico','monobasico','dibasico']);
const _BM_STOP=new Set(['para','com','por','dos','das','sol','inj','amp','cmp','oral','susp','xarope','frasco','caixa','comprimido','capsula','solucao','injetavel','suspensao','uso','via','dose','cada','mais','menos','disp','gts','gotas','creme','gel','pomada','bisnaga','sem','rev','lib','prol','retard','plus','forte','duo','max','mini','bls','pct','env','ser','cpr','cps','xpe','bis','spr','spray','und','unid','comp','cap','liof']);
// A_077: "g.paracetamol" (marcador G. colado sem espaço) nunca casava - virava 1 token só.
// NÃO é split cego por ponto (medido no A_073: quebra SULFA./CLORID./DICL./CATG. em abreviação de
// sal/insumo, ex. "clorid.prometazina" -> principal "clorid", errado). Só tira o MESMO marcador que
// o _sGen já reconhece como genérico em todo o resto do sistema - "g." no INÍCIO da linha.
const _bmSemMarcadorGen = t => t.replace(/^g\.(?=[a-z])/, '');
function _bmPalavras(linha){ return _bmSemMarcadorGen(_bmNorm(linha)).split(/\s+/).filter(p=>p.length>3 && !_BM_STOP.has(p) && !_BM_SAIS.has(p) && !/^\d/.test(p)); }
const _bmDist1=(a,b)=>{ if(a===b)return true; const la=a.length,lb=b.length; if(Math.abs(la-lb)>1)return false; let i=0,j=0,e=0; while(i<la&&j<lb){ if(a[i]===b[j]){i++;j++;continue;} if(++e>1)return false; if(la>lb)i++; else if(lb>la)j++; else {i++;j++;} } if(i<la||j<lb)e++; return e<=1; };
// pares a distância-1 que são palavras REAIS diferentes (nunca typo uma da outra) — o fuzzy NÃO pode uni-los.
// Caso real 22/07: busca "complexo b" devolvia EQUIPO MACROGOTAS COMPLETO (COMPLEXO~COMPLETO, 1 letra).
const _BM_FUZZY_NAO=[['complexo','completo'],['sodio','sodico'],['sodio','sodica'],['calcio','calcico'],['potassio','potassico']];   // +14531: CLORETO DE SODIO nunca fuzzy-casa DICLOFENACO SODICO (íon != adjetivo de sal)
const _bmFuzzyParProibido=(a,b)=>_BM_FUZZY_NAO.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
const _bmFuzzy=(w,t)=>{ if(!t)return false; if(t.includes(w))return true; if(w.length<5)return false; return t.split(/\s+/).some(k=>k.length>=5&&k[0]===w[0]&&!_bmFuzzyParProibido(k,w)&&_bmDist1(k,w)); };
// substância casa por PALAVRA INTEIRA (evita cetamina casar dentro de escetamina)
const _bmTemSub=(sub,texto)=> !!sub && (' '+texto+' ').includes(' '+sub+' ');

// MATERIAL (sem PA): casa por substantivo + característica; bloqueia categorias alheias.
const _BM_MATKW=['envelope','campo','atadura','ligadura','luva','fralda','sonda','papel','seringa','agulha','lamina','bisturi','kit','teste','tira','lanceta','fita','gaze','compressa','cateter','equipo','mascara','avental','touca','gorro','lencol','esparadrapo','micropore','algodao','coletor','dreno','swab','cotonete','eletrodo','abaixador','espatula','bolsa','scalp','abocath','jelco','termometro','oximetro','glicosimetro','curativo','bandagem','protetor','escova','pinca','tesoura','cuba','bandeja','umidificador','nebulizador','filtro','extensor','torneira','conector','circuito','fio','sutura','hidrogel','alginato','hidrocoloide','sapatilha','prope','prope','sapato','pantufa','tubo','canula'];
const _BM_BLOCK=['figurinha','figurinhas','cromo','cromos','copa','world','cup','panini','album','brinquedo','chocolate','alimento','doce','revista','sticker','boneco','pelucia','beach','tennis','tenis','esporte','esportivo','futebol','game'];
// palavras GENÉRICAS que caem no path de medicamento como "principal" mas não são princípio ativo (forma/recipiente).
// Quando o principal é uma dessas, exige uma palavra DISTINTIVA (marca/qualificador) casar — mata "ADESIVO SALONPAS"->ByeByeFever e "ALMOTOLIA 100ML"->água oxigenada.
// >>> +77520 FAMÍLIA D (10/08): 'cinta', 'manta' e 'protetor'. Medido no catálogo real, e os três
//     erros eram do mesmo feitio — a palavra-cabeça aparecendo em qualquer lugar do candidato:
//        CINTA DE CONTENCAO ABDOMINAL -> GARROTE AZUL   ("...E CINTA A" no princípio ativo dele)
//        MANTA TERMICA ALUMINIZADA    -> AVENTAL DESC MANGA LONGA
//        PROTETOR OCULAR FOTOTERAPIA  -> ABSORVENTE INTIMUS PROTETOR DIARIO
//     O da MANTA é o que mais ensina: ela nem tem "manta" no nome. O _bmFuzzy aceita DISTÂNCIA 1
//     em palavras de 5+ letras com a mesma inicial, e "manta" está a uma letra de "MANGA".
// >>> E O QUE FEZ O ERRADO GANHAR DO CERTO: os três eram GLOBAL COM ESTOQUE, e essa preferência
//     comercial vem ANTES do score de relevância na ordenação. A MANTA TERMICA de verdade estava
//     no pool, com DUAS palavras em comum, e perdeu pro avental que tinha ZERO. Esta lista mata o
//     candidato antes de a ordenação existir — que é o lugar certo: preferir estoque próprio entre
//     produtos comparáveis é regra da casa; entre produtos diferentes é outra coisa.
const _BM_GENERICO=new Set(['adesivo','almotolia','frasco','pote','bolsa','recipiente','coletor','envelope','guia','adaptador','canhao','colirio','cinta','manta','protetor','acido']);   // +B502 (08/10): ACIDO FOLICO casava VITAMINA C pela palavra 'acido' sozinha; +14531: adaptador/canhão exigem distintiva (coleta-vácuo != Transofix); colírio exige o PA pedido
// ÁGUA tem GRAU/USO distinto e não intercambiável: INJ = estéril/apirogênica/p-injeção (uso no
// PACIENTE) x EQUIP = autoclave/deionizada (uso em EQUIPAMENTO). "destilada" é neutro (aparece nos
// dois). Na dúvida entre águas de uso diferente NÃO casa (segurança do paciente). Só age quando o
// pedido é água (principal='agua') e nomeia um grau.
const _BM_AGUA_INJ=['injecao','injetavel','injetaveis','esteril','apirogenica','apirogenico','irrigacao'];
const _BM_AGUA_EQUIP=['autoclave','deionizada','desmineralizada','bidestilada','reagente'];
const _BM_AGUA_BACT=['bacteriostatica','bacteriostatico'];   // 14531: tem CONSERVANTE — grau próprio, checado ANTES (o nome costuma trazer "p/ injeção" junto)
function _bmAguaGrau(texto){ const s=_bmNormF(texto); if(_BM_AGUA_BACT.some(k=>s.includes(' '+k))) return 'BACT'; if(_BM_AGUA_INJ.some(k=>s.includes(' '+k))) return 'INJ'; if(_BM_AGUA_EQUIP.some(k=>s.includes(' '+k))) return 'EQUIP'; return null; }
// qualificadores genéricos (tamanho/adjetivo) que NÃO servem como palavra distintiva de marca
const _BM_QUALIF_GEN=new Set(['grande','grandes','pequeno','pequena','medio','media','mini','super','extra','longo','longa','curto','curta','largo','larga','fino','fina','grosso','grossa','simples','comum','normal','descartavel','desc']);
// DISPOSITIVOS de CALIBRE (gauge): cateter/agulha/scalp/abocath/jelco/cânula/sonda/dreno/tubo.
// O calibre "22G"/"25G" (gauge) NÃO é dose em grama, e "intravenoso" NÃO é forma injetável de
// medicamento — são material puro (PASSO 0 unificação, 23/07). Reconhecidos ANTES do bail de
// dose/forma pra não desrotar pro caminho de medicamento (onde cateter nunca casa).
const _BM_DEVICE=['cateter','agulha','scalp','abocath','jelco','canula','sonda','dreno','lanceta','equipo','extensor','tubo'];
// MATERIAL PELA CABEÇA DO NOME (68574): produto cujo nome começa com uma destas palavras É material,
// mesmo trazendo volume/peso no nome ("FIXADOR CITOLOGICO FRASCO C/100ML" era desrotado pro caminho
// de MEDICAMENTO por causa do "100ML" e lá casou "FIXADOR DE TUBO ENDOTRAQUEAL" — outro produto).
// Só vale como PRIMEIRA palavra, pra não desrotar medicamento que cita "fita"/"frasco" no meio.
// (NÃO entram aqui as palavras do _BM_GENERICO — almotolia/coletor/frasco/bolsa são RECIPIENTE, e
// viram o conteúdo de outro produto: "ALMOTOLIA 100ML" casaria "AGUA OXIGENADA ... ALMOTOLIA".
// Isso é a suíte de ouro caso 2, que pegou a regressão na hora.)
const _BM_MAT_CABECA=['fixador','escova','escovinha','espatula','lencol','glicosimetro','fita','compressa','atadura','gaze','algodao','luva','luvas','avental','touca','fralda','curativo','esparadrapo'];
function _bmMaterial(texto){
  let t=_bmNormF(texto);
  // N97: 'E CANULA'/'C/ CANULA' no fim do nome é acessório que vem junto do remédio (ACTILYSE 50MG ... E CANULA), não o produto.
  if(_bmDoses(texto).size>0) t=t.replace(/(^|\s)(?:e|c|com)\s+canulas?(?=\s|$)/g,' ');
  if(_BM_DEVICE.some(k=>t.includes(' '+k+' ')||t.includes(' '+k+'s '))) return true;   // dispositivo -> material (calibre/via não desrotam)
  const _cab=t.trim().split(/\s+/)[0];
  if(_BM_MAT_CABECA.includes(_cab)) return true;                                        // cabeça de material -> material
  if(_bmDoses(texto).size>0) return false; if(_bmForma(texto)) return false;
  return _BM_MATKW.some(k=>t.includes(' '+k.split(' ')[0]));
}
// ── discriminadores OBRIGATÓRIOS de material: cada CONCEITO tem famílias (sinônimos). Se o pedido nomeia
//    uma família, o candidato tem que casar ALGUMA das famílias que o pedido nomeou (senão bloqueia).
//    Só bloqueiam quando o pedido especifica — não afrouxam nada.
const _BM_FAM_SUBTIPO=[['uretral','vesical','foley','folley'],['enteral','nasoenteral','nasogastrica','nasogastrico','gastrica','levine','dobbhoff','duodenal','alimentacao'],['aspiracao','aspirativa'],['endotraqueal','orotraqueal','intubacao'],['nelaton'],['retal','rectal'],['peridural','epidural'],['raqui','raquidiana','raquianestesia','espinal','spinal']];  // agulha peridural != raqui != comum (caso real 64996). 'spinal' (sem E) entrou em 06/08: é COMO O CATÁLOGO ESCREVE ("AGULHA DESC. SPINAL 27GA X 3 1/2") e, sem ela, uma agulha de raqui casava a hipodérmica 25x7 comum — a família existia e a palavra do dado real ficou de fora.
const _BM_FAM_MATERIAL=[['algodao'],['crepom','crepe'],['elastica','elastico'],['gessada','gesso','gessado'],['rayon'],['tnt','sintetica']];
const _BM_FAM_IDADE=[['infantil','infantis','pediatrica','pediatrico','pediatria','junior','baby','bebe','neonatal'],['adulto','adultos','geriatrica','geriatrico','senior']];
const _BM_FAM_TESTE=[['igg'],['igm'],['iga'],['antigeno','ag','ns1'],['anticorpo','pcr','molecular']];
// analito do teste (a doença/alvo): dengue != covid != influenza... (escopo fechado nas comuns). So bloqueia se o pedido nomeia um.
const _BM_FAM_ANALITO=[['dengue'],['covid','coronavirus','sars'],['influenza','flu','h1n1'],['hiv','aids'],['sifilis','treponema'],['malaria'],['hepatite','hbsag','hcv','hbv'],['gravidez','hcg','bhcg'],['rotavirus'],['estreptococo','strep'],['toxoplasmose'],['leishmaniose']];
// TIPO DE FITA (68574): fita de AUTOCLAVE é indicador de esterilização, MICROPOROSA/CREPE são
// curativo, ISOLANTE/DUPLA FACE não são nem hospitalar. Trocar uma pela outra é erro grosseiro
// (900 un, R$ 3.249 na proposta do Eduardo).
const _BM_FAM_FITA=[['autoclave','indicadora','esterilizacao'],['microporosa','micropore','microporo'],['crepe','crepom'],['isolante','eletrica'],['adesiva','embalagem','durex'],['cirurgica','transpore','transpore'],['zebrada','sinalizacao','demarcacao']];
// TIPO DE COMPRESSA (68574): CAMPO OPERATÓRIO é pano cirúrgico grande (com fio radiopaco), gaze é
// outro produto. O pedido de campo operatório casava a gaze 7,5x7,5 e ainda comia a linha da gaze.
const _BM_FAM_COMPRESSA=[['campo','operatorio','cirurgico','laparotomia'],['gaze','gazes'],['nao','tecido','tnt'],['algodonada','algodao']];
// TIPO DE FIXADOR (28/07, caso real 68574): "fixador" são três produtos sem parentesco —
// CITOLÓGICO (líquido/spray de laboratório), de CATETER (curativo adesivo) e de TUBO ENDOTRAQUEAL
// (dispositivo). O citológico do cliente estava casando um curativo fixador de cateter: R$2.494,68
// de produto ERRADO dentro da proposta — e item errado é pior que item faltando.
// AGULHA DE CANETA/INSULINA (28/07, caso real 68574): a hipodérmica "13x4,5" do pedido casava
// "AGULHA P/ CANETA INSULINA 31G 6MM". São produtos distintos e a barreira é SIMÉTRICA — pedido
// comum não recebe caneta, pedido de caneta não recebe hipodérmica. Calibres de caneta (31G/32G) e
// comprimentos em mm (4/5/6/8mm) são a assinatura; hipodérmica se escreve NxN (13x4,5, 25x7).
function _bmAgulhaCaneta(texto){
  var t=_bmNormF(texto);
  return / caneta /.test(t) || / insulina /.test(t) || /\b3[12]\s?g\b/.test(t) || /\b[4568]\s?mm\b/.test(t);
}
const _BM_FAM_FIXADOR=[['citologico','citologia','citopatologico','laminas'],['cateter','venoso','curativo','fenestrado','fene'],['tubo','endotraqueal','orotraqueal','canula','tot']];
function _bmFamHit(text, fam){ const t=_bmNormF(text); return fam.some(tok=>t.includes(' '+tok+' ')); }
// calibre N-XX / CH / FR (sonda, cateter, agulha): "N-06"->6, "N.12"->12, "N 08"->8. Null se nao houver.
// calibre com ESCALA (PASSO 3 item 3): {n:número, s:'FR'|'G'|'N'}. CH/Fr/FR/Fg = MESMA escala French;
// G/GA = gauge; G e FR NUNCA se convertem. "N" (número) é CORINGA de escala (N.24 casa 24G e 14FR).
function _bmCalibre(texto){
  var u=String(texto).toUpperCase(); var m, s, n;
  if((m=u.match(/\b(?:CH|FR|FG)[.\-\s]*(\d{1,2})\b/)) || (m=u.match(/\b(\d{1,2})\s*(?:CH|FR|FG)\b/))) { s='FR'; n=m[1]; }
  else if((m=u.match(/\bGA[.\-\s]*(\d{1,2})\b/)) || (m=u.match(/\b(\d{1,2})\s*GA\b/)) || (m=u.match(/\b(\d{1,2})\s*G(?=[X\s\/\-]|$)/))) { s='G'; n=m[1]; }
  else if((m=u.match(/\bN[º°O.\-\s]*(\d{1,2})\b/))) { s='N'; n=m[1]; }
  else if(/\bSCALP/.test(u) && (m=u.match(/(?:^|[\s\-])(19|21|23|25|27)(?=\s|$|\/)/)) && !/(?:C\/|CX\s?|X\s?)(19|21|23|25|27)\b/.test(u)) { s='G'; n=m[1]; }   // A_565: scalp sem G: 19/21/23/25/27 e calibre
  else return null;
  n=n.replace(/^0+/,''); n=(n===''?'0':n);
  return { n:n, s:s };
}
// tamanho em mm do TUBO/SONDA ENDOTRAQUEAL, canônico ×10: "7,0"->70, "7,5"->75, "N.75"->75,
// "N.8,0MM"->80, "N.40"->40 (=4,0mm). Só usado na família endotraqueal. Null se não achar.
function _bmEndoMm(texto){
  var u=String(texto).toUpperCase();
  var m=u.match(/\bN[º°O.\-\s]*(\d)[,.]?(\d)?\s*M?M?\b/) || u.match(/\b(\d)[,.](\d)\s*M?M?\b/);
  if(!m) return null; return parseInt(m[1],10)*10 + (m[2]?parseInt(m[2],10):0);
}
// ── ESPECIALIZAÇÃO COSMÉTICA DECLARADA SÓ PELO CANDIDATO (77520 família D, 10/08) ─────────────
// >>> ESTA REGRA VALE AO CONTRÁRIO DAS OUTRAS DA CASA, e é por isso que ela é curta. Em todas as
//     outras quem não declara não vota; aqui quem declara é o CANDIDATO e o pedido é que fica
//     calado — e mesmo assim barra.
// O caso: tirada a película transparente, "CURATIVO HIDROCOLOIDE PLUS C/ESPUMA 10X10CM" passou a
// casar "CURATIVO HIDROCOLOIDE PARA ACNES CART 24 UN". A palavra que importa casa, o hidrocolóide
// é o mesmo material — e é adesivo de espinha vendido pra pele, não curativo de ferida.
// >>> POR QUE NÃO GENERALIZAR ("candidato mais específico não serve"): mataria meio catálogo.
//     "ESTÉRIL", "DESCARTÁVEL", uma marca a mais no nome — o catálogo é mais verboso que o pedido
//     em quase toda linha, e essa é a situação normal, não o erro. O que não é normal é o pedido
//     hospitalar receber produto de PRATELEIRA DE FARMÁCIA. Daí a lista fechada, e curta.
const _BM_COSMETICO = ['acne','acnes','espinha','espinhas','cravo','cravos','verruga','verrugas','calo','calos','estria','estrias','celulite','rugas','antirrugas'];
function _bmCosmeticoSoNoCand(reqText, candText){
  var t = _bmNormF(candText);
  var achou = _BM_COSMETICO.filter(function(k){ return t.includes(' '+k+' '); });
  if(!achou.length) return false;
  var r = _bmNormF(reqText);
  return !_BM_COSMETICO.some(function(k){ return r.includes(' '+k+' '); });   // o pedido pediu? então serve
}
function _bmDiscorda(reqText, candText, familias){
  const reqFams=familias.filter(f=>_bmFamHit(reqText,f));
  if(!reqFams.length) return false;                 // pedido não especifica esse conceito -> sem restrição
  return !reqFams.some(f=>_bmFamHit(candText,f));    // candidato tem que casar ALGUMA família que o pedido nomeou
}
// palavras RELEVANTES do nome (>2 letras, sem as de ligação): a [0] é o substantivo, a cabeça.
// (nome próprio: já existe um _BM_STOP no motor, de outra lista e de outro uso — o desta linha é
//  o das palavras de LIGAÇÃO do nome de material, e misturar os dois mudaria as duas leituras.)
const _BM_STOP_MAT=new Set(['para','com','de','do','da','p','e','em','cx','pct','und','unid','kit','c','un','x','sem']);
function _bmPalRel(texto){ return _bmNormF(texto).trim().split(/\s+/).filter(w=>w.length>2 && !_BM_STOP_MAT.has(w)); }
// ── O SUBSTANTIVO CASA? (extraído de dentro do _bmMatchMat em 06/08) ─────────────────────────
// Era um bloco no meio do matcher de material e virou função PORQUE PRECISA SER PERGUNTADO DE
// FORA: a comparação de duplicatas casou "ACIDOS GRAXOS+VITAMINAS" (óleo de pele) com "PGA ACIDO
// POLIGLICOLICO" (fio de sutura) — a única palavra em comum era "ACIDO", que não é o substantivo
// de nenhum dos dois. A busca nunca cometeria esse erro; quem não perguntava era o casador.
// >>> É ASSIMÉTRICO DE PROPÓSITO (req x cand), como toda a família _bmMatchMat: quem compara
//     PARES tem que perguntar nos DOIS sentidos. "ACIDOS" acha "ACIDO" no fio; "PGA" não acha
//     nada no óleo — e é o segundo sentido que mata o par.
// Comportamento idêntico ao que estava embutido; só mudou de lugar.
function _bmSubstantivo(reqText, candText){
  const ct=_bmNormF(candText);
  const rw=_bmPalRel(reqText);
  if(!rw.length) return false;
  // mesmo substantivo — PALAVRA INTEIRA (tolera plural s/es). Mata "guia" casar dentro de "guiat".
  // 68574: o pedido do cliente vem no PLURAL ("LUVAS DE PROCEDIMENTOS") e o banco cadastra no
  // SINGULAR ("LUVA PROCEDIM...") — antes só o inverso era tolerado e o item SUMIA da proposta.
  const _sing = rw[0].replace(/(?:es|s)$/,'');
  const _dimin = _BM_DIMINUTIVO[rw[0]] || null;    // de-para explícito (escovinha -> escova)
  const _abrev = _BM_ABREV[rw[0]] || _BM_ABREV[_sing] || null;      // desc <-> descartavel
  const _molec = _bmSinonMol(rw[0])[0] || null;                      // escopolamina <-> hioscina
  if(!(ct.includes(' '+rw[0]+' ')||ct.includes(' '+rw[0]+'s ')||ct.includes(' '+rw[0]+'es ')
       ||(_sing.length>=3 && (ct.includes(' '+_sing+' ')||ct.includes(' '+_sing+'s ')||ct.includes(' '+_sing+'es ')))
       ||(_dimin && (ct.includes(' '+_dimin+' ')||ct.includes(' '+_dimin+'s ')))
       ||(_abrev && (ct.includes(' '+_abrev+' ')||ct.includes(' '+_abrev+'s ')))
       ||(_molec && (ct.includes(' '+_molec+' ')||ct.includes(' '+_molec+'/'))))){
    // SINÔNIMO TUBO<->SONDA no contexto ENDOTRAQUEAL (caso real 64997): cliente escreve "TUBO
    // ENDOTRAQUEAL", banco cadastra "SONDA ENDOTRAQUEAL" — mesmo dispositivo. SÓ nesse contexto
    // (os DOIS lados na família endotraqueal/orotraqueal/intubação); tubo genérico não vira sonda.
    var _altTubo = rw[0]==='tubo' ? 'sonda' : (rw[0]==='sonda' ? 'tubo' : null);
    var _famEndo = ['endotraqueal','orotraqueal','intubacao'];
    // SINÔNIMO FITA<->TIRA no contexto GLICEMIA (28/07, caso real 68574): o cliente escreve "FITA
    // DE GLICEMIA", o banco cadastra "TIRAS P/GLICOSE". Mesma receita do tubo<->sonda: só vale com
    // os DOIS lados no contexto glicemia/glicose/reagente — fita adesiva/autoclave/micropore fora.
    var _altTira = rw[0]==='fita' ? 'tira' : (rw[0]==='tira' ? 'fita' : null);
    var _famGli = ['glicemia','glicose','glicosimetro','reagente'];
    var _okTira = _altTira && _bmFamHit(reqText,_famGli) && _bmFamHit(candText,_famGli)
                  && (ct.includes(' '+_altTira+' ')||ct.includes(' '+_altTira+'s '));
    if(!_okTira && !(_altTubo && _bmFamHit(reqText,_famEndo) && _bmFamHit(candText,_famEndo)
         && (ct.includes(' '+_altTubo+' ')||ct.includes(' '+_altTubo+'s ')))) return false;
  }
  // CABEÇAS mutuamente exclusivas (14531): EXTENSOR não é EQUIPO (e vice-versa) — o candidato
  // "EQUIPO INFUSOR ... (EXTENSOR)" contém a palavra, mas a CABEÇA do nome diz o que ele é.
  const candHead = ct.trim().split(' ')[0];
  if(rw[0]==='extensor' && candHead==='equipo') return false;
  if(rw[0]==='equipo' && candHead==='extensor') return false;
  return true;
}
function _bmMatchMat(reqText, candText){
  const ct=_bmNormF(candText);
  if(_BM_BLOCK.some(b=>ct.includes(' '+b))) return false;             // categoria alheia (figurinha, beach tennis...)
  const rw=_bmPalRel(reqText);
  if(!rw.length) return false;
  if(!_bmSubstantivo(reqText,candText)) return false;                 // substantivo + cabeças exclusivas
  // ── discriminadores obrigatórios (subtipo/material/faixa-etária/tipo-de-teste) ──
  if(_bmDiscorda(reqText,candText,_BM_FAM_SUBTIPO)) return false;     // sonda uretral != enteral != aspiração != endotraqueal
  if(_bmDiscorda(reqText,candText,_BM_FAM_MATERIAL)) return false;    // atadura algodão != crepom
  if(_bmDiscorda(reqText,candText,_BM_FAM_IDADE)) return false;       // fralda infantil != adulto
  if(_bmDiscorda(reqText,candText,_BM_FAM_TESTE)) return false;       // teste IGG/IGM != antígeno
  if(_bmDiscorda(reqText,candText,_BM_FAM_ANALITO)) return false;     // teste dengue != covid != influenza (analito)
  if(_bmVarianteConflito(reqText,candText)) return false;             // placa != rolo, slip != luer lock, saco != frasco, aberto != fechado
  if(_bmCosmeticoSoNoCand(reqText,candText)) return false;            // adesivo de acne não atende pedido de curativo de ferida
  // fita/compressa: só valem quando o PEDIDO é do produto (senão "campo" de outro item bloquearia)
  if((rw[0]==='fita'||rw[0]==='fitas') && _bmDiscorda(reqText,candText,_BM_FAM_FITA)) return false;            // autoclave != microporosa != crepe
  if((rw[0]==='compressa'||rw[0]==='compressas') && _bmDiscorda(reqText,candText,_BM_FAM_COMPRESSA)) return false;  // campo operatório != gaze
  if(rw[0]==='fixador' && _bmDiscorda(reqText,candText,_BM_FAM_FIXADOR)) return false;                              // citológico != cateter != tubo
  if(rw[0]==='agulha'||rw[0]==='agulhas'){ if(_bmAgulhaCaneta(reqText) !== _bmAgulhaCaneta(candText)) return false; } // caneta de insulina != hipodérmica
  // ── calibre N-XX (só sonda/cateter/dreno/agulha/tubo): N-06 != N-12; evita 4 calibres colapsarem em 1 ──
  if(['sonda','cateter','dreno','agulha','scalp','abocath','jelco','tubo'].includes(rw[0])){
    const calReq=_bmCalibre(reqText);
    if(calReq){ const cc=_bmCalibre(candText);
      if(cc){
        if(cc.n!==calReq.n) return false;                                   // número diferente (N-06 != N-12, 22G != 24G)
        if(cc.s!=='N' && calReq.s!=='N' && cc.s!==calReq.s) return false;   // mesmo número, escalas EXPLÍCITAS diferentes: gauge != French
      }
    }
  }
  // ── tamanho em mm do ENDOTRAQUEAL (7,0 != 7,5; "N.75"=7,5): não deixa TUBO 7,0 baixar em N.75 ──
  if(_bmFamHit(reqText,['endotraqueal','orotraqueal','intubacao']) && _bmFamHit(candText,['endotraqueal','orotraqueal','intubacao'])){
    const mmReq=_bmEndoMm(reqText);
    if(mmReq){ const mmC=_bmEndoMm(candText); if(mmC && mmC!==mmReq) return false; }
  }
  // ── característica-chave OBRIGATÓRIA quando o pedido especifica ──
  const tamReq=_bmTamanhos(reqText);                                  // tamanho P/M/G/GG/XG/EG (multi-tamanho casa qualquer DESSES)
  if(tamReq.size){ const tc=_bmTamanhos(candText); if(![...tamReq].some(t=>tc.has(t))) return false; }
  const vReq=_bmVolume(reqText);                                      // volume (SERINGA 20ML só casa 20ML)
  if(vReq){ if(vReq!==_bmVolume(candText)) return false; }
  // DIMENSÃO NxN (23x40). 28/07: compara os DOIS números em CENTÍMETROS canônicos — "200X90" e
  // "2MTX90CM" são o MESMO lençol, e antes não casavam (era comparação de texto cru).
  const _dim=t=>{ const m=String(t).toUpperCase().replace(/,/g,'.').match(/(\d+(?:\.\d+)?)\s*(MT|M|CM)?\s*[X]\s*(\d+(?:\.\d+)?)\s*(MT|M|CM)?/);
    if(!m) return null; const cv=(v,u)=>{ const n=parseFloat(v); return (u==='M'||u==='MT') ? n*100 : n; };
    // unidade escrita só no fim vale pros DOIS lados ("1,80X1,40M" = 180x140cm). Quando cada lado
    // traz a sua ("20CMX4,5M"), cada uma vale na sua.
    const u1=m[2]||m[4]||'', u2=m[4]||'';
    return cv(m[1],u1)+'x'+cv(m[3],u2); };
  const dimReq=_dim(reqText);
  const _dimC=dimReq?_dim(candText):null;
  if(dimReq){ if(_dimC && _dimC!==dimReq) return false; }
  // largura CM (atadura/gaze 15CM != 10CM). ADITIVA (28/07): só bloqueia quando os DOIS lados
  // declaram CM. Antes, pedido com "CM" x candidato sem "CM" reprovava o produto EXATO — foi assim
  // que a gaze 13 fios que o cliente pediu (e que existe no banco) ficou de fora da proposta.
  const cmReq=_bmCm(reqText);
  if(cmReq.size){
    const cc=_bmCm(candText);
    if(cc.size){ if(![...cmReq].some(x=>cc.has(x))) return false; }
    else { const so=_bmNumSolto(candText);          // candidato MUDO: número órfão conta como largura
           if(so.size && ![...cmReq].some(x=>so.has(x))) return false; }
  }
  // nº de FIOS da gaze/compressa. 68574: o banco escreve "11FIO" (singular) e "13F" — o regex só
  // aceitava "FIOS", então gaze de 13 fios casava compressa de 11 fios.
  const _fios=t=>(String(t).toUpperCase().replace(/,/g,'.').match(/(\d+)\s*(?:FIOS|FIO|F)\b/)||[])[1];
  const fiosReq=_fios(reqText);
  if(fiosReq){ const fc=_fios(candText); if(fc && fc!==fiosReq) return false; }
  const pesoReq=_bmPeso(reqText);                                    // peso GR (algodão 500g != 25g)
  if(pesoReq.size){ const pc=_bmPeso(candText); if(![...pesoReq].some(x=>pc.has(x))) return false; }
  // METRAGEM (68574): atadura 4,5m != 1,8m; fita 30m != 4,5m. "1,80M" ≡ "180MT" (mesma medida).
  const metReq=_bmMetros(reqText);
  if(metReq.size){ const mc=_bmMetros(candText); if(mc.size && !_bmMetrosIgual(metReq,mc)) return false; }
  // VOLUME em ML como conjunto (68574): pega o "C/100ML" que o _bmVolume deixa passar.
  const mlReq=_bmMl(reqText);
  if(mlReq.size){ const mlc=_bmMl(candText); if(mlc.size && ![...mlReq].some(x=>mlc.has(x))) return false; }
  const gReq=_BM_GLOVE.find(g=>_bmNormF(reqText).includes(' '+g+' '));  // material da luva (nitrílica != látex)
  if(gReq){ const gc=_BM_GLOVE.find(g=>ct.includes(' '+g+' ')); if(gc && gc!==gReq) return false; }
  // TIPO DE LUVA — só quando o pedido É de luva. 68574: "COMPRESSA CIRURGICA CAMPO OPERATORIO"
  // caía aqui (a palavra "cirúrgica" ligava o discriminador de luva) e o item sumia da proposta.
  const _ehLuva = rw[0]==='luva' || rw[0]==='luvas';
  let ltReq=_ehLuva ? _bmLuvaTipo(reqText) : null;
  // LUVA com tamanho NUMÉRICO 6-9(,5) = cirúrgica IMPLÍCITA (caso real 23/07: "luva estéril
  // 7.0" x procedimento TAM G). Só quando o pedido não declarou o tipo por extenso.
  if(!ltReq && _ehLuva && /\b[6-9](?:[.,][05])?\b/.test(String(reqText))) ltReq='cir';
  if(ltReq==='cir'){                                                   // cirúrgica SÓ casa cirúrgica explícita + tamanho numérico igual
    if(_bmLuvaTipo(candText)!=='cir') return false;
    const ns=String(reqText).match(/\b([6-9](?:[.,]\d)?)\b/);
    if(ns){ const nc=String(candText).match(/\b([6-9](?:[.,]\d)?)\b/); if(nc && nc[1].replace(',','.')!==ns[1].replace(',','.')) return false; }
  } else if(ltReq==='proc'){ if(_bmLuvaTipo(candText)==='cir') return false; }  // procedimento não casa cirúrgica
  const eReq=_bmEsteril(reqText);                                      // estéril != não-estéril (só se o pedido especifica)
  if(eReq){ const ec=_bmEsteril(candText); if(ec && ec!==eReq) return false; }
  if(_bmNegConflito(reqText, candText)) return false;               // com/sem conflitante (s/agulha, s/clor...)
  // se nenhuma característica-chave no pedido, exige um qualificador em comum
  // (luva cirúrgica já validada por tipo+tamanho numérico conta como característica — o
  // candidato abrevia "EST." e o qualificador 'esteril' nunca casaria por texto)
  // >>> QUEM DISPENSA O QUALIFICADOR É A MEDIDA **CONFIRMADA**, NÃO A MEDIDA PEDIDA (77520
  //     família D, 10/08). Era isto que deixava o substantivo genérico fechar sozinho no caminho
  //     de material: o pedido trazia "CURATIVO HIDROCOLOIDE ... 10X10CM", o 10x10 ligava a
  //     dispensa, e o candidato "CURATIVO transparente cx 40 und" — que não declara dimensão
  //     nenhuma — passava com a palavra "curativo" de único elo. Mesmo caminho no "KIT CATETER
  //     DUPLO LUMEN 7FR 20CM" -> "CATETER TIPO OCULOS" (de oxigênio), com o CATETER DUPLO LUMEN
  //     7FR-20CM parado no catálogo.
  //     A barreira de medida está certa em não votar quando o candidato é mudo ("quem não declara
  //     não vota"); o erro era a DISPENSA tratar esse silêncio como confirmação. Medida que o
  //     candidato não declarou não confirmou nada — e o que não confirma nada não pode dispensar
  //     a única outra evidência que sobrou.
  const _confDim = !!(dimReq && _dimC), _confCm = !!(cmReq.size && _bmCm(candText).size);
  const _confFios = !!(fiosReq && _fios(candText)), _confVol = !!(vReq && _bmVolume(candText));
  if(!tamReq.size && !_confVol && !_confDim && !_confCm && !_confFios && !pesoReq.size && ltReq!=='cir'){
    const quals=rw.slice(1);
    // o qualificador também vale pelo de-para de abreviação (desc <-> descartavel)
    if(quals.length>0 && !quals.some(function(q){
      if(q.length<=2) return false;
      if(ct.includes(q)) return true;
      var qs=q.replace(/(?:es|s)$/,'');                    // plural do pedido no de-para
      return !!((_BM_ABREV[q] && ct.includes(_BM_ABREV[q])) || (_BM_ABREV[qs] && ct.includes(_BM_ABREV[qs])));
    })) return false;
  }
  return true;
}
// PROPORÇÃO de associação (15617): "3+3", "5+2MG/ML", "400+57MG" -> par "maior+menor" (ordem
// robusta). Exige DÍGITO dos dois lados do + (PIPERACILINA+TAZOBACTAM não vira proporção).
// VASO (23526): 'COM'|'SEM'|null — S/V, S/VASO, SEM VASO x C/V, C/VASO, COM VASO CONST.
function _bmVaso(t){
  var u=' '+String(t||'').toUpperCase()+' ';
  // >>> O VASOCONSTRITOR PELO NOME (bug #5): o cliente escreve "LIDOCAINA + EPINEFRINA", não
  //     "C/VASO". Sem isso o pedido COM vaso podia receber a versão SEM vaso — que é outro
  //     procedimento, não outro preço. Vale nos dois sentidos: "S/ EPINEFRINA" é SEM.
  if(/\sS\/?\s?V(ASO)?\b|SEM VASO|\sS\/\s?(?:ADREN|EPINEF|NORADREN)|SEM\s+(?:ADRENALINA|EPINEFRINA)/.test(u)) return 'SEM';
  if(/\sC\/?\s?V(ASO)?\b|COM VASO|VASO CONST|ADRENALINA|EPINEFRINA/.test(u)) return 'COM';
  return null;
}
function _bmProp(t){
  var m=String(t||'').toUpperCase().replace(/,/g,'.').match(/(\d+(?:\.\d+)?)\s*(?:MG(?:\/ML)?|MCG|G|UI)?\s*\+\s*(\d+(?:\.\d+)?)/);
  if(!m) return null;
  var a=parseFloat(m[1]), b=parseFloat(m[2]);
  if(!(a>0)||!(b>0)) return null;
  return Math.max(a,b)+'+'+Math.min(a,b);
}
function _bmFormaCand(prod){ return _bmMemo('fc', String(prod == null ? '' : prod), () => _bmFormaCandCalc(prod)); }
function _bmFormaCandCalc(prod){
  var f=_bmForma(prod); if(f) return f;
  var up=_bmStrip(String(prod).toUpperCase());
  // >>> ESTA LINHA TAMBÉM ERA UM CHUTE, e mordia o mesmo pedido de oncologia: "DOCETAXEL 80MG/4ML
  //     CX/1FRS GENERICO BLAU" (R$65,45) tem "/ML" e virava LIQUIDO_ORAL — um frasco-ampola de
  //     quimioterápico classificado como xarope, e barrado contra um pedido injetável.
  //     Ter ML no nome diz que é LÍQUIDO; não diz se é oral ou injetável. Então: não sei.
  //     (null não bloqueia nada, então um pedido de líquido oral continua alcançando a LACTULOSE
  //     667MG/ML 120ML — o que se perde é só a capacidade de BARRAR com base num palpite.)
  // >>> ANTES ISTO DEVOLVIA 'SOLIDO_ORAL' — um CHUTE, e a barreira de forma o tratava como fato.
  //     Era o que matava o pedido de oncologia: "PEMETREXEDE DISSODICO 100MG CX/1FRS GENERICO
  //     BLAU" não tem palavra de forma no nome nem ML, então era adivinhado COMPRIMIDO — e o
  //     pedido, que diz "PÓ PARA SOLUÇÃO INJETÁVEL", batia numa barreira dura contra um chute.
  //     Frasco-ampola de quimioterápico virando comprimido por omissão do cadastro.
  //     Agora: null = NÃO SEI. Quem não sabe não vota — a barreira só age quando os DOIS lados
  //     nomeiam a forma e elas divergem, que é a mesma filosofia das outras barreiras da casa
  //     (sub-forma oral, vasoconstritor, subtipo de insulina e de penicilina).
  return null;
}
// Insulinas NUNCA cruzam subtipo (NPH != Regular != Lispro != Glargina != Aspart != Degludeca != Detemir)
const _BM_INSU = {nph:['nph'],regular:['regular'],lispro:['lispro','humalog'],aspart:['aspart','asparte','novorapid','fiasp'],glargina:['glargina','lantus','basaglar','toujeo'],degludeca:['degludeca','tresiba'],detemir:['detemir','levemir'],glulisina:['glulisina','apidra']};
function _bmInsulinaSub(texto){
  var t=_bmNormF(texto); var isI=t.includes(' insulina '); var sub=null;
  for(var k in _BM_INSU){ for(var i=0;i<_BM_INSU[k].length;i++){ if(t.includes(' '+_BM_INSU[k][i])){ sub=k; isI=true; } } }
  return isI ? (sub||'generica') : undefined;   // undefined = não é insulina; 'generica' = insulina sem subtipo identificado
}

// ── BLINDAGEM DE PREÇO (Lemuel 21/07) — 2 checks que teriam pego o TRESIBA e o HUMALOG sozinhos.
// Caso real: S3MED gravou preço de CAIXA no compra_unit -> TRESIBA saiu na proposta a 5.263/cx
// (5x o certo) e o HUMALOG a 320,56 sendo que o nosso GLOBAL vende a 137,10.
//   (1) custo do fornecedor > a NOSSA venda1 do mesmo item  -> impossível, é preço errado
//   (2) unitário > 2x a MEDIANA dos peers do mesmo PA+dose  -> destoa demais do mercado
// É ALERTA, nunca bloqueio automático: marca o item e a tela mostra. Quem decide é o humano.
function _bpDose(p){ const m=String(p||'').toUpperCase().match(/(\d+(?:[.,]\d+)?)\s*(MG\/ML|MCG\/ML|UI\/ML|U\/ML|MG|MCG|UI|G|%)/g); return m?m.slice(0,2).join('+').replace(/\s+/g,''):''; }
function _bpChave(c){ const p=_bmNorm(c.principio_ativo||''), d=_bpDose(c.produto||''); return (p.length>=3&&d)?p+'|'+d:null; }
var _bpCache = null;
function _bpIndex(){
  if (_bpCache) return _bpCache;
  const nossa={}, peers={};
  (typeof cotacoes!=='undefined'?cotacoes:[]).forEach(c=>{
    const k=_bpChave(c); if(!k) return;
    if (ehGlobal(c)){
      const v=parseFloat(c.global_venda1); if(v>0) (nossa[k]=nossa[k]||[]).push({v, prod:c.produto, cod:c.codigo});
    } else {
      const u=parseFloat(c.compra_unit); if(u>0) (peers[k]=peers[k]||[]).push({u, forn:String(c.fornecedor)});
    }
  });
  _bpCache={nossa,peers}; return _bpCache;
}
// CAÇA-ERRO DE DIGITAÇÃO, não comparativo (DECISOES_DO_DONO.md nº 8, A_082): a lei "custo × custo"
// NÃO se aplica aqui — compara custo do fornecedor contra a NOSSA VENDA de propósito, pra pegar
// preço de caixa gravado como unitário (ex.: TRESIBA/HUMALOG, ~R$ 5 mil, 21/07). Nenhuma auditoria
// futura pode marcar este ponto como defeito de custo×custo. Na tela sempre como "possível erro de
// digitação" — nunca como economia ou margem.
// devolve {tipo, msg} quando o preço do item cheira a errado; null quando está ok
function bpAlertaErroDeDigitacao(c){
  if (!c) return null;
  const u=parseFloat(c.compra_unit); if(!(u>0)) return null;
  if (ehGlobal(c)) return null;  // o GLOBAL é a referência
  const k=_bpChave(c); if(!k) return null;
  const {nossa,peers}=_bpIndex();
  // (1) custo > nossa venda
  const n=(nossa[k]||[]).slice().sort((a,b)=>a.v-b.v)[0];
  if (n && u > n.v) return { tipo:'acima-da-nossa-venda',
    msg:'custo '+u.toFixed(2)+' do fornecedor é MAIOR que a nossa venda '+n.v.toFixed(2)+' (cód '+n.cod+') — preço provavelmente errado' };
  // (2) > 2x a mediana dos peers
  const pr=(peers[k]||[]).map(x=>x.u).filter(x=>Math.abs(x-u)>1e-9).sort((a,b)=>a-b);
  if (pr.length){
    const med = pr.length%2 ? pr[(pr.length-1)/2] : (pr[pr.length/2-1]+pr[pr.length/2])/2;
    if (med>0 && u > 2*med) return { tipo:'acima-dos-peers',
      msg:'unitário '+u.toFixed(2)+' é '+(u/med).toFixed(1)+'x a mediana dos concorrentes ('+med.toFixed(2)+', n='+pr.length+') — pode ser preço de CAIXA gravado como unitário' };
  }
  return null;
}

// EAN-13 VÁLIDO dentro de um texto (29/07). Exige dígito verificador certo (módulo 10, pesos 1/3):
// código errado é tratado como SEM ean — nunca casa por código. 12 ou 14 dígitos também não é
// EAN-13 (o 14 é DUN de caixa de embarque, o 15 é GGREM).
function _bmEanDoTexto(texto){
  const m = String(texto == null ? '' : texto).match(/(?<!\d)(\d{13})(?!\d)/g);
  if (!m) return null;
  for (const cand of m) {
    let soma = 0;
    for (let i = 0; i < 12; i++) soma += parseInt(cand[i], 10) * (i % 2 === 0 ? 1 : 3);
    if (((10 - (soma % 10)) % 10) === parseInt(cand[12], 10)) return cand;
  }
  return null;
}
// ══ ÍNDICE DE CANDIDATOS — visitar 200 linhas em vez de 20.000 ═══════════════════════════════
// Depois de memoizar tudo que era função pura, a busca ainda custava ~100ms por item: sobrou o
// custo IRREDUTÍVEL de tocar 20.705 linhas, ~5µs cada. A única forma de ganhar de verdade é NÃO
// VISITAR a maioria delas. É o que este índice faz — e o risco dele é o oposto do risco de
// lentidão: um índice que perde uma linha tira produto da busca EM SILÊNCIO.
//
// >>> POR ISSO ELE É UM SUPERCONJUNTO PROVADO, não uma heurística. O filtro do motor é o paOK:
//         _bmFuzzy(w, t)  para w em {principal, subAlvo, sinônimos}  e t em {paN, prodN}
//     e o _bmFuzzy aceita de dois jeitos, então o índice cobre os dois:
//       (a) t.includes(w)  — SUBSTRING, podendo cair no meio de uma palavra maior.
//           Cobertura: se t contém w (|w|>=4), t contém os 4 primeiros caracteres de w como
//           substring. Indexando TODOS os 4-gramas de t, o balde do 4-grama inicial de w é
//           garantidamente um superconjunto. (4-grama, não token: é o que sobrevive à substring
//           no meio da palavra, que um índice de tokens perderia.)
//       (b) algum token k de t com |k|>=5, k[0]===w[0] e distância de edição 1 pra w.
//           Distância 1 força |k| em {|w|-1, |w|, |w|+1}. Indexando cada token por
//           (primeira letra, comprimento), os três baldes cobrem todos os k possíveis.
//     E o classMatch, que não depende de w nenhum: as linhas de classe COMPLEXO_B ficam num
//     conjunto próprio, somado quando o pedido é dessa classe.
//
// >>> QUANDO ELE NÃO SABE, ELE DESISTE: se o principal tem menos de 4 caracteres, se algum
//     sinônimo é curto demais, ou se o índice ainda não foi construído, devolve null e o motor
//     varre tudo como antes. Desistir é barato; errar é invisível.
// A equivalência é verificada contra o banco REAL em tools/prova_indice.js e travada na suíte
// tests/testa_indice.js — os dois caminhos têm que devolver EXATAMENTE o mesmo produto.
let _bmIdx = null;
function _bmIdxConstroi(rows){
  const g4 = new Map(), fl = new Map(), classeB = [];
  for (let i = 0; i < rows.length; i++) {
    const c = rows[i];
    // o MESMO texto que o paOK olha: prodN e paN. Marca não entra porque o paOK não a consulta.
    const t = _bmNorm(c.produto || '') + ' ' + _bmNorm(c.principio_ativo || '');
    for (let j = 0; j + 4 <= t.length; j++) {
      const k = t.substr(j, 4);
      let a = g4.get(k); if (!a) { a = []; g4.set(k, a); }
      if (a[a.length - 1] !== c) a.push(c);
    }
    const toks = t.split(/\s+/);
    for (let j = 0; j < toks.length; j++) {
      const k = toks[j]; if (k.length < 5) continue;
      const key = k[0] + k.length;
      let a = fl.get(key); if (!a) { a = []; fl.set(key, a); }
      if (a[a.length - 1] !== c) a.push(c);
    }
    if (_bmClasseFam((c.produto || '') + ' ' + (c.principio_ativo || '')) === 'COMPLEXO_B') classeB.push(c);
  }
  return { g4, fl, classeB, n: rows.length, base: rows };
}
function _bmIdxGarante(){
  if (typeof cotacoes === 'undefined' || !cotacoes.length) { _bmIdx = null; return null; }
  // reconstrói quando o array de cotações trocou (recarga do banco) — comparação por identidade
  if (!_bmIdx || _bmIdx.base !== cotacoes) _bmIdx = _bmIdxConstroi(cotacoes);
  return _bmIdx;
}
// interruptor: desligado, o motor varre tudo como antes. Existe pra que a prova de equivalência
// (tools/prova_indice.js) possa rodar os DOIS caminhos no mesmo processo e comparar resultado a
// resultado — sem isso, "o índice é um superconjunto" seria só uma afirmação minha.
let _bmIdxOff = false;
// ── O MESMO ÍNDICE, PARA O CAMINHO DE MATERIAL ───────────────────────────────────────────────
// Medido: o pedido cirúrgico (21 das 37 linhas são material) custava 234ms por item enquanto o de
// medicamentos já estava em 24ms — porque o material tem filtro próprio (_bmMatchMat) e não
// passava pelo índice.
// >>> A PORTA OBRIGATÓRIA do _bmMatchMat é uma só, e é o que torna o índice provável: o candidato
//     PRECISA conter, como palavra inteira, o 1º substantivo do pedido — ou uma variante dele:
//       rw[0] · o singular (tira -s/-es) · o diminutivo (escovinha->escova) · a abreviação
//       (desc<->descartavel) · o sinônimo de molécula · tubo<->sonda · fita<->tira
//     TODAS saem de rw[0] e são calculáveis ANTES do laço. Se o candidato contém a palavra, ele
//     contém os 4 primeiros caracteres dela — logo está no balde de 4-gramas. Superconjunto.
// Palavra com menos de 4 letras não tem balde: devolve null e o motor varre tudo, como sempre.
function _bmIdxCandidatosMat(rw0){
  if (_bmIdxOff || !rw0) return null;
  const ix = _bmIdxGarante(); if (!ix) return null;
  const sing = rw0.replace(/(?:es|s)$/, '');
  const vars = [rw0, sing,
    _BM_DIMINUTIVO[rw0] || null,
    _BM_ABREV[rw0] || _BM_ABREV[sing] || null,
    _bmSinonMol(rw0)[0] || null,
    rw0 === 'tubo' ? 'sonda' : (rw0 === 'sonda' ? 'tubo' : null),
    rw0 === 'fita' ? 'tira'  : (rw0 === 'tira'  ? 'fita' : null),
  ].filter(Boolean);
  const vistos = new Set(), out = [];
  for (const w of vars) {
    if (w.length < 4) return null;                       // sem balde pra essa: varre tudo
    const b = ix.g4.get(w.substr(0, 4));
    if (b) for (let i = 0; i < b.length; i++) if (!vistos.has(b[i])) { vistos.add(b[i]); out.push(b[i]); }
  }
  return out;
}
function _bmIdxCandidatos(principal, subAlvo, sinonimos, reqClasse){
  if (_bmIdxOff) return null;
  const ix = _bmIdxGarante(); if (!ix) return null;
  const palavras = [principal].concat(subAlvo ? [subAlvo] : []).concat(sinonimos || []);
  const vistos = new Set(), out = [];
  const junta = arr => { if (!arr) return; for (let i = 0; i < arr.length; i++)
    if (!vistos.has(arr[i])) { vistos.add(arr[i]); out.push(arr[i]); } };
  for (const w of palavras) {
    if (!w || w.length < 4) return null;                 // não sei cobrir: varre tudo
    junta(ix.g4.get(w.substr(0, 4)));                    // (a) substring
    if (w.length >= 5) for (let L = w.length - 1; L <= w.length + 1; L++) junta(ix.fl.get(w[0] + L));  // (b) fuzzy
  }
  if (reqClasse === 'COMPLEXO_B') junta(ix.classeB);
  return out;
}

// ── CANAL DE ALTERNATIVA COM AVISO (aprovado pelo Lemuel) ────────────────────────────────────
// Até aqui a busca só sabia dizer duas coisas: "achei" e "nada". Faltava a terceira, que é a
// resposta honesta na maior parte dos casos difíceis: "achei parecido, olha a diferença".
// Sem ela, todo caso limítrofe virava uma escolha ruim — casar calado (e mandar o produto errado)
// ou devolver nada (e perder a venda de um item que a casa tem na prateleira).
// COMO FUNCIONA: só roda DEPOIS que a busca normal devolveu null, e afrouxa UMA barreira por vez,
// registrando qual foi. O motivo vira o texto do aviso âmbar na tela, com [Aceitar] e [Recusar].
// Nunca substitui um match limpo, e nunca entra calada.
const _BM_RELAX = [
  { chave: 'volume', texto: 'volume diferente do pedido — confira a apresentação' },
  { chave: 'forma',  texto: 'apresentação diferente (pó/liofilizado x solução) — confira' },
  // A NOTAÇÃO COLADA "A MG / B ML" — a última a ser tentada, e a mais delicada (decisão do Lemuel).
  // "BROMOPRIDA 5MG/2ML" tem DUAS leituras possíveis e as duas são defensáveis:
  //    (a) 5mg CONTIDOS em 2ml  = 2,5mg/ml   <- a conta padrão, que o motor usa
  //    (b) 5mg/ml em ampola de 2ml = 10mg    <- o produto que existe no mercado
  // Não dá pra escolher uma sem arriscar ofertar o dobro ou a metade da concentração — e não
  // existe bromoprida 2,5mg/ml nem ondansetrona 1mg/ml à venda, o que sugere que o cliente
  // escreveu na forma (b). Mas "o cliente escreveu errado, então eu adivinho" é exatamente o tipo
  // de regra que põe produto errado no orçamento.
  // ENTÃO: sai como ALTERNATIVA, com a conta escrita no aviso, e o vendedor decide. Só dispara
  // quando o pedido usa essa notação colada E o frasco é o mesmo — dose diferente noutro frasco
  // continua sendo produto diferente.
  { chave: 'notacao', texto: 'a dose do pedido está escrita como "A MG/B ML", que tem duas leituras '
    + '(A mg no frasco inteiro, ou A mg por ml). Este produto é o mesmo frasco, mas com a outra '
    + 'leitura de concentração — confira a força antes de fechar' },
];
// o pedido escreve a dose na forma colada "5MG/2ML"? (dois números com a barra no meio)
function _bmNotacaoColada(linha){
  return /\d+(?:[.,]\d+)?\s*(?:MG|MCG|UI|G)\s*\/\s*\d+(?:[.,]\d+)?\s*ML/i.test(String(linha || ''));
}
function buscarAlternativa(linha){
  for (const r of _BM_RELAX) {
    // a relaxação da notação só existe pra quem escreveu na notação colada
    if (r.chave === 'notacao' && !_bmNotacaoColada(linha)) continue;
    const opt = {}; opt[r.chave] = true;
    const c = buscarMelhorProduto(linha, opt);
    if (c) return { c, motivo: r.texto };
  }
  return null;
}
// aviso de equivalência IMPERFEITA vindo do dicionário (LUMAZENIL x FLUMAZENIL): o match acontece,
// mas o vendedor tem que ver a diferença antes de fechar.
function _bmAvisoPedido(linha){
  const pal = _bmPalavras(linha);
  for (const w of pal) { const a = _bmDicAviso.get(w); if (a) return a; }
  return null;
}
// >>> _rx.coleta (10/08, família C da 77520): um ARRAY opcional que a função enche com TODOS os
//     candidatos que passaram nas barreiras — não só o escolhido. Quem monta o orçamento precisa
//     saber que o mesmo remédio existe em C/14 e em C/500 pra poder avisar; sem isto, a única
//     saída seria reescrever o casamento fora do motor, que é como se criam duas cópias que
//     discordam. É ADITIVO: sem a opção, nada muda — e o assert 11 da suíte cobra exatamente isso.
function buscarMelhorProduto(linha, _rx) {
  _rx = _rx || {};
  const _col = Array.isArray(_rx.coleta) ? _rx.coleta : null;
  linha = (linha == null ? '' : String(linha));   // blindagem: aceita qualquer tipo sem quebrar
  if (!linha.trim()) return null;
  // ── CAMADA 1: EAN (29/07) ─────────────────────────────────────────────────────────────────
  // Quando os DOIS lados têm EAN-13 VÁLIDO e ele bate, é identificação perfeita (produto +
  // apresentação + laboratório) e pula todas as barreiras de texto. A estreia mediu 63,1% de
  // batida contra a CMED. Qualquer outra situação — um lado sem EAN, EAN diferente, dígito
  // verificador errado — cai no motor de sempre, sem mudança nenhuma.
  const _eanReq = _bmEanDoTexto(linha);
  if (_eanReq) {
    const _porEan = cotacoes.filter(c => c.ean && String(c.ean).trim() === _eanReq && pv(c));
    if (_porEan.length) {
      _porEan.sort((a,b) => (ehGlobalComEstoque(b) - ehGlobalComEstoque(a)) || (_velha(a) - _velha(b)) || (_super(a) - _super(b)) || (pv(a) - pv(b)));
      if (_col) _porEan.forEach(c => _col.push(c));
      return _porEan[0];
    }
  }
  // ── MATERIAL ──
  if (_bmMaterial(linha)) {
    // de-para de PALAVRA aplicado nos DOIS lados: "DRENO SUCTOR 4.8" e "DRENO SUCCAO ... 4,8" são
    // o mesmo dreno escrito com outra palavra e outra vírgula. Sem dicionário carregado, o
    // _bmCanonPal só normaliza o texto e o comportamento é o de antes.
    const _lm = _bmCanonPal(linha);
    // índice do material: reduz o universo antes do filtro caro. Se não souber cobrir, devolve
    // null e cai na varredura completa — o mesmo contrato do índice de medicamento.
    const _stopM = new Set(['para','com','de','do','da','p','e','em','cx','pct','und','unid','kit','c','un','x','sem']);
    const _rwM = _bmNormF(linha).trim().split(/\s+/).filter(w => w.length > 2 && !_stopM.has(w));
    const _univM = (_rwM.length ? _bmIdxCandidatosMat(_rwM[0]) : null) || cotacoes;
    // o de-para de palavra aproxima produtos parecidos — e é justamente por isso que a barreira do
    // número discriminador tem que vir JUNTO: sem ela, "DRENO SUCTOR 4.8" alcança e casa a cânula
    // de 6,4. Calibre, vias e medida barram antes de qualquer escolha por preço.
    const cands = _univM.filter(c => pv(c) && _bmMatchMat(_lm, _bmCanonPal(c.produto||''))
      && !_bmDiscrimConflito(linha, c.produto||'', true) && !_bmPortaoConflito(linha, c.produto||''));   // true = decimal solto conta como calibre
    if (!cands.length) return null;
    cands.sort((a,b)=> (ehGlobalComEstoque(b)-ehGlobalComEstoque(a)) || (_velha(a) - _velha(b)) || (_super(a) - _super(b)) || (pv(a) - pv(b)));  // GLOBAL c/ estoque 1º
    if (_col) cands.forEach(c => _col.push(c));
    return cands[0];
  }
  // ── MEDICAMENTO: PA + FORMA + DOSE exatos ──
  const reqForma = _bmForma(linha);
  const reqDoses = _bmDoses(linha);
  const pal = _bmPalavras(linha);
  if (!pal.length) return null;
  const principal = pal[0];
  const principalGenerico = _BM_GENERICO.has(principal);                          // principal genérico (adesivo/almotolia) -> exige palavra distintiva
  const distintivasReq = principalGenerico ? pal.slice(1).filter(w=>!_BM_GENERICO.has(w) && !_BM_QUALIF_GEN.has(w)) : [];
  // principal é recipiente genérico (almotolia/adesivo/frasco/guia...) SEM palavra distintiva =
  // não dá pra identificar o produto -> NÃO ENCONTRADO. Mata "ALMOTOLIA 100ML"->água oxigenada
  // (o volume batia). Precisão > cobertura: melhor null do que cotar o conteúdo errado do recipiente.
  if (principalGenerico && !distintivasReq.length) return null;
  // CMED: se a palavra principal é uma MARCA que resolve pra 1 substância (não-combo, não-ambígua),
  // o candidato também casa pelo PA = substância. FORMA e DOSE seguem barreiras duras.
  const subAlvo = _bmCmed.get(principal) || null;
  // PROPORÇÃO de associação "N+N" (15617: BETAMETASONA 3+3 != BETATRINTA 5+2): par numérico
  // normalizado (maior+menor); barreira quando OS DOIS lados têm proporção e ela difere.
  const reqProp = _bmProp(linha);
  // forma dose-crítica (cpr/inj/líquido) sem dose no pedido = não dá pra confirmar = NÃO ENCONTRADO
  // (proporção presente conta como dose: "3+3" identifica a associação mesmo sem unidade)
  // forma dose-crítica (cpr/inj/líquido) sem dose no pedido: normalmente NÃO dá pra confirmar. MAS
  // MARCA DE COMBO FIXO (TORSILAX/DORFLEX CPR) se identifica PELA MARCA, não por dose. Regra segura
  // (sem dicionário): quando o pedido não tem dose, só casa candidato que TAMBÉM não tem dose no nome
  // — genérico com dose (DIPIRONA 500MG) segue travado (dose ambígua). Marcado abaixo no loop.
  const formaSemDose = (reqDoses.size === 0 && reqForma && _BM_DOSE_CRIT[reqForma] && !reqProp);
  // sem massa absoluta (só % / MG/ML, ou nenhum mg) -> o VOLUME entra: ALCOOL 70% 1000ML != 50ML; AGUA OX 1000ML != 100ML
  const reqVol = [...reqDoses].every(d=>d.endsWith('/ML')||d.endsWith('%')) ? _bmVolume(linha) : null;
  // volumes do pedido como CONJUNTO (pega "C/50ML", que o _bmVolume ignora) — ver a barreira abaixo
  const reqSoConc = reqDoses.size > 0 && [...reqDoses].every(d=>d.endsWith('/ML'));
  const reqMl = reqSoConc ? _bmMl(linha) : new Set();
  const reqMlTodos = _bmMl(linha);   // volume do pedido SEMPRE — usado no desempate do pedido-sem-dose
  const reqInsu = _bmInsulinaSub(linha);   // se o pedido é insulina, exige mesmo subtipo (NPH != Lispro...)
  const reqPeni = _bmPeniSub(linha);       // penicilina: benzatina != procaína != cristalica (bug #5)
  const reqSoro = _bmSoroTipo(linha);      // ringer SIMPLES != ringer LACTATO (bug #5)
  const reqFolin = _bmFolinico(linha);     // acido FOLINICO != acido FOLICO (oncologia, 03/08)
  const reqClasse = _bmClasseFam(linha);   // CLASSE intercambiável CMED (COMPLEXO_B): pedido complexo B casa outro complexo B
  const _sinMolPre = _bmSinonMol(principal);   // calculado uma vez: o índice precisa dele antes do loop
  const reqComposto = /\bcompost[oa]\b/.test(_bmNorm(linha));   // pedido "X COMPOSTO" = associação; não casa monodroga (23530)
  const reqSubForma = _bmSubFormaOral(linha);   // efervescente x liberação prolongada (23530)
  const cands = [];
  // candidatos adiados: passaram TUDO menos "o pedido não trouxe dose". Julgados depois do loop,
  // quando dá pra medir se há de fato mais de uma dose possível. Ver o comentário na barreira.
  const _semDose = [];
  // ÍNDICE: em vez de visitar as 20 mil linhas, visita só as que PODEM passar no paOK. O
  // _bmIdxCandidatos devolve null quando não consegue garantir cobertura — e aí varre tudo,
  // como sempre. Ver a prova de superconjunto na definição, logo acima do índice.
  const _univ = _bmIdxCandidatos(principal, subAlvo, _sinMolPre, reqClasse) || cotacoes;
  _univ.forEach(c => {
    if (!pv(c)) return;
    const prod = c.produto||'', pa = c.principio_ativo||'';
    const paN = _bmNorm(pa), prodN = _bmNorm(prod);
    const classMatch = !!(reqClasse && _bmClasseFam(prod+' '+pa) === reqClasse);   // ambos da MESMA classe (ex.: Santiplex <-> Complexo B)
    // sinônimo de MOLÉCULA (28/07): butilbrometo de escopolamina = hioscina — mesma substância,
    // de-para direto nos dois sentidos, sem contexto (ao contrário de fita<->tira)
    const _sinMol = _sinMolPre;
    const paOK = _bmFuzzy(principal, paN) || _bmFuzzy(principal, prodN)
              || _bmTemSub(subAlvo, paN) || _bmTemSub(subAlvo, prodN)   // PA direto OU substância do CMED
              || _sinMol.some(s => _bmFuzzy(s, paN) || _bmFuzzy(s, prodN))
              || classMatch;                                            // OU mesma classe terapêutica (barreiras de forma/dose/volume seguem valendo abaixo)
    if (!paOK) return;
    // SUBTIPO DA PENICILINA: benzatina != procaína != cristalica (só quando os DOIS nomeiam).
    // É a contrapartida obrigatória do de-para benzilpenicilina <-> penicilina G <-> benzetacil.
    if (reqPeni) { const cp = _bmPeniSub(prod + ' ' + pa); if (cp && cp !== reqPeni) return; }
    // SORO: ringer SIMPLES não é ringer LACTATO (a 68036 pede simples, o estoque tem lactato)
    if (reqSoro) { const cs = _bmSoroTipo(prod + ' ' + pa); if (cs && cs !== reqSoro) return; }
    // FOLÍNICO x FÓLICO: nunca cruzam. Vem antes de qualquer pontuação/fuzzy, de propósito.
    if (reqFolin) { const cf = _bmFolinico(prod + ' ' + pa); if (cf && cf !== reqFolin) return; }
    // NÚMERO DISCRIMINADOR (calibre / nº de vias / medida) — vale nos DOIS caminhos, não só no de
    // material: "TUBO ENDOTRAQUEAL 7,0" e "PAPEL LENÇOL 50X70" nem sempre caem na trilha de
    // material, e o número é o produto do mesmo jeito.
    if (_bmDiscrimConflito(linha, prod)) return;
    if (_bmPortaoConflito(linha, prod)) return;   // A_547: liberacao/associacao/tamanho
    // VARIANTE DECLARADA — vale nos DOIS caminhos pelo mesmo motivo do número discriminador: o
    // SULFAMETOXAZOL+TRIMETOPRIMA COMPRIMIDO que casou "FR 5ML" é medicamento, não material, e
    // não passa pelo _bmMatchMat. Quem não declara não vota; ver a definição da barreira.
    if (_bmVarianteConflito(linha, prod)) return;
    // (o pedido-sem-dose foi movido pra DEPOIS da barreira de forma — ver _semDose logo abaixo)
    // COMPOSTO não é substituído por SIMPLES (23530 caso 1): pedido "X COMPOSTO" (associação) só casa
    // candidato que também é composto — PA com '+' OU nome traz "composto". Mono (escopolamina pura) fora.
    if (reqComposto && pa.indexOf('+') < 0 && !/\bcompost[oa]\b/.test(prodN)) return;
    // SUB-FORMA oral (23530 caso 2): efervescente x liberação prolongada nomeados e diferentes -> fora
    if (reqSubForma) { const sfc = _bmSubFormaOral(prod); if (sfc && sfc !== reqSubForma) return; }
    // COMBO NÃO SUBSTITUI SIMPLES (caso real 23/07: NEOMICINA POMADA -> EMSCORT combo): PA do
    // candidato é COMBO (+) e o NOME do produto não traz o principal -> só casa se OUTRA palavra
    // do pedido casar o resto do PA (pedido de combo por extenso). Precisão > cobertura.
    if (pa.indexOf('+') >= 0 && !_bmFuzzy(principal, prodN) && !classMatch) {   // '+' no PA CRU (o _bmNorm come o sinal); classe intercambiável dispensa (complexo B é combo por natureza)
      const outrosPed = pal.slice(1).filter(w => w.length >= 4);
      if (!outrosPed.some(w => paN.includes(w))) return;
    }
    if (principal === 'agua') { const grReq = _bmAguaGrau(linha); if (grReq && _bmAguaGrau(prod) !== grReq) return; }  // água injetável(paciente) != água autoclave/equipamento
    if (principalGenerico && distintivasReq.length && !distintivasReq.some(w=>paN.includes(w)||prodN.includes(w))) return;  // genérico sem palavra distintiva em comum
    const _fc = _bmFormaCand(prod);
    if (!_rx.forma && reqForma && _fc && _fc !== reqForma) return;    // FORMA: barreira dura, mas só quando o candidato DECLARA a forma
    // PEDIDO SEM DOSE (movido pra cá em 03/08 — caso TRANSAMIN do pedido cirúrgico de 37 linhas).
    // A regra: pedido sem dose numa forma dose-crítica só casava candidato TAMBÉM sem dose,
    // porque "candidato com dose = ambíguo". "TRANSAMIN INJETAVEL" caía aqui e ficava sem match,
    // mesmo com o banco tendo "TRANSAMIN INJ. IV 50MG/ML CX5 AMP 5ML" no estoque próprio.
    // >>> MAS AMBÍGUO É COISA QUE SE MEDE, NÃO QUE SE PRESUME. Estes candidatos ficam de lado e
    //     são julgados DEPOIS do loop: se todos os que sobraram (mesmo PA, mesma forma) tiverem a
    //     MESMA dose, não há ambiguidade nenhuma — é um produto só, e casa. Se houver duas doses
    //     diferentes, aí sim o pedido é ambíguo de verdade e continua sem match.
    //     Ficou DEPOIS da barreira de forma de propósito: assim o TRANSAMIN comprimido de 250MG
    //     não entra na conta da ambiguidade do TRANSAMIN INJETÁVEL — são formas diferentes.
    //     E SÓ VALE QUANDO O PEDIDO NOMEIA UMA MARCA, não uma molécula. É a diferença entre
    //     "TRANSAMIN INJETAVEL" (a marca tem uma apresentação injetável só) e "DIPIRONA CPR"
    //     (a molécula existe em 500MG, 1G, ...). Contar as doses do banco não bastaria: o banco
    //     de hoje pode ter uma dose só e o de amanhã ter duas, e aí o MESMO pedido mudaria de
    //     resposta sozinho. O sinal de marca é estável: a palavra do pedido está no NOME do
    //     produto mas NÃO é o princípio ativo dele.
    if (formaSemDose && _bmDoses(prod).size > 0) {
      // ehMarca de duas formas: (1) a palavra do pedido está no NOME do candidato mas não é o
      // princípio ativo dele (TRANSAMIN); (2) o pedido só alcançou este candidato ATRAVÉS do
      // dicionário marca<->PA — e passar pelo dicionário já é a prova de que o pedido nomeou uma
      // marca, não a molécula ("PRECEDEX INJETAVEL" chegando na DEXMEDETOMIDINA).
      const _viaDic = _sinMol.length > 0 && _sinMol.some(s => _bmFuzzy(s, paN) || _bmFuzzy(s, prodN));
      _semDose.push({ c: c, ehMarca: (!_bmFuzzy(principal, paN) && _bmFuzzy(principal, prodN)) || _viaDic });
      return;
    }
    if (reqDoses.size && !_bmDoseEq(reqDoses, _bmDoses(prod))) {                              // DOSE (barreira dura)
      // 2ª chance: injetável reconstituído (pó) -> 40MG == 40MG/ML (mesmo produto). NÃO vale p/ solução (DIMORF 10MG != 10MG/ML)
      // 3ª chance: dose TOTAL do frasco == CONCENTRAÇÃO × VOLUME (oncológicos do 63622), só com o
      // mesmo volume declarado dos dois lados e a conta fechando exata.
      if (!(reqForma==='INJETAVEL' && _bmReconst(prod) && _bmDoseEqIgnMl(reqDoses, _bmDoses(prod)))
       && !_bmDoseTotalEqSemVol(reqDoses, _bmMl(linha), _bmDoses(prod), _bmMl(prod))
       // com o volume afrouxado (canal de alternativa), a pergunta passa a ser só "é a MESMA DOSE
       // TOTAL noutro frasco?" — 100MG em 20ML e 100MG em 50ML são a mesma quantidade de droga.
       // A dose continua tendo que fechar EXATA; o que se afrouxou foi o tamanho do frasco.
       && !(_rx.volume && _bmDoseTotKey(linha) === _bmDoseTotKey(prod))
       // NOTAÇÃO COLADA "A MG/B ML": a dose deixa de barrar, mas SÓ se for o MESMO FRASCO — os
       // dois lados declarando volume e o volume batendo. Dose diferente noutro frasco continua
       // produto diferente, e continua barrada. Isto nunca roda na busca normal: só quando o
       // canal de alternativa pede, e o resultado sai âmbar com a conta escrita no aviso.
       && !(_rx.notacao && (() => { const a = _bmMl(linha), b = _bmMl(prod);
              return a.size && b.size && [...a].some(v => b.has(v)); })())) return;
    }
    if (reqProp) { const cp2=_bmProp(prod); if (cp2 && cp2!==reqProp) return; }              // PROPORÇÃO N+N: 3+3 != 5+2 (barreira dos dois lados)
    // VOLUME (quando só há concentração). >>> RELAXADO EM 03/08 — era a MESMA doença do
    // _bmFormaCand: ausência tratada como divergência. O candidato cadastrado só pela massa
    // ("PACLITAXEL 100,2MG CX/1FRS BERGAMO TAXILAN", R$61,77) não declara volume nenhum, e era
    // barrado como se declarasse um volume DIFERENTE. Agora só barra quando o candidato DECLARA.
    // O caso que a barreira existe pra proteger continua protegido: em "ALCOOL 70% 1000ML" x
    // "ALCOOL 70% 50ML" os DOIS lados declaram, e a divergência barra como sempre.
    // A conta não fica solta: quem não declara volume ainda precisa fechar a dose total pela
    // regra concentração × volume (_bmDoseTotalEqSemVol), logo acima.
    if (!_rx.volume && reqVol && _bmVolume(prod) != null && reqVol !== _bmVolume(prod)) return;
    // VOLUME DA APRESENTAÇÃO (pedido de oncologia, 03/08) — a barreira acima usa _bmVolume, que
    // tem lookbehind e IGNORA "C/50ML" e "50MG/50ML" (a barra antes do número). Nesses formatos —
    // que são justamente como o pedido de onco e o banco escrevem — ela nunca agia, e a cisplatina
    // de 50MG/50ML ficava indistinguível da de 100MG/100ML: as duas viram 1MG/ML depois da
    // aritmética, e o que separa as apresentações passa a ser SÓ o volume do frasco.
    // Usa o CONJUNTO de volumes (_bmMl), e só barra quando os DOIS lados declaram e não há
    // nenhum volume em comum — candidato que não declara volume (o cadastro só pela massa total,
    // "OXALIPLATINA 100MG CX/1FRS") continua passando.
    if (reqSoConc && !_rx.volume) {
      const _vc = _bmMl(prod);
      // >>> QUANDO OS DOIS LADOS TÊM VOLUME DE APRESENTAÇÃO, A PERGUNTA É SÓ SOBRE ELE (10/08).
      //     Senão o "5" de "250MG/5ML" — que é dose por colher, não frasco — aparece nos dois
      //     conjuntos e SOZINHO satisfaz a interseção: foi assim que a suspensão de 60ML recebeu
      //     o frasco de 150ML. Quando um dos lados não declara apresentação (só concentração), a
      //     pergunta volta a ser a de antes, com os conjuntos crus: quem não declara não vota.
      const _ar = _bmMlApres(linha), _ac = _bmMlApres(prod);
      const _r = (_ar.size && _ac.size) ? _ar : reqMl;
      const _c = (_ar.size && _ac.size) ? _ac : _vc;
      if (_r.size && _c.size && ![..._r].some(v => _c.has(v))) return;
    }
    if (_bmNegConflito(linha, prod)) return;                                                 // com/sem conflitante (s/clor vs c/cloranfenicol)
    // VASOCONSTRITOR (23526): anestésico local COM vaso != SEM vaso — só age com marcador
    // explícito nos DOIS lados e principal anestésico (lidocaína/xylestesin/hypocaina...).
    // NOVABUPI/LEVOBUPIVACAINA entraram em 03/08: o pedido cirúrgico pede "NOVABUPI COM VASO" e
    // recebia "NOVABUPI 0,5% S/V" — a versão SEM vasoconstritor. A guarda existia e não agia
    // porque a marca não estava nesta lista de anestésicos. Com vaso e sem vaso são procedimentos
    // diferentes; oferecer um pelo outro é erro clínico, não diferença de preço.
    if (/lidocaina|xylestesin|xilestesin|hypocaina|bupivacaina|levobupivacaina|novabupi|mepivacaina|prilocaina|articaina|anestesic/i.test(linha + ' ' + prod + ' ' + pa)) {
      const vReq2 = _bmVaso(linha), vCand = _bmVaso(prod);
      if (vReq2 && vCand && vReq2 !== vCand) return;
    }
    if (reqInsu !== undefined) {                                                             // INSULINA: subtipo tem que bater (NPH != Lispro...)
      const ci = _bmInsulinaSub(prod);
      if (ci === undefined) return;                                                          // pedido é insulina, candidato não é
      if (reqInsu !== 'generica' && ci !== reqInsu) return;                                  // subtipo diferente
    }
    let sc = 0;
    if (_bmTemSub(subAlvo, paN) || _bmTemSub(subAlvo, prodN)) sc += 5;   // casou pela substância do CMED (mais confiável que só a marca no nome)
    if (paN.startsWith(principal) || prodN.startsWith(principal) || (subAlvo && (paN.startsWith(subAlvo) || prodN.startsWith(subAlvo)))) sc += 3;
    for (let i=1;i<pal.length;i++){ if(paN.includes(pal[i])) sc+=2; if(prodN.includes(pal[i])) sc+=1; }
    cands.push({c, sc});
  });
  // ── OS ADIADOS: "pedido sem dose" só é ambíguo se houver MAIS DE UMA dose possível ────────────
  // Medido, não presumido: se todos os candidatos que sobraram (mesmo PA, mesma forma) têm a
  // MESMA dose, o pedido sem dose identifica um produto só e casa. Duas doses diferentes = o
  // pedido é ambíguo de verdade e continua sem match — que era o motivo da regra existir.
  // Só entra quando NÃO houve candidato normal: quem trouxe dose declarada sempre tem prioridade.
  if (!cands.length && _semDose.length) {
    // >>> O VOLUME DO PEDIDO É UM DISCRIMINADOR, e estava sendo ignorado aqui. "CIPROFLOXACINO
    //     INJETAVEL 100 ML" e "HEPARINA INJETAVEL SODICA 5 ML" não trazem dose, mas trazem o
    //     FRASCO — e é ele que separa o cipro de 100ML do de 200ML, e a heparina de 5ML da
    //     subcutânea de 0,25ML (Hemofol). Sem este filtro, tudo virava "ambíguo" e o item saía
    //     sem match tendo o produto certo no banco.
    let pool = _semDose, filtrouPorVolume = false;
    if (reqMlTodos.size) {
      // SÓ quem declara o volume pedido. Aqui o pedido não deu dose NENHUMA — o frasco é a única
      // coisa que ele disse, então candidato que não declara volume não tem como ser conferido e
      // vira ruído que quebra a unanimidade da dose.
      // >>> E se ninguém sobrar, sobra NADA — não se volta pro pool inteiro. Cair de volta era o
      //     bug: o pedido de 100ML acabava recebendo o frasco de 200ML, e o de 5ML recebia a
      //     ampola subcutânea de 0,25ML. Pedido que diz o frasco quer AQUELE frasco.
      pool = pool.filter(x => { const v = _bmMl(x.c.produto||'');
        return v.size && [...reqMlTodos].some(w => v.has(w)); });
      filtrouPorVolume = true;
    }
    // O FILTRO DE VOLUME VEM ANTES DA PERGUNTA "é marca?" — e a ordem importa. Checando o pool
    // inteiro, um irmão de OUTRO frasco (o cipro de 200ML, cadastrado com o PA no campo próprio)
    // derrubava a regra e o item saía sem match mesmo com o frasco certo no banco.
    // E quando o pedido DECLARA o volume, ele já disse qual frasco quer: aí a exigência de "ser
    // marca" não é mais necessária — o volume é o discriminador, e a dose total logo abaixo
    // continua tendo que ser unânime.
    if (!filtrouPorVolume && !pool.every(x => x.ehMarca)) pool = [];
    if (pool.length) {
      // AMBIGUIDADE MEDIDA PELA DOSE TOTAL, não pelo texto da dose: "200MG em 100ML" e "2MG/ML em
      // 100ML" são o MESMO produto escrito de dois jeitos (2 × 100 = 200). Comparar as strings
      // faria o motor achar que há duas forças diferentes e recusar por ambiguidade inexistente.
      // >>> QUANDO O PEDIDO DÁ SÓ O VOLUME, "5000UI" e "5000UI/ML" NO MESMO FRASCO SÃO A MESMA
      //     COISA. Medido no banco: as 9 heparinas de 5ML custam de R$17 a R$27 e 7 delas escrevem
      //     "5000UI/ML" enquanto 2 escrevem "5000UI" — inclusive o MESMO PARINEX, cadastrado das
      //     duas formas por fornecedores diferentes. Não são duas forças: é a marca do "por
      //     mililitro" que um cadastro escreve e o outro omite.
      //     O RISCO, declarado: um produto que fosse mesmo "5000UI no frasco inteiro de 5ML"
      //     (1000UI/ML) seria confundido. Isso só vale AQUI, no caminho em que o pedido não
      //     declarou dose nenhuma e o volume bate exato — nunca na barreira de dose, que continua
      //     comparando "/ML" e massa absoluta como coisas diferentes.
      // DUAS LEITURAS, e basta UMA delas ser unânime pra não haver ambiguidade:
      //   total  — concentração × volume ("200MG em 100ML" == "2MG/ML em 100ML" == 200MG). É o que
      //            resolve o ciprofloxacino, cadastrado ora pela massa, ora pela concentração.
      //   rotulo — o número como está escrito, ignorando o "/ML" ("5000UI" == "5000UI/ML"). É o
      //            que resolve a heparina, onde o MESMO PARINEX aparece das duas formas.
      const kTotal  = x => _bmDoseTotKey(x.c.produto||'');
      const kRotulo = x => [..._bmDoses(x.c.produto||'')].map(d => d.replace(/\/ML$/, '')).sort().join('|');
      const unanime = k => { const k0 = k(pool[0]); return pool.every(x => k(x) === k0); };
      if (unanime(kTotal) || unanime(kRotulo)) {
        const u = pool.map(x => x.c).sort((a,b)=> (ehGlobalComEstoque(b)-ehGlobalComEstoque(a)) || (_velha(a) - _velha(b)) || (_super(a) - _super(b)) || (pv(a) - pv(b)));
        if (_col) u.forEach(c => _col.push(c));
        return u[0];
      }
    }
  }
  if (!cands.length) return null;
  cands.sort((a,b)=> (ehGlobalComEstoque(b.c)-ehGlobalComEstoque(a.c)) || (_velha(a.c) - _velha(b.c)) || (_super(a.c) - _super(b.c)) || (b.sc - a.sc) || (pv(a.c) - pv(b.c)));  // GLOBAL c/ estoque 1º
  if (_col) cands.forEach(x => _col.push(x.c));
  // ── DESEMPATE POR PREÇO ENTRE APRESENTAÇÕES IDÊNTICAS (decisão do Lemuel, 03/08) ─────────────
  // O score mede RELEVÂNCIA DE TEXTO — quantas palavras do pedido aparecem no candidato. Entre
  // produtos DIFERENTES isso é o critério certo. Entre o MESMO produto escrito de dois jeitos,
  // não é: foi assim que a cisplatina 50MG/50ML saiu a R$278,66 (FAULDCISPLA) tendo a de
  // R$144,79 (BLAU C-PLATIN) no banco, com a MESMA dose e o MESMO volume. Quem escreve o nome
  // mais parecido com o pedido não é quem vende mais barato.
  // Então: mesma tripla (dose + volume) = mesmo produto = ganha o MAIS BARATO. Tripla diferente =
  // são produtos diferentes e o score continua mandando. GLOBAL com estoque segue na frente.
  const _trip = c => [..._bmDoses(c.produto||'')].sort().join('|') + '#' + [..._bmMl(c.produto||'')].sort().join('|');
  const _top = cands[0], _kTop = _trip(_top.c), _gTop = ehGlobalComEstoque(_top.c);
  let _melhor = _top.c;
  // A_541: o desempate por preço só vale dentro da MESMA faixa (atual/velha) e da MESMA classe (Supermédica ou não) do 1º: senão desfaz a ordem estoque→Supermédica→atual→velho.
  cands.forEach(x => { if (ehGlobalComEstoque(x.c) === _gTop && _velha(x.c) === _velha(_top.c) && _super(x.c) === _super(_top.c) && _trip(x.c) === _kTop && pv(x.c) < pv(_melhor)) _melhor = x.c; });
  return _melhor;
}

// ─── SCORE DE CONFIANÇA (FASE 3) — mesmos critérios adversariais da auditoria ───────────
// Marca match AUTOMÁTICO (lista/IA) como alta/media/baixa. media/baixa -> ⚠️ CONFERIR na tela e
// TRAVA o PDF até o vendedor confirmar. Match escolhido À MÃO (addItem) já entra alta.
// SINAIS FORTES (baixa): (a) família/subtipo divergente, (c) preço foge >3x da mediana dos peers.
// SINAL MÉDIO (media): (d) dose/volume só num lado; (b+e) poucas palavras em comum / casou só pela marca.
let _confPeerIdx=null;
function _confPeerGrupos(){
  const cs=(typeof cotacoes!=='undefined'?cotacoes:[]);
  if(_confPeerIdx&&_confPeerIdx.base===cs&&_confPeerIdx.n===cs.length) return _confPeerIdx.m;
  const m=new Map();
  for(const x of cs){ if(ehGlobal(x)) continue;
    const k=_pePaNorm(x.principio_ativo||x.produto)+'|'+_peDoseKey(x.produto)+'|'+((_bmForma(x.produto))||'?');
    let a=m.get(k); if(!a){a=[];m.set(k,a);} a.push(x); }
  _confPeerIdx={base:cs,n:cs.length,m}; return m;
}
function _confPeerMediana(c){
  const pk=_pePaNorm(c.principio_ativo||c.produto), dk=_peDoseKey(c.produto), f=(typeof _bmForma==='function'?_bmForma(c.produto):null)||'?';
  if(pk.length<3||!dk) return null;
  const key=pk+'|'+dk+'|'+f;
  const ps=(_confPeerGrupos().get(key)||[]).map(x=>pv(x)).filter(v=>v>0); // B_619: indice por chave (linhas; pv na hora); antes varria o catalogo inteiro por candidato
  if(ps.length<3) return null;
  ps.sort((a,b)=>a-b); const m=ps.length>>1; return ps.length%2?ps[m]:(ps[m-1]+ps[m])/2;
}
function _bmConfianca(pedido, c){
  if(!c || !pedido) return {nivel:'alta', motivos:[]};
  // CAMADA 1 (29/07): casou por EAN = identificação perfeita. Nível ALTA com o motivo 'EAN'
  // explícito, pra dar pra distinguir na tela o que veio de código do que veio de texto.
  const _e = _bmEanDoTexto(pedido);
  if (_e && c.ean && String(c.ean).trim() === _e) return { nivel:'alta', motivos:['casou por EAN '+_e] };
  const cp=c.produto||'', pa=c.principio_ativo||''; const motivos=[]; let forte=false, medio=false;
  // (a) família/subtipo divergente
  const FAMS=[_BM_FAM_SUBTIPO,_BM_FAM_MATERIAL,_BM_FAM_IDADE,_BM_FAM_TESTE,_BM_FAM_ANALITO];
  if(FAMS.some(f=>_bmDiscorda(pedido,cp,f))){ motivos.push('subtipo/família diferente do pedido'); forte=true; }
  // (c) preço foge >3x da mediana dos peers do mesmo grupo
  const med=_confPeerMediana(c); if(med){ const p=pv(c); if(p>0 && (p/med>3||med/p>3)){ motivos.push('preço '+(p>med?(p/med).toFixed(1)+'x acima':(med/p).toFixed(1)+'x abaixo')+' da mediana'); forte=true; } }
  // (d) dose/volume só num lado
  const dq=_bmDoses(pedido).size>0, dc=_bmDoses(cp).size>0;
  if(dq!==dc){ motivos.push('dose só '+(dq?'no pedido':'no item escolhido')); medio=true; }
  // (b)+(e) poucas palavras em comum / casou só pela marca (dicionário)
  const wq=_bmPalavras(pedido); const wc=new Set([..._bmPalavras(cp),..._bmPalavras(pa)]);
  const inter=wq.filter(w=>wc.has(w));
  const principal=wq[0], paN=_bmNorm(pa), prodN=_bmNorm(cp);
  const soMarca=!!principal && _bmCmed.has(principal) && !paN.includes(principal) && !prodN.includes(principal);
  if(wq.length>=2 && inter.length<=1){ motivos.push(soMarca?'casou pela marca (dicionário)':'poucas palavras em comum'); medio=true; }
  // ── ÁRBITRO CMED (FASE 2, 23/07): o dicionário oficial decide quando conhece a marca do
  // pedido. Substância do pedido (via _bmCmed) INCOMPATÍVEL com o PA/nome do candidato ->
  // BAIXA na hora (a trava do PDF que já existe segura; aviso ⚠ visível, nunca bloqueio mudo).
  // Compatível -> aprova: remove o rebaixamento "casou pela marca" (o árbitro confirma o match).
  const subArb = principal ? (_bmCmed.get(principal)||null) : null;
  if (subArb) {
    const subOk = _bmTemSub(subArb, paN) || _bmTemSub(subArb, prodN)
               || paN.includes(subArb) || prodN.includes(subArb)
               || subArb.split(' ').some(t=>t.length>=5 && (paN.includes(t)||prodN.includes(t)));
    if (!subOk) { motivos.push('CMED: substâncias divergem — pedido é '+subArb.toLowerCase()+', item escolhido não é'); forte=true; }
    else {
      const iSo = motivos.indexOf('casou pela marca (dicionário)');
      if (iSo>=0) { motivos.splice(iSo,1); if(!motivos.length) medio=false; }   // árbitro aprovou: marca->substância confirmada
    }
  }
  const nivel = forte ? 'baixa' : (medio ? 'media' : 'alta');
  return {nivel, motivos};
}
/* ═══ DUAS PORTAS, NÃO TRÊS — mesmo molde do commit 2d81526 (C_023, globalmed_sistema_final.html,
   11/09/2026), aplicado aqui (A_064, 15/09/2026). ORDEM DO DONO: *"'confiança média' e tal, acho
   isso ruim [...] é a máquina falando DE SI MESMA, não do produto. Some."*
   >>> A tela só fala DOIS estados: casou (linha limpa) ou dúvida (motivo em português, sobre o
       PRODUTO). A palavra "média"/"baixa" nunca chega aos olhos de uma pessoa.
   >>> AS FAIXAS (nivel alta/media/baixa) CONTINUAM POR DENTRO — decidem quem trava o PDF
       (_itensAConferir, _portaoQualidade). O que muda aqui é só o texto que a pessoa lê.
   >>> LISTA DE CALAR, NÃO DE PERMITIR: motivo que não bate com nenhuma regra de tradução PASSA
       CRU (texto do motor) — nunca some em silêncio (lição 23/33). */
var _CONF_MUDOS = [
  /confian[çc]a m[ée]dia/i,          // a máquina medindo a si mesma
  /poucas palavras em comum/i,       // idem
  /casou pela marca/i                // "(dicionário)" é vocabulário de dentro
];
var _CONF_PT = [
  [/^subtipo\/fam[íi]lia diferente do pedido$/i, 'é outro tipo de produto — confira'],
  [/^pre[çc]o (.+) da mediana$/i,                'preço $1 do que os outros cobram'],
  [/^dose s[óo] no pedido$/i,                    'o cliente disse a dose · este item não diz qual é'],
  [/^dose s[óo] no item escolhido$/i,            'este item tem dose · o cliente não disse qual'],
  [/^CMED: subst[âa]ncias divergem — pedido é (.+), item escolhido não [ée]$/i,
                                                 'cliente pediu $1 · este item não tem $1'],
  [/^dose n[ãa]o existe na CMED p\/ esta marca — existem: (.+)$/i,
                                                 'a dose pedida não existe nesta marca · existem: $1']
];
// Motivos crus (_conf.motivos) -> dúvidas em português, sobre o produto. [] = casou.
function _confMotivosPt(motivos){
  var crus = (motivos && motivos.length) ? motivos : [];
  var fora = [];
  for (var i = 0; i < crus.length; i++){
    var m = String(crus[i] == null ? '' : crus[i]).trim();
    if (!m) continue;
    if (_CONF_MUDOS.some(function(r){ return r.test(m); })) continue;   // a máquina falando de si
    var pt = m;
    for (var j = 0; j < _CONF_PT.length; j++){
      if (_CONF_PT[j][0].test(m)) { pt = m.replace(_CONF_PT[j][0], _CONF_PT[j][1]); break; }
    }
    fora.push(pt);   // não bateu com nenhuma regra -> passa cru (de propósito)
  }
  return fora;
}
// Casou (linha limpa) ou dúvida (motivo em português)? Só dúvida trava/mostra CONFERIR na tela —
// as faixas (nivel) continuam decidindo por dentro quem entra em _itensAConferir.
function _confEhDuvida(c){
  return !!(c && c._conf && c._conf.nivel !== 'alta' && _confMotivosPt(c._conf.motivos).length > 0);
}
// ── QUEM É "ESTE ITEM" NA TELA É A LINHA, NÃO O PRODUTO (54618, 11/08) ───────────────────────
// Todo manipulador daqui pra baixo recebe o `_lid` — a identidade da LINHA. Antes recebiam o id
// da COTAÇÃO, e isso só funcionava enquanto duas linhas do mesmo produto eram impossíveis. Com o
// pedido de três linhas de ciprofloxacino, o id da cotação passa a apontar pras três ao mesmo
// tempo: editar o preço de uma mudaria a outra, e remover apagaria todas.
// O id da cotação continua existindo no item (`i.id`) e continua sendo usado onde ele É o assunto
// — esgotar no banco, comparar com uma alternativa, gravar a proposta.
function _itemPorLid(lid){ return itens.find(i => i._lid === lid); }
// confirma um match sinalizado (destrava aquele item p/ o PDF)
function confirmarMatch(lid){ const it=_itemPorLid(lid); if(it){ it._confOK=true; renderItens(); } }
// ── ACEITAR / RECUSAR A ALTERNATIVA ──────────────────────────────────────────────────────────
// Aceitar tira o âmbar e GRAVA o de-para no dicionário do banco — é assim que ele evolui: o que
// o vendedor confirmou uma vez o motor já sabe da próxima. Recusar tira o item da proposta e o
// devolve pra lista de não encontrados, que é de onde ele vai pra fila de cotação.
function aceitarAlternativa(lid){
  const it = _itemPorLid(lid); if (!it) return;
  const pedido = it._pedido, oferta = it.produto;
  it._alt = null; it._altAceita = true; renderItens();
  // o log só reforça o dicionário; se falhar, a decisão do vendedor na tela continua valendo
  try {
    fetch(`${SUPA_URL}/rest/v1/dicionario_marca_pa?on_conflict=tipo,de,para`, { method:'POST',
      headers:{ 'apikey':SUPA_KEY, 'Authorization':'Bearer '+SUPA_KEY, 'Content-Type':'application/json',
                'Prefer':'resolution=merge-duplicates' },
      body: JSON.stringify([{ tipo:'marca', de:String(pedido||'').slice(0,120),
        para:String(oferta||'').slice(0,120), aviso:null, origem:'aceite do vendedor na tela' }])
    }).catch(()=>{});
  } catch(e){}
  toast('Alternativa aceita — o de-para foi aprendido');
}
function recusarAlternativa(lid){
  const it = _itemPorLid(lid); if (!it) return;
  const pedido = it._pedido || it.produto;
  itens = itens.filter(i => i._lid !== lid);
  if (typeof naoEncontrados !== 'undefined' && naoEncontrados.indexOf(pedido) < 0) naoEncontrados.push(pedido);
  renderItens(); calcTotal();
  if (typeof renderNaoEncontrados === 'function') renderNaoEncontrados();
  toast('Alternativa recusada — item voltou pra lista de não encontrados', 'error');
}

// ── FASE 3 do árbitro CMED (23/07): VALIDAÇÃO DE DOSE. Pedido com MARCA conhecida + dose que
// NÃO existe na CMED pra aquela marca ("VENVANSE 40MG") = provável erro de digitação do cliente
// -> rebaixa a confiança (alta->media) com o aviso "existem: 30/50/70MG". Async (consulta
// cmed_pf com cache por marca), roda DEPOIS do add: anexa motivo e re-renderiza. Nunca bloqueia.
var _doseCmedCache = {};
async function _bmDoseCmedCheck(item, pedido){
  try{
    const wq = _bmPalavras(pedido||''); const principal = wq[0];
    if (!principal || !_bmCmed.has(principal)) return;                 // só age quando a MARCA é conhecida
    const dosePed = doseKey(pedido||''); if (!dosePed) return;         // sem dose no pedido: nada a validar
    let doses = _doseCmedCache[principal];
    if (!doses) {
      const r = await fetch(`${SUPA_URL}/rest/v1/cmed_pf?select=dose_key&marca_norm=ilike.${encodeURIComponent(principal.toUpperCase()+'*')}&limit=400`, { headers: H });
      const d = await r.json();
      doses = [...new Set((Array.isArray(d)?d:[]).map(x=>x.dose_key).filter(Boolean))];
      _doseCmedCache[principal] = doses;
    }
    if (!doses.length) return;                                         // marca sem linha na cmed_pf: não opina
    const massa = k => String(k||'').split('+')[0];                    // compara pela 1ª massa (30MG de "30MG+..." etc)
    const existe = doses.some(k => massa(k) === massa(dosePed));
    if (!existe) {
      const lista = [...new Set(doses.map(massa))].slice(0,8).join(' / ');
      const it = _itemPorLid(item._lid); if (!it || it._confOK) return;   // a LINHA que pediu, não outra do mesmo produto
      it._conf = it._conf || { nivel:'alta', motivos:[] };
      it._conf.motivos.push('dose não existe na CMED p/ esta marca — existem: '+lista);
      if (it._conf.nivel === 'alta') it._conf.nivel = 'media';         // trava do PDF que já existe segura
      renderItens();
    }
  }catch(e){ /* silencioso: validação é bônus, nunca trava o fluxo */ }
}

/* ==MOTOR-B-END== */
  global.MotorBusca = {
    buscarMelhorProduto: buscarMelhorProduto,
    _bmConfianca: _bmConfianca,
    _bmMaterial: _bmMaterial,
    _bmMatchMat: _bmMatchMat,
    _bmForma: _bmForma,
    _bmDoses: _bmDoses,
    ehGlobalComEstoque: ehGlobalComEstoque,
    incluiNaBusca: incluiNaBusca,
    pv: pv,
    margemSugerida: margemSugerida,
    _bmClasseFam: _bmClasseFam,
    /* A_493: os robôs e as ferramentas alimentam o motor por aqui; preço de fornecedor com mais de 60 dias nem entra (uma regra só: limedtec-cotacao-vencida.js) */
    /* B_621: esgotado (e GLOBAL sem estoque) tambem nao entra: a MESMA decisao da tela (limedtec-visivel.js, motivoInvisivel), sem copia */
    setCotacoes: function (a) { cotacoes = (a || []).filter(function (c) { if (LT_VENCIDA && LT_VENCIDA.ehMorta(c)) return false; var m = _LTV.motivoInvisivel(c); return !(m === 'esgotado' || m === 'global_sem_estoque' || m === 'proibido_pelo_dono'); }); },
    setCmed: function (m) { _bmCmed = m || new Map(); },
    _bmMl: _bmMl,
    _bmMlApres: _bmMlApres,
    _bmVolume: _bmVolume,
    // ── A REGRA DE EMBALAGEM, EXPOSTA (A_058, 10/09/2026) ────────────────────────────────────
    // "quantas unidades vêm na caixa, E EU SEI DISSO?" é a pergunta que separa o fato do chute, e
    // quem precisava dela do lado de fora era o PEDIDO DE COMPRA (globalmed_sistema_final.html):
    // ele escrevia "UN" para o item provado unitário e para o item que ninguém declarou — a mesma
    // palavra para as duas coisas, no papel com que o dono compra. A alternativa era copiar a
    // regra para o outro arquivo, e duas cópias da mesma regra divergem no primeiro caso novo.
    _packInfo: _packInfo,
    // ── AS BARREIRAS, EXPOSTAS (06/08) ───────────────────────────────────────────────────────
    // Quem compara DUPLICATAS decidia por semelhança de nome e preço, enquanto a busca já sabia
    // separar calibre, via, subtipo e dose. Sem estas linhas, "chamar a barreira que já existe"
    // era impossível de fora do motor e a única saída era reescrever a regra — que é como se
    // criam duas cópias que discordam. Uso: tools/lib_barreiras.js.
    _bmDiscrim: _bmDiscrim,
    _bmDiscrimConflito: _bmDiscrimConflito,
    _bmVia: _bmVia,
    _bmViaOk: _bmViaOk,
    _bmViaConflito: _bmViaConflito,
    _bmVariante: _bmVariante,
    _bmVarianteConflito: _bmVarianteConflito,
    _bmCalibre: _bmCalibre,
    _bmSubstantivo: _bmSubstantivo,
    _bmPalRel: _bmPalRel,
    _bmTamanhos: _bmTamanhos,
    _bmCm: _bmCm,
    _bmNormF: _bmNormF,
    _sMaterial: _sMaterial,
    // dicionário marca<->PA do banco: as ferramentas de node carregam por aqui (a tela usa o
    // carregarDicMarcaPa(), que não vive dentro do motor). Aceita as linhas cruas da tabela.
    setDic: function (rows) {
      var d = new Map(), av = new Map(), pc = new Map();
      function par(a, b) { var na = _bmNorm(a), nb = _bmNorm(b); if (!na || !nb) return;
        if (!d.has(na)) d.set(na, []); if (!d.has(nb)) d.set(nb, []);
        if (d.get(na).indexOf(nb) < 0) d.get(na).push(nb);
        if (d.get(nb).indexOf(na) < 0) d.get(nb).push(na); }
      (rows || []).forEach(function (x) { par(x.de, x.para);
        if (x.aviso) { av.set(_bmNorm(x.de), x.aviso); av.set(_bmNorm(x.para), x.aviso); }
        if (x.tipo === 'palavra') { var de = _bmNorm(x.de), pa = _bmNorm(x.para);
          if (de && pa && de.indexOf(' ') < 0 && pa.indexOf(' ') < 0 && !pc.has(de)) pc.set(de, pa); } });
      _bmDic = d; _bmDicAviso = av; _bmPalCanon = pc;
    },
    _bmDicAvisoDe: _bmDicAvisoDe,
    // liga/desliga o indice de candidatos — usado pela prova de equivalencia, que roda os DOIS
    // caminhos no mesmo processo e compara resultado a resultado
    setIndice: function (on) { _bmIdxOff = !on; _bmIdx = null; },
    _bmIdxCandidatos: _bmIdxCandidatos,
    setClasseB: function (a) { var src = (a instanceof Set) ? [].concat.apply([], [Array.from(a)]) : (a || []); _bmClasseB = new Set(src.map(function (m) { return _bmNorm(String(m)); }).filter(function (m) { return m && m.length >= 4; })); },
    getCotacoes: function () { return cotacoes; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
