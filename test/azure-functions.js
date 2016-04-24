'use strict';
/* globals describe, it, before, after*/
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var assert = require('assert');
var mockery = require('mockery');
var debug = require('debug')('azure-functions:test:live:azure-functions');
var skeemas = require('skeemas');
var clone = require('clone');
var functionSchema = require('./schemas/function');
var functionListingSchema = require('./schemas/function-listing');
var resourceManagementMock = require('./mocks/azure-arm-resource');

nconf.env().file({
    file: path.join(__dirname, '/assets/.config-mock.json')
});

function validateFunctionObject(func) {
    var result = skeemas.validate(func, functionSchema);
    assert(result.valid, JSON.stringify(result.errors));
}

function validateFunctionListing(func) {
    var result = skeemas.validate(func, functionListingSchema);
    assert(result.valid, JSON.stringify(result.errors));
}

describe('azure-functions-mock', function () {

    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        mockery.registerMock('azure-arm-resource', resourceManagementMock);
    });

    after(function () {
        mockery.deregisterMock('azure-arm-resource', resourceManagementMock);
        mockery.disable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    var sampleFunction = fs.readFileSync('./test/assets/samplefunction', {
        encoding: 'utf8'
    });
    var sampleFunctionNames = ['unittesthttp', 'unittesthttp2'];

    describe('#CRUD', function () {
        this.timeout(360000);
        it('#deployfunction-http-mock', function () {
            var AzureFunctions = require('../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.deployFunction(sampleFunctionNames[0], sampleFunction, [{
                    type: 'http',
                    direction: 'in',
                    name: 'req'
                }])
                .then(func => {
                    validateFunctionObject(func);
                });
        });

        it('#deployfunction-http2-mock', function () {
            var AzureFunctions = require('../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.deployFunction(sampleFunctionNames[1], sampleFunction, [{
                    type: 'http',
                    direction: 'in',
                    name: 'req'
                }])
                .then(func => {
                    validateFunctionObject(func);
                });
        });

        it('#listFunctions-mock', function () {
            var AzureFunctions = require('../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.listFunctions()
                .then(functions => {
                    debug('function listing:');
                    debug(functions);
                    validateFunctionListing(functions);
                    var funcNames = clone(sampleFunctionNames);
                    functions.forEach(func => {
                        var found = false;
                        funcNames.every((name, index) => {
                            if (name === func.name.replace(nconf.get('FUNCTION_APP_NAME') + '/', '')) {
                                found = true;
                                delete funcNames[index];
                                // break;
                                return false;
                            }
                            return true;
                        });
                        assert(found);
                    });
                });
        });
    });

    describe('#getFunction-mock', function () {
        this.timeout(10000);
        it('gets an Azure Function', function () {
            var AzureFunctions = require('../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.getFunction('unittesthttp')
                .then(func => {
                    debug('validating function:');
                    debug(func);
                    validateFunctionObject(func);
                    return azFunctions.getFunction('unittesthttp2');
                })
                .then(func => {
                    validateFunctionObject(func);
                });
        });
    });

    describe('#deleteFunction-mock', function () {
        this.timeout(30000);
        it('deletes an Azure Function', function () {
            var AzureFunctions = require('../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.deleteFunction('unittesthttp')
                .then(func => {
                    validateFunctionObject(func);
                    return azFunctions.listFunctions();
                })
                .then(functions => {
                    validateFunctionListing(functions);
                    assert.equal(functions.length, 1);
                });
        });
    });
});
