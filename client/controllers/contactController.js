angular
  .module('ContactController', ['ngRoute', 'EventFactory', 'ClickedFactory'])
  .controller('ContactController', contactController)

function contactController($scope, ClickedFactory) {
  $scope.first_name = '';
  $scope.desc = '';
  $scope.image = '';

  function pageLoad() {
    ClickedFactory.getInfo()
      .then((res) => {
        // console.log('res.data', res.data);
        $scope.first_name = res.data.first_name;
        $scope.desc = res.data.bio;
        $scope.image = res.data.profilepic;
      });
  }
  pageLoad();
}
