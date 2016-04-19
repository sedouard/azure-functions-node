'use strict';
var fs = require('fs');
var path = require('path');

var skeemas = require('skeemas');
var debug = require('debug')('azure-functions:azure-functions');
var msRest = require('ms-rest');
var WebResource = msRest.WebResource;
var msRestAzure = require('ms-rest-azure');
var resourceManagement = require("azure-arm-resource");
const BbPromise = require('bluebird');
/**
 * @class
 * 
 
 * Policy assignment list operation result.
 * @member {array} [value] Policy assignment list.
 * 
 * @member {string} [nextLink] Gets or sets the URL to get the next set of
 * policy assignment results.
 * 
 */
class AzureFunctions {
	/**
	 * @constructor
	 * @param {object} [subscriptionDetails] Azure Subscription Details.
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
		this._rmClient = Promise.promisifyAll(
			new resourceManagement.ResourceManagementClient(this._credentials, 
				subscriptionDetails.subscriptionId),
			{
				multiArgs: true
			});
		this._rmClient.apiVersion = '2015-08-01';
	}

	listFunctions () {
		var requestUrl = this._buildBaseUrl();
		requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions';

		return this._performRequest(requestUrl)
		.then(functionListing => {
			return functionListing;
		});
	}

	getFunction (name) {
		var requestUrl = this._buildBaseUrl();
		requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;

		return this._performRequest(requestUrl)
		.then(functionListing => {
			return functionListing;
		});
	}

	deployFunction (name, contents, bindings) {
		
		return this._performRequest(this._buildBaseUrl(), 'GET', null, '2016-02-01')
		.then(group => {
			debug('group response:');
			debug(group);
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
						'index.js': contents
					}
				}
			});
		});	
	}

	deleteFunction (name) {
		var requestUrl = this._buildBaseUrl();
		requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + this.functionAppName + '/functions/' + name;

		return this._performRequest(requestUrl, 'DELETE')
		.then(functionListing => {
			return functionListing;
		});
	}

	_buildBaseUrl () {
		var requestUrl = this._rmClient.baseUri + '//subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}';
		requestUrl = requestUrl.replace('{subscriptionId}', this.subscriptionDetails.subscriptionId);
		requestUrl = requestUrl.replace('{resourceGroupName}', this.resourceGroupName);
		return requestUrl;
	}

	_performRequest (requestUrl, method, body, apiVersion) {
		if (!method) {
			method = 'GET';
		}

		var httpRequest = new WebResource();
		var client = this._rmClient;
		httpRequest.method = method;
		httpRequest.headers = {};
		if (method === "POST" || method === "PUT" || method === "PATCH") {
			if (body.constructor.name === 'ReadStream') {
				debug('setting body to read stream');
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
		return new Promise((resolve, reject) => {
			return client.pipeline(httpRequest, (err, response, responseBody) => {

				var statusCode = response.statusCode;

				if (statusCode < 200 || statusCode > 299) {

					var error = new Error(responseBody);
					error.statusCode = response.statusCode;
					error.request = msRest.stripRequest(httpRequest);
					error.response = msRest.stripResponse(response);
					if (responseBody === '') {
						responseBody = null;
					}
					var parsedErrorResponse;
					try {
						parsedErrorResponse = JSON.parse(responseBody);
						if (parsedErrorResponse) {
						if (parsedErrorResponse.error) parsedErrorResponse = parsedErrorResponse.error;
						if (parsedErrorResponse.code) error.code = parsedErrorResponse.code;
						if (parsedErrorResponse.message) error.message = parsedErrorResponse.message;
						}
						if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
							var resultMapper = new client.models['CloudError']().mapper();
							error.body = client.deserialize(resultMapper, parsedErrorResponse, 'error.body');
						}
					} catch (defaultError) {
						error.message = util.format('Error "%s" occurred in deserializing the responseBody ' + 
										'- "%s" for the default response.', defaultError.message, responseBody);
						return reject(error);
					}
					return reject(error);
				}
				// Create Result
				var result = null;
				if (responseBody === '') responseBody = null;

				if (statusCode === 200) {
					var parsedResponse = null;
					try {
						parsedResponse = JSON.parse(responseBody);
						result = JSON.parse(responseBody);
					} catch (error) {
						var deserializationError = new Error(util.format('Error "%s" occurred in deserializing the responseBody - "%s"', error, responseBody));
						deserializationError.request = msRest.stripRequest(httpRequest);
						deserializationError.response = msRest.stripResponse(response);
						return reject(deserializationError);
					}
				}
				
				return resolve(result);
			});
		});
	}

	
}

module.exports = AzureFunctions;
