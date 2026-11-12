/* LIMEDTEC — "COTAÇÃO VENCIDA": A REGRA, NUM LUGAR SÓ. Peça de MOLDE (A_493, ordem do dono 26/10/2026:
   "tira do sistema de cotação o que tem mais de 3 meses e coloca um botão para solicitar nova cotação").
   Só cálculo, sem rede, sem gravar nada: vencida é ESTADO calculado e reversível (renovou o preço, volta).
   Por linha (item E fornecedor), pela data da PRÓPRIA linha: `data`, senão `created_at` (a mesma data do
   robô, tools/bionexo_preco_velho.cjs). A_500 (decisão 197, 27/10/2026): vale 60 DIAS CORRIDOS (era 3 meses):
   hoje 27/10/2026 → vence o que é ANTERIOR a 28/08/2026; 60 dias exatos ainda vale (59 e 60 valem, 61 vence). Sem data (ou data inválida): NÃO inventa idade —
   devolve semData e a tela mostra como pendência. GLOBAL (fornecedor '1') nunca vence: somos nós. */
(function (raiz) {
  'use strict';
  const DIAS = 60;
  /* A_540 (decisão 265, 06/11/2026): preço de 61 a LIMITE_VENCIDA_DIAS dias NÃO some: cota por ÚLTIMO, com MKP_VENCIDA (55%) no lugar do 32%.
     LIMITE_VENCIDA_DIAS = 180 é PROVISÓRIO (CEO, reversível, um número só, até o dono dizer se quer limite). Passou do limite: não cota. Atualizou a data: volta ao MKP normal. */
  const MKP_VENCIDA = 1.55;
  const LIMITE_VENCIDA_DIAS = 180;
  /* A_541: aceita também DD/MM/AAAA (32 linhas vinham assim e eram lidas como "sem data": nunca venciam). */
  const dataDe = (c) => {
    let d = String((c && (c.data || c.created_at)) || '').trim();
    const br = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(d);
    d = br ? br[3] + '-' + br[2] + '-' + br[1] : d.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    const t = new Date(Date.parse(d + 'T00:00:00Z'));
    return !isNaN(t) && t.toISOString().slice(0, 10) === d ? d : null;
  };
  const hojePadrao = () => new Date().toISOString().slice(0, 10);
  function limiteVencida(hoje) {   // `hoje` menos 60 dias corridos (AAAA-MM-DD); o que for anterior a isto é vencida
    return new Date(Date.parse((hoje || hojePadrao()) + 'T00:00:00Z') - DIAS * 86400000).toISOString().slice(0, 10);
  }
  function ehVencida(c, hoje) {
    if (!c) return { vencida: false, semData: false, data: null };
    const glob = String(c.tipo || '').toLowerCase() === 'global' || String(c.fornecedor == null ? '' : c.fornecedor).trim() === '1';
    const d = dataDe(c);
    if (glob) return { vencida: false, semData: false, data: d };
    if (!d) return { vencida: false, semData: true, data: null };
    return { vencida: d < limiteVencida(hoje), semData: false, data: d };
  }
  function limiteMorta(hoje) { return new Date(Date.parse((hoje || hojePadrao()) + 'T00:00:00Z') - LIMITE_VENCIDA_DIAS * 86400000).toISOString().slice(0, 10); }
  /* A_540: faixa do preço: 'atual' (<=60d, GLOBAL, sem data) | 'velha' (61..180d: cota por último a 55%) | 'morta' (>180d: não cota) */
  function faixa(c, hoje) {
    const v = ehVencida(c, hoje);
    if (!v.vencida) return 'atual';
    return v.data < limiteMorta(hoje) ? 'morta' : 'velha';
  }
  const ehVelhaCotavel = (c, hoje) => faixa(c, hoje) === 'velha';
  const ehMorta = (c, hoje) => faixa(c, hoje) === 'morta';
  /* O MKP que a linha usa. markup_venda preenchido à mão vence tudo; senão velha = 55%; senão `normal` (o 32% da casa). */
  /* A_544 (decisão 265, 09/11/2026): markup_venda NOT NULL default 1,32 (kit_cliente/ddl/04_markup_e_view_vendedor.sql:26) — toda linha vem com 1,32 carimbado
     pela coluna, não por escolha. Na faixa velha, 1,32 = "sem markup à mão"; qualquer outro valor > 0 continua sendo escolha à mão e vence. */
  const MKP_PADRAO_CARIMBADO = 1.32;
  function markupAMao(c, hoje) {
    const m = parseFloat(c && c.markup_venda);
    if (!(m > 0)) return 0;
    if (Math.abs(m - MKP_PADRAO_CARIMBADO) < 1e-9 && ehVelhaCotavel(c, hoje)) return 0;
    return m;
  }
  function mkpDe(c, normal, hoje) {
    const m = markupAMao(c, hoje);
    if (m > 0) return m;
    return ehVelhaCotavel(c, hoje) ? MKP_VENCIDA : normal;
  }
  /* A_541 (decisão 265): a ORDEM de escolha mora aqui: estoque GLOBAL -> Supermédica (fornecedor 2) -> mais barato -> atualizados -> velho a 55%.
     ehSupermedica: 0 = é a Supermédica, 1 = não é (chave de ordenação; a motor_busca aplica DEPOIS da chave de velha, então Supermédica velha perde para qualquer atual). */
  const SUPERMEDICA_ID = '2';
  const ehSupermedica = (c) => String((c && c.fornecedor != null) ? c.fornecedor : '').trim() === SUPERMEDICA_ID || /super\s*m[eé]dica/i.test(String((c && (c.fornecedor_nome || c.fornecedor)) || '')) ? 0 : 1;
  /* A_566 (dono, 11/11): todo custo de fornecedor mostra do lado a data em que ele veio (foi importado). UMA função só; a data é da PRÓPRIA linha (data, senão created_at). Sem data: "data não registrada", nunca inventada. */
  function rotuloImportado(c) {
    const d = dataDe(c);
    return d ? 'importado em ' + d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(2, 4) : 'data não registrada';
  }
  const NOTA_PRECO_ANTIGO = 'preço antigo, reconfirmar com o fornecedor';
  const API = { DIAS, MKP_VENCIDA, LIMITE_VENCIDA_DIAS, MKP_PADRAO_CARIMBADO, markupAMao, NOTA_PRECO_ANTIGO, SUPERMEDICA_ID, ehSupermedica, dataDe, rotuloImportado, limiteVencida, limiteMorta, ehVencida, faixa, ehVelhaCotavel, ehMorta, mkpDe };
  raiz.LT_COTACAO_VENCIDA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
