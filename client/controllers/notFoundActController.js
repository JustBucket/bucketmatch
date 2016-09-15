angular
  .module('notFoundActController', ['ngRoute', 'EventFactory', 'UserFactory'])
  .controller('notFoundActController', notFoundActController);

function notFoundActController($scope, $location, $http) {
  $scope.postNewActivity = function() {
    //console.log('in postNewActivity', $scope.activityname, $scope.activitydesc);

    var activityName = $scope.activityname.trim();
    var activityDesc = $scope.activitydesc.trim();

    // simple validation checks
    if(activityName === '' || activityDesc === '') {
      return;
    }

    var newActivityObj = {actname: activityName, actdesc: activityDesc};

    // TODO: move this over to a separate factory or service
    // var postUrl = '/activity/add';
    // $http.post(postUrl, JSON.stringify(newActivityObj))
    //   .then(function(result) {

    //   });

  };
}

