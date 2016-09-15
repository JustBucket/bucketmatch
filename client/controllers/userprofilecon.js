angular
  .module('UserProfileController', ['ngRoute', 'EventFactory', 'UserFactory'])
  .controller('UserProfileController', usercontroller)

function usercontroller($scope, $location, $http, EventFactory, UserFactory) {
  $scope.image = undefined;
  $scope.activities = [];
  $scope.completed = [];
  $scope.description = '';
  $scope.userid = '';
  $scope.username = '';
  
  $scope.activityView = function () {
    console.log("inside usercontroler", this.activity.actname)
    EventFactory.updateEvent(this.activity.actname);
  };

  $scope.addActivity = function () {
    EventFactory.updateUser($scope.userid);
    $location.path('addActivity');
  };

  function loadPage() {
    UserFactory.fetch().then((data) => {
      if (data === null) {
        UserFactory.error('Sorry incorrect username or password.  Please try again')
        $location.path('/');
      }
      console.log('data', data.data);
      
      var userObj = data.data.user;

      $scope.image = userObj.profilepic;
      $scope.activities = data.data.activities;
      //$scope.completed = '';
      if(userObj.bio !== null) {
        $scope.description = userObj.bio;
      } 

      $scope.userid = userObj._id;
      $scope.username = userObj.first_name;
      
    });
  }
  loadPage();
}
