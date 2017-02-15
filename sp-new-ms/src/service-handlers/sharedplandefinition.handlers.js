/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

const _ = require('lodash'),
  HttpStatus = require('http-status-codes');

const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger");

const ex = require('../exceptions');

module.exports = function (lib) {
  const serviceHandlers = [];
  //    {
  //      'path': '/sharedplandefinitions',
  //      'method': 'GET',
  //      'summary': 'Returns the list of shared plan definitions',
  //      "params": [],
  //      "responseclass": "SharedPlanDefinition",
  //      "nickname": "getSharedPlanDefinitions"
  //    },
  serviceHandlers.push({
    'resource': '/sharedplandefinitions',
    'method': 'GET',
    'handler': getSharedPlanDefinitionsHandler
  });
  function getSharedPlanDefinitionsHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called GET:/sharedplandefinitions handler");

    let model = lib.db.model('SharedPlanDefinition');
    ///////////
    // Fulfilling Request
    ///////////
    return model.findAllQAsync(req.getId(), {}).then(spdefs => {
      log.debug("after findAllAsync");
      if (spdefs.length === 0) {
        //spdefs = NoEntryAvailableStr;
        //          res.send(HttpStatus.NO_CONTENT);
        return res.sendSuccess(HttpStatus.NO_CONTENT);
      } else {
        // Send back the Shared Plan Definition data to the client
        //          controller.writeHAL(req, res, spdefs);
        return res.sendSuccess(spdefs);
      }
      //        counters.success(req, 'sharedplandefinition', 'GET');
    })
    .catch(error => {
      log.debug(("" + error + "").red);
      //          counters.failure(req, 'sharedplandefinition', 'GET');
      //          next(controller.RESTError(req, 'InternalServerError', error));
      return res.sendError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    });
    // End fulfillment
  };
  //let x =getSharedPlanDefinitionsHandler;

  //    {
  //      'path': '/sharedplandefinitions/{id}',
  //      'method': 'GET',
  //      'summary': 'Returns the full data of a shared plan definition',
  //      "params": [ swagger.pathParam('id', 'The Id of the shard plan definition','int') ],
  //      "nickname": "getSharedPlanDefinition"
  //    },
  serviceHandlers.push({
    'resource': '/sharedplandefinitions/:id',
    'method': 'GET',
    'handler': getSharedPlanDefinitionHandler
  });
  function getSharedPlanDefinitionHandler(req, res) {
    let log = log0.createRqLogger(req);
    log.debug("Called GET:/sharedplandefinitions/{id} handler");

    // Request validation
    let valRes = validate(req);
    if (valRes.err) {
      // Send back error to client
      //        counters.failure(req, 'sharedplandefinitioninstance', 'GET');
      //        return next(controller.RESTError(req, valRes.result['restErr'], valRes.result['errStr']));
      return res.sendError(valRes.result['restErr'], valRes.result['errStr']);
    }
    // Get the validated params
    let id = valRes.result['id'];

    // Fulfilling Request
    return lib.db.model('SharedPlanDefinition')
    // Chaining to Read Shared Plan Definition
    .findOneQAsync(req.getId(), id).then(spdef => {
      if (!spdef) {
        throw new ex.ArgumentError("Invalid id: Shared plan definition not found");
      }
      // Send back Shared Plan definition details to client
      //        controller.writeHAL(req, res, spdef);
      //        counters.success(req, 'sharedplandefinitioninstance', 'GET');
      //        next();
      return res.sendSuccess(spdef);
    })
    .catch(ex.ArgumentError, error => {
      log.debug(('' + 'ArgumentError: ' + error.message + '').red);
      //          counters.failure(req, 'sharedplandefinitioninstance', 'GET');
      //          next(controller.RESTError(req, 'InvalidArgumentError', error.message));
      return res.sendError(HttpStatus.BAD_REQUEST, error.message);
    })
    .catch(error => {
      //          counters.failure(req, 'sharedplandefinitioninstance', 'GET');
      //          next(controller.RESTError(req, 'InternalServerError', error));
      return res.sendError(HttpStatus.BAD_REQUEST, error);
    });
    // End fulfillment

    ///////////
    // Utils
    //////////
    function validate(req) {
      let log = log0.createRqLogger(req);
      log.debug("validate() called");

      let id = req.params.id;
      if (!id) {
        return {
          'err': true,
          'result': {
            'restErr': HttpStatus.BAD_REQUEST,
            'errStr': 'Missing Shared plan definition id'
          }
        };
      }
      return {
        'err': false,
        'result': {
          'id': id
        }
      };
    }
    ;
    //////////
  };

  // log0.debug("serviceHandlers.length = " + serviceHandlers.length);

  return serviceHandlers;
};
