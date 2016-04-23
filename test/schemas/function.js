var scmUrlPattern = 'https://.*\.scm\.azurewebsites\.net/.*';
var rmUrlPattern = '/subscriptions/.*/resourceGroups/.*/providers/Microsoft.Web/sites/.*';
module.exports = {
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            pattern: '/subscriptions/.*',
            required: true
        },
        name: {
            type: 'string',
            pattern: '.*/.*',
            required: true
        },
        function_app_id: {
            type: 'string',
            pattern: rmUrlPattern
        },
        type: {
            type: 'string',
            pattern: 'Microsoft.Web/sites/functions',
            required: true
        },
        location: {
            type: 'string',
            required: true
        },
        script_root_path_href: {
            type: 'string',
            script_href: ''
        },
        script_href: {
            type: 'string',
            script_href: scmUrlPattern
        },
        config_href: {
            type: '',
            test_data_href: scmUrlPattern
        },
        properties: {
            type: 'object',
            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    minLength: 1,
                    required: true
                },
                function_app_id: {
                    type: 'string',
                    minLength: 1,
                    required: true
                },
                script_root_path_href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                script_href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                config_href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                test_data_href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                secrets_file_href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                href: {
                    type: 'string',
                    pattern: scmUrlPattern,
                    required: true
                },
                test_data: {
                    type: 'string',
                    required: true
                },
                files: {
                    required: false
                },
                config: {
                    type: 'object',
                    properties: {
                        bindings: {
                            type: 'array'
                        }
                    }
                }
            }
        }
    }
};
