/*
* Copyright (c) 2016 by Tecnotree Ltd. All Rights Reserved.
*/
"use strict";

const Promise = require("bluebird");
const events = require('events');
const _ = require('lodash');
const uuid = require('uuid');
const common = require('@tt-asa/common');
const kafka = require('@tt-asa/common/src/kafka');
const log = _.invoke(common, "logger");
const lib = require("../lib");

const config = require('../config/config.js');
const main = require('../main');

let createConsumer = kafka.createConsumer;
let createClient = kafka.createClient;

let options = {
  "clientId": "sp-new-ms-test",
  "groupId": "sp-new-ms-test-group"
};

let topic = _.get(config, 'kafka.producer.topic') ;
/**
 * Generic Ok Test case core
 * @param done - mocha test case done
 * @param createRequesteMessageCb  - function(requestId) { ,,, return requesteMessageObj;}
 * @param validateResponseMesaageCb  - function(responseMasageObj) { ,,, should series }
 */
/*
function tcCore(done, createRequestPayloadPartsCb, validateResponseMessageCb) {
  log.debug("Started the test case...");
  // create gen-ms params
  let options = {
    "groupId": "models-test-group"
  };
  let reqRespTopicPair = [
    _.get(config, 'kafka.consumer.topic'),
    _.get(config, 'kafka.producer.topic')
  ];
  // Call get-config micro service via gen-ms.call()
  //  causing kafka query-request/query-response message exchange
  _.invoke(common, "gen-ms.call",
    // params
    reqRespTopicPair, createRequestPayloadPartsCb, validateResponseMessageCb, options
  )
  .then(()=>{
    done();
    return "ok";
  })
  .catch(e => {
    log.error('Caught error: ' + e.toString());
    done(e);
  });
};

*/
/**
 * Core for test cases expecting timeout error
 * @param done - mocha test case done
 * @param createRequesteMessageCb  - function(requestId) { ,,, return requesteMessageObj;}
 * @param timeoutErrorStr - error string to chacke for timeout error
 */
/*function tcCoreExpectTimeoutError(done, createRequestPayloadPartsCb, timeoutErrorStr, timoutMsecs) {
  log.debug("Started the test case...");
  // create gen-ms params
  let options = {
    "groupId": "models-test-group"
  };
  if(timoutMsecs) {
    options.timoutMsecs = timoutMsecs;
  }
  let reqRespTopicPair = [
    _.get(config, 'kafka.consumer.topic'),
    _.get(config, 'kafka.producer.topic')
  ];
  // Call get-config micro service via gen-ms.call()
  //  causing kafka query-request/query-response message exchange
  _.invoke(common, "gen-ms.call",
    // params
    reqRespTopicPair, createRequestPayloadPartsCb,
      (responseMessage) => {
        done("Not expected response message received - responseMessage: " + JSON.stringify(responseMessage));
      },
      options
  )
  .then((responseMessage) => {
    done("Not expected response message received - responseMessage: " + JSON.stringify(responseMessage));
    return "ok";
  })
  .catch(e => {
    if(timeoutErrorStr === e) {
      log.error('++Timeout error detected++: ' + e.toString());
      done();
    }
    else {
      log.error('++Caught error++: ' + JSON.stringify(e));
      done('Not expected error happened :'  + e.toString());
    }
  });
};

*/
///////////////////////
// Utils
///////////////////////
let testOwnerId = process.env.TESTOWNERID || "61932220";
let testMemberId = process.env.TESTMEMBERID || "61932230";
log.debug("testOwnerId: " + testOwnerId);
log.debug("testMemberId: " + testMemberId);

let testOwnerIdPerfix = testOwnerId.slice(0, -1);
let testMemberIdPerfix = testMemberId.slice(0, -1);
log.debug("testOwnerIdPerfix: " + testOwnerIdPerfix);
log.debug("testMemberIdPerfix: " + testMemberIdPerfix);

let testOwnerId1 = testOwnerIdPerfix + "0";
let testOwnerId2 = testOwnerIdPerfix + "1";
let testOwnerId3 = testOwnerIdPerfix + "2";

let date = (new Date()).getTime();

log.info("==============================");
log.info("testOwnerId1: " + testOwnerId1);
log.info("testOwnerId2: " + testOwnerId2);
log.info("testOwnerId3: " + testOwnerId3);
log.info("==============================");

let testMemberId1 = testMemberIdPerfix + "0";
let testMemberId2 = testMemberIdPerfix + "1";
let testMemberId3 = testMemberIdPerfix + "2";
log.info("testMemberId1: " + testMemberId1);
log.info("testMemberId2: " + testMemberId2);
log.info("testMemberId3: " + testMemberId3);
log.info("==============================");

function getTestSpDef() {
  return {
    "name": "test-sharedPlan",
    "unitType": 53,
    "allowance": 1024000,
    "packageDefId": 1004,
    "purchaseCost": 50000,
    "renewalCost": [10000],
    "additionalMemberCost": [5000],
    "validityPeriod": "m"
  };
};

function getTestSp(testSpDefObj) {
  return {
    'defId': testSpDefObj['id'],
    'ownerId': testOwnerId1
  };
};

function getTestMA() {
  return {
    "planId": -1,
    "memberId": testMemberId1,
    "allowanceShareType": "percent",
    "shareValue": 20
  };
};

function getTestREN() {
  return {
    "id": -1,
    "planId": -1,
    "expiry": date,
    "numRetries": 2
  };
};

function createTestData() {
  log.debug("createTestData: called ");
  return Promise.resolve(lib.db.model('SharedPlanDefinition').create(getTestSpDef))
  .then(spDefObj => {
    return lib.db.model('SharedPlanDefinition').saveAsync(spDefObj).then( () => {
      return spDefObj;
    });
  })
  .then(spDefObj => {
    let testSp = getTestSp(spDefObj);
    return Promise.resolve(lib.db.model('SharedPlan').create(testSp)).then(spObj => {
      return lib.db.model('SharedPlan').saveAsync(spObj)
      .then( () => {
        return ([spDefObj, spObj]);
      });
    });
  })
  .then(objs => {
    let spDefObj = objs[0];
    let testSp = objs[1];
    let testMa = getTestMA();
		testMa.defId = objs[0].id;
    testMa.planId = objs[1].id;
//    testRen.planId = objs[1].id;
    return Promise.resolve(lib.db.model('MemberAllowanceShare').create(testMa)).then(maObj => {
      return lib.db.model('MemberAllowanceShare').saveAsync(maObj)
      .then( () => {
					let masObject = JSON.stringify(maObj);
					return ([spDefObj, testSp, [masObject]]);
      });
    });
  })
  .then(objs => {
    let spDefObj = objs[0];
    let testSp = objs[1];
    let masObject = objs[2];
    let testRen = getTestREN();
    //testRen.planId = testSp.planId;
    testRen.planId = objs[1].id;
    return Promise.resolve(lib.db.model('Renewal').create(testRen)).then(renObj => {
      return lib.db.model('Renewal').saveAsync(renObj)
      .then( () => {
				//	let masObject = JSON.stringify(maObj);
					return ([spDefObj, testSp, [masObject],renObj ]);
      });
    });
  });
};



function updateRow(objToSave, model) {
  return lib.db.model(model).saveAsync(objToSave).then(function (obj ) {
    log.debug("Updated " + model + " row = " + JSON.stringify(obj));
    return obj;
  }) 
	.catch(e => {
    log.debug("err = " + JSON.stringify(e));
  });
};

function findRow(id, model) {
  	return lib.db.model(model).findOneAsync(id).then(function (obj ) {
      return obj;
  	}) 
		.catch(e => {
    	log.debug("err = " + JSON.stringify(e));
  	});
};

function findAllRow( criteria, model) {
  	return lib.db.model(model).findAllAsync(criteria).then(function (obj ) {
    	log.debug("Returning " + model + " row = " + JSON.stringify(obj));
      return obj;
  	}) 
		.catch(e => {
    	log.debug("err = " + JSON.stringify(e));
  	});
};


function removeRow(obj, model) {
  return lib.db.model(model).removeAsync(obj);
};



function genericBlankDb(model) {
  log.debug("genericBlankDb: called ");
  let criteria = null;
  return model.findAllAsync(criteria)
  .then(function (objs) {
    log.debug("genericBlankDb: objs= " + JSON.stringify(objs));
    if (!_.isArray(objs) || (objs.length === 0)) {
      return "ok";
    }
    let rmps = _.map(objs, obj => {
      model.removeAllAsync(obj);
    });
    return Promise.all(rmps);
  })
  .catch(e => {
    log.debug("genericBlankDb: err = " + JSON.stringify(e));
  });
};

function blankSpDb() {
  return genericBlankDb(lib.db.model('SharedPlan'));
}

function blankMaDb() {
  return genericBlankDb(lib.db.model('MemberAllowanceShare'));
};

function blankSpDefDb() {
  return genericBlankDb(lib.db.model('SharedPlanDefinition'));
};

function blankRenDefDb() {
  return genericBlankDb(lib.db.model('Renewal'));
};

function blankDb(db) {
  return new Promise((resolve, reject) => {
    db.send_command("flushdb", (err, data) => {
			if(err) {
				log.debug("blankdb() error occured : error = " + JSON.stringify(err));
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

function consumerListen(){
}

function writeCDR ( cdrMessageObj ) {
	let msgObj = {
   "jsonBody": cdrMessageObj
  };
	_.invoke(common,
		"gen-ms.cast",
		topic,
		function(correlationId) {
			let payloadParts = {};
			payloadParts.msgObj = msgObj;
		  return payloadParts;
		},
		options
	)
	.then(function() {
		log.debug("CDR generated successfully");
	})
	.catch(function(e) {
		log.debug('Failed to generate CDR, error: ' + e.toString());
	});

};

function setUpOffset(consumer){
	log.info("gen-ms::start::Setting up offsetOutOfRanger handler");
  consumer.on('offsetOutOfRange', (err) => {
		log.debug("gen-ms::start::offsetOutOfRanger handler called -  err:" + JSON.stringify(err));
		// Get config params
		//let topic = requestTopic;
		let partition = 0;
		let offset = new kafka.Offset(client);

		// Log the event
		log.warn('Consumer offsetOutOfRange event, topic: %s', topic);
		// Try to be in sync again
		offset.fetchAsync([{topic: topic, partition: partition, time: -1, maxNum: 2}])
  .then( (offsets) => {
	  let min = Math.min.apply(null, offsets[topic][partition]);
	  log.info('gen-ms::start::Latest available offset: %s', min);
	  return min;
	})
	.then( (newOffset) => {
		log.info('gen-ms::start::Setting topic %s:%s offset to %s', topic, partition, newOffset);
	  consumer.setOffset(topic, partition, newOffset);
	  log.info('gen-ms::start::Committing new offset');
	 // commit does not seem to take effect unless client consumes new messages
	 // does not seem to hurt either
	  return consumer.commitAsync(true);
 })
 .then( (data) => {
		log0.info('gen-ms::start::Offset committed');
	})
	.catch( (err) => {
		log.error('gen-ms::start::An error occurred while fetching offset: %s', err);
  });
});
					 //                                                                                                                                   log0.info("gen-ms::start::offsetOutOfRange handler has been setup");
					 //
					 //
}

function setUpConsumer(){
	let usedOptions = {};
	usedOptions = options;
	let clientId = _.get(config, 'kafka.consumer.clientId') ;
	let client = createClient(clientId, usedOptions);


//	let client = _.get(config, 'consumer.clientId') ;
	let zookeeperConnect = _.get(config, 'kafka.zookeeper') ;
  log.debug("Kafka client created." + client);
  log.debug("Kafka zoo created." + zookeeperConnect);

	//let consumerOptions = _.pick(usedOptions, ["autoCommit", "fetchMaxWaitMs", "fetchMaxBytes", "groupId", "offset", "fromOffset"]);
	let consumerOptions = _.get(config, 'kafka.consumer') ;
  log.debug("consumerOptions" + consumerOptions);

	//let consumer = createConsumer(client, topic, consumerOptions);
	return createConsumer(client, topic, consumerOptions);
  log.debug("ran consumer" );
};

function analyseQueue(){
 // Setup a queue to execute
 let q = async.queue(function(iteration, callback) {

 q.push(retryCount, function(error, success) { });

	q.drain = function() {
		if(finalResponse.resultCode === 0) {
			res.sendSuccess(finalResponse);
		} 
	};// queue drain

 
 });

};



function tcCoreTestTwo(done, consumer, sgcsResponseMessage) {
  log.debug("testfive" );
	consumer.on('error', function() {});
  let replyEventEmitter = new events.EventEmitter();
  log.debug("testsix" );
	let replyReceived = new Promise(function (resolve) {
  log.debug("testseven" );
    replyEventEmitter.on('query.response.received', function (sbqsResponseMessage) {
			resolve(sbqsResponseMessage);
			done();
  log.debug("testeight" );
		});
  });
	//let requestId = uuid.v4();
	//log.debug("Request id generated:" + requestId.toString());
	//var client = createTestKafkaClient(requestId.toString());
	//		  log.debug("Kafka client created.");
	//					  log.debug("Kafka producer created.");
	//					  var consumer = createTestKafkaConsumer(client, siteId);
	//							  log.debug("Kafka consumer created.");

  log.debug("testnine" );
	consumer.on('message', function(message) {
		log.debug("+++Kafka message received+++:" + JSON.stringify(message));
		consumer.pause();
		log.debug("testten" );
		let sbqsResponseMessage = JSON.parse(message.value);
		replyEventEmitter.emit('query.response.received', sbqsResponseMessage);
	});
  log.debug("testeleven" );

	consumer.close(true, function() {});
//	client.close(function() {});
};
function tcCoreTest(done, consumer, cdrAction) {
  log.debug("testOne" );
	consumer.on('error', () => {log.debug("error consumer called" ); });
	//setUpOffset(consumer);

  let replyEventEmitter = new events.EventEmitter();
  log.debug("testsix" );
	let replyReceived = new Promise(function (resolve) {
  log.debug("testseven" );
    replyEventEmitter.on('query.response.received', function (cdrMessage) {
			//resolve(sgcsResponseMessage);
			cdrAction(cdrMessage);
  log.debug("calling done" );
//			done();
  log.debug("testeight" );
		});
  });

	consumer.on('message', function(message) {
		//log.debug("+++Kafka message received+++:" + JSON.stringify(message));
		log.debug("+++Kafka message received+++:" );
		consumer.pause();
		let cdrMessage = JSON.parse(message.value);
		replyEventEmitter.emit('query.response.received', cdrMessage);
		
		consumer.close(true, () => {});
	//consumer.resume();
	//log.info("Setting up drain handler");
	//consumer.on('drain', function() {
	//  log.info('Drain event');
	//});

	//	done ();
	});


};
function tcCoreTestBackup(done, consumer, sgcsResponseMessage) {
  log.debug("testOne" );
	consumer.on('error', () => {log.debug("error consumer called" ); });
	//setUpOffset(consumer);

	consumer.on('message', function(message) {
		log.debug("+++Kafka message received+++:" + JSON.stringify(message));
		consumer.pause();
		sgcsResponseMessage = JSON.parse(message.value);
		//  if (sbqsResponseMessage.requestId === requestId) {
		//   replyEventEmitter.emit('query.response.received', sbqsResponseMessage);
		// }
	consumer.close(true, () => {});
	//consumer.resume();
	//log.info("Setting up drain handler");
		done ();
	});


};
/*
function blankDb() {
  let rmps = [
    blankSpDb(),
    blankMaDb(),
    blankSpDefDb(),
    blankRenDb()
  ];
  return Promise.all(rmps);
};
*/


// EXPORTS
//module.exports.tcCore = tcCore;
module.exports.tcCoreTest = tcCoreTest;
//module.exports.tcCoreExpectTimeoutError = tcCoreExpectTimeoutError;
module.exports.blankDb = blankDb;
module.exports.updateRow = updateRow;
module.exports.findRow = findRow;
module.exports.findAllRow = findAllRow;
module.exports.removeRow = removeRow;
module.exports.setUpConsumer = setUpConsumer;
module.exports.writeCDR = writeCDR;
module.exports.createTestData = createTestData;
