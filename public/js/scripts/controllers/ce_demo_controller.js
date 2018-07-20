app.controller('ce_demo_ctrl', function ($scope, $q, $location, $http, $route, $timeout, $firebaseObject, $routeParams, $firebaseArray, $mdDialog, $mdToast, $mdMenu) {

var Theindex = elasticlunr(function () {
    this.addField('description');
    this.addField('category');
    this.setRef('id');
});



$http.get('../js/scripts/controllers/install_drywall.json').then(function (data){
		frontEndSearch(data.data).then(function(r){
		    //console.log(r);
		    $scope.results = Theindex.search("install drywall");
		    console.log($scope.results);
		    $scope.$apply();
		})
	});


function frontEndSearch (d){
    //console.log(d);
    var promiseArr = [];
    for (i = 0; i < d.length; i++) {
    var func = function (){
        var promise = $q.defer();
        var document = {
            "id": d[i].PartId,
            "description": d[i].Description,
            "category": d[i].CategoryTitle
        };
        Theindex.addDoc(document);
        promise.resolve('done');
    }
    promiseArr.push(func());
}

return $q.all(promiseArr)

};











});


