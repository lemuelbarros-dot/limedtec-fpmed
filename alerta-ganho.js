/* F_101: alerta de cotacao GANHA (Bionexo/Apoio). Uma regra, um lugar: o PC (tools/f101_alerta_ganho.cjs) e as telas usam este arquivo.
   So le. Nao muda robo nem estado. Ganho = estado 'ganha' (so entra no banco do login do dono, decisao 248). */
(function (raiz, fab) { if (typeof module === 'object' && module.exports) module.exports = fab(); else raiz.ALERTAGANHO = fab(); })(this, function () {
  function chave(origem, r) { return origem + ':' + r.bionexo_id + ':' + (r.estado_em || ''); }
  // linhas: respostas do banco; avisados: array de chaves ja avisadas. Devolve ganhos novos, 1 por cotacao (bionexo_id).
  function novosGanhos(origem, linhas, avisados) {
    var ja = new Set(avisados || []), vistos = new Set(), out = [];
    (linhas || []).forEach(function (r) {
      if (!r || r.estado !== 'ganha') return;
      var k = chave(origem, r), c = origem + ':' + r.bionexo_id;
      if (ja.has(k) || vistos.has(c)) return; vistos.add(c); out.push({ chave: k, origem: origem, id: r.bionexo_id, hospital: r.comprador || r.hospital || '', valor: r.total || null, em: r.estado_em || null });
    });
    return out;
  }
  // Tela: pisca o titulo + selo GANHOU ate clicar no selo (grava as chaves como avisadas).
  function ligaNaTela(origem, linhas, doc, store) {
    var LS = 'f101_avisados', av = []; try { av = JSON.parse(store.getItem(LS) || '[]'); } catch (e) {}
    var novos = novosGanhos(origem, linhas, av); var sel = doc.getElementById('f101-selo');
    if (!novos.length) { if (sel) sel.remove(); return novos; }
    var base = doc.title.replace(/^🔔 GANHOU[^|]*\| /, '');
    if (!sel) { sel = doc.createElement('div'); sel.id = 'f101-selo'; sel.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99999;background:#16a34a;color:#fff;padding:10px 16px;border-radius:8px;font:700 15px sans-serif;cursor:pointer;box-shadow:0 2px 10px #0006'; doc.body.appendChild(sel); }
    sel.textContent = '🔔 GANHOU ' + novos.length + ' — clique para dar ciente';
    var on = false; if (doc.defaultView._f101t) clearInterval(doc.defaultView._f101t);
    doc.defaultView._f101t = doc.defaultView.setInterval(function () { on = !on; doc.title = on ? '🔔 GANHOU ' + novos.length + ' | ' + base : base; }, 800);
    sel.onclick = function () { try { store.setItem(LS, JSON.stringify(av.concat(novos.map(function (n) { return n.chave; })))); } catch (e) {} clearInterval(doc.defaultView._f101t); doc.title = base; sel.remove(); };
    return novos;
  }
  // F_101b: o ganho vira tarefa em 'tarefas' (widget Minhas tarefas, ja pisca em toda tela). Prefixo fixo = chave de idempotencia por cotacao.
  function prefixoTarefa(n) { return 'GANHOU cotação ' + n.id + ' —'; }
  function tarefaDeGanho(n, email) {
    var v = n.valor == null ? '' : ' — R$ ' + Number(n.valor).toFixed(2).replace('.', ',');
    return { para_email: email, criada_por: email, prioridade: true, texto: prefixoTarefa(n) + ' ' + (n.hospital || '?') + v + ' → enviar para Compras' };
  }
  // F_101c: destinatarios = dono + quem tem admin_financeiro (papel gestor_geral ou permissao no perfil) (Isadora, decisao 226). Nunca e-mail no codigo.
  function destinatarios(perfis, dono) {
    var out = [dono], extra = 0;
    (perfis || []).forEach(function (p) {
      if (!p || !p.email || p.ativo === false) return;
      if (!(p.papel === 'gestor_geral' || (p.permissoes && p.permissoes.admin_financeiro === true))) return; // mesma regra do limedtec-papeis.js
      var e = String(p.email).toLowerCase(); if (out.some(function (x) { return String(x).toLowerCase() === e; })) return; out.push(p.email); extra++;
    });
    return { emails: out, achouOutro: extra > 0 };
  }
  // 1 tarefa por pessoa, idempotente por (prefixo + destinatario). Falha de uma pessoa nao impede as outras; falha do dono sobe.
  async function tarefasDoGanho(n, dono, perfis, io) {
    var d = destinatarios(perfis, dono), feitas = 0, falhas = [];
    if (!d.achouOutro) io.avisa('GlobalMed: sem gestora cadastrada', 'Nao achei perfil com permissao admin_financeiro alem do dono. So o dono recebeu a tarefa do ganho ' + n.id + '.');
    for (var i = 0; i < d.emails.length; i++) {
      try { if (await io.existe(d.emails[i], prefixoTarefa(n))) continue; await io.insere(tarefaDeGanho(n, d.emails[i])); feitas++; } catch (e) { falhas.push(d.emails[i]); }
    }
    if (falhas.indexOf(dono) >= 0) throw new Error('tarefa do dono falhou');
    return { feitas: feitas, falhas: falhas };
  }
  return { destinatarios: destinatarios, tarefasDoGanho: tarefasDoGanho, prefixoTarefa: prefixoTarefa, tarefaDeGanho: tarefaDeGanho, novosGanhos: novosGanhos, ligaNaTela: ligaNaTela, chave: chave };
});
