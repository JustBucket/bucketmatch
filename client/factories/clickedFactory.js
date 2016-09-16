angular
  .module('ClickedFactory', [])
  .factory('ClickedFactory', ClickedFactory)

function ClickedFactory($location, $http) {
  const userInfo = {};
  let clicked = {};

  userInfo.setUser = function (data) {
    // console.log('in setUser', data);
    clicked = data;
    $location.path('contact');
  };

  userInfo.getInfo = function () {
    // console.log('in getInfo', clicked);
    return $http.get('/userinfo/' + clicked.fb_id);
  };
  return userInfo;
}
