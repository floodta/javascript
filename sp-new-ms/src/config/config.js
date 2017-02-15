/*
 * Copyright (c) 2016 by Tecnotree Ltd. All Rights Reserved.
 */
'use strict';

module.exports = {
  "kafka": {
    "zookeeper": "localhost:2181",
    "producer": {
      "clientId": "sp-new-ms",
      "topic": "responseCDRDetails"
    },
    "consumer": {
      "clientId": "sp-new-ms",
      "groupId": "sp-new-ms-group",
      "topic": "requestCDRDetails",
      "autoCommit": true,
			"fromOffset:":false,
      "fetchMaxWaitMs": 1000,
      "fetchMaxBytes": 1024 * 1024
    }
  },
//  "timeToWait": 3000,
  "defaultPartition": 0
};
