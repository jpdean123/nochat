app.controller('UploadCtrl', function ($scope, $q, $location, $http, $route, $timeout, $firebaseObject, $routeParams, $firebaseArray, $mdDialog, $mdToast, $mdMenu) {

var fire = firebase.database();

$scope.fileSelected = function(e) {
  // get file

 // first create a user 
  var newUser = fire.ref().child('ev_savings_users').push();
    var now = moment().format();
    var blank_user = {
      upload_time: now  
    };
    newUser.set(blank_user);
  
  
  var file = e.target.files[0];
  var ext = file.name.split('.').pop();
  var filename = newUser.key + "." + ext;
  console.log(ext);
  console.log(filename);
  $scope.fileProgress = 1;

  // create storage REF
  var storageRef = firebase.storage().ref('fuelly_data/' + filename);
 

  //upload file
  var task = storageRef.put(file);

  //update progress bar

  task.on('state_changed', 
  function progress(snapshot) {
    console.log(snapshot);
    $scope.fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) *100;

    $scope.$apply();

  },
  function error(err) {
    console.log(err);
  },
  function complete() {
      converter(file);
  }
  )  
};


$scope.getjson = function (bucket, nm) {
  console.log(url);
    var file = url;
    var data = {
        fileBucket: bucket,
        fileName: nm
    };

var csvtojson = firebase.functions().httpsCallable('csvToJson');
csvtojson(data).then(function(result) {
  // Read result of the Cloud Function.
console.log(result);
  // ...
});


}

function converter(f){
   Papa.parse(f, {
  header:true,
  worker: true,
  complete: function(results) {
    processJSON(results.data);
  }
});
};


var rawdata;

function processJSON (d) {
  //console.log(d);
  rawdata = d;
  parseKeys(d).then(function(r){
    //console.log(r);
    rawdata.sort(compare);
    calculations(rawdata).then(function(r){
      console.log('done');
    });
  })

};

function parseKeys (d){
  var promises = [];
  for (var i = 0; i < rawdata.length; i++) {
    var pr = function() {
      var deferred = $q.defer();
      if (Object.keys(rawdata[i]).length > 1) {
         angular.forEach(rawdata[i], function(value, key) {
         var oldName = key;
          var newName = key.trim();
          rename(rawdata[i],oldName, newName);
          deferred.resolve('finished');
      });
      } else {
        rawdata.splice(i,1);
      }
     
    };
    promises.push(pr());
   };
   return $q.all(promises)
};


function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const odometerA = a.odometer.toUpperCase();
  const odometerB = b.odometer.toUpperCase();

  let comparison = 0;
  if (odometerA > odometerB) {
    comparison = 1;
  } else if (odometerA < odometerB) {
    comparison = -1;
  }
  return comparison;
};


function rename(obj, oldName, newName) {
    if(!obj.hasOwnProperty(oldName)) {
        return false;
    }

    obj[newName] = obj[oldName];
    delete obj[oldName];
    return true;
};


$scope.output = {};
$scope.output.fillups = {};
$scope.output.times = [];


function calculations (raw){
  var deferred = $q.defer();
    $scope.output.fillups.count = raw.length;
    $scope.output.fillups.cost =raw.length * 25;
    console.log(raw);
    for (var i = 0; i < raw.length; i++) {
      //process time
      $scope.output.times.push(moment(raw[i].date_added));
      
      if(i == raw.length - 1) {
        console.log('last one happened');
        $scope.output.fillups.most_recent = moment.max($scope.output.times);
        $scope.output.fillups.least_recent = moment.min($scope.output.times);
       
      }
      
    }
    
  return deferred.promise;
};




});


