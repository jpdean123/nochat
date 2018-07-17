const functions = require('firebase-functions');


var admin = require("firebase-admin");
//var serviceAccount = require("./serviceaccount.json");

const request = require('request');
var moment = require('moment');
var moment_timezone = require('moment-timezone');
var Promise = require('promise');
const cors = require('cors')({origin: true});
var numeral = require('numeral');
var getUrls = require('get-urls');
var linkify = require('linkifyjs');
const csvtojson = require("csvtojson");

const http = require('http');
const express = require('express');
var fetchUrl = require("fetch").fetchUrl;
const extractor = require('node-article-extractor');
var tools = require('./tools');


const accountSid = tools.twilio_sid();
const authToken = tools.twilio_auth_token();

const twilioClient = require('twilio')(accountSid, authToken);

admin.initializeApp(functions.config().firebase);

var db = admin.database();


const algoliasearch = require('algoliasearch');

const ALGOLIA_ID = algolia_id();

const ALGOLIA_ADMIN_KEY = algolia_admin_key();
const ALGOLIA_SEARCH_KEY = algolia_search_key();

const ALGOLIA_INDEX_NAME = 'all_messages';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);


// ALGOLIA CODE ------------------------------------------------------------------------------------

// Update the search index every time a blog post is written.
exports.syncMsgToAlgolia = functions.database.ref('topics/{topicID}/messages/{messageID}').onWrite((event) => {
  // Get the part document
  const message = event.after.val();
  const messageRef = event.after.ref;
  const msgsRef = messageRef.parent;
  const topicRef = msgsRef.parent;
  const topicKey = topicRef.key;

  // Add an 'objectID' field which Algolia requires
  message.objectID = event.after.key;
  message.topicKey = topicKey;

  // Write to the algolia index
  const index = client.initIndex("all_messages");
  return index.saveObject(message);
});

exports.helloWorld = functions.https.onRequest((request, response) => {
    const helperKeywords = ['/help'];
    //console.log(request.body.From);
    
    const msg_from = request.body.From;
    const msg_body = request.body.Body;
    const msg_to = request.body.To;
    
    
    checkForHelper(msg_body).then(function(res){
       if(res.bool == true) {
           var reply_body = res.reply;
           var phone = msg_from;
        sendOutgoingMsg(reply_body, phone);
        response.send("Hello from Firebase!");
       } if (res.bool == false) {
           saveIncomingMsg(msg_from,msg_body,msg_to).then(function(){
            response.send("Hello from Firebase!");
        });
       }
    });
 
});

const checkForHelper = function(body){
    var promise = new Promise(function (resolve, reject) {
        
        var helperRef = db.ref('admin/helper_vocabulary');
        helperRef.once('value', function(snap){
             var keywordObj = snap.val();
             var keys = Object.keys(snap.val());
             console.log(keys);
             var keywordArr = [];
             
             
             var processedKeys = 0;
             
             for (var x = 0; x < keys.length; x++) {
                 
                processedKeys++;
                  k = keys[x];
                  var keyword = keywordObj[k].term;
                  var modified = "/" + keyword;
                  keywordArr.push(modified);
                  
                  if (keys.length == processedKeys) {
                       if (keywordArr.indexOf(body) > -1) { 
                           var matchIndex = keywordArr.indexOf(body);
                           var matchID = keys[matchIndex];
                            console.log(matchID);
                           var resObj = {
                               bool: true,
                               reply: keywordObj[matchID].default_response
                           };
                           resolve(resObj);
                       } else {
                           var resObj = {
                               bool: false
                           };
                           resolve(resObj)
                       }
                  };
            };
             
          
        });
    });
    
    return promise
};


const saveIncomingMsg = function(msg_from,msg_body,msg_to) {
    var promise = new Promise(function (resolve, reject) {
     const links = linkify.find(msg_body);
    
    // first, find the channel it needs to go to
    const topics = db.ref('topics');
    const query = topics.orderByChild('phone_number').equalTo(msg_to);
    var topicKey = "";

	query.once('value').then(snap => {
	    var topic = snap.val();
	    var k = Object.keys(snap.val())[0];
	    topicKey = k;
	
	    // next find the user that sent it
	    const users = db.ref('users');
	    const q = users.orderByChild('phone_number').equalTo(msg_from);
	    q.once('value', function (s) {
	        var u = s.val();
	        var x =Object.keys(s.val())[0];
	        
	        var foundUser = u[x];        
	      
	       var newMsg = db.ref().child('topics/' + topicKey + '/messages').push();
            var newObj = {
              from_id : x,
              from_first_name: foundUser.first_name,
              from_last_name: foundUser.last_name,
              body_raw: msg_body,
              source: 'sms',
              external: links,
              timestamp: admin.database.ServerValue.TIMESTAMP
            };
            
            newMsg.set(newObj);
            resolve(newObj);
	    });
	    
	});
 }); // end of promise
 return promise
};




exports.newMessage = functions.database.ref('topics/{topicID}/messages/{messageID}').onWrite((event) => {
  
    const message = event.after.val();
    const p = event.after.ref;
    const messagesPath = p.parent;
    const topicPath = messagesPath.parent;
    
    topicPath.child('members').once('value', function(snap){
        const members = snap.val();
        var keys = Object.keys(snap.val());
        
         keys.forEach(x => {
             db.ref('users/'+x).once('value').then(function(s){
                 var phone = s.val().phone_number;
                 var reply_body= message.from_first_name + " " + message.from_last_name + ": " + message.body_raw + " (via " + message.source + ")";
                 
                 if(x == message.from_id) {
                     
                 } else {
                     sendOutgoingMsg(reply_body, phone); 
                 };
                 
             })
         });
        
    });
        
});

const sendOutgoingMsg = function(b, to_phone) {
    console.log('trying to send a message to the number ' + to_phone);
    twilioClient.messages
                  .create({
                     body: b,
                     from: '+17342924012',
                     to: to_phone
                   })
                  .then(message => console.log(message.sid))
                  .done();
};


exports.pullExternalLinks = functions.database.ref('topics/{topicID}/messages/{messageID}').onWrite((event) => {
  
    const message = event.after.val();
    const p = event.after.ref;
    
    console.log(p);

    if (message.external) {
        return getExternal(message.external, p).then(function(r){
            for (var i = 0; i < r.length; i++) {
                var ref = r[i].p;
                ref.set(r[i].d)
            };
        });
    } else {
        console.log('nothing');
    }

        
});

const getExternal = function(externalArr, path) {
    var keys = Object.keys(externalArr);
    var promiseArray = [];
    
     keys.forEach(x => {
        var promise = new Promise(function (resolve, reject) {
         var u = externalArr[x].href;
         fetchUrl(u, function(error, meta, body){
            var data = extractor(body);
            var processed = JSON.parse(JSON.stringify(data));
            var extRef = path.child('external/' + x + '/details');
            var result = {
                d: processed,
                p: extRef
            };
            
            resolve(result); 
         });
     });
     promiseArray.push(promise);
  });
    
    return Promise.all(promiseArray)
};


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });



