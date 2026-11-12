/* LIMEDTEC — PAPEIS E PERMISSOES.  Molde puro: nao conhece nenhum cliente nem nenhuma pessoa.
 *
 * TRES PAPEIS (definidos pelo dono do produto):
 *   vendedor      cria cotacao/proposta, busca, gera PDF. NAO ve custo/margem.
 *   gerente       tudo do vendedor + custo/margem + paineis + cadastros. Permissoes AJUSTAVEIS.
 *   gestor_geral  tudo, mais usuarios, configuracoes, licenca e imports.
 *   dono_produto  (LIMEDTEC Central) — ve licenca/versao/saude/contagem de TODOS os clientes,
 *                 e NENHUM dado comercial de nenhum. Ver COMPLIANCE.md.
 *
 * >>> ESTE ARQUIVO NAO E A SEGURANCA. Ele decide o que a TELA mostra. Quem impede o vendedor de
 *     ler custo e a RLS do Postgres — porque esconder um botao nao impede ninguem de abrir o F12
 *     e chamar a REST na mao. Os dois existem e fazem coisas diferentes:
 *         RLS  = o vendedor NAO CONSEGUE ler o custo.
 *         aqui = o vendedor nao VE um campo vazio e um botao que daria erro.
 *     Se um dia os dois discordarem, quem manda e a RLS. Esta e a ordem certa de confiar.
 *
 * >>> SEM PAPEL = NEGADO. Nunca "acesso total por omissao". Mesmo principio do banco() sem
 *     valor-padrao em limedtec-config.js: uma instalacao incompleta tem que parar, nao liberar.
 *     O modo de falha que isso evita e o pior de todos — o que parece que funcionou.
 */
(function (raiz) {
  'use strict';

  // A LISTA DE CHAVES. Nomear a permissao pelo que ela LIBERA, nao pela tela onde ela aparece:
  // tela muda de nome, permissao nao.
  var CHAVES = [
    'cotar',            // criar/editar cotacao e proposta
    'gerar_documento',  // PDF/proposta pro cliente final
    'ver_custo',        // preco de compra e margem   <<< a linha que separa vendedor de gerente
    'ver_paineis',      // paineis e relatorios financeiros
    'cadastrar',        // produto e fornecedor
    'importar',         // imports de tabela de fornecedor
    'gerir_usuarios',   // criar, trocar papel, desativar
    'configurar',       // configuracoes do cliente e licenca
    'admin_financeiro', // abrir o financeiro e mandar WhatsApp em massa (quem administra o caixa)
  ];

  // O PADRAO DE CADA PAPEL. O gerente e o unico ajustavel — por isso os toggles so valem pra ele.
  var PADRAO = {
    vendedor:     { cotar: true, gerar_documento: true },
    gerente:      { cotar: true, gerar_documento: true, ver_custo: true, ver_paineis: true, cadastrar: true },
    gestor_geral: { cotar: true, gerar_documento: true, ver_custo: true, ver_paineis: true,
                    cadastrar: true, importar: true, gerir_usuarios: true, configurar: true, admin_financeiro: true },
    // o dono do produto NAO cota e NAO ve custo de ninguem: ele opera a Central, nao a operacao
    // do cliente. Ver a tabela no COMPLIANCE.md.
    dono_produto: { ver_paineis: true },
  };

  // ── TETO DE DESCONTO POR PAPEL (19/08) ──────────────────────────────────────────────────────
  // Ordem do dono, palavra dele: *"bloqueia para dar apenas 5% de desconto; abaixo disso e so com
  // a minha autorizacao"*. O numero mora AQUI, colado no papel, e NAO na tela — a tela de Cotacao
  // tem TRES portas de desconto (geral, por item, preco digitado a mao) e uma constante na tela
  // vira tres constantes que envelhecem em ritmos diferentes. Um lugar, uma verdade.
  //
  // >>> SEM TETO E' DE CHAVE, NAO DE PAPEL. Quem autoriza e' quem tem `gerir_usuarios`, e quem
  //     autoriza nao pede autorizacao a si mesmo. Perguntando pela CHAVE (e nao por
  //     "papel === gestor_geral") a regra continua certa no dia em que nascer um quarto papel.
  //
  // >>> SEM PAPEL = O MAIS APERTADO, nunca "sem teto por omissao". E a mesma lei do `pode()` logo
  //     abaixo: instalacao incompleta tem que PARAR, nao liberar. Errar apertado devolve uma
  //     mensagem que a pessoa le e resolve; errar solto vira desconto que ninguem autorizou.
  var TETO_DESCONTO = { vendedor: 5, gerente: 8 };
  var TETO_SEM_PAPEL = 5;

  // perfil -> { pct, semTeto, papel, confirmado }.  `pct` e Infinity quando nao ha teto: assim
  // quem usa isso escreve `Math.min(teto.pct, x)` sem um `if` de excecao em cada porta.
  function tetoDesconto(perfil) {
    var r = permissoes(perfil);
    if (!r.ok) return { pct: TETO_SEM_PAPEL, semTeto: false, papel: null, confirmado: false, motivo: r.motivo };
    if (r.pode.gerir_usuarios) return { pct: Infinity, semTeto: true, papel: r.papel, confirmado: true, motivo: '' };
    var t = TETO_DESCONTO[r.papel];
    return { pct: (typeof t === 'number' ? t : TETO_SEM_PAPEL), semTeto: false,
      papel: r.papel, confirmado: true, motivo: '' };
  }

  function papeis() { return Object.keys(PADRAO); }
  function chaves() { return CHAVES.slice(); }

  // perfil: { papel, ativo, permissoes } — vem da tabela do cliente, nunca do codigo.
  function permissoes(perfil) {
    var p = perfil || {};
    if (!p.papel || !PADRAO[p.papel]) {
      return { ok: false, motivo: p.papel ? ('papel desconhecido: ' + p.papel) : 'sem papel definido',
        pode: {} };
    }
    if (p.ativo === false) {
      return { ok: false, motivo: 'usuario desativado', pode: {} };
    }
    var base = {};
    CHAVES.forEach(function (k) { base[k] = !!PADRAO[p.papel][k]; });
    // TOGGLES: so o gerente e ajustavel, e so pra DESLIGAR ou LIGAR dentro do que a lista permite.
    // Um toggle nunca pode dar ao gerente uma chave de gestor (gerir_usuarios, configurar): isso
    // seria promover alguem por configuracao, sem ninguem trocar o papel dele.
    if (p.papel === 'gerente' && p.permissoes && typeof p.permissoes === 'object') {
      var PROIBIDAS = { gerir_usuarios: 1, configurar: 1, importar: 1, admin_financeiro: 1 };
      CHAVES.forEach(function (k) {
        if (!(k in p.permissoes)) return;
        if (PROIBIDAS[k]) return;                       // toggle nao promove
        base[k] = !!p.permissoes[k];
      });
    }
    // admin_financeiro tambem pode ser CONCEDIDA por perfil (permissoes.admin_financeiro === true),
    // so por quem tem gerir_usuarios (a RLS de perfis). Nunca vem do codigo nem do e-mail.
    if (p.permissoes && typeof p.permissoes === 'object' && p.permissoes.admin_financeiro === true) base.admin_financeiro = true;
    return { ok: true, motivo: '', papel: p.papel, pode: base };
  }

  function pode(perfil, chave) {
    var r = permissoes(perfil);
    return r.ok && !!r.pode[chave];
  }

  // a mensagem que a tela mostra quando nega. Clara e sem culpar quem esta na frente dela.
  function negado(perfil, chave) {
    var r = permissoes(perfil);
    if (!r.ok) return 'Acesso não liberado: ' + r.motivo + '. Fale com quem administra o sistema.';
    return 'Seu perfil (' + r.papel + ') não tem permissão para isto. Fale com quem administra o sistema.';
  }

  raiz.LimedtecPapeis = { CHAVES: CHAVES, PADRAO: PADRAO, papeis: papeis, chaves: chaves,
    permissoes: permissoes, pode: pode, negado: negado,
    TETO_DESCONTO: TETO_DESCONTO, TETO_SEM_PAPEL: TETO_SEM_PAPEL, tetoDesconto: tetoDesconto };
  if (typeof module !== 'undefined' && module.exports) module.exports = raiz.LimedtecPapeis;
})(typeof window !== 'undefined' ? window : globalThis);
