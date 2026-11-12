/* LIMEDTEC — LUPA: buscar pelo código da cotação (bionexo_id). Peça de MOLDE (F_088), usada pelas telas Bionexo e Apoio.
   Filtra o que já está na tela; se não achar, pergunta ao banco (a lista vem limitada) e diz em palavra de gente. */
var LTBUSCA = (function () {
  function limpa(t) { return String(t == null ? '' : t).replace(/\D/g, ''); }
  function filtra(rows, termo) {
    var t = limpa(termo); if (!t) return rows;
    return rows.filter(function (r) { return String(r.bionexo_id).indexOf(t) !== -1; });
  }
  function campo() { return '<label class="busca-cot">🔍 <input type="search" id="f-busca" inputmode="numeric" placeholder="código da cotação" autocomplete="off"></label>'; }
  // ctx: { fetch, url, headers, tabela } -> { achou: bool, rows: [], erro: bool }
  async function noBanco(termo, ctx) {
    var t = limpa(termo); if (!t) return { achou: false, rows: [], erro: false };
    try {
      var r = await ctx.fetch(ctx.url + '/rest/v1/' + ctx.tabela + '?select=*&bionexo_id=eq.' + encodeURIComponent(t) + '&limit=500', { headers: ctx.headers, cache: 'no-store' });
      if (!r.ok) return { achou: false, rows: [], erro: true };
      var c = await r.json(); c = Array.isArray(c) ? c : [];
      return { achou: c.length > 0, rows: c, erro: false };
    } catch (e) { return { achou: false, rows: [], erro: true }; }
  }
  function msgNaoAchou(termo, erro) {
    return erro ? 'Não consegui consultar o banco agora para a cotação ' + limpa(termo) + '. Tente de novo; isto não quer dizer que ela não exista.'
      : 'A cotação ' + limpa(termo) + ' não está no sistema.';
  }
  return { limpa: limpa, filtra: filtra, campo: campo, noBanco: noBanco, msgNaoAchou: msgNaoAchou };
})();
if (typeof module !== 'undefined') module.exports = LTBUSCA;
