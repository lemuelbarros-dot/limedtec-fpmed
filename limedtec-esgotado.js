/* ═══════════════════════════════════════════════════════════════════════════════════════════
   LIMEDTEC — "ESGOTOU NO FORNECEDOR": A REGRA, NUM LUGAR SÓ.  Peça de MOLDE.
   Escrita em 13/08/2026, a pedido do dono ("reaproveite a mesma função; não duplique" — L10).

   >>> POR QUE ELA SAIU DE DENTRO DA TELA. O "Esgotou" nasceu em 22/07 dentro da Cotação, colado
       no botão. Agora a tela de PEDIDOS POR FORNECEDOR precisa do MESMO comportamento: o
       comprador liga, o fornecedor diz "não tenho", e o preço dele tem que parar de aparecer nas
       próximas cotações. Copiar a regra pra segunda tela é o começo de duas regras — e duas
       regras que decidem se um preço aparece ou não um dia discordam, em silêncio, sobre dinheiro.

   >>> A SEMÂNTICA, E ELA É DE 22/07 (não muda aqui):
           estoque = 0 EXPLÍCITO ....... "esgotado marcado"  -> FORA da busca
           estoque = null ou '' ........ "não informado"     -> entra como sempre
       Por isso desfazer é voltar pra `null`, e não pra zero. É a mesma normalização que se fez em
       22/07 nos 6 fornecedores que tinham 0 acidental de import antigo (0 -> null), justamente
       pra não sumirem sem ninguém ter marcado.

   >>> ESGOTADO É ESTADO, NÃO DELEÇÃO. A cotação e o `compra_unit` ficam intactos: some da busca,
       não do banco. Nada aqui apaga linha nenhuma.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  const norm = (s) => String(s == null ? '' : s).toLowerCase()
    .replace(/^[\s+>*#]+/, '').replace(/\s+/g, ' ').trim();

  const API = {
    /* ═══ A_504 — FORNECEDOR 100% ESGOTADO "SOME" DAS LISTAS (decisão 194, 27/10/2026) ═══════
       >>> Dono: "STOCK MED essa pode zerar tudo e sumir com ela da ai". SUMIR NÃO É APAGAR: a
           linha e o cadastro ficam no banco; só deixam de aparecer onde a vendedora ESCOLHE
           fornecedor. Regra única: esgotado = TEM linha em `cotacoes` e TODAS têm estoque 0
           explícito. Sem linha nenhuma (cadastro novo) NÃO é esgotado; uma linha null/''/>0
           já o mantém na tela. A tela passa `chave(c)` (o nome canônico), pra um fornecedor
           gravado ora por código ora por nome contar como UM só. */
    fornecedoresEsgotados(cotacoes, chave) {
      const g = new Map();
      (Array.isArray(cotacoes) ? cotacoes : []).forEach(c => {
        const k = norm(chave ? chave(c) : (c && c.fornecedor));
        if (!k) return;
        const r = g.get(k) || { n: 0, z: 0 };
        r.n++; if (API.ehEsgotado(c.estoque)) r.z++;
        g.set(k, r);
      });
      const out = new Set();
      g.forEach((r, k) => { if (r.n > 0 && r.z === r.n) out.add(k); });
      return out;
    },
    fornecedorEsgotado(esgotados, ...chaves) {
      if (!esgotados || !esgotados.size) return false;
      return chaves.some(k => { const n = norm(k); return !!n && esgotados.has(n); });
    },

    /* ── A LEITURA DO ESTADO ───────────────────────────────────────────────────────────────── */
    ehEsgotado(estoque) { return estoque === 0 || estoque === '0'; },
    naoInformado(estoque) { return estoque == null || estoque === ''; },

    /* ═══ QUAL LINHA DE `cotacoes` É ESTA LINHA DO PEDIDO? ═══════════════════════════════════
       >>> ESTA É A PARTE PERIGOSA DA ENTREGA, e por isso ela devolve uma LISTA em vez de uma
           resposta. O item do pedido guarda `produto`, `fornecedor` e `marca` — mas NÃO guarda o
           `id` da cotação de onde ele veio (conferido no `enviarParaCompras` da Cotação). E o
           mesmo fornecedor pode ter VÁRIAS linhas do mesmo produto: marcas diferentes, validades
           diferentes, importações diferentes.
       >>> ENTÃO "zerar o estoque daquele fornecedor pra aquele produto" pode ser ambíguo — e o
           jeito errado de resolver ambiguidade numa gravação de banco é escolher a primeira.
           Foi exatamente isso que quebrou a Cotação hoje (`.find()` devolvendo a primeira linha
           de duas com a mesma identidade), e ali era só a tela; aqui seria o banco.
       >>> A REGRA: com `cotacao_id`, é exata. Sem ele, casa por fornecedor + produto (+ marca, se
           houver), e QUEM CHAMA decide o que fazer com mais de uma. Nenhuma decisão é tomada aqui.
       >>> E O `cotacao_id` PASSOU A SER GRAVADO no envio pra Compras — pedido novo não cai mais
           neste caminho. O casamento existe pros pedidos que JÁ ESTÃO no banco sem ele. */
    candidatas(cotacoes, item) {
      const lista = Array.isArray(cotacoes) ? cotacoes : [];
      if (item && item.cotacao_id) {
        const exata = lista.filter(c => String(c.id) === String(item.cotacao_id));
        if (exata.length) return { modo: 'id', linhas: exata };
      }
      const alvoProd = norm(item && item.produto);
      const alvoForn = norm(item && item.fornecedor);
      if (!alvoProd || !alvoForn) return { modo: 'nome', linhas: [] };
      let linhas = lista.filter(c => {
        if (norm(c.fornecedor) !== alvoForn) return false;
        const np = norm(c.produto);
        return np === alvoProd || np.includes(alvoProd) || alvoProd.includes(np);
      });
      /* A marca só ESTREITA, nunca amplia: se ela desempata, ótimo; se não casar com nada, o
         desempate não existe e a ambiguidade continua — e continuar ambíguo é a resposta certa. */
      const marca = norm(item && item.marca);
      if (linhas.length > 1 && marca && marca !== '—') {
        const porMarca = linhas.filter(c => norm(c.marca) === marca);
        if (porMarca.length) linhas = porMarca;
      }
      return { modo: 'nome', linhas };
    },

    /* ═══ AS PERGUNTAS DE CONFIRMAÇÃO ═══════════════════════════════════════════════════════
       >>> O TEXTO É DA TELA, A CONTAGEM É DAQUI. Estoque PRÓPRIO (o nosso, que vem do SIAD) pede
           DUAS confirmações porque zerar ali apaga um saldo real até o próximo import; fornecedor
           externo pede UMA. Essa distinção é regra de negócio e vive aqui; a redação de cada tela
           fica na tela, porque a frase que faz sentido no orçamento do cliente não é a mesma que
           faz sentido no pedido de compra. */
    ehEstoqueProprio(c) {
      return String(c && c.fornecedor) === '1' || String(c && c.tipo).toLowerCase() === 'global';
    },

    /* ═══ AS DUAS GRAVAÇÕES ═════════════════════════════════════════════════════════════════
       >>> `estoque_em` VAI JUNTO NAS DUAS, e não é detalhe: quem zera na mão também carimba a
           data, senão a tela de Ofertas mostraria "sem data" pra um saldo mexido há dez segundos
           — pior que não ter data nenhuma. (Regra de 22/07, mantida.)
       >>> E O VALOR ANTERIOR VOLTA PRO CHAMADOR, porque sem ele o desfazer é uma mentira: hoje
           marcar esgotado APAGA o saldo que estava lá (50 vira 0), e desfazer só conseguiria
           devolver "não informado". Quem chama guarda o anterior e passa de volta no `restaura`. */
    async esgota(sbPatch, cotacao, agoraISO) {
      const antes = (cotacao && cotacao.estoque !== undefined) ? cotacao.estoque : null;
      await sbPatch('cotacoes', 'id=eq.' + cotacao.id, { estoque: 0, estoque_em: agoraISO });
      return antes;
    },
    async restaura(sbPatch, cotacaoId, valorAnterior, agoraISO) {
      /* Volta pro que era. Se o que era já era 0 (ou não se sabe), volta pra `null` — "não
         informado" — que é o estado que RE-ENTRA na busca. Devolver 0 seria desfazer nada. */
      const alvo = (valorAnterior === undefined || valorAnterior === null
        || valorAnterior === '' || valorAnterior === 0 || valorAnterior === '0')
        ? null : valorAnterior;
      await sbPatch('cotacoes', 'id=eq.' + cotacaoId, { estoque: alvo, estoque_em: agoraISO });
      return alvo;
    },
  };

  raiz.LT_ESGOTADO = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
