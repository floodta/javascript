/*
* Copyright (c) 2016 by Tecnotree Ltd. All Rights Reserved.
*/
"use strict";

const _ = require('lodash');
const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger");

function verifyOwnerId(req, id) {
  let log = log0.createRqLogger(req);
  log.debug('verifyOwnerId() called');

  if (_.isUndefined(req.headers)) {
    // Assumed the use is from swagger UI
    return true;
  }
  let clientId = req.headers.clientid;
  if (_.isUndefined(clientId)) {
    // Assumed the use is from swagger UI
    return true;
  }
  if(clientId === 0) {
    // Assumed the use is from swagger UI
    return true;
  }

  let ownerid = clientId.toString();
  log.debug('' + '+++ id to verify: (' + id + ') +++' + '');
  log.debug('' + '+++ retrieved owner_id is: (' + ownerid + ') +++' + '');
  return (id === ownerid);
}

module.exports.verifyOwnerId = verifyOwnerId;
