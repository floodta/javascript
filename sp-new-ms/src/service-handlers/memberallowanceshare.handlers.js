/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/
"use strict";

const _ = require('lodash'),
  HttpStatus = require('http-status-codes'),
  Promise = require("bluebird");

const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger");

const
  vtors = require('../utils/validators'),
  ex = require('../exceptions'),
  pu = require('../utils/promises'),
  vf = require('../utils/verify');

//    pp = require("pp-services");

// TODO: remove below hack after resolving the pp-service hooks for SP Ph2
const pp = {
  "validateSubscriberQAsync": function (subId) {
    return Promise.resolve("ok");
  },
  "balanceQueryMemberQAsync": function(reqId, spObj, spDefObj, memAlws) {
    return Promise.reject("balanceQueryMember(): Not supported in Ph2 yet!");
  }
};

//  Promise.promisifyAll(pp);


module.exports = function (lib) {
  const serviceHandlers = [];

  const getReadSpDetailsPromise = pu.getReadSpDetailsPromise;
  const verifyOwnerId = vf.verifyOwnerId;

  //    {
  //      'path': '/memberallowanceshares/{id}',
  //      'method': 'GET',
  //      'summary': 'Returns the full data of a member allowance share',
  //      "params": [swagger.pathParam('id', 'The Id of the member allowance share in question','int'),
  //          swagger.queryParam('balance_query', 'optional param i.e. for \'balance_query\'', 'boolean')],
  //      "nickname": "getMemberAllowanceShare"
  //    }
  serviceHandlers.push({
    'resource': '/memberallowanceshares/:id',
    'method': 'GET',
    'handler': getMemberAllowanceShareHandler
  });
  function getMemberAllowanceShareHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called getMemberAllowanceShare() handler");

    // Request validation
    let valRes = vtors.validateIdParam(req, 'Member Allowance share id');
    if (valRes.err) {
      // Send back error to client
      //        counters.failure(req, 'memberallowancesharesinstance', 'GET');
      //        return next(controller.RESTError(req, valRes.err['restErr'], valRes.err['errStr']));
      // log.debug("getMemberAllowanceShareHandler: validateIdParam() error: valRes = " + JSON.stringify(valRes));
      return res.sendError(valRes.err['restErr'], valRes.err['errStr']);
    }
    // Get the validated params
    let id = valRes.result['id'];

    ///////////
    // Fulfilling Request
    ///////////
    return lib.db.model('MemberAllowanceShare')
    // Chaining to Member Allowance
    .findOneQAsync(req.getId(), id).then(function (memAlws) {
      if (!memAlws) {
        throw new ex.ArgumentError("Invalid \'id\': Member allowance share data not found");
      }
      // Chaining to Read Shared Plan
      return lib.db.model('SharedPlan')
      .findOneQAsync(req.getId(), memAlws.planId).then(function (spObj) {
        if (!spObj) {
          throw new ex.ArgumentError("Shared plan not found");
        }
        // Chaining to Read Shared Plan Details
        return getReadSpDetailsPromise(req.getId(), lib, spObj);
      })
      .then(function (spObj) {
        // ** Verify owner id **
        if (!verifyOwnerId(req, spObj['ownerId'])) {
          throw new ex.OwnerIdError();
        }
        let nextPromise;
        // Checking if balance query is needed
        let balance_query = vtors.isTrue(req.params.balance_query);
        if (balance_query) {
          // Chaining to do balance query
          nextPromise = balanceQueryHandler(lib, req, res, spObj, memAlws);
        } else {
          // Just pass the member allowance data
          nextPromise = memAlws;
        }
        // Chaining to do ne
        return nextPromise;
      });
    })
    .then(function (memAlws) {
      // Send back the Member Allowance Share details to the client
      //          controller.writeHAL(req, res, memAlws);
      //          counters.success(req, 'memberallowancesharesinstance', 'GET');
      //          return next();
      return res.sendSuccess(memAlws);
    })
    .catch(ex.OwnerIdError, function (error) {
      log.debug(('' + 'OwnerIdError: ' + error.message + '').red);
      //          counters.failure(req, 'memberallowancesharesinstance', 'GET');
      //          res.send(HttpStatus.FORBIDDEN, {error: true, msg: error.message});
      //          return;
      return res.sendError(HttpStatus.FORBIDDEN, error.message);
    })
    .catch(ex.ArgumentError, function (error) {
      log.debug(('' + 'ArgumentError: ' + error.message + '').red);
      //          counters.failure(req, 'memberallowancesharesinstance', 'GET');
      //          return next(controller.RESTError(req, 'InvalidArgumentError', error.message));
      return res.sendError(HttpStatus.BAD_REQUEST, error.message);
    })
    .catch(function (error) {
      log.debug(("" + error + "").red);
      //          counters.failure(req, 'memberallowancesharesinstance', 'GET');
      //          return next(controller.RESTError(req, 'InternalServerError', error));
      return res.sendError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    });
    // End fulfillment
  };

  // log0.debug("serviceHandlers.length = " + serviceHandlers.length);

  return serviceHandlers;
};

//////////////////
// Utility functions
/////////////////
// Shared Plan balance query handler
function balanceQueryHandler(lib, req, res, spObj, memAlws) {
  let log = log0.createRqLogger(req);
  log.debug("balanceQueryHandler() called");

  let spDefObj = spObj['planDefinition'];
  let memAlwsArr = spObj['memberAllowanceShares'];
  var spObj = _.omit(spObj, ['planDefinition', 'memberAllowanceShares']);

  // Chaining for Calling ppService to do balance query via SMA services
  return pp.balanceQueryMemberQAsync(req.getId(), spObj, spDefObj, memAlws)
  .then(function (result) {
    // Refresh member allowance current balance from the balance query result
    memAlws.currentBalance = result.currentBalance;
    // Return Member Allowance object as promise (result in immediate fulfillment)
    return memAlws;
  });
}
