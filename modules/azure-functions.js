'use strict';
var debug = require('debug')('azure-functions:azure-functions');
var msRest = require('ms-rest');
var WebResource = msRest.WebResource;
var msRestAzure = require('ms-rest-azure');
var resourceManagement = require('azure-arm-resource');
const BbPromise = require('bluebird');

/**
 * AzureFunctions Allows for easy interaction for manipulating Azure Functions
 *
 * @@class
 */
class AzureFunctions {
    /**
     * Creates an instance of AzureFunctions
     *
     * @constructor
     * @this {AzureFunctions}
     * @param {object} [subscriptionDetails]
     * @param {object} [subscriptionDetails.subscriptionId] Azure Subscription Id
     * @param {object} [subscriptionDetails.clientId] Service Principal Client Id
     * @param {object} [subscriptionDetails.clientId] Service Principal Client Secret
     * @param {object} [subscriptionDetails.domain] Azure Active Directory Domain (eg: yourapp.com)
     */
    constructor(resourceGroupName, functionAppName, subscriptionDetails) {
        debug(subscriptionDetails);
        this.resourceGroupName = resourceGroupName;
        this._subscriptionDetails = subscriptionDetails;
        this.functionAppName = functionAppName;
        this.subscriptionDetails = subscriptionDetails;
        this._credentials = new msRestAzure.ApplicationTokenCredentials(subscriptionDetails.clientId,
            subscriptionDetails.domain,
            subscriptionDetails.clientSecret);
        this._rmClient = BbPromise.promisifyAll(
            new resourceManagement.ResourceManagementClient(this._credentials,
                subscriptionDetails.subscriptionId), {
                multiArgs: true
            });
        this._rmClient.apiVersion = '2015-08-01';
    }

    /**
     * Gets all Azure Functions in the function app
     *
     * @method
     * @return {Promise<Array>} An array of Function objects.
     */
    listFunctions() {
        var requestUrl = this._buildBaseUrl();
        requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions';

        return this._performRequest(requestUrl)
            .then(functionListing => {
                return functionListing.value;
            });
    }

    /**
     * Gets an Azure Function
     *
     * @method
     * @param {string} name The name of the function
     * @return {array} Ann array of Function objects.
     */
    getFunction(name) {
        var requestUrl = this._buildBaseUrl();
        requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;

        return this._performRequest(requestUrl)
            .then(functionListing => {
                return functionListing;
            });
    }

    /**
     * Deploys a Function to the Functions App
     *
     * @method
     * @param {string} name The name of the function to deploy
     * @param {string} functionContent The code that defines the function logic
     * @param {obejct} binding The Azure Function bindings
     * @return {Promise<null>} A promise that resolves when the function is deployed
     */
    deployFunction(name, functionContent, bindings) {

        return this._performRequest(this._buildBaseUrl(), 'GET', null, '2016-02-01')
            .then(group => {
                var requestUrl = this._buildBaseUrl();
                requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;

                if (!Array.isArray(bindings)) {
                    throw new Error('bindings must be an array');
                }
                return this._performRequest(requestUrl, 'PUT', {
                    location: group.location,
                    properties: {
                        config: {
                            bindings: bindings
                        },
                        files: {
                            'index.js': functionContent
                        }
                    }
                });
            });
    }

    /**
     * Deletes a Function from the Functions App
     *
     * @method
     * @param {string} name The name of the function to delete
     * @return {Promise<null>} A promise that resolves when the function is deleted
     */
    deleteFunction(name) {
        var requestUrl = this._buildBaseUrl();
        requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;

        return this._performRequest(requestUrl, 'DELETE')
            .then(functionListing => {
                return functionListing;
            });
    }

     /**
     * Enables a Function from the Functions App
     *
     * @method
     * @param {string} name The name of the function to Enable
     * @return {Promise<null>} A promise that resolves when the function is Enables
     */

    enableFunction(name){
        var requestUrl = this._buildBaseUrl();
        requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;
        return this._performRequest(requestUrl)
            .then(functionListing => {
                var props = functionListing.properties;
                props.config.disabled = false;
                return this._performRequest(requestUrl,'PUT',{properties:props});
            });
        }

    /**
     * Disables a Function from the Functions App
     *
     * @method
     * @param {string} name The name of the function to Disable
     * @return {Promise<null>} A promise that resolves when the function is disabled
     */

    disableFunction(name){
        var requestUrl = this._buildBaseUrl();
        requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;
        return this._performRequest(requestUrl)
            .then(functionListing => {
                var props = functionListing.properties;
                props.config.disabled = true;
                return this._performRequest(requestUrl,'PUT',{properties:props});
            });
        }

    /**
     * Generates the base url for all Azure Functions REST request
     *
     * @method
     * @return {string} The base url for Azure Functions REST requests
     */
    _buildBaseUrl() {
        var requestUrl = this._rmClient.baseUri + '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}';
        requestUrl = requestUrl.replace('{subscriptionId}', this.subscriptionDetails.subscriptionId);
        requestUrl = requestUrl.replace('{resourceGroupName}', this.resourceGroupName);
        return requestUrl;
    }

    /**
     * Performs authenticated call to ARM Api. Lifted from Azure/autorest
     *
     * @method
     * @param {string} requestUrl The full url to make the request call to
     * @param {string} method The HTTP method
     * @param {object|Readable} body The request body. Can be a Readable stream as well.
     * @return {Promise<response>} A promise that resolves with the response body
     */
    _performRequest(requestUrl, method, body, apiVersion) {
        if (!method) {
            method = 'GET';
        }

        var httpRequest = new WebResource();
        var client = this._rmClient;
        httpRequest.method = method;
        httpRequest.headers = {};
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            if (body.constructor.name === 'ReadStream') {
                httpRequest.body = body;
            } else {
                httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
                httpRequest.body = JSON.stringify(body);
            }

        } else {
            httpRequest.body = null;
        }
        httpRequest.headers['x-ms-client-request-id'] = msRestAzure.generateUuid();

        var queryParameters = [];
        queryParameters.push('api-version=' + encodeURIComponent(apiVersion || client.apiVersion));

        if (queryParameters.length > 0) {
            requestUrl += '?' + queryParameters.join('&');
        }
        // trim all duplicate forward slashes in the url
        var regex = /([^:]\/)\/+/gi;
        requestUrl = requestUrl.replace(regex, '$1');

        httpRequest.url = requestUrl;
        // this logic is mostly from the Azure auto-rest generated code
        return client.pipelineAsync(httpRequest)
        .spread((response, responseBody) => {
            var statusCode = response.statusCode;

            if (statusCode < 200 || statusCode > 299) {
                var errorResponse = JSON.parse(responseBody);
                throw new Error(errorResponse.error.code, errorResponse.error.message);
            }
            // Create Result
            var result = null;
            if (responseBody === '') {
                responseBody = null;
            }

            result = JSON.parse(responseBody);
            return result;
        });
    }
}

module.exports = AzureFunctions;
