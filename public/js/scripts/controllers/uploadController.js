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
      storageRef.getDownloadURL().then(function(url) {
        console.log(url);
        getJsonOfFile(url);
    }).catch(function(error) {
      console.log(error);
    });
  }
  )  
};


$scope.getjson = function getJsonOfFile(url) {
    var file = "https://firebasestorage.googleapis.com/v0/b/nochat-c4f7d.appspot.com/o/fuelly_data%2F-LHLA3UhPmWcpsPt-R34.csv?alt=media&token=a3566a79-3af5-4c77-98ba-e4d7e8e10b0c";
    var data = {
        filepath: file
    };

var csvtojson = firebase.functions().httpsCallable('csvToJson');
csvtojson(data).then(function(result) {
  // Read result of the Cloud Function.
console.log(result);
  // ...
});


}

});


