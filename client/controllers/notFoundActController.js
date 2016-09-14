angular
  .module('notFoundActController', ['ngRoute', 'EventFactory', 'UserFactory'])
  .controller('notFoundActController', notFoundActController);

function notFoundActController($scope, $location) {
  $scope.postNewActivity = function() {
    //console.log('in postNewActivity', $scope.activityname, $scope.activitydesc);
    var newActivityObj = {};
    var activityName = $scope.activityname.trim();
    var activityDesc = $scope.activitydesc.trim();

    // simple validation checks

    var postUrl = '/activity/add';
    // $.post(postUrl, )
    //   .then()
    //   .catch();
  };
}

