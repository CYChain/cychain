/*
 * Copyright © 2018 cychain Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the cychain Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var SwaggerRunner = require('swagger-node-runner');
var swaggerHelper = require('../helpers/swagger');

// Its necessary to require this file to extend swagger validator with our custom formats
require('../helpers/swagger').getValidator();

/**
 * Configure swagger node runner with the app.
 * It loads the swagger specification and maps everything with an active express app.
 *
 * @module
 * @see Parent: {@link config}
 * @requires fs
 * @requires js-yaml
 * @requires path
 * @requires swagger-node-runner
 * @param {Object} app - An express app to which map the swagger details
 * @param {Object} config - Application Configurations
 * @param {Object} logger - Application Logger
 * @param {Object} scope - Application Scope
 * @param {function} cb - Callback function
 * @returns {void}
 */
function bootstrapSwagger(app, config, logger, scope, cb) {
	// Register modules to be used in swagger fittings
	require('../helpers/swagger_module_registry').bind(scope);

	// Load Swagger controllers and bind the scope
	var controllerFolder = '/api/controllers/';
	fs.readdirSync(config.root + controllerFolder).forEach(file => {
		if (path.basename(file) !== 'index.js') {
			// eslint-disable-next-line import/no-dynamic-require
			require(config.root + controllerFolder + file)(scope);
		}
	});

	var swaggerConfig = {
		appRoot: config.root,
		configDir: `${config.root}/config/swagger`,
		swaggerFile: path.join(`${config.root}/schema/swagger.yml`),
		enforceUniqueOperationId: true,
		startWithErrors: false,
		startWithWarnings: true,
	};

	// Swagger express middleware
	SwaggerRunner.create(swaggerConfig, (errors, runner) => {
		if (errors) {
			// Ignore unused definition warning
			errors.validationWarnings = _.filter(
				errors.validationWarnings,
				error => error.code !== 'UNUSED_DEFINITION'
			);

			// Some error occurred in configuring the swagger
			if (!_.isEmpty(errors.validationErrors)) {
				logger.error('Swagger Validation Errors:');
				logger.error(errors.validationErrors);
			}

			if (!_.isEmpty(errors.validationWarnings)) {
				logger.error('Swagger Validation Warnings:');
				logger.error(errors.validationWarnings);
			}

			if (
				!_.isEmpty(errors.validationErrors) ||
				!_.isEmpty(errors.validationWarnings)
			) {
				cb(errors);
				return;
			}
		}

		// Swagger express middleware
		var swaggerExpress = runner.expressMiddleware();

		// Check the response and act appropriately on error
		runner.on('responseValidationError', validationResponse => {
			// TODO: Troubleshoot why default validation hook considers json response as string response
			if (validationResponse.errors[0].code !== 'INVALID_RESPONSE_BODY') {
				logger.error('Swagger Response Validation Errors:');
				logger.error(validationResponse.errors[0].errors);
			}
		});

		// Install middleware
		swaggerExpress.register(app);

		// To be used in test cases or getting configuration runtime
		app.swaggerRunner = runner;

		// Managing all the queries which were not caught by previous middlewares.
		app.use((req, res, next) => {
			// We need to check if the response is already handled by some other middlewares/fittings/controllers
			// In case not, we consider it as 404 and send default response
			// res.headersSent is a patch, and only works if above middlewares set some header no matter the status code
			// Another possible workaround would be res.bodySize === 0
			if (!res.headersSent) {
				res.status(404);
				res.json({ description: 'Page not found' });
			}
			next();
		});

		swaggerHelper
			.getResolvedSwaggerSpec()
			.then(resolvedSchema => {
				// Successfully mounted the swagger runner
				cb(null, {
					swaggerRunner: runner,
					definitions: resolvedSchema.definitions,
				});
			})
			.catch(reason => {
				cb(reason);
			});
	});
}

module.exports = bootstrapSwagger;
