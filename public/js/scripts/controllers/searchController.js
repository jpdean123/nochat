app.controller('SearchCtrl', function ($scope, $q, $location, $http, $route, $timeout, $firebaseObject, $routeParams, $firebaseArray, $mdDialog, $mdToast, $mdMenu) {

var fire = firebase.database();

$scope.test = "search Controller!!!";



  
$scope.initiateSearch = function (){

	var query = $scope.search;

  algolia_messages
    .search({
      query
    })
    .then(responses => {
       
        console.log(responses.hits);
        $scope.hits = responses.hits;
        $scope.$apply();
         processHits(responses.hits);
      });

};

function processHits(h) {
    var keys = Object.keys(h);
    for (i = 0; i < keys.length; i++) {
        var k = keys[i];
        var timestamp = h[k].timestamp;
        var pretty = moment(timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a"); 
        $scope.hits[k].time_pretty = pretty;
        $scope.$apply();
    };
};


});


