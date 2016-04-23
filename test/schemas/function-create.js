module.exports = {
    additionalProperties: false,
    properties: {
        location: {
            type: 'string',
            minLength: 4
        },
        properties: {
            type: 'object',
            additionalProperties: false,
            properties: {
                config: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        bindings: {
                            type: 'array',
                            required: true,
                            minLength: 1
                        }
                    }
                },
                files: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        'index.js': {
                            type: 'string',
                            minLength: 20,
                            required: true
                        }
                    }
                }
            }
        }
    }
};
