'use strict';
/* globals describe, it, before*/
var nconf = require('nconf');
var debug = require('debug')('azure-functions:test:live:azure-functions');
nconf.env().file({file: './test/live/.config.json'});
global.Promise = require('bluebird');

describe('provider:aws', function () {

  var email;

  describe('#listFunctionsLive', function () {
    this.timeout(10000);
    it('lists Azure Functions', function () {
      var AzureFunctions = require('../../index');
      var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
      	nconf.get('FUNCTION_APP_NAME'),
      	{
      		subscriptionId: nconf.get('SUBSCRIPTION_ID'),
          clientId: nconf.get('CLIENT_ID'),
          clientSecret: nconf.get('CLIENT_SECRET'),
          domain: nconf.get('AD_DOMAIN')
      	});

      return azFunctions.listFunctions()
      .then((functions) => {
        debug(functions);
      });
    });
  });
  
  describe('#getFunctionLive', function () {
    this.timeout(10000);
    it('gets an Azure Function', function () {
      var AzureFunctions = require('../../index');
      var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
      nconf.get('FUNCTION_APP_NAME'),
      {
        subscriptionId: nconf.get('SUBSCRIPTION_ID'),
        clientId: nconf.get('CLIENT_ID'),
        clientSecret: nconf.get('CLIENT_SECRET'),
        domain: nconf.get('AD_DOMAIN')
      });

      return azFunctions.getFunction('HttpTriggerNodeJS1')
      .then(func => {
        debug(func);
      });
    });
  });
  
  describe('#deleteFunctionLive', function () {
    this.timeout(10000);
    it('deletes an Azure Function', function () {
      var AzureFunctions = require('../../index');
      var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
      	nconf.get('FUNCTION_APP_NAME'),
      	{
      		subscriptionId: nconf.get('SUBSCRIPTION_ID'),
          clientId: nconf.get('CLIENT_ID'),
          clientSecret: nconf.get('CLIENT_SECRET'),
          domain: nconf.get('AD_DOMAIN')
      	});

        return azFunctions.deleteFunction('HttpTriggerNodeJS2')
        .then(func => {
          debug(func);
        });
    });
  });
  
  describe('#deployFunctionLive', function () {
    this.timeout(120000);
    it('lists webjobs', function () {
      var AzureFunctions = require('../../index');
      var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
      	nconf.get('FUNCTION_APP_NAME'),
      	{
      		subscriptionId: nconf.get('SUBSCRIPTION_ID'),
          clientId: nconf.get('CLIENT_ID'),
          clientSecret: nconf.get('CLIENT_SECRET'),
          domain: nconf.get('AD_DOMAIN')
      	});

        return azFunctions.deployFunction('testfunction2', 'module.exports = function (context, data) {\r\n    context.res = {\r\n        body: { greeting: \'Hello \' + data.first + \' \' + data.last + \'!\'}\r\n    };\r\n\r\n    context.done();\r\n};\r\n',
        [{
          "type": "http",
          "direction": "in",
          "name": "req"
        }])
        .then(jobs => {
          debug('jobs:');
          debug(jobs);
        });
    });
  });
});
