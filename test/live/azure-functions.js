'use strict';
/* globals describe, it*/
var fs = require('fs');
var nconf = require('nconf');
var path = require('path');
var assert = require('assert');
var debug = require('debug')('azure-functions:test:live:azure-functions');
var skeemas = require('skeemas');
var clone = require('clone');
var functionSchema = require('../schemas/function');
var functionListingSchema = require('../schemas/function-listing');

nconf.env().file({
    file: path.join(__dirname, '../assets/.config.json')
});
global.Promise = require('bluebird');

function validateFunctionObject(func) {
    var result = skeemas.validate(func, functionSchema);
    assert(result.valid, JSON.stringify(result.errors));
}

function validateFunctionListing(func) {
    var result = skeemas.validate(func, functionListingSchema);
    assert(result.valid, JSON.stringify(result.errors));
}

describe('azure-functions', function () {

    var sampleFunction = fs.readFileSync('./test/assets/samplefunction', {
        encoding: 'utf8'
    });
    var sampleFunctionNames = ['unittesthttp', 'unittesthttp2'];

    describe('#CRUD', function () {
        this.timeout(360000);
        it('#deployfunction-http-live', function () {
            var AzureFunctions = require('../../index');
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
                    debug(func);
                    validateFunctionObject(func);
                });
        });

        it('#deployFunction-http2-live', function () {
            var AzureFunctions = require('../../index');
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
                    debug(func);
                    validateFunctionObject(func);
                });
        });

        it('#listFunctions-live', function () {
            var AzureFunctions = require('../../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.listFunctions()
                .then(functions => {
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

    describe('#getFunction-live', function () {
        this.timeout(10000);
        it('gets an Azure Function', function () {
            var AzureFunctions = require('../../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.getFunction('unittesthttp')
                .then(func => {
                    debug(func);
                    validateFunctionObject(func);
                    return azFunctions.getFunction('unittesthttp2');
                })
                .then(func => {
                    validateFunctionObject(func);
                });
        });
    });

    describe('#deleteFunction-live', function () {
        this.timeout(30000);
        it('deletes an Azure Function', function () {
            var AzureFunctions = require('../../index');
            var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
                nconf.get('FUNCTION_APP_NAME'), {
                    subscriptionId: nconf.get('SUBSCRIPTION_ID'),
                    clientId: nconf.get('CLIENT_ID'),
                    clientSecret: nconf.get('CLIENT_SECRET'),
                    domain: nconf.get('AD_DOMAIN')
                });

            return azFunctions.deleteFunction('unittesthttp')
                .then(func => {
                    debug(func);
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
