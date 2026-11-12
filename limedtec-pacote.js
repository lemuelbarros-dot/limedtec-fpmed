/* LIMEDTEC — GUARDA DE PACOTE (decisao 207, desenho secao 8.3).  Molde puro: nao conhece cliente.
 * O cliente so abre o que comprou. A pagina chama no topo  LTPACOTE.exigePacote('dashboard')  e,
 * sem o pacote, e mandada de volta ANTES de desenhar qualquer coisa (vale tambem pelo endereco direto).
 * Pacotes: sistema · dashboard · financeiro · robos · whatsapp.  Config do cliente: pacotes: 'todos' | [..].
 * >>> Config SEM `pacotes` = 'todos' (cliente que ja roda hoje nao pode perder tela). Config com lista
 *     VAZIA = nada liberado. Passo 5 (ligar nas demais paginas) vem depois.
 */
(function (raiz) {
  'use strict';
  function lista(cfg) {
    var p = cfg && cfg.pacotes;
    if (p == null || p === 'todos') return 'todos';
    return Array.isArray(p) ? p.map(String) : [];
  }
  function tem(nome, cfg) {
    var l = lista(cfg === undefined ? raiz.LIMEDTEC_CLIENTE : cfg);
    return l === 'todos' || l.indexOf(String(nome)) >= 0;
  }
  function exigePacote(nome, opc) {
    opc = opc || {};
    if (tem(nome, opc.cfg)) return true;
    var doc = opc.doc || raiz.document, loc = opc.loc || raiz.location;
    if (doc && doc.documentElement) doc.documentElement.style.display = 'none';
    if (loc && loc.replace) loc.replace(opc.destino || 'limedtec.html');
    return false;
  }
  var API = { tem: tem, lista: lista, exigePacote: exigePacote };
  raiz.LTPACOTE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
