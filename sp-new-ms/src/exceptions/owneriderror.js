/*
* Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

function OwnerIdError(message) {
  if (message) {
    this.message = message;
  } else {
    this.message = 'Access is not permitted - **different owner-id detected**';
  }
}

OwnerIdError.prototype = new Error;

module.exports = {
  "x": OwnerIdError
};
