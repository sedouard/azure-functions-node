'use strict';
var assert = require('assert');
var nconf = require('nconf');
var skeemas = require('skeemas');
var functionCreateSchema = require('../schemas/function-create');
var debug = require('debug')('azure-functions:test:mocks:azure-arm-resource');

nconf.env().file({
    file: './test/assets/.config-mock.json'
});
var _functionCache = {};
class ResourceManagementClient {
    constructor(credentials, subscriptionId) {
        assert.equal(credentials.constructor.name, 'ApplicationTokenCredentials');
        assert.equal(subscriptionId, nconf.get('SUBSCRIPTION_ID'));
    }

    _responseBodyForFunc(funcName, funcData) {
        return {
            id: '/subscriptions/' + nconf.get('AZURE_SUBSCRIPTION_ID') + '/resourceGroups/' + nconf.get('') + '/providers/Microsot.Web/sites/' + nconf.get('FUNCTION_APP_NAME') + '/functions/' + funcName,
            name: nconf.get('FUNCTION_APP_NAME') + '/' + funcName,
            location: funcData.location,
            type: 'Microsoft.Web/sites/functions',
            properties: {
                name: funcName,
                function_app_id: '/subscriptions/' + nconf.get('AZURE_SUBSCRIPTION_ID') + '/resourceGroups/' + nconf.get('RESOURCE_GROUP_NAME') + '/providers/Microsot.Web/sites/' + nconf.get('FUNCTION_APP_NAME'),
                script_root_path_href: 'https://' + nconf.get('FUNCTION_APP_NAME') + '.scm.azurewebsites.net/api/vfs/site/wwwroot/' + funcName,
                script_href: 'https://serverlessdemo.scm.azurewebsites.net/api/vfs/site/wwwroot/unittesthttp/index.js',
                config_href: 'https://serverlessdemo.scm.azurewebsites.net/api/vfs/site/wwwroot/unittesthttp/function.json',
                test_data_href: 'https://serverlessdemo.scm.azurewebsites.net/api/vfs/site/wwwroot/unittesthttp/function.json',
                secrets_file_href: 'https://serverlessdemo.scm.azurewebsites.net/api/vfs/site/wwwroot/unittesthttp/function.json',
                href: 'https://serverlessdemo.scm.azurewebsites.net/api/vfs/site/wwwroot/unittesthttp/function.json',
                config: {
                    bindings: funcData.properties.bindings
                },
                files: null,
                test_data: ''
            }
        };
    }
    pipeline(httpRequest, callback) {
        assert.equal(httpRequest.constructor.name, 'WebResource');
        var rgRegex = new RegExp('\/subscriptions\/' + nconf.get('SUBSCRIPTION_ID') + '\/resourceGroups\/' + nconf.get('RESOURCE_GROUP_NAME'));
        var functionRegex = new RegExp('\/providers\/Microsoft\.Web\/sites\/' + nconf.get('FUNCTION_APP_NAME') + '\/functions\/');
        var functionsRegex = /\/providers\/Microsoft\.Web\/sites\/serverlessdemo\/functions/;
        debug('functionRegex: ' + '\/providers\/Microsoft\.Web\/sites\/' + nconf.get('FUNCTION_APP_NAME') + '\/functions\/');
        debug(httpRequest.url.match(functionRegex));
        var response = {
            statusCode: 200
        };
        var responseBody;
        debug('URL: ' + httpRequest.url);
        if (httpRequest.method === 'PUT' && httpRequest.url.match(functionRegex)) {
            debug('MOCK CREATE FUNCTION');
            // create function
            let body = JSON.parse(httpRequest.body);
            let validation = skeemas.validate(body, functionCreateSchema);
            let parts = httpRequest.url.split('/');
            let funcName = parts[parts.length - 1].split('?')[0];
            assert(validation.valid, validation.errors);
            responseBody = JSON.stringify(this._responseBodyForFunc(funcName, body));
            response.statusCode = 204;
            _functionCache[funcName] = body;
            debug('current function cache:');
            debug(_functionCache);
        } else if (httpRequest.method === 'GET' && httpRequest.url.match(functionRegex)) {
            debug('MOCK GET FUNCTION');
            // get function
            let parts = httpRequest.url.split('/');
            let funcName = parts[parts.length - 1].split('?')[0];
            debug('function cache:');
            debug(_functionCache);
            if (!_functionCache[funcName]) {
                response.statusCode = 404;
                // not an actual azure response body but it works
                responseBody = JSON.stringify({
                    message: 'not found'
                });
            } else {
                responseBody = JSON.stringify(this._responseBodyForFunc(funcName, _functionCache[funcName]));
            }
        } else if (httpRequest.method === 'DELETE' && httpRequest.url.match(functionRegex)) {
            debug('MOCK DELETE FUNCTION');
            // get function
            let parts = httpRequest.url.split('/');
            let funcName = parts[parts.length - 1].split('?')[0];
            debug('function cache:');
            debug(_functionCache);
            if (!_functionCache[funcName]) {
                response.statusCode = 404;
                // not an actual azure response body but it works
                responseBody = JSON.stringify({
                    message: 'not found'
                });
            } else {
                delete _functionCache[funcName];
                responseBody = '';
            }
        } else if (httpRequest.method === 'GET' && httpRequest.url.match(functionsRegex)) {
            debug('MOCK LIST FUNCTIONS');
            // list functions
            let functionListing = [];
            debug('function cache:');
            debug(_functionCache);
            for (let key in _functionCache) {
                if (typeof key === 'string') {
                    functionListing.push(this._responseBodyForFunc(key, _functionCache[key]));
                }
            }
            debug('response function listing:');
            debug({
                value: functionListing
            });
            responseBody = JSON.stringify({
                value: functionListing
            });
        } else if (httpRequest.method === 'GET' && httpRequest.url.match(rgRegex)) {
            debug('MOCK GET FUNCTION');
            debug(httpRequest.url);
            responseBody = JSON.stringify({
                location: 'West US'
            });
        } else {
            response.statusCode = 400;
            // not an actual azure response body but it works
            responseBody = JSON.stringify({
                message: 'bad request'
            });
        }

        var util = function () {};

        return callback(null, response, responseBody, util);
    }
}

module.exports = {
    ResourceManagementClient: ResourceManagementClient
};
