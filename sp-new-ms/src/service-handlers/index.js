/*
 * Copyright (c) 2015 by Tecnotree Ltd. All Rights Reserved.
 */

"use strict";
module.exports = function(lib) {
    const _ = require('lodash');
    const handlerSets = [
      require("./sharedplandefinition.handlers")(lib),
      require("./sharedplan.handlers")(lib),
      require("./memberallowanceshare.handlers")(lib)
    ];
    //Create the overall flat array of service handlers
    let serviceHandlers = _.reduce(handlerSets, (acc, hndlrs) => {
      return _.concat(acc, hndlrs);
    }, []);
//    console.log("serviceHandlers = " + JSON.stringify(serviceHandlers));
    return serviceHandlers;
};
