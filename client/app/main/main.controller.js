'use strict';

(function() {

class MainController {

  constructor($http, $window, $cookies, Files, Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.Files = Files;
    this.$http = $http;
    this.$cookies = $cookies;
    this.$window = $window;
    this.userFiles = {};
  }

  $onInit() {
    this.Files.get().$promise.then(response => {
      this.userFiles = response;
    });
  }

  accessCloud(cloud) {
    this.$cookies.put('currentCloud', cloud);
    if(!this.userFiles[cloud + 'files']) {
      this.$window.location = this.$window.location.protocol + '//' + this.$window.location.host + '/api/cloud/' + cloud + '/login';
    }
  }
}

angular.module('dropzoneApp')
  .component('main', {
    templateUrl: 'app/main/main.html',
    controller: MainController
  });

})();
