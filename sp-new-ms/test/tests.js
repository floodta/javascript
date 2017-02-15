/*
* Copyright (c) 2016 by Tecnotree Ltd. All Rights Reserved.
*/

"use strict";

const Promise = require("bluebird");
const _ = require('lodash');
const redis = require("redis");
const should = require('should');
const events = require('events');

const common = require('@tt-asa/common');

const log = _.invoke(common, "logger", "models-tests");

const tu = require('../src/utils/test');

const waitTimeMsecs = 500;  // 10 sec

let blankDb = tu.blankDb;
let createTestData = tu.createTestData;
let findRow = tu.findRow;
let writeCDR = tu.writeCDR;
let findAllRow = tu.findAllRow;
let setUpConsumer = tu.setUpConsumer;
let updateRow = tu.updateRow;
let removeRow = tu.removeRow;
let tcCore = tu.tcCore;
let tcCoreTest = tu.tcCoreTest;
let tcCoreExpectTimeoutError = tu.tcCoreExpectTimeoutError;

describe('models tests', () => {
  let testSpDef, testSp, testMas, testRen, consumer;
	let DataCDR = common.cdr.dataCdr;
	     //let sampleCdr = new DataCDR(sharedPlanPackageDetails.subscriberId, config.cdr.SHARED_PLAN_RECHARGE);
  let sampleCDR = new DataCDR('932220',130 );

  function createTestDataForThisTest(db) {
		return blankDb(db).then( () => {
			return createTestData().then( objs => {
				let spDefObj = objs[0];
				let spObj = objs[1];
				let maObjs = objs[2];
				let renObjs = objs[3];
				// Setup test data for the test suite
				testSpDef = spDefObj;
				testSp = spObj;
				testMas = maObjs;
				testRen = renObjs;
				return [testSpDef, testSp, testMas, testRen];
			});
		});
  };

  function createTestCDR(cdr) {
		 writeCDR(cdr)
  };


  let dbReadyEventEmitter = new events.EventEmitter();
  let consumerReadyEventEmitter = new events.EventEmitter();

	before(done => {

		// DATABASE DATA in REDIS
		let consumerReady = new Promise( function(resolve, reject)  {
			consumerReadyEventEmitter.on('connect.received',  function () {
				resolve();
			});
		});
		// DATABASE DATA in REDIS
		let dbReady = new Promise( function(resolve, reject)  {
			dbReadyEventEmitter.on('connect.received',  function () {
				resolve(createTestDataForThisTest(db));
			});
		});

		consumer = setUpConsumer();
		let db = redis.createClient();


		db.on('connect', function() {
			dbReadyEventEmitter.emit('connect.received');
			dbReady.then ( () => {
				createTestCDR(sampleCDR);
				done();
			});
		});
		/*
		consumer.on('ready', function() {
			consumerReadyEventEmitter.emit('connect.received');
			consumerReady.then ( () => {
				//createTestCDR(sampleCDR);
				done();
			});
		});
		*/


		// PRODUCER READY
/*		var producerReady = new Promise(function(resolve) {
		    producer.on('ready', function() {
					resolve(createTestCDR(cdr));
							    });
		 });
		 */

		/*
		let producerReady = new Promise( function(resolve, reject)  {
			prodReadyEventEmitter.on('connect.received',  function () {
				resolve(createTestCDR(cdr));
			});
		});
	*/
	});
 // Error listeners without these error cause termination
   //producer.on('error', function() {});



 it('QUERY..> find SharedPlanDefinition row matching id', function () {
  	let id = testSpDef.id;
    return findRow(id, "SharedPlanDefinition").then(function (obj ) {
			let spDef = obj;	
      should(spDef.id).equal(id);
      log.debug("The retrieved: SharedPlanDefinition data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });
});
  
  //---------------
  // use findAll
 /*
 it('QUERY..> find SharedPlanDefinition row matching id', function() {
  	let id = testSpDef.id;
    return findAllRow( null, "SharedPlanDefinition").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.id).equal(id);
      log.debug("The retrieved: SharedPlanDefinition data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });

});
*/

 it('Activation - Invalid Package Allowance', function(done) {
		tcCoreTest(
      done,
			consumer,
			function(cdrAction) {

			//(sgcsResponseMessage) => {
				log.debug("tzf back in test");
        should(cdrAction).have.properties(["jsonBody"]);
        let returnedSpDefObj = cdrAction.jsonBody;
				log.debug("------------------------------");
        log.debug(JSON.stringify(returnedSpDefObj));
			  log.debug("------------------------------");
				}
    );



 });




  // use findAll
	 /*
 it('QUERY..> find SharedPlan row matching id', function() {
   let ownerid = testSp.ownerId;
 	 let criteria = null;
   if (!_.isNull(ownerid)) {
        criteria = {'ownerId': ownerid};
   }

   return findAllRow( criteria, "SharedPlan").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.ownerId).equal(ownerid);
      log.debug("The retrieved: SharedPlan data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });

});
  // use findOne won't work.  you need the id which is stored uner
  // SPO:ownerId.  not SP: Need to use findAll to find details. 
/*
 it('QUERY..> find SharedPlan row matching id', function() {
   let ownerid = testSp.ownerId;
    return findRow( ownerid, "SharedPlan").then(function (obj ) {
			let spDef = obj;	
    	return findRow( spDef, "SharedPlan").then(function (obj ) {
				let spDef = obj;	
      	should(spDef.ownerId).equal(ownerid);
      	log.debug("The retrieved: SharedPlan data matches");
      	log.debug("------------------------------");
      	log.debug(JSON.stringify(obj));
      	log.debug("------------------------------");
			});
  });

});

*/
	/*
  //---------------
// use find all
it('QUERY..> find Renewal row matching plan id', function () {
// 		let masObject = JSON.parse(testMas);
    let planId = testRen.planId;
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}

    return findAllRow( criteria, "Renewal").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.planId).equal(planId);
      log.debug("The retrieved: renewal data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });

});
	//
  //---------------
// use find all
//Add this test when renewals are defined and date format is needed. 
//date is stored as a string in redis so has to be parsed.  
it('QUERY..> find Renewal row matching expiry', function () {
// 		let masObject = JSON.parse(testMas);
    let planId = testRen.planId;
    let expiry = Date(testRen.Expiry);
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}

    return findAllRow( criteria, "Renewal").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.planId).equal(planId);
			let returnedExpiry = Date(spDef.Expiry);
      should(returnedExpiry).equal(expiry);
      log.debug("The retrieved: renewal data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });

});

  //---------------
it('QUERY..> update Renewal row ', function()  {
    let planId = testRen.planId;
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}
    return findAllRow( criteria, "Renewal").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
			// make sure plan id is equal
      should(spDef.planId).equal(planId);
      log.debug("The retrieved: renewal data matches");
			
			// update the current balance
      log.debug("Renewal num retries " + spDef.numRetries);
      log.debug("Increment Renewal numRetries by 10" );
			spDef.numRetries = (spDef.numRetries + 10);
			let numRetries = spDef.numRetries;

			// call an update or a save function
    	return updateRow(spDef, "Renewal").then(function (obj ) {
      	log.debug("------------------------------");
      	log.debug(JSON.stringify(obj));
      	log.debug("------------------------------");
    		return findAllRow( criteria, "Renewal").then(function (obj ) {
      		should(spDef.planId).equal(planId);
      		should(spDef.numRetries).equal(numRetries);
      		log.debug("------------------------------");
      		log.debug("Row was updated");
      		log.debug(JSON.stringify(obj));
      		log.debug("------------------------------");
  		});
  	});
  });
});

// use find all
it('QUERY..> find memberallowanceshare row matching plan id', function () {
 		let masObject = JSON.parse(testMas);
    let planId = masObject.planId;
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}

    return findAllRow( criteria, "MemberAllowanceShare").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.planId).equal(planId);
      log.debug("The retrieved: memberallowanceshare data matches");
      log.debug("------------------------------");
      log.debug(JSON.stringify(obj));
      log.debug("------------------------------");
  });

});
  
  //---------------
it('QUERY..> update memberallowanceshare row ', function()  {
 		let masObject = JSON.parse(testMas);
    let planId = masObject.planId;
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}
    return findAllRow( criteria, "MemberAllowanceShare").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
			// make sure plan id is equal
      should(spDef.planId).equal(planId);
      log.debug("The retrieved: memberallowanceshare data matches");
			
			// update the current balance
      log.debug("MAS current balance " + spDef.currentBalance);
      log.debug("Increment MAS current balance by 10" );
			spDef.currentBalance = (spDef.currentBalance + 10);
			let currentBalance = spDef.currentBalance;

			// call an update or a save function
    	return updateRow(spDef, "MemberAllowanceShare").then(function (obj ) {
      	log.debug("------------------------------");
      	log.debug(JSON.stringify(obj));
      	log.debug("------------------------------");
    		return findAllRow( criteria, "MemberAllowanceShare").then(function (obj ) {
      		should(spDef.planId).equal(planId);
      		should(spDef.currentBalance).equal(currentBalance);
      		log.debug("------------------------------");
      		log.debug("Row was updated");
      		log.debug(JSON.stringify(obj));
      		log.debug("------------------------------");
  		});
  	});
  });
});

  //---------------
it('QUERY..> update sharedplan row ', function() {
   let ownerid = testSp.ownerId;
 	 let criteria = null;
   if (!_.isNull(ownerid)) {
        criteria = {'ownerId': ownerid};
   }

    return findAllRow( criteria, "SharedPlan").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
      should(spDef.ownerId).equal(ownerid);
      log.debug("The retrieved: sharedplan data matches");
			
			// update the current balance
      log.debug("SP current renewal number " + spDef.currentRenewalNumber);
      log.debug("Increment SP current balance by 10" );
			spDef.currentRenewalNumber = (spDef.currentRenewalNumber + 10);
			let currentRenewalNumber = spDef.currentRenewalNumber;

			// call an update or a save function
    	return updateRow(spDef, "SharedPlan").then(function (obj ) {
      	log.debug("------------------------------");
      	log.debug(JSON.stringify(obj));
      	log.debug("------------------------------");
    		return findAllRow( criteria, "SharedPlan").then(function (obj ) {
					let spDef = obj[0];	
      		should(spDef.ownerId).equal(ownerid);
      		should(spDef.currentRenewalNumber).equal(currentRenewalNumber);
      		log.debug("------------------------------");
      		log.debug("Row was updated");
      		log.debug(JSON.stringify(obj));
      		log.debug("------------------------------");
  		});
  	});
  });

});
  
  
  
  
  //---------------
it('QUERY..> update SharedPlanDefinition row ', function()  {
  	let id = testSpDef.id;
    return findAllRow( null, "SharedPlanDefinition").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	

      should(spDef.id).equal(id);
      log.debug("The retrieved: sharedplandefinition data matches");
			
			// update the purchase cost
      log.debug("SP purchase cost " + spDef.purchaseCost);
      log.debug("Increment SP purchaseCost =  7777777" );
			spDef.purchaseCost = 7777777;
			let purchaseCost = spDef.purchaseCost;

			// call an update or a save function
    	return updateRow(spDef, "SharedPlanDefinition").then(function (obj ) {
      	log.debug("------------------------------");
      	log.debug(JSON.stringify(obj));
      	log.debug("------------------------------");
    		return findAllRow( null, "SharedPlanDefinition").then(function (obj ) {
					let spDef = obj[0];	
      		should(spDef.id).equal(id);
      		should(spDef.purchaseCost).equal(purchaseCost);
      		log.debug("------------------------------");
      		log.debug("Row was updated");
      		log.debug(JSON.stringify(obj));
      		log.debug("------------------------------");
  		});
  	});
  });

});




// Delete MAS but not the mas key 
// A MAS:planId may have many mas plans defined.  
// in this test we delete the first one only. 
 it('QUERY..> delete MemberAllowanceShare  ', function() {
 		let masObject = JSON.parse(testMas);
    let planId = masObject.planId;
 	 	let criteria = null;
   	if (!_.isNull(planId)) {
        criteria = {'planId': planId};
   	}
    return findAllRow( criteria, "MemberAllowanceShare").then(function (obj ) {
 			should(obj.length).equal(1);
			let spDef = obj[0];	
			// make sure plan id is equal
 			should(spDef.planId).equal(planId);
 			log.debug("Remove MemberAllowanceShare with plan idid " + planId);
   		return removeRow(spDef, "MemberAllowanceShare").then(()=>{
    		return findAllRow( criteria, "MemberAllowanceShare").then((dbDataObj ) => {
      	if(!dbDataObj) {
        	log.debug("findOneAsync() returned with object not found WHICH IS GOOD...");
        	return "ok";
      	}
      	else {
        	log.debug("Deletion did not happen dataObj still there - dataObject: " + JSON.stringify(dataObj) + " dbDataObj: " + JSON.stringify(dbDataObj));
        	var err = "After delete the dbDataObj still there - deletion did not happen!";
        	return err;
      	}
    	})
    	.catch(e => {
      	log.debug('Caught error: ' + e.toString());
      	return "ok";
    	});
 		})
 		.catch(e => {
   		log.error('Caught error: ' + e.toString());
 		});
	});
});

// Delete shared plan but not the sharedplan key 
// A SP:ownerId may have many shared plans defined.  
// in this test we delete the first one only. 
 it('QUERY..> delete SharedPlan  ', function() {
   let id = testSp.ownerId;
 	 let criteria = null;
   if (!_.isNull(id)) {
        criteria = {'ownerId': id};
   }

    return findAllRow( criteria, "SharedPlan").then(function (obj ) {
			let spDef = obj[0];	
 			should(spDef.ownerId).equal(id);
 			log.debug("Remove SharedPlan with id " + id);
   		//return removeRow(spDef, "SharedPlanDefinition").then( () =>{
   		return removeRow(spDef, "SharedPlan").then(()=>{
    		return findAllRow( criteria, "SharedPlan").then((dbDataObj ) => {
      	if(!dbDataObj) {
        	log.debug("findOneAsync() returned with object not found WHICH IS GOOD...");
        	return "ok";
      	}
      	else {
        	log.debug("Deletion did not happen dataObj still there - dataObject: " + JSON.stringify(dataObj) + " dbDataObj: " + JSON.stringify(dbDataObj));
        	var err = "After delete the dbDataObj still there - deletion did not happen!";
        	return err;
      	}
    	})
    	.catch(e => {
      	log.debug('Caught error: ' + e.toString());
      	return "ok";
    	});
  	})
  	.catch(e => {
   		log.error('Caught error: ' + e.toString());
  	});
	});
});


 it('QUERY..> delete Renewal ', function() {
  	let id = testRen.id;
 		return findAllRow( null, "Renewal").then(function (obj ) {
			let spDef = obj[0];	
 			should(spDef.id).equal(id);
 			log.debug("Remove Renewal with id " + id);
   		//return removeRow(spDef, "SharedPlanDefinition").then( () =>{
   		return removeRow(spDef, "Renewal").then(()=>{
 				return findAllRow( null, "Renewal").then( (dbDataObj)=> {
      	if(!dbDataObj) {
        	log.debug("findOneAsync() returned with object not found WHICH IS GOOD...");
        	return "ok";
      	}
      	else {
        	log.debug("Deletion did not happen dataObj still there - dataObject: " + JSON.stringify(dataObj) + " dbDataObj: " + JSON.stringify(dbDataObj));
        	var err = "After delete the dbDataObj still there - deletion did not happen!";
        	return err;
      	}
    	})
    	.catch(e => {
      	log.debug('Caught error: ' + e.toString());
      	return "ok";
    	});
  	})
  	.catch(e => {
    	log.error('Caught error: ' + e.toString());
  	});
   });

		});


 it('QUERY..> delete SharedPlanDefinition ', function() {
  	let id = testSpDef.id;
 		return findAllRow( null, "SharedPlanDefinition").then(function (obj ) {
			let spDef = obj[0];	
 			should(spDef.id).equal(id);
 			log.debug("Remove SharedPlanDefinition with id " + id);
   		//return removeRow(spDef, "SharedPlanDefinition").then( () =>{
   		return removeRow(spDef, "SharedPlanDefinition").then(()=>{
 				return findAllRow( null, "SharedPlanDefinition").then( (dbDataObj)=> {
      	if(!dbDataObj) {
        	log.debug("findOneAsync() returned with object not found WHICH IS GOOD...");
        	return "ok";
      	}
      	else {
        	log.debug("Deletion did not happen dataObj still there - dataObject: " + JSON.stringify(dataObj) + " dbDataObj: " + JSON.stringify(dbDataObj));
        	var err = "After delete the dbDataObj still there - deletion did not happen!";
        	return err;
      	}
    	})
    	.catch(e => {
      	log.debug('Caught error: ' + e.toString());
      	return "ok";
    	});
  	})
  	.catch(e => {
    	log.error('Caught error: ' + e.toString());
  	});
   });


			// check that row doesn't exist anymore
		});
		*/
	});





