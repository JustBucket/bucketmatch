angular
  .module('UserFactory', [])
  .factory('UserFactory', userFactory)

function userFactory($http) {
  let userData = [];
  let user = '';
  let password = '';
  let error = '';

  userData.fetch = function () {
    return $http.get('/user'); // request user profile information
  };

  userData.updateUser = function (person, pass) {
    user = person;
    password = pass;
  };

  userData.error = function (data) {
    $scope.error = data;
  };

  userData.createNew = function (data) {
    return $http.post(ADDURL + data);
  }
  return userData;
}
