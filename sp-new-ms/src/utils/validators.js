/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

const _ = require('lodash'),
  HttpStatus = require('http-status-codes');

const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger");

// validators:= [validator]
// validator:= {'pred': predicateFuncNeedsToPass, 'rest_err': restErrorStringAtPredFails, 'err_str': errorStringAtPredFails}
function createValidator(validators) {
  return function (val) {
    let failed_validation = _.find(validators, vtor => {
      return !(vtor['pred'](val));
    });
    let err = true;
    let rest_err = null;
    let err_str = null;
    if (_.isUndefined(failed_validation)) {
      //Everything passed
      err = false;
    } else {
      rest_err = failed_validation['rest_err'];
      err_str = failed_validation['err_str'];
    }
    return {
      'err': err,
      'rest_err': rest_err,
      'err_str': err_str
    };
  };
};

function intParamValidator(param_value, param_name) {
  let validators = [
    {
      'pred': function (val) {
        return (!_.isUndefined(val) && !_.isNull(val));
      },
      'rest_err': 'InvalidArgumentError',
      'err_str': "Missing \'" + param_name + "\' parameter"
    },
    {
      'pred': val => {
        let intVal = parseInt(val);
        return (!_.isNaN(intVal));
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "\'" + param_name + "\' parameter is not an integer"
    }
  ];

  let validator = createValidator(validators);

  let res = validator(param_value);
  let valid = !res.err;

  let intValue = null;

  if (valid) {
    //Everything passed - pass back real integer value as well
    intValue = parseInt(param_value);
  }

  res['value'] = intValue;

  return res;
};

function intBodyParamValidator(param_value, param_name) {
  let validators = [
    {
      'pred': val => {
        return (!_.isUndefined(val) && !_.isNull(val));
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "Missing \'" + param_name + "\' parameter"
    },
    {
      'pred': val => {
        return (_.isNumber(val) && !_.isNaN(val));
      },
      'rest_err': 'InvalidArgumentError',
      'err_str': "\'" + param_name + "\' parameter is not a number"
    },
    {
      'pred': val => {
        let strVal = "" + val + "";
        let intVal = parseInt(strVal);
        return (!_.isNaN(intVal));
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "\'" + param_name + "\' parameter is not an integer"
    }
  ];

  let validator = createValidator(validators);

  let res = validator(param_value);

  return res;
};

function isTrue(value) {
  if (typeof (value) === 'string') {
    value = value.toLowerCase();
  }
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
    return true;
    default:
    return false;
  }
};

function strParamValidator(param_value, param_name) {
  let validators = [
    {
      'pred': val => {
        return (!_.isUndefined(val) && !_.isNull(val));
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "Missing \'" + param_name + "\' parameter"
    },
    {
      'pred': val => {
        return _.isString(val);
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "\'" + param_name + "\' parameter is not a string"
    }
  ];

  let validator = createValidator(validators);

  let res = validator(param_value);
  let valid = !res.err;

  let strValue = null;

  if (valid) {
    //Everything passed - pass back the string value as well
    strValue = param_value;
  }

  res['value'] = strValue;

  return res;
};

function strBodyParamValidator(param_value, param_name) {
  let validators = [
    {
      'pred': val => {
        return (!_.isUndefined(val) && !_.isNull(val));
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "Missing \'" + param_name + "\' parameter"
    },
    {
      'pred': val => {
        return _.isString(val);
      },
      'rest_err': HttpStatus.BAD_REQUEST,
      'err_str': "\'" + param_name + "\' parameter is not a number"
    }
  ];

  let validator = createValidator(validators);

  let res = validator(param_value);

  return res;
};

// Validate server request for parameter: id - if valid return parsed int value in {result: {"id"}, intValue}
function validateIdParam(req, name) {
  let log = log0.createRqLogger(req);
  log.debug("validateIdParam() called");

  if(!req["params"]) {
    return {
      'err': {
        'restErr': HttpStatus.BAD_REQUEST,
        'errStr': 'Missing ' + name
      }
    };
  }
  let id = req.params["id"];
  if (!id) {
    return {
      'err': {
        'restErr': HttpStatus.BAD_REQUEST,
        'errStr': 'Missing ' + name
      }
    };
  }
  let valres = intParamValidator(id, name);
 // let valres = strParamValidator(id, name);
  if (valres.err) {
    return {
      'err': {
        'restErr': valres['rest_err'],
        'errStr': valres['err_str']
      }
    };
  }
  id = valres['value'];
  log0.debug("validateIdParam:valres" + JSON.stringify(valres));

  let ret = {
    'err': false,
    'result': {
      'id': id
    }
  };
  log0.debug("validateIdParam:ret" + JSON.stringify(ret));
  return ret;
};

module.exports.createValidator = createValidator;
module.exports.intParamValidator = intParamValidator;
module.exports.intBodyParamValidator = intBodyParamValidator;
module.exports.isTrue = isTrue;
module.exports.strParamValidator = strParamValidator;
module.exports.strBodyParamValidator = strBodyParamValidator;
module.exports.validateIdParam = validateIdParam;
