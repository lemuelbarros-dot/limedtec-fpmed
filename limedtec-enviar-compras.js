/* LIMEDTEC — "ENVIAR PARA COMPRAS": o botão e o clique, NUM LUGAR SÓ. Peça de MOLDE (F_073, decisão 207).
   Molde é a GlobalMed: as telas Bionexo e Apoio usavam cada uma a sua cópia deste trecho. A regra do pedido
   continua em bionexo-compras.js (BXCOMPRAS); aqui mora só o botão e o que acontece quando se clica nele. */
var LTCOMPRAS = (function () {
  function podeCotacao(c, BXCOMPRAS) { return c.itens.some(function (i) { return BXCOMPRAS.podeEnviar(i.estado); }); }
  function botao(cotId, pode, esc) { return pode ? '<button type="button" class="b-compras" data-cot="' + esc(cotId) + '">Enviar para Compras</button>' : ''; }
  function ehBotao(ev) { return !!(ev.target.closest && ev.target.closest('.b-compras')); }
  // ctx: { todas, origem, BXCOMPRAS, vigente, aviso, confirma, fetch, url, headers }
  async function clique(ev, ctx) {
    var b = ev.target.closest && ev.target.closest('.b-compras'); if (!b) return false;
    var id = b.getAttribute('data-cot'), itens = ctx.todas.filter(function (r) { return String(r.bionexo_id) === id; });
    var n = itens.filter(function (r) { return ctx.BXCOMPRAS.podeEnviar(r.estado); }).length;
    var confirma = ctx.confirma; if (!confirma('Enviar a cotação ' + id + ' (' + n + ' itens em negociação ou ganhos) para Compras?')) return true;
    b.disabled = true;
    var res = await ctx.BXCOMPRAS.envia({ id: id, itens: itens, origem: ctx.origem }, ctx.vigente, ctx.fetch, ctx.url, ctx.headers);
    ctx.aviso(res.msg, !res.ok && !res.jaEnviada); b.disabled = false; if (res.ok) b.textContent = 'Enviada ✓';
    return true;
  }
  return { podeCotacao: podeCotacao, botao: botao, ehBotao: ehBotao, clique: clique };
})();
if (typeof module !== 'undefined') module.exports = LTCOMPRAS;
