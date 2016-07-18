angular.module('app', [
  'satellizer',
  'ui.router',
  'ui.bootstrap',
  'permission',
  'permission.ui'
]);

angular.module('app').config(routeConfig);
angular.module('app').config(authConfig);
angular.module('app').run(defineRoles);
angular.module('app').service('PasswordService', PasswordService);
angular.module('app').controller('AuthController', AuthController);
angular.module('app').controller('PasswordDialogController', PasswordDialogController);
angular.module('app').controller('ProfileController', ProfileController);

function defineRoles(RoleStore, $auth) {
  RoleStore.defineRole('anonymous', function() {
    if ($auth.isAuthenticated()) {
      return false;
    }
    return true;
  });
}

function authConfig($authProvider) {
  $authProvider.tokenPrefix = 'customer';
  $authProvider.baseUrl = '/customer/';
  $authProvider.oauth2({
    name: 'wechat',
    url: '/auth/wechat',
    redirectUri: encodeURIComponent(window.location.origin),
    appid: 'wx42b2746da8e4f318',
    scope: 'snsapi_login',
    defaultUrlParams: ['response_type', 'appid', 'redirect_uri', 'scope'],
    authorizationEndpoint: 'https://open.weixin.qq.com/connect/qrconnect'
  });
}

function routeConfig($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise(function($injector) {
    var $state = $injector.get('$state');
    $state.go('404');
  });

  $stateProvider.state('entry', {
    url: '/',
    templateUrl: 'views/entry.html'
  });

  $stateProvider.state('404', {
    url: '/404',
    templateUrl: 'views/404.html'
  });

  $stateProvider.state('login', {
    url: '/login?redirectTo',
    templateUrl: 'views/login.html',
    controller: 'AuthController',
    controllerAs: 'authCtrl'
  });

  $stateProvider.state('signup', {
    url: '/signup',
    templateUrl: 'views/signup.html',
    controller: 'AuthController',
    controllerAs: 'authCtrl'
  });

  $stateProvider.state('profile', {
    url: '/profile',
    templateUrl: 'views/profile.html',
    controller: 'ProfileController',
    controllerAs: 'profileCtrl',
    data: {
      permissions: {
        except: ['anonymous'],
        redirectTo: function() {
          return {
            state: 'login',
            params: {
              redirectTo: 'profile'
            }
          };
        }
      }
    }
  });

  $stateProvider.state('logout', {
    url: '/logout',
    controller: function($auth, $state) {
      $auth.logout();
      $state.go('entry');
    }
  });

  $stateProvider.state('forgotPassword', {
    url: '/forgot-password',
    templateUrl: 'views/forgot-password.html'
  });

}

function AuthController($auth, $state, $stateParams) {

  this.login = function(credentials) {
    $auth.login(credentials).then(function() {
      var redirectTo = $stateParams.redirectTo || 'entry';
      $state.go(redirectTo);
    }).catch(function() {
      alert('失败');
    });
  };

  this.logout = function() {
    $auth.logout();
  };

  this.authenticate = function(type) {
    $auth.authenticate(type);
  };

  this.signup = function(credentials) {
    $auth.signup(credentials).then(function() {
      alert('成功');
    }).catch(function() {
      alert('失败');
    });
  };

}

function PasswordService($http, $auth) {
  this.setPassword = function(userId, password) {
    return $http.put('http://127.0.0.1:3000/api/customers/' + userId + '/password', {password});
  };
}

function ProfileController($uibModal) {

  this.showPasswordDialog = function() {
    $uibModal.open({
      templateUrl: 'partials/change-password.html',
      controller: 'PasswordDialogController',
      controllerAs: 'passwordCtrl'
    });
  };

}


function PasswordDialogController(PasswordService, $auth) {

  this.changePassword = function(password) {
    var userId = $auth.getPayload().sub;
    PasswordService.setPassword(userId, password).then(function() {
      console.log('ok');
    });
  };

  this.cancel = function() {
    console.log('cancel');
  };

}
