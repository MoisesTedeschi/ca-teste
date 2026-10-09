/*
 * Teste Code Resource — lógica da tela da custom activity.
 * Roda no navegador, dentro do iframe do Journey Builder.
 * Não contém nenhum segredo (o arquivo é público).
 */
(function () {
  'use strict';

  var GET_URL = 'https://httpbin.org/get?origem=ca-code-resource';

  var connection = new Postmonger.Session();
  var payload = {};

  var elStatus = document.getElementById('statusConfig');
  var elResultado = document.getElementById('resultado');
  var btnGet = document.getElementById('btnGet');

  // 1. Avisa o Journey Builder que a tela está pronta.
  connection.trigger('ready');

  // 2. O JB devolve a configuração atual da activity.
  connection.on('initActivity', function (data) {
    payload = data || {};
    var configurada = payload.metaData && payload.metaData.isConfigured;
    elStatus.textContent = configurada ? 'já configurada' : 'ainda não configurada — clique em Done';
    elStatus.className = configurada ? 'ok' : '';
  });

  // 3. Usuário clicou em Done (activity de um passo só).
  connection.on('clickedNext', salvar);

  function salvar() {
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    // Dados enviados ao execute para cada contato.
    payload.arguments.execute.inArguments = [
      { contactKey: '{{Contact.Key}}' },
      { origem: 'code-resource-teste' }
    ];

    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    connection.trigger('updateActivity', payload);
  }

  // Botão de teste: GET a partir do navegador (só na configuração, não na jornada).
  btnGet.addEventListener('click', function () {
    btnGet.disabled = true;
    elResultado.hidden = false;
    elResultado.className = 'box';
    elResultado.textContent = 'Chamando ' + GET_URL + ' …';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', GET_URL, true);
    xhr.timeout = 10000;
    xhr.onload = function () {
      var ok = xhr.status >= 200 && xhr.status < 300;
      mostrar(ok, 'HTTP ' + xhr.status, xhr.responseText);
    };
    xhr.onerror = function () { mostrar(false, 'Falha de rede ou bloqueio (CORS/CSP)', ''); };
    xhr.ontimeout = function () { mostrar(false, 'Timeout (10 s)', ''); };
    xhr.send();
  });

  function mostrar(ok, titulo, corpo) {
    btnGet.disabled = false;
    elResultado.className = 'box ' + (ok ? 'ok' : 'erro');
    elResultado.textContent = (ok ? 'Sucesso — ' : 'Erro — ') + titulo;
    if (corpo) {
      var pre = document.createElement('pre');
      pre.textContent = corpo;
      elResultado.appendChild(pre);
    }
  }
})();
