/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

const _ = require("lodash");

const common = require('@tt-asa/common');
const log = _.invoke(common, "logger");

module.exports = {
  'getReadSpDetailsPromise': function getReadSpDetailsPromise(reqId, lib, spObj) {
    //log.debug("getReadSpDetailsPromise(): spObj.defId: " + spObj.defId);
    let promise =
    // Chaining for Getting Shared Plan Definition
    lib.db.model('SharedPlanDefinition')
    .findOneQAsync(reqId, spObj.defId).then( spdef => {
      spObj["planDefinition"] = spdef;
      //log.debug("getReadSpDetailsPromise() - 1: spObj: " + JSON.stringify(spObj));
      //log.debug("getReadSpDetailsPromise() - 1/2: spdef: " + JSON.stringify(spdef));
      // Chaining for Getting Member Allowance Data
      //log.debug("getReadSpDetailsPromise() - 2: spObj: " + JSON.stringify(spObj));
      return lib.db.model('MemberAllowanceShare')
      .findAllQAsync(reqId, {'planId': spObj.id});
    })
    .then(results => {
      //log.debug("getReadSpDetailsPromise() - 3: spObj: " + JSON.stringify(spObj));
      //log.debug("getReadSpDetailsPromise() - 3/1: spObj: " + JSON.stringify(results));
      // Chaining for Getting Member Allowance Data
      let memAlwsArr = [];
      if (_.isArray(results)) {
        memAlwsArr = results;
      }
      spObj["memberAllowanceShares"] = memAlwsArr;
      //log.debug("getReadSpDetailsPromise() - 3/2: spObj: " + JSON.stringify(spObj));
      return spObj;
    });
    return promise;
  }
};
