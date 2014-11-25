'use strict';

require('native-promise-only');
var createCore = require('./core/index.js');
var userConfigurations = require('./content/configurations.js');

function serverStartSuccess(server) {
  console.log('Servidor iniciado no endereço: %s:%s', server.host, server.port);
}

function serverStartFail(err) {
  console.log('Erro ao iniciar servidor:');
  console.log(err);
}

// Utiliza o "core" do iniderNews para criar uma nova instância
// com as configurações definidas pelo usuário.
createCore(userConfigurations)
  .start()
  .then(serverStartSuccess)
  .catch(serverStartFail);
