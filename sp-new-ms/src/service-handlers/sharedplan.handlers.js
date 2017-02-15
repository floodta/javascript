/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

const _ = require('lodash'),
  HttpStatus = require('http-status-codes');

const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger");

const
  //    pp = require("pp-services"),
  vtors = require('../utils/validators'),
  ex = require('../exceptions'),
  pu = require('../utils/promises'),
  vf = require('../utils/verify');

const Promise = require("bluebird");

// TODO: remove below hack after resolving the pp-service hooks for SP Ph2
const pp = {
  "validateSubscriberQAsync": function (subId) {
    return Promise.resolve("ok");
  },
  "balanceQueryPlanQAsync": function(reqId, spObj, spDefObj, memberAllowances) {
    return Promise.reject("balanceQueryPlan(): Not supported in Ph2 yet!");
  },
  "activatePlanQAsync": function(reqId, spObj, spDefObj, memAlwsArr) {
    return Promise.reject("activatePlan(): Not supported in Ph2 yet!");
  }
};

//  Promise.promisifyAll(pp);

module.exports = function (lib) {
  const serviceHandlers = [];
  const getReadSpDetailsPromise = pu.getReadSpDetailsPromise;
  const verifyOwnerId = vf.verifyOwnerId;
  //    {
  //      'path': '/sharedplans',
  //      'method': 'GET',
  //      'summary': 'Returns the list of shared plans',
  //      "params": [queryPar],
  //      "responseclass": "SharedPlan",
  //      "nickname": "getSharedPlans"
  //    },
  serviceHandlers.push({
    'resource': '/sharedplans',
    'method': 'GET',
    'handler': getSharedPlansHandler
  });
  function getSharedPlansHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called GET:/sharedplans handler");

    // Request validation
    let valRes = validate(req);
    if (valRes.err) {
      // Send back error to client
      //      counters.failure(req, 'sharedplan', 'GET');
      //        return next(controller.RESTError(req, valRes.result['restErr'], valRes.result['errStr']));
      return res.sendError(valRes.result['restErr'], valRes.result['errStr']);
    }
    // Get the validated params
    let criteria = valRes.result['criteria'];
    let ownerId = valRes.result['ownerid'];

    // ** Verify owner id **
    if (!_.isUndefined(ownerId) && !_.isNull(ownerId)) {
      if (!verifyOwnerId(req, ownerId)) {
        //        counters.failure(req, 'sharedplan', 'GET');
        //          res.send(HttpStatus.FORBIDDEN, {error: true, msg: 'Access is not permitted - **different owner-id detected**'});
        //          return;
        return res.sendError(HttpStatus.FORBIDDEN, 'Access is not permitted - **different owner-id detected**');
      }
    }

    ///////////
    // Fulfilling Request
    ///////////
    return lib.db.model('SharedPlan')
    // Chaining to Read Shared Plans
    .findAllQAsync(req.getId(), criteria).then(spObjs => {
      let readPromises = Promise.map(spObjs, (spObj, index) => {
        return getReadSpDetailsPromise(req.getId(), lib, spObj);
      });
      // Chaining to Read Shared Plans' Details
      return readPromises;
    })
    .then(results => {
      if (!_.isArray(results) || (results.length === 0)) {
        //results = NoEntryAvailableStr;
        //            res.send(HttpStatus.NO_CONTENT);
        res.sendSuccess(HttpStatus.NO_CONTENT);
      } else {
        // Send back Shared Plan details to client
        //            controller.writeHAL(req, res, results);
        res.sendSuccess(results);
      }
      //        counters.success(req, 'sharedplan', 'GET');
      //          next();
      return;
    })
    .catch(error => {
      log.debug(("" + error + "").red);
      //        counters.failure(req, 'sharedplan', 'GET');
      //          next(controller.RESTError(req, 'InternalServerError', error));
      res.sendError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    });
    // End fulfillment

    ///////////
    // Utils
    //////////
    function validate(req) {
      let log = log0.createRqLogger(req);
      log.debug("validate() called");

      let ownerid = null;
      let owneridRequired = true;
      if (!req.params.owner_id && owneridRequired) {
        return {
          'err': true,
          'result': {
            'restErr': HttpStatus.BAD_REQUEST,
            'errStr': 'Missing a\'owner-id\' parameter'
          }
        };
      }
      if (req.params.owner_id) {
        let valres = vtors.strParamValidator(req.params.owner_id, 'owner-id');
        if (valres.err) {
          return {
            'err': true,
            'result': {
              'restErr': valres['rest_err'],
              'errStr': valres['err_str']
            }
          };
        }
        ownerid = valres['value'];
      } else {
        let clientId = req.headers.clientid;
        if (!_.isUndefined(clientId)) {
          ownerid = clientId.toString();
          log.debug('' + '+++ owner_id taken from client_id (' + ownerid + ') +++' + '');
        }
      }
      let criteria = null;
      if (!_.isNull(ownerid)) {
        criteria = {'ownerId': ownerid};
      }
      return {
        'err': false,
        'result': {
          'ownerid': ownerid,
          'criteria': criteria
        }
      };
    }
    ;
    //////////
  };

  //    {
  //      'path': '/sharedplans/{id}',
  //      'method': 'GET',
  //      'summary': 'Returns the full data of a shared plan',
  //      "params": [ swagger.pathParam('id', 'The Id of the shared plan','int'),
  //          swagger.queryParam('balance_query', 'optional param i.e. for \'balance_query\'', 'boolean')],
  //      "nickname": "getSharedPlan"
  //    },
  serviceHandlers.push({
    'resource': '/sharedplans/:id',
    'method': 'GET',
    'handler': getSharedPlanHandler
  });
  function getSharedPlanHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called GET:/sharedplans/{id} handler");

    // Request validation
    let valRes = vtors.validateIdParam(req, 'Shared plan id');
    if (valRes.err) {
      // Send back error to client
      //      counters.failure(req, 'sharedplaninstance', 'GET');
      //        return next(controller.RESTError(req, valRes.err['restErr'], valRes.err['errStr']));
      return res.sendError(valRes.err['restErr'], valRes.err['errStr']);

    }
    // Get the validated params
    let id = valRes.result['id'];

    // Fulfilling Request
    return lib.db.model('SharedPlan')
    // Chaining to Read Shared Plan
    .findOneQAsync(req.getId(), id).then(spObj => {
      if (!spObj) {
        throw new ex.ArgumentError("Invalid id: Shared plan not found");
      }
      // Chaining to Read Shared Plan Details
      return getReadSpDetailsPromise(req.getId(), lib, spObj);
    })
    .then(spObj => {
      // ** Verify owner id **
      if (!verifyOwnerId(req, spObj['ownerId'])) {
        throw new ex.OwnerIdError();
      }
      // Check if balance query is needed
      let nextPromise;
      let balance_query = vtors.isTrue(req.params.balance_query);
      if (balance_query) {
        // Do balance query
        nextPromise = balanceQueryHandler(lib, req, res, spObj);
      } else {
        // Just pass the shared plan data
        nextPromise = spObj;
      }
      return nextPromise;
    })
    .then(spObj => {
      // Send back Shared Plan details to client
      //          controller.writeHAL(req, res, spObj);
      return res.sendSuccess(spObj);
      //        counters.success(req, 'sharedplaninstance', 'GET');
      //          next();
    })
    .catch(ex.OwnerIdError, error => {
      log.debug(('' + 'OwnerIdError: ' + error.message + '').red);
      //        counters.failure(req, 'sharedplaninstance', 'GET');
      //          res.send(HttpStatus.FORBIDDEN, {error: true, msg: error.message});
      //          return;
      return res.sendError(HttpStatus.FORBIDDEN, error.message);
    })
    .catch(ex.ArgumentError, error => {
      log.debug(('' + 'ArgumentError: ' + error.message + '').red);
      //        counters.failure(req, 'sharedplaninstance', 'GET');
      //          next(controller.RESTError(req, 'InvalidArgumentError', error.message));
      return res.sendError(HttpStatus.BAD_REQUEST, error);
    })
    .catch(error => {
      log.debug(("" + error + "").red);
      //        counters.failure(req, 'sharedplaninstance', 'GET');
      //          next(controller.RESTError(req, 'InternalServerError', error));
      return res.sendError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    });
    // End fulfillment
  };

  //    {
  //      'path': '/sharedplans/{id}/memberallowanceshares',
  //      'method': 'GET',
  //      'summary': 'Returns all of the member allwoance data for the specified shared plan',
  //      "params": [ swagger.pathParam('id', 'The Id of the shared plan','int') ],
  //      "nickname": "getSharedPlanMemberAllowanceShares"
  //    },
  serviceHandlers.push({
    'resource': '/sharedplans/:id/memberallowanceshares',
    'method': 'GET',
    'handler': getSharedPlanMemberAllowanceSharesHandler
  });
  function getSharedPlanMemberAllowanceSharesHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called GET:/sharedplans/{id}/memberallowanceshares handler");

    // Request validation
    let valRes = vtors.validateIdParam(req, 'Shared plan id');
    if (valRes.err) {
      // Send back error to client
      //      counters.failure(req, 'sharedplaninstancememberallowance', 'GET');
      //        return next(controller.RESTError(req, valRes.err['restErr'], valRes.err['errStr']));
      return res.sendError(valRes.err['restErr'], valRes.err['errStr']);
    }
    // Get the validated params
    let id = valRes.result['id'];

    ///////////
    // Fulfilling Request
    ///////////
    return lib.db.model('SharedPlan')
    // Chaining to Read Shared Plan
    .findOneQAsync(req.getId(), id).then(spObj => {
      if (!spObj) {
        throw new ex.ArgumentError("Invalid id: Shared plan not found");
      }
      // Chaining to Read Shared Plan Details
      return getReadSpDetailsPromise(req.getId(), lib, spObj);
    })
    .then(spObj => {
      // ** Verify owner id **
      if (!verifyOwnerId(req, spObj['ownerId'])) {
        throw new ex.OwnerIdError();
      }
      // Send back Shared Plan's member Allowance Share details to client
      let memAlwsArr = spObj['memberAllowanceShares'];
      if (memAlwsArr.length === 0) {
        //memAlwsArr = NoEntryAvailableStr;
        //            res.send(HttpStatus.NO_CONTENT);
        return res.sendSuccess(HttpStatus.NO_CONTENT);
      } else {
        //            controller.writeHAL(req, res, memAlwsArr);
        return res.sendSuccess(memAlwsArr);
      }
      //        counters.success(req, 'sharedplaninstancememberallowance', 'GET');
      //          next();
      //          return;
    })
    .catch(ex.OwnerIdError, error => {
      log.debug(('' + 'OwnerIdError: ' + error.message + '').red);
      //        counters.failure(req, 'sharedplaninstancememberallowance', 'GET');
      //          res.send(HttpStatus.FORBIDDEN, {error: true, msg: error.message});
      //          return;
      return res.sendError(HttpStatus.FORBIDDEN, error.message);
    })
    .catch(ex.ArgumentError, error => {
      log.debug(('' + 'ArgumentError: ' + error.message + '').red);
      //        counters.failure(req, 'sharedplaninstancememberallowance', 'GET');
      //          next(controller.RESTError(req, 'InvalidArgumentError', error.message));
      return res.sendError(HttpStatus.BAD_REQUEST, error.message);
    })
    .catch(error => {
      //        counters.failure(req, 'sharedplaninstancememberallowance', 'GET');
      //          next(controller.RESTError(req, 'InternalServerError', error));
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
function balanceQueryHandler(lib, req, res, exSpObj) {
  let log = log0.createRqLogger(req);
  log.debug("balanceQueryHandler() called");

  let spDefObj = exSpObj['planDefinition'];
  let memAlwsArr = exSpObj['memberAllowanceShares'];
  let spObj = _.omit(exSpObj, ['planDefinition', 'memberAllowanceShares']);

  // Chaining for Calling ppService to do balance query via SMA services
  return pp.balanceQueryPlanQAsync(req.getId(), spObj, spDefObj, memAlwsArr)
  .then(result => {
    //
    if (_.isObject(result.planData)) {
      log.debug("ppService.balanceQueryPlan() returned plan data");
      spObj.ownShare.currentBalance = result.planData.ownShare.currentBalance;
    } else {
      log.debug("ppService.balanceQueryPlan() has NOT returned plan data".red);
    } // end of _.isObject()

    if (!_.isArray(result.memberAllowancesData)) {
      log.debug("ppService.balanceQueryPlan() has NOT returned member allowances data");
    } else {
      log.debug("ppService.balanceQueryPlan() returned member allowances data");
      // Refresh member allowance current blanaces from the balance query result
      _.each(result.memberAllowancesData, (rma, index1) => {
        _.each(memAlwsArr, (ma, index) => {
          if (rma.id === ma.id) {
            memAlwsArr[index].currentBalance = rma.currentBalance;
          }
        });
      });
    } // end of _.isArray()

    spObj['planDefinition'] = spDefObj;
    spObj['memberAllowanceShares'] = memAlwsArr;

    // Return the updated Shared Plan object as promise (result in immediate fulfillment)
    return spObj;
  });
};
