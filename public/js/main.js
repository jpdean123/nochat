/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('nochatApp', [
  'firebase',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngAnimate',
  'ngMessages',
  'ngMaterial',
  'LiveSearch',
  'ngSanitize'
]);

/**
 * Configure the Routes
 */
app.config(function ($locationProvider, $routeProvider, $mdThemingProvider) {

  $locationProvider.hashPrefix('');
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    .when("/search", {templateUrl: "partials/search.html", controller: "SearchCtrl"})
    .when("/upload", {templateUrl: "partials/upload.html", controller: "UploadCtrl"})
    .when("/cedemo", {templateUrl: "partials/demo.html", controller: "ce_demo_ctrl"})
    .otherwise("/");


    $mdThemingProvider.theme('default')
    .accentPalette('orange');
});


// app.directive("fileInput",["$parse",function($parse){
//   return {
//     link: function($scope, $element, $attrs, $ngModelCtrl){
//       function createFileInput(){
//         var fileInput = document.createElement("input");
//         fileInput.type = "file";
//         angular.element(fileInput).on("change",function(event){
//           $scope.$apply(function(){
//             $parse($attrs.onChange)($scope, {$event:event});
//           })
//           //remove old input
//           fileInput.remove();
//           //create new file input
//           createFileInput();
//         })
//         $element.append(fileInput);
//       }
//       createFileInput();
//     }
//   }
// }])



// /**
//  * Controls the Blog
//  */
// // app.controller('BlogCtrl', function ($scope, $location, $http, $firebaseObject) {
// //   console.log("Blog Controller reporting for duty.");
// // });

app.controller('HomeCtrl', function ($scope, $location, $http, $firebaseObject) {
  var fire = firebase.database();
  
  $scope.createUser = function(){
   var newUser = fire.ref().child('users').push();
      newUser.set($scope.user);
    
}

$scope.topic = {};

$scope.topic.phone_number = "+17342924012";

$scope.newTopic = function (){
    var newTopic = fire.ref().child('topics').push();
    newTopic.set($scope.topic);
};


$scope.newHelper = function (){
    var newHelper = fire.ref().child('admin/helper_vocabulary').push();
    newHelper.set($scope.helper);
};


  
  
});

app.directive("fileInput",["$parse",function($parse){
  return {
    link: function($scope, $element, $attrs, $ngModelCtrl){
      function createFileInput(){
        var fileInput = document.createElement("input");
        fileInput.type = "file";
        angular.element(fileInput).on("change",function(event){
          $scope.$apply(function(){
            $parse($attrs.onChange)($scope, {$event:event});
          })
          //remove old input
          fileInput.remove();
          //create new file input
          createFileInput();
        })
        $element.append(fileInput);
      }
      createFileInput();
    }
  }
}])



// /**
//  * Controls the Footer
//  */
// // app.controller('FooterCtrl', function ($scope, $location, $http) {
  
// //  // firebase.auth().onAuthStateChanged(function(user) {
// //  //      if (user) {
// //  //         console.log(user.uid);
// //  //      } else {
// //  //       console.log('no user');
// //  //      }
// //  //      });


// // });




// app.controller("FooterCtrl", ["$scope", "$firebaseAuth",
//   function($scope, $firebaseAuth) {

//   }
// ]);

// app.controller("HeaderCtrl", ["$scope", "$firebaseAuth", "UserService", "$location",
//   function($scope, $firebaseAuth, UserService, $location) {
//     var u = UserService.getCurrentUser();

//     if (u.loggedIn === true) {
//       $scope.currentUser = u;
//     } else {
//       $scope.currentUser = false;
//       $location.path('signup');

//     };
  
//     $scope.openMenu = function($mdMenu, ev) {
//       originatorEv = ev;
//       $mdMenu.open(ev);
//     };

//     $scope.logOut = function(){
//         UserService.logOut();
//     };

//   $scope.currentPath = $location.path();

//   $scope.goToPage = function(path){
//     $location.path(path);
//   };

//   }]);

// app.service('UserService', function ($firebaseAuth, $location, $rootScope){

//   var auth = $firebaseAuth();


//   var currentUser = {
//     loggedIn : false,
//     email: '',
//     uid: ''
//   };

//   var fUser = auth.$getAuth();

//       if (fUser) {
//       console.log("Signed in as:", fUser.email);
//         currentUser.loggedIn = true;
//         currentUser.email = fUser.email;
//         currentUser.uid = fUser.uid;

//     } else {
//       console.log("Signed out");
//     };


//  auth.$onAuthStateChanged(function(firebaseUser) {
//   if (firebaseUser) {
//     console.log("Signed in as:", firebaseUser.uid);
//     currentUser.loggedIn = true;
//     currentUser.email = firebaseUser.email;
//     currentUser.uid = firebaseUser.uid;
//     //$location.path('dashboard');

//   } else {
//     console.log("Signed out");
//     currentUser.loggedIn = false;
//     currentUser.email = "";
//     currentUser.uid = "";
//   }
// });

//   this.getCurrentUser = function() {
//       return currentUser;
    
//     }

//   this.logOut = function(){
//     $location.path('signup');
//     auth.$signOut();
//   }




// });

// app.service('browserService', function ($firebaseAuth, $location, $rootScope, $window){

// this.openNewTab = function(){
//      var newTabWindow = $window.open();
//      newTabWindow.document.write('Loading your estimate...');
//      return newTabWindow;
// }

// this.updateTabLocation = function(tabLocation, tab) {
//      if(!tabLocation){
//       tab.close();
//      }
//      tab.location.href = tabLocation;
// }




// });

