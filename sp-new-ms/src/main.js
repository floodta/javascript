/*
* Copyright (c) 2016 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

let argv = require('minimist')(process.argv.slice(2));
if (argv['help']) {
  console.log("Usage: node src/main [options]");
  console.log("       node src/main --zookeeper localhost:2181");
  console.log("");
  console.log("Options:");
  console.log("--zookeeper <zookeeker>  set up zoopkeeper hostname:port (i.e. --zookeeper localhost:2181 )");
  console.log("--llevel <llevel>        set up log level options: debug|trace|info|warn|error (i.e. --llevel info )");
  console.log("");
  console.log("");
  console.log("");

  process.exit(0);
}

const HttpStatus = require('http-status-codes');
const _ = require('lodash');

var events = require('events');

const config = require('./config/config');

const common = require('@tt-asa/common');
const log0 = _.invoke(common, "logger", "sp-new-ms");

const ck = _.invoke(common, "kakfa", "sp-new-ms");

const ex = require('./exceptions');
const lib = require('./lib');

const zookeeper = argv['zookeeper'] || _.get(config, 'kafka.zookeeper') || 'localhost:2181';

let VoiceCDR = common.cdr.voiceCdr;
let DataCDR = common.cdr.dataCdr;

var cdrTopic = _.get(config, 'kafka.producer.cdrTopic') ;

//////////////////////////
// Creating ms from common gen-ms
//////////////////////////
let options = {
  "clientId": "sp-new-ms",
  "groupId": "sp-new-ms",
  "zookeeper": zookeeper
};

let reqRespTopicPair = [
  _.get(config, 'kafka.consumer.topic'),
  _.get(config, 'kafka.producer.topic')
];

// Launch the micro service
_.invoke(common, "gen-ms.start",
  // params
  reqRespTopicPair, handleCall, options
 // reqRespTopicPair, handleCall, options
)
.then(() => {
  log0.info("+++ The sp-new-ms Micro service has been started successfully ++++");
})
.catch(e => {
  log0.error("Could not start the Micro service - reason: " + e.toString() + " ....");
  process.exit();
});

// End of service creation

//////////////
// Utils
//////////////
function startKafka(){
}
function handleCall(callContext) {
	 /*
  // Attach to call context
log0.debug("tzf handleCall");	
//let consumer = ck.createConsumer(client, requestTopic, consumerOptions);
//	let consumerOptions = _.pick(usedOptions, ["autoCommit", "fetchMaxWaitMs", "fetchMaxBytes", "groupId", "offset", "fromOffset"]);
//	if(!consumerOptions.groupId) {
//		consumerOptions.groupId = ("gen-ms-server-group-" + (process.pid).toString());
	}
//let consumer = ck.createConsumer(client, cdrTopic, consumerOptions);
      //  if param int => success status code i.e. 201, 202
      //  if param obj => success with 200 and the obj json obj -> body
 //     if(_.isObject(statusOrObj)) {
  //      let jsonBody = statusOrObj;
        //  if param int => success status code i.e. 201, 202
   //     let jsonStr = JSON.stringify(jsonBody);
    //    let status = HttpStatus.OK;
        if(arg2) {
          status = arg2;
        }
        log.debug("Service handler returned with success [status: " + status + " ], [obj-str: " + jsonStr + " ]");
        // Prepare the response
        let responseHeaderAdditions = {
          "httpStatusCode": status
        };
        let msgObj = {
          "jsonBody": jsonBody
        };
        //---------------------------------------
        // Send back kafka response
        let rsParts = {};
        rsParts.msgObj = msgObj;
        rsParts.headerAdditions = responseHeaderAdditions;
        return new Promise( (resolve, reject) => {
          sendPayloads(rsParts, (err, data) => {
            if(err) {
              log.error("Kafka produder error: " + data);
              reject(err);
            } else {
              resolve("ok");
            }
          });
        });
        //---------------------------------------
      } else {
        let status = statusOrObj;
        log.debug("Service handler returned with success: [ status: " + status + " ]");
        // Prepare the response
        let responseHeaderAdditions = {
          "httpStatusCode": status
        };
        let rsParts = {};
        rsParts.headerAdditions = responseHeaderAdditions;
        //---------------------------------------
        // Send back kafka response
        return new Promise( (resolve, reject) => {
          sendPayloads(rsParts, (err, data) => {
            if(err) {
              log.error("Kafka produder error: " + data);
              reject(err);
            } else {
              resolve("ok");
            }
          });
        });
        //---------------------------------------
      }
    },
    "sendError": (status, errObjOrStr) => {
      log.debug("Service handler returned with error: [status: " + status + "] errObjOrStr: [ " + errObjOrStr + "]");
      // Prepare the response
      let responseHeaderAdditions = {
        "httpStatusCode": status
        //"httpHeader": undefined
      };
      let jsonBody = (function () {
        if(_.isString(errObjOrStr)) {
          return {'message': errObjOrStr};
        } else {
          return errObjOrStr;
        }
      })();
      let msgObj = {
        "jsonBody": jsonBody
      };
      //---------------------------------------
      // Send back kafka response
      let rsParts = {};
      rsParts.msgObj = msgObj;
      rsParts.headerAdditions = responseHeaderAdditions;
      return new Promise( (resolve, reject) => {
        sendPayloads(rsParts, (err, data) => {
          if(err) {
            log.error("Kafka produder error: " + data);
            reject(err);
          } else {
            resolve("ok");
          }
        });
      });
      //---------------------------------------
    }
  };
	log.debug("tzf end ");
	*/
};



// Method to push CDR messages to Kafka topic
 function sendCDR(cdrs, requestId) {
   cdrs.forEach(function(cdr) {
       log0.debug("Generating CDR " + JSON.stringify(cdr));
       _.invoke(common,
				"gen-ms.cast",
         cdrTopic,
         function(correlationId) {
          var msgObj = {
            "jsonBody": cdr
          };
          var payloadParts = {};
          payloadParts.correlationId = requestId;
          payloadParts.msgObj = msgObj;
          return payloadParts;
        },
        options
       )
      .then(function() {
        log0.debug("CDR generated successfully");
        return "ok";
      })
			.catch(function(e) {
				log0.debug('Failed to generate CDR, error: ' + e.toString());
			});
		});
  }//sendCDR
//
