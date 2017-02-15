/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

function ArgumentError(message) {
  this.message = message;
}

ArgumentError.prototype = new Error;

module.exports = {
  "x": ArgumentError
};
