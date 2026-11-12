/* N96 (19/10/2026): "Enviar para Compras" da aba Bionexo.
   MESMO destino e MESMA forma de pedido do botão da Giovana (POST em pedidos_compra, status 'pendente',
   itens com qtd/venda_calculada) — a tela de Compras lê os dois sem saber a diferença.
   Diferença declarada: a Giovana monta o pedido a partir do orçamento aberto na tela dela (função presa
   no HTML dela, depende de itens/DOM); aqui o pedido nasce da cotação ganha. Não há custo nesta tabela
   (bionexo_respostas guarda o que OFERECEMOS). B_632 (27/10, urgente do dono): o custo agora vai — vem da linha de
   `cotacoes` do MESMO produto (item_nosso) e MESMO fornecedor, a mais nova (aplicaCustos); sem linha fica vazio (ausente ≠ zero).
   Referência: numero_orcamento = 'BIONEXO-<id>' — a trava contra envio duplicado. */
var BXCOMPRAS = (function () {
  function num(v) { return v == null || v === '' ? null : Number(v); }
  // 20/10 dono: 'enviada' = aba "Em negociação" da Bionexo; libera o botão para ele ir atrás do fornecedor. Perdida e vazio: não.
  function podeEnviar(estado) { return estado === 'ganha' || estado === 'resgatada' || estado === 'enviada'; }
  function rotuloEstado(estado) {
    return { ganha: 'ganhamos', perdida: 'perdemos', resgatada: 'pedido resgatado', enviada: 'em negociação', sem_pedido: 'não ganhamos (sem pedido)' }[estado] || 'não sei ainda';
  }
  // B_648 (28/10, CEO): a Bionexo só confirma ganha (API traz só CONFIRMED); perda = ausência. Estado DERIVADO na tela (CHECK intocado, nada gravado):
  // enviada + respondida há 3+ dias + sem pedido = 'sem_pedido'. É dedução, não leitura do portal; não é 'perdida'. Sem data: não decide.
  function semPedido(r, agora, dias) {
    if (!r || r.estado !== 'enviada' || !r.respondida_em) return false;
    var t = Date.parse(r.respondida_em); if (isNaN(t)) return false;
    return (agora == null ? Date.now() : agora) - t >= (dias || 3) * 86400000;
  }
  var AVISO_QTD = 'quantidade não gravada — enviado 1 cx, conferir com o pedido do portal';
  // P14 (21/10): uma função para os dois portais; origem 'BIONEXO' (padrão) ou 'APOIO' decide prefixo e vendedora.
  function ref(id, origem) { return (origem || 'BIONEXO') + '-' + id; }
  function nomeOrigem(origem) { return origem === 'APOIO' ? 'Apoio' : 'Bionexo'; }
  // A_525 (03/11, dono): "Enviar para Compras" leva TODA a negociacao. Campo ausente vira "nao informado" (nunca vazio calado).
  var CAMPOS_NEGOCIACAO = ['prazo_entrega_dias', 'pagamento_dias', 'frete', 'pedido_minimo', 'validade_proposta', 'local_entrega', 'cnpj_faturamento', 'comprador', 'contato_nome', 'contato_telefone', 'contato_email', 'confirmado_em', 'aceito_por'];
  function vazio(v) { return v == null || v === ''; }
  function primeiro(rows, f) { for (var i = 0; i < rows.length; i++) { var v = f(rows[i]); if (!vazio(v)) return v; } return null; }
  function negociacao(rows) {
    var ex = function (r) { return (r && r.negociacao && typeof r.negociacao === 'object') ? r.negociacao : {}; };
    var col = function (c, k) { return primeiro(rows, function (r) { return vazio(r[c]) ? ex(r)[k || c] : r[c]; }); };
    var n = {
      prazo_entrega_dias: col('prazo_entrega_dias'), pagamento_dias: col('pagamento_dias'), frete: col('frete'), pedido_minimo: col('pedido_minimo'),
      validade_proposta: col('validade', 'validade_proposta'), cnpj_faturamento: col('cnpj_comprador', 'cnpj_faturamento'), comprador: col('comprador'),
      local_entrega: primeiro(rows, function (r) { return ex(r).local_entrega; }),
      contato_nome: primeiro(rows, function (r) { return ex(r).contato_nome; }),
      contato_telefone: primeiro(rows, function (r) { return ex(r).contato_telefone; }),
      contato_email: primeiro(rows, function (r) { return ex(r).contato_email; }),
      confirmado_em: primeiro(rows, function (r) { return ex(r).confirmado_em; }),
      aceito_por: primeiro(rows, function (r) { return ex(r).aceito_por; })
    };
    n.nao_informado = CAMPOS_NEGOCIACAO.filter(function (k) { return vazio(n[k]); });
    return n;
  }
  // cot = { id, itens:[linhas de bionexo_respostas], comprador }; vigente = função da tela (valor corrigido vale).
  function montaPedido(cot, vigente) {
    var itens = (cot.itens || []).filter(function (r) { return podeEnviar(r.estado); }).map(function (r) {
      var v = vigente(r), q = num(r.quantidade);
      var it = {
        solicitado: r.item_pedido, produto: r.item_nosso || r.item_pedido, und: r.unidade || null,
        qtd: q, venda_calculada: v.unit, fornecedor: r.fornecedor || 'a buscar' /* 19/10 dono: saber de onde é o fornecedor; 20/10: sem fornecedor = o dono vai buscar */, marca: '—',
        bionexo_id: r.bionexo_id
      };
      if (r.negociacao && !vazio(r.negociacao.fabricante)) it.marca = String(r.negociacao.fabricante); // A_525: fabricante lido no portal
      // N101 (dono 19/10): sem quantidade gravada vai 1 caixa + aviso para o comprador conferir. Preço nunca se inventa.
      if (q == null) { it.qtd = 1; it.und = 'CX'; it.observacao = AVISO_QTD; }
      return it;
    });
    var p0 = (cot.itens || [])[0] || {};
    var corpo = {
      numero_orcamento: ref(cot.id, cot.origem), cliente: p0.comprador || nomeOrigem(cot.origem) + ' ' + cot.id,
      vendedora: nomeOrigem(cot.origem) + ' (robô)', status: 'pendente', itens: itens
    };
    // B_635 (decisão 195): CNPJ do cliente vai em todo pedido; coluna cnpj_cliente (aditiva), pois clientes não casa.
    var cnpj = (cot.itens || []).map(function (r) { return r.cnpj_comprador; }).filter(Boolean)[0];
    if (cnpj) corpo.cnpj_cliente = String(cnpj).trim();
    corpo.negociacao = negociacao(cot.itens || []); // A_525
    return corpo;
  }
  // B_632: custo de compra. linhas = cotacoes {produto,fornecedor,compra_unit,data}. Mesmas contas da tela de Compras (_pedResumo).
  function chave(p, f) { return String(p || '').trim().toLowerCase() + '|' + String(f || '').trim().toLowerCase(); }
  // B_633: UMA regra de "esgotado/vencida" — a dos módulos da casa (mesmo shim do motor_busca.js); sem segunda cópia.
  var LTE = (typeof LT_ESGOTADO !== 'undefined' && LT_ESGOTADO) || (typeof require === 'function' ? require('./limedtec-esgotado.js') : null);
  var LTV = (typeof LT_COTACAO_VENCIDA !== 'undefined' && LT_COTACAO_VENCIDA) || (typeof require === 'function' ? require('./limedtec-cotacao-vencida.js') : null);
  function ehGlobal(l) { return String(l.tipo || '').toLowerCase() === 'global' || String(l.fornecedor == null ? '' : l.fornecedor).trim() === '1'; }
  // A_540 (decisao 265): 'vale' = nao esgotada e nao MORTA (>180d). Preco de 61-180d vale, mas so quando nao ha atualizado (ver atuaisSePuder).
  function vale(l) { return !(LTE && LTE.ehEsgotado(l.estoque)) && !(LTV && LTV.ehMorta(l)); }
  function velha(l) { return !!(LTV && LTV.ehVelhaCotavel(l)); }
  function atuaisSePuder(ls) { var a = ls.filter(function (l) { return !velha(l); }); return a.length ? a : ls; }
  function maisNovos(ls) {
    var data = ls.reduce(function (m, l) { return String(l.data || '') > m ? String(l.data || '') : m; }, '');
    return ls.filter(function (l) { return String(l.data || '') === data; });
  }
  function nota(it, t) { it.observacao = (it.observacao ? it.observacao + ' · ' : '') + t; }
  // B_636: sem linha de nome igual, PERGUNTA ao motor (buscaEquiv = escolherPorMotor da casa; nao ha segundo casador aqui).
  // Linha sem data vale (mesma regra da tela: ehVencida.semData = false). Esgotada/vencida/GLOBAL nunca entra.
  function equivalente(it, buscaEquiv) {
    if (typeof buscaEquiv !== 'function') return false;
    var m = null; try { m = buscaEquiv(it.produto, it); } catch (e) { m = null; }
    if (!m || !(num(m.compra_unit) > 0) || ehGlobal(m) || !vale(m)) return false;
    var forn0 = it.fornecedor;
    // a nota antiga 'nenhum outro com estoque, comprador vai buscar' deixou de ser verdade
    it.observacao = String(it.observacao || '').split(' · ').filter(function (x) { return !/comprador vai buscar/.test(x); }).join(' · ') || undefined; if (it.observacao === undefined) delete it.observacao;
    it.fornecedor = m.fornecedor; it.compra_unit = num(m.compra_unit);
    if (it.venda_calculada > 0) it.mkp_item = Math.round((it.venda_calculada - it.compra_unit) / it.compra_unit * 10000) / 100;
    nota(it, 'equivalente: ' + m.produto + (forn0 && forn0 !== 'a buscar' ? ' (em vez de ' + forn0 + ')' : ''));
    return true;
  }
  function aplicaCustos(itens, linhas, buscaEquiv) {
    var por = {}, porProd = {}, glob = {};
    (linhas || []).forEach(function (l) {
      if (ehGlobal(l) && vale(l)) glob[chave(l.produto, '')] = true; // A_525: o produto existe no estoque GLOBAL
      if (!(num(l.compra_unit) > 0) || ehGlobal(l)) return; // a GLOBAL somos nós: não existe "custo nosso" dela
      (por[chave(l.produto, l.fornecedor)] = por[chave(l.produto, l.fornecedor)] || []).push(l);
      (porProd[chave(l.produto, '')] = porProd[chave(l.produto, '')] || []).push(l);
    });
    itens.forEach(function (it) {
      if (glob[chave(it.produto, '')]) { // A_525 + decisao 19: item do estoque GLOBAL nao tem "nosso custo" nem fornecedor de fora
        it.fornecedor = 'GLOBALMED (estoque)'; delete it.compra_unit; delete it.mkp_item; return;
      }
      var ls = por[chave(it.produto, it.fornecedor)], bons = atuaisSePuder((ls || []).filter(vale));
      if (ls && !bons.length) { // fornecedor gravado esgotado/vencido: procura o mesmo produto em quem tem
        var forn0 = it.fornecedor, alt = atuaisSePuder((porProd[chave(it.produto, '')] || []).filter(function (l) { return vale(l) && chave('', l.fornecedor) !== chave('', forn0); }));
        if (!alt.length) { if (equivalente(it, buscaEquiv)) return; it.fornecedor = 'a buscar'; delete it.compra_unit; delete it.mkp_item; nota(it, 'fornecedor esgotado: ' + forn0 + ' — nenhum outro com estoque, comprador vai buscar'); return; }
        var menor = Math.min.apply(null, alt.map(function (l) { return num(l.compra_unit); }));
        var esc = alt.filter(function (l) { return num(l.compra_unit) === menor; })[0];
        it.fornecedor = esc.fornecedor; nota(it, 'fornecedor trocado: ' + forn0 + ' esgotado');
        bons = alt.filter(function (l) { return chave('', l.fornecedor) === chave('', esc.fornecedor); });
      }
      // A_540: o fornecedor gravado so tem preco velho (61-180d) e OUTRO fornecedor tem preco atualizado -> o atualizado vem na frente (a ordem da decisao 265)
      if (bons.length && bons.every(velha)) { var forn1 = it.fornecedor, atual = (porProd[chave(it.produto, '')] || []).filter(function (l) { return vale(l) && !velha(l) && chave('', l.fornecedor) !== chave('', forn1); }); if (atual.length) { var m1 = Math.min.apply(null, atual.map(function (l) { return num(l.compra_unit); })); var e1 = atual.filter(function (l) { return num(l.compra_unit) === m1; })[0]; it.fornecedor = e1.fornecedor; nota(it, 'fornecedor trocado: ' + forn1 + ' com preço antigo'); bons = atual.filter(function (l) { return chave('', l.fornecedor) === chave('', e1.fornecedor); }); } }
      if (!bons.length) { if (equivalente(it, buscaEquiv)) return; nota(it, 'custo não encontrado'); return; }
      var custos = maisNovos(bons).map(function (l) { return num(l.compra_unit); });
      if (bons.every(velha)) nota(it, LTV.NOTA_PRECO_ANTIGO); // A_540: so tem preco de 61-180d -> Compras reconfirma com o fornecedor
      it.compra_unit = Math.min.apply(null, custos);
      if (custos.some(function (c) { return c !== custos[0]; })) nota(it, 'conferir: mais de um custo na cotação, usei o menor');
      if (it.venda_calculada > 0) it.mkp_item = Math.round((it.venda_calculada - it.compra_unit) / it.compra_unit * 10000) / 100;
    });
    return itens;
  }
  // Mesmas contas de _pedTotalCompraParaBanco / _pedMkpParaBanco: nulo quando nenhum item tem custo.
  function totais(itens) {
    var ct = 0, cm = 0, vm = 0, algum = false;
    itens.forEach(function (i) {
      var cu = num(i.compra_unit) || 0, q = num(i.qtd) || 0, vu = num(i.venda_calculada) || 0;
      if (cu > 0) { algum = true; ct += cu * q; }
      if (cu > 0 && vu > 0) { cm += cu * q; vm += vu * q; }
    });
    return { total_compra: algum ? ct : null, mkp_medio: cm > 0 ? parseFloat(((vm - cm) / cm * 100).toFixed(2)) : null };
  }
  async function buscaCustos(itens, f, url, H) {
    var nomes = Array.from(new Set(itens.map(function (i) { return i.produto; }))), linhas = [];
    for (var k = 0; k < nomes.length; k += 30) {
      var lote = nomes.slice(k, k + 30).map(function (n) { return '"' + String(n).split('\\').join('\\\\').split('"').join('\\"') + '"'; }).join(',');
      var r = await f(url + '/rest/v1/cotacoes?select=produto,fornecedor,compra_unit,data,estoque,tipo&compra_unit=gt.0&produto=in.(' + encodeURIComponent(lote) + ')', { headers: H, cache: 'no-store' });
      if (!r.ok) throw new Error('custos HTTP ' + r.status);
      linhas = linhas.concat(await r.json());
    }
    return linhas;
  }
  // f = fetch (já com o crachá), url = base do banco, H = headers. Devolve {ok, msg}. Erro vira aviso, nunca sucesso (decisão 30).
  async function envia(cot, vigente, f, url, H) {
    var corpo = montaPedido(cot, vigente);
    if (!corpo.itens.length) return { ok: false, msg: 'Nenhum item em negociação ou ganho nesta cotação.' };
    var sem = corpo.itens.filter(function (i) { return i.venda_calculada == null; });
    if (sem.length) return { ok: false, msg: sem.length + ' item(ns) sem preço gravado — não enviei.' };
    try {
      try { aplicaCustos(corpo.itens, await buscaCustos(corpo.itens, f, url, H)); var t0 = totais(corpo.itens); corpo.total_compra = t0.total_compra; corpo.mkp_medio = t0.mkp_medio; }
      catch (e) { /* sem custo o pedido ainda sai; itens ficam sem compra_unit */ }
      var dup = await f(url + '/rest/v1/pedidos_compra?numero_orcamento=eq.' + encodeURIComponent(corpo.numero_orcamento) + '&select=id&limit=1', { headers: H, cache: 'no-store' });
      if (!dup.ok) return { ok: false, msg: 'Não consegui conferir se já foi enviada (HTTP ' + dup.status + '). Não enviei.' };
      var d = await dup.json();
      if (d && d.length) return { ok: false, jaEnviada: true, msg: 'Esta cotação já foi enviada para Compras.' };
      var h2 = {}; Object.keys(H).forEach(function (k) { h2[k] = H[k]; }); h2['Content-Type'] = 'application/json'; h2['Prefer'] = 'return=minimal';
      var r = await f(url + '/rest/v1/pedidos_compra', { method: 'POST', headers: h2, body: JSON.stringify(corpo) });
      if (!r.ok) { var t = ''; try { t = await r.text(); } catch (e) {} return { ok: false, msg: 'Compras recusou (HTTP ' + r.status + '): ' + t.slice(0, 120) }; }
      var nq = corpo.itens.filter(function (i) { return i.observacao; }).length;
      return { ok: true, msg: 'Enviada para Compras.' + (nq ? ' ' + nq + ' item(ns) sem quantidade foram com 1 cx — o comprador vai conferir.' : '') };
    } catch (e) { return { ok: false, msg: 'Sem conexão: ' + e.message }; }
  }
  return { podeEnviar: podeEnviar, rotuloEstado: rotuloEstado, semPedido: semPedido, montaPedido: montaPedido, negociacao: negociacao, aplicaCustos: aplicaCustos, totais: totais, envia: envia, ref: ref };
})();
if (typeof module !== 'undefined') module.exports = BXCOMPRAS;
