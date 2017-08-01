[![Build Status](https://travis-ci.org/sedouard/azure-functions-node.svg?branch=master)](https://travis-ci.org/sedouard/azure-functions-node) [![Code Climate](https://codeclimate.com/github/sedouard/azure-functions-node/badges/gpa.svg)](https://codeclimate.com/github/sedouard/azure-functions-node) [![Test Coverage](https://codeclimate.com/github/sedouard/azure-functions-node/badges/coverage.svg)](https://codeclimate.com/github/sedouard/azure-functions-node/coverage)
# Azure Functions Node.js Client Library

List, deploy and delete [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) via Node.js.

**NOTE**: this is not an official Microsoft library. If you're looking for the Azure Functions CLI, see [azure-functions-cli](https://www.npmjs.com/package/azure-functions-cli).

## Getting Setup

Install the module by doing:

```
npm install azure-functions
```
 
### Creating an Azure Service Principal

You'll need to create an Azure Service Principal to authenticate into your Azure account. Checkout [this guide](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal/) on how you can set this up.

With the Azure CLI you just need to do:

```bash
npm install azure-cli -g
# set mode to azure resource manager
azure config mode arm
# authenticate
azure login
azure ad app create --name "functions" --home-page "https://www.justpickanydomain.org" --identifier-uris "https://www.justpickanydomain.org/example" --password <INVENT_A_CLIENT_SECRET>
# output
data:    AppId:          4fd39843-c338-417d-b549-a545f584a745
data:    ObjectId:       4f8ee977-216a-45c1-9fa3-d023089b2962
data:    DisplayName:    exampleapp
...
info:    ad app create command OK
# create the service principal. This guid is your CLIENT_ID
azure ad sp create 4fd39843-c338-417d-b549-a545f584a745
# output
info:    Executing command ad sp create
- Creating service principal for application 4fd39843-c338-417d-b549-a545f584a74+
data:    Object Id:        7dbc8265-51ed-4038-8e13-31948c7f4ce7
data:    Display Name:     exampleapp
data:    Service Principal Names:
data:                      4fd39843-c338-417d-b549-a545f584a745
data:                      https://www.contoso.org/example
info:    ad sp create command OK
# assign a role to this service principal. You need to provide enough access
# to read/write to the Functions App resource
azure role assignment create --objectId 7dbc8265-51ed-4038-8e13-31948c7f4ce7 -o Owner -c /subscriptions/{subscriptionId}/
```

## Working with Functions

Each api in this SDK returns a Promise.

### Get a Function

Getting a function will return a function object.

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions('RESOURCE_GROUP_NAME',
    'FUNCTION_APP_NAME', {
        subscriptionId: 'SUBSCRIPTION_ID',
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        domain: 'AD_DOMAIN'
    });

return azFunctions.getFunction('unittesthttp')
    .then(func => {
        validateFunctionObject(func);
        return azFunctions.getFunction('unittesthttp2');
    })
    .then(func => {
        validateFunctionObject(func);
    });

/** func object:
{  
   "id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME/functions/FUNCTION_NAME",
   "name":"serverlessdemo/unittesthttp2",
   "type":"Microsoft.Web/sites/functions",
   "location":"West US",
   "properties":{  
      "name":"unittesthttp2",
      "function_app_id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME",
      "script_root_path_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/",
      "script_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/index.js",
      "config_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/function.json",
      "test_data_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/sampledata/FUNCTION_NAME.dat",
      "secrets_file_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/secrets/FUNCTION_NAME.json",
      "href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/functions/FUNCTION_NAME",
      "config":{  
         "bindings":[
            {  
               "type":"http",
               "direction":"in",
               "name":"req"
            }
         ]
      },
      "files":null,
      "test_data":""
   }
}
**/
```

### List All Functions

Listing functions returns an array of function objects as shown above.

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions('RESOURCE_GROUP_NAME',
    'FUNCTION_APP_NAME', {
        subscriptionId: 'SUBSCRIPTION_ID',
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        domain: 'AD_DOMAIN'
    });

return azFunctions.listFunctions('unittesthttp')
    .then(functionListing => {
        console.log(functionListing);
    });

/** functionListing Object:
[{  
   "id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME/functions/FUNCTION_NAME",
   "name":"serverlessdemo/unittesthttp2",
   "type":"Microsoft.Web/sites/functions",
   "location":"West US",
   "properties":{  
      "name":"unittesthttp2",
      "function_app_id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME",
      "script_root_path_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/",
      "script_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/index.js",
      "config_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/function.json",
      "test_data_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/sampledata/FUNCTION_NAME.dat",
      "secrets_file_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/secrets/FUNCTION_NAME.json",
      "href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/functions/FUNCTION_NAME",
      "config":{  
         "bindings":[
            {  
               "type":"http",
               "direction":"in",
               "name":"req"
            }
         ]
      },
      "files":null,
      "test_data":""
   }
},
{  
   "id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME/functions/FUNCTION_NAME",
   "name":"serverlessdemo/unittesthttp2",
   "type":"Microsoft.Web/sites/functions",
   "location":"West US",
   "properties":{  
      "name":"unittesthttp2",
      "function_app_id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME",
      "script_root_path_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/",
      "script_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/index.js",
      "config_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/function.json",
      "test_data_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/sampledata/FUNCTION_NAME.dat",
      "secrets_file_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/secrets/FUNCTION_NAME.json",
      "href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/functions/FUNCTION_NAME",
      "config":{  
         "bindings":[
            {  
               "type":"http",
               "direction":"in",
               "name":"req"
            }
         ]
      },
      "files":null,
      "test_data":""
   }
}]
**/
```

### Create a Function

Given a function name and bindings array you can create functions. See the [bindings section](## Function Bindings) for a list of available bindings.

You can deploy sizeable function, up to several megabytes big. This is useful if you are compiling your functions into a single file.

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
    nconf.get('FUNCTION_APP_NAME'), {
        subscriptionId: nconf.get('SUBSCRIPTION_ID'),
        clientId: nconf.get('CLIENT_ID'),
        clientSecret: nconf.get('CLIENT_SECRET'),
        domain: nconf.get('AD_DOMAIN')
    });

return azFunctions.deployFunction('functionname', 'var x = \'foo\'; console.log(\'whatever\');', [{
        type: 'http',
        direction: 'in',
        name: 'req'
    }])
    .then(func => {
        console.log(func);
    });

/** func Object
{  
   "id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME/functions/FUNCTION_NAME",
   "name":"serverlessdemo/unittesthttp2",
   "type":"Microsoft.Web/sites/functions",
   "location":"West US",
   "properties":{  
      "name":"unittesthttp2",
      "function_app_id":"/subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/FUNCTION_APP_NAME",
      "script_root_path_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/",
      "script_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/index.js",
      "config_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/site/wwwroot/FUNCTION_NAME/function.json",
      "test_data_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/sampledata/FUNCTION_NAME.dat",
      "secrets_file_href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/vfs/data/functions/secrets/FUNCTION_NAME.json",
      "href":"https://FUNCTION_APP_NAME.scm.azurewebsites.net/api/functions/FUNCTION_NAME",
      "config":{  
         "bindings":[
            {  
               "type":"http",
               "direction":"in",
               "name":"req"
            }
         ]
      },
      "files":null,
      "test_data":""
   }
}
**/
```

### Delete a Function

Deleting a function is very straight-forward.

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
    nconf.get('FUNCTION_APP_NAME'), {
        subscriptionId: nconf.get('SUBSCRIPTION_ID'),
        clientId: nconf.get('CLIENT_ID'),
        clientSecret: nconf.get('CLIENT_SECRET'),
        domain: nconf.get('AD_DOMAIN')
    });

return azFunctions.deleteFunction('functionname')
    .then(() => {
        console.log('deleted functionname');
    });
```

### Disabling a Function

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
    nconf.get('FUNCTION_APP_NAME'), {
        subscriptionId: nconf.get('SUBSCRIPTION_ID'),
        clientId: nconf.get('CLIENT_ID'),
        clientSecret: nconf.get('CLIENT_SECRET'),
        domain: nconf.get('AD_DOMAIN')
    });

return azFunctions.disableFunction('functionname')
    .then(() => {
        console.log('disabled functionname');
    });
```

### Enabling a Function

```js
var AzureFunctions = require('azure-functions');
var azFunctions = new AzureFunctions(nconf.get('RESOURCE_GROUP_NAME'),
    nconf.get('FUNCTION_APP_NAME'), {
        subscriptionId: nconf.get('SUBSCRIPTION_ID'),
        clientId: nconf.get('CLIENT_ID'),
        clientSecret: nconf.get('CLIENT_SECRET'),
        domain: nconf.get('AD_DOMAIN')
    });

return azFunctions.enableFunction('functionname')
    .then(() => {
        console.log('enabled functionname');
    });
```


## Function Triggers

With Azure Functions you can bind a variety of events from Azure services to Azure functions.

You need to provide this as the `bindings` array to the `createFunction` method.

### Blob Trigger

```js
[{   path: 'path-within-storage-account',
    connection: 'storage-account-connection-string',
    name: 'blob-argument-name-for-function',
    type: 'blobTrigger',
    direction: 'in' 
}]
```

### Eventhub Trigger

```js
[{   path: 'eventhub-name',
    connection: 'service-bus-connection-string',
    type: 'eventHubTrigger',
    name: 'event-parameter-name-for-function',
    direction: 'in' 
}]
```

### Webhook Trigger

Webhooks must have their input as an `httpTrigger` and output as `http`.
```js
[
{   webHookType: 'genericJson',
    type: 'httpTrigger',
    direction: 'in',
    name: 'req' 
},
{ type: 'http', direction: 'out', name: 'res' }
]
```

### Github Webhook Trigger

```js
[{   webHookType: 'github',
    type: 'httpTrigger',
    direction: 'in',
    name: 'req' },
{ type: 'http', direction: 'out', name: 'res' }]
```

### Storage Account Queue Trigger

```js
[{  queueName: 'queue-name',
    connection: 'storage-account-name',
    name: 'message-parameter-name-for-function',
    type: 'queueTrigger',
    direction: 'in' }]
```

### Service Bus Queue Trigger

```js
[{  queueName: 'samples-input',
    connection: 'service-bus-connection-string',
    name: 'message-parameter-name-for-function',
    type: 'serviceBusTrigger',
    direction: 'in' }]
```

### Timer Trigger

```js
[{ schedule: '0 * * * * *',
    name: 'timer-parameter-name-for-function',
    type: 'timerTrigger',
    direction: 'in' }]
```
