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

var constants = require('../helpers/constants.js');
// Submodules
var blocksAPI = require('./blocks/api');
var blocksVerify = require('./blocks/verify');
var blocksProcess = require('./blocks/process');
var blocksUtils = require('./blocks/utils');
var blocksChain = require('./blocks/chain');

// Private fields
var library;
var self;
var __private = {};

__private.lastBlock = {};
__private.lastReceipt = null;

__private.loaded = false;
__private.cleanup = false;
__private.isActive = false;

/**
 * Initializes submodules with scope content.
 * Calls submodules.chain.saveGenesisBlock.
 * @memberof module:blocks
 * @class
 * @classdesc Main Blocks methods.
 * @param {function} cb - Callback function.
 * @param {scope} scope - App instance.
 * @return {setImmediateCallback} Callback function with `self` as data.
 */
// Constructor
function Blocks(cb, scope) {
	library = {
		logger: scope.logger,
	};

	// Initialize submodules with library content
	this.submodules = {
		api: new blocksAPI(
			scope.logger,
			scope.db,
			scope.logic.block,
			scope.schema,
			scope.dbSequence
		),
		verify: new blocksVerify(
			scope.logger,
			scope.logic.block,
			scope.logic.transaction,
			scope.db
		),
		process: new blocksProcess(
			scope.logger,
			scope.logic.block,
			scope.logic.peers,
			scope.logic.transaction,
			scope.schema,
			scope.db,
			scope.dbSequence,
			scope.sequence,
			scope.genesisblock
		),
		utils: new blocksUtils(
			scope.logger,
			scope.logic.account,
			scope.logic.block,
			scope.logic.transaction,
			scope.db,
			scope.dbSequence,
			scope.genesisblock
		),
		chain: new blocksChain(
			scope.logger,
			scope.logic.block,
			scope.logic.transaction,
			scope.db,
			scope.genesisblock,
			scope.bus,
			scope.balancesSequence
		),
	};

	// Expose submodules
	this.shared = this.submodules.api;
	this.verify = this.submodules.verify;
	this.process = this.submodules.process;
	this.utils = this.submodules.utils;
	this.chain = this.submodules.chain;

	self = this;

	this.submodules.chain.saveGenesisBlock(err => setImmediate(cb, err, self));
}

/**
 * PUBLIC METHODS
 */
/**
 * Last block functions, getter, setter and isFresh
 * @property {function} get Returns lastBlock
 * @property {function} set Sets lastBlock
 * @property {function} isFresh Returns status of last block - if it fresh or not
 */
Blocks.prototype.lastBlock = {
	get() {
		return __private.lastBlock;
	},
	set(lastBlock) {
		__private.lastBlock = lastBlock;
		return __private.lastBlock;
	},
	/**
	 * Returns status of last block - if it fresh or not
	 *
	 * @function isFresh
	 * @return {boolean} Fresh status of last block
	 */
	isFresh() {
		if (!__private.lastBlock) {
			return false;
		}
		// Current time in seconds - (epoch start in seconds + block timestamp)
		var secondsAgo =
			Math.floor(Date.now() / 1000) -
			(Math.floor(constants.epochTime / 1000) + __private.lastBlock.timestamp);
		return secondsAgo < constants.blockReceiptTimeOut;
	},
};

/**
 * Last Receipt functions: get, update and isStale.
 * @property {function} get Returns lastReceipt
 * @property {function} update Updates lastReceipt
 * @property {function} isStale Returns status of last receipt - if it fresh or not
 */
Blocks.prototype.lastReceipt = {
	get() {
		return __private.lastReceipt;
	},
	update() {
		__private.lastReceipt = Math.floor(Date.now() / 1000);
		return __private.lastReceipt;
	},
	/**
	 * Returns status of last receipt - if it stale or not
	 *
	 * @public
	 * @method lastReceipt.isStale
	 * @return {boolean} Stale status of last receipt
	 */
	isStale() {
		if (!__private.lastReceipt) {
			return true;
		}
		// Current time in seconds - lastReceipt (seconds)
		var secondsAgo = Math.floor(Date.now() / 1000) - __private.lastReceipt;
		return secondsAgo > constants.blockReceiptTimeOut;
	},
};

Blocks.prototype.isActive = {
	get() {
		return __private.isActive;
	},
	set(isActive) {
		__private.isActive = isActive;
		return __private.isActive;
	},
};

Blocks.prototype.isCleaning = {
	get() {
		return __private.cleanup;
	},
};

/**
 * Handle modules initialization.
 * Modules are not required in this file.
 * @param {modules} scope Exposed modules
 */
Blocks.prototype.onBind = function() {
	// TODO: move here blocks submodules modules load from app.js.
	// Set module as loaded
	__private.loaded = true;
};

/**
 * Handle node shutdown request
 *
 * @public
 * @method cleanup
 * @listens module:app~event:cleanup
 * @param  {function} cb Callback function
 * @return {function} cb Callback function from params (through setImmediate)
 */
Blocks.prototype.cleanup = function(cb) {
	__private.loaded = false;
	__private.cleanup = true;

	if (!__private.isActive) {
		// Module ready for shutdown
		return setImmediate(cb);
	}
	// Module is not ready, repeat
	setImmediate(function nextWatch() {
		if (__private.isActive) {
			library.logger.info('Waiting for block processing to finish...');
			setTimeout(nextWatch, 10000); // 10 sec
		} else {
			return setImmediate(cb);
		}
	});
};

/**
 * Get module loading status
 *
 * @public
 * @method isLoaded
 * @return {boolean} status Module loading status
 */
Blocks.prototype.isLoaded = function() {
	// Return 'true' if 'modules' are present
	return __private.loaded;
};

// Export
module.exports = Blocks;
