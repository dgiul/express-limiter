'use strict';

// API Rate Limit

/**
 * Limits in-memory data structure which stores all of the limits
 */
var limits = {}

exports.findAll = function () {
	return limits
}


/**
 * Returns a limit if it finds one, otherwise returns
 * null if one is not found.
 * @param key The key to the limit
 * @param done The function to call next
 * @returns The limit if found, otherwise returns null
 */
exports.get = function (key, done) {
	var doc = limits[key]
	var limit = doc ? JSON.stringify(doc.limit) : undefined
	return done(null, limit)
}

/**
 * Saves a limit using key, total, remainin and reset values. 
 * @param key The key value for the record that consists of client_id, path and method values (required)
 * @param limit An object that contains total, remaining and reset fields (required)
 *    - total Allowed number of requests before getting rate limited  
 *    - remaining Rest of allowed number of requests
 *    - reset The expiration date of the limit that is a javascript Date() object
 * @param done Calls this with null always
 * @returns returns this with null
 */
exports.set = function (key, limit, timeType, expire, done) {
	limits[key] = { limit: JSON.parse(limit), timeType: timeType, expire: expire }
	if (exports.config.debug == true) {
		console.log(limits[key])
	}
	return done(null)
}

/**
 * Deletes a limit
 * @param key The limit to delete
 * @param done returns this when done
 */
exports.delete = function (key, done) {
	delete limits[key]
	return done(null)
}

/**
 * Removes expired limits.  It does this by looping through them all
 * and then removing the expired ones it finds.
 * @param done returns this when done.
 * @returns done
 */
exports.removeExpired = function (done) {
	var limitsToDelete = []
	var date = new Date()
	for (var key in limits) {
		if (limits.hasOwnProperty(key)) {
			var doc = limits[key]
			if (date > doc.expire) {
				limitsToDelete.push(key)
			}
		}
	}
	for (var i = 0; i < limitsToDelete.length; ++i) {
		if (exports.config.debug == true) {
			console.log("Deleting limit:" + key)
		}
		delete limits[limitsToDelete[i]]
	}
	return done(null)
}

/**
 * Removes all access limits.
 * @param done returns this when done.
 */
exports.removeAll = function (done) {
	limits = {}
	return done(null)
}



/**
 * Configuration of limits.
 *
 * total - Allowed number of requests before getting rate limited 
 * expiresIn - The time in seconds before the limit expires
 * timeToCheckExpiredLimits - The time in seconds to check expired limits
 */
var min = 60000, // 1 minute in milliseconds
    hour = 3600000; // 1 hour in milliseconds

exports.config = {
	lookup: ['user.id'], //  must be generated req.user object before. Or try 'connection.remoteAddress'
	total: 150,
	expire: 10 * min, 
	debug: false,
	timeToCheckExpiredLimits: 24 * hour
} 