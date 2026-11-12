/* A_513 (28/10/2026): PEÇA ÚNICA da busca de cotações no servidor (nasceu na A_512, dentro da Cotação).
   Cotação e Comparativo chamam esta mesma função — ⛔ não escreva segunda busca.
   Entrada: lista de termos; cada termo precisa aparecer em produto | principio_ativo | marca (E entre termos).
   - Cotação passa os termos separados ("dipirona 500"); Comparativo passa a frase inteira como UM termo
     (é a regra que ele sempre teve: a frase aparece num dos três campos).
   - Falha de rede/HTTP LANÇA erro: "não achei" só pode sair de resposta 200 vazia (lição 23).
   - `cortada` = bateu no teto; a tela avisa, não finge que mostrou tudo. */
(function (raiz) {
  'use strict';
  var CAMPOS = ['produto', 'principio_ativo', 'marca'];
  var TETO_PADRAO = 300;

  function limpaTermo(t) { return String(t == null ? '' : t).toLowerCase().replace(/[,()*%\\"]/g, '').trim(); }

  // devolve o pedaço `and=(...)` da consulta, ou '' se não sobrou termo
  function montaFiltro(termos) {
    var lim = (termos || []).map(limpaTermo).filter(Boolean);
    if (!lim.length) return '';
    return 'and=(' + lim.map(function (t) {
      return 'or(' + CAMPOS.map(function (f) { return f + '.ilike.*' + encodeURIComponent(t) + '*'; }).join(',') + ')';
    }).join(',') + ')';
  }

  // opts: { url, key, tabela, termos, teto, headers, fetchFn }
  async function buscaCotacoesServidor(opts) {
    var filtro = montaFiltro(opts.termos);
    if (!filtro) return { linhas: [], cortada: false };
    var teto = opts.teto || TETO_PADRAO;
    var f = opts.fetchFn || (typeof fetch !== 'undefined' ? fetch : null);
    if (!f) throw new Error('sem fetch');
    var h = opts.headers || { 'apikey': opts.key, 'Authorization': 'Bearer ' + opts.key };
    var r = await f(opts.url + '/rest/v1/' + (opts.tabela || 'cotacoes') + '?select=*&' + filtro + '&order=id&limit=' + teto, { headers: h });
    if (!r.ok) throw new Error('HTTP ' + r.status);               // status antes do corpo (lição 23)
    var d = await r.json();
    if (!Array.isArray(d)) throw new Error('resposta inesperada');
    return { linhas: d, cortada: d.length >= teto };
  }

  var api = { buscaCotacoesServidor: buscaCotacoesServidor, montaFiltro: montaFiltro, TETO_PADRAO: TETO_PADRAO };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.GMBuscaCotacoes = api;
})(typeof window !== 'undefined' ? window : globalThis);
