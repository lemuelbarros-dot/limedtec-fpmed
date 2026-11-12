/* LIMEDTEC cliente 002 FPMED - pacote so-Robos. Preencher na maquina dela. Nunca por aqui a service_role. */
(function (raiz) {
  raiz.LIMEDTEC_CLIENTE = {
    id: '002', nome: 'FPMED', nomeCompleto: 'FPMED Hospitalar',
    banco: { url: 'https://zsyppapkbenmelggimjf.supabase.co', anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeXBwYXBrYmVubWVsZ2dpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MDY0NzgsImV4cCI6MjExMDA4MjQ3OH0.iH4tSIxuCnD_6raNYDJPFG7onaNLaVKD_f2ZknoalqY' },
    loginPortal: 'supervisao@fpmed.com.br',
    paginas: ['index.html', 'globalmed_bionexo.html', 'globalmed_apoio.html'],
    pacotes: ['robos'],
  };
})(typeof window !== 'undefined' ? window : globalThis);
