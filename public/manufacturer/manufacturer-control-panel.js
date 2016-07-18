var LOGIN_STATE_NAME = 'login';
var LOGOUT_STATE_NAME = 'logout';
var SIGNUP_STATE_NAME = 'signup';
var RESETPWD_STATE_NAME = 'resetpwd';
var SETPWD_STATE_NAME = 'setPwd';

var LOGIN_REDIRECT_TO = '/dashboard';
var LOGOUT_REDIRECT_TO = '/login';

var adminApp = angular.module('adminControlPanel', [
    'ng-admin',
    'satellizer',
    'ngFileUpload'
  ]).config(manufacturerControlPanelConfig)
    // .config(requestInterception)
    .config(['RestangularProvider', responseInterception])
  .config(routeConfig)
  .config(authConfig)
  .run(anonymousRedirect)
  .controller('AuthController', AuthController)
  .controller('ManufacturerController', ManufacturerController)
  .controller('ChangeOwnPwdController', ChangeOwnPwdController)
  .controller('ResetPwdController', ResetPwdController)
  .controller('SetPwdController', SetPwdController)
  .controller('UserMenu', function($scope, $auth, $http) {
    $http.get("/api/auth/manufacturer-accounts/" + $auth.getPayload().sub).success(data => {
      this.name = data.email;
    }).catch(data => {
      this.name = "未知用户";
    });
  });

function manufacturerControlPanelConfig(NgAdminConfigurationProvider) {

  var nga = NgAdminConfigurationProvider;
  var admin = nga.application('我是厂商').baseApiUrl('/api/auth/');

  admin.addEntity(nga.entity('batches'));
  admin.addEntity(nga.entity('models'));
  admin.addEntity(nga.entity('manufacturers'));

  batchConfig(nga, admin);
  modelConfig(nga, admin);
  manufacturersAuthConfig(nga, admin);

  admin.menu(menuConfig(nga, admin));
  admin.header(headerConfig());
  admin.dashboard(nga.dashboard());

  nga.configure(admin);
}

function authConfig($authProvider) {
  $authProvider.tokenPrefix = 'manufacturer';
  $authProvider.baseUrl = '/api/manufacturer/';
  $authProvider.storageType = 'sessionStorage';
}

function routeConfig($stateProvider) {
  var loginStateName = LOGIN_STATE_NAME;
  var logoutStateName = LOGOUT_STATE_NAME;
  var logoutRedirectTo = LOGOUT_REDIRECT_TO;
  var signupStateName = SIGNUP_STATE_NAME;
  var resetPwdStateName = RESETPWD_STATE_NAME;
  var setPwdStateName = SETPWD_STATE_NAME;

  $stateProvider.state("changePwd", {
      parent: 'main',
      url: '/change-password',
      templateUrl: 'views/change-password.html'
    });

  $stateProvider.state("auth", {
      parent: 'main',
      url: '/auth-manufacturer',
      templateUrl: 'views/auth-manufacturer.html',
      controller: 'ManufacturerController',
      controllerAs: 'manufacturerCtrl'
    });

  $stateProvider.state(loginStateName, {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'AuthController',
    controllerAs: 'authCtrl'
  });

  $stateProvider.state(signupStateName, {
    url: '/signup',
    templateUrl: 'views/signup.html',
    controller: 'AuthController',
    controllerAs: 'authCtrl'
  });

  $stateProvider.state(logoutStateName, {
    url: '/logout',
    controller: function($auth, $location) {
      $auth.logout();
      $location.path(logoutRedirectTo);
    }
  });

  $stateProvider.state(resetPwdStateName, {
    url: '/resetPwd',
    templateUrl: 'views/reset-password.html'
  });

  $stateProvider.state(setPwdStateName, {
    url: '/setPwd',
    templateUrl: 'views/set-password.html'
  });

  $stateProvider.state('select-manufacturer', {
    url: '/select',
    templateUrl: 'views/select-manufacturer.html',
    controller: 'ManufacturerController',
    controllerAs: 'manufacturerCtrl'
  });
}

function anonymousRedirect($rootScope, $state, $auth) {
  var loginStateName = LOGIN_STATE_NAME;
  var logoutStateName = LOGOUT_STATE_NAME;
  var signupStateName = SIGNUP_STATE_NAME;
  var resetPwdStateName = RESETPWD_STATE_NAME;
  var setPwdStateName = SETPWD_STATE_NAME;
  $rootScope.$on('$stateChangeStart', function(evt, toState) {
    if (!$auth.isAuthenticated()) {
      if (toState.name === loginStateName) return;
      if (toState.name === logoutStateName) return;
      if (toState.name === signupStateName) return;
      if (toState.name === resetPwdStateName) return;
      if (toState.name === setPwdStateName) return;

      console.log('not login, redirect to signin');
      evt.preventDefault();
      return $state.go(loginStateName);
    }
  });
}

function AuthController($auth, $location, notification) {
  var loginRedirectTo = LOGIN_REDIRECT_TO;

  this.login = function(credentials) {
    $auth.login(credentials)
      .then(function() {
        $location.path(loginRedirectTo);
      }).catch(function(data) {
        notification.log("Wrong Password.", {
          addnCls: 'humane-flatty-error'
        });
      });
  };

  this.signup = function(credentials) {
    $auth.signup(credentials)
      .then(function() {
        return $auth.login(credentials);
      })
      .then(function() {
        $location.path(loginRedirectTo);
      });
  };
}

function ManufacturerController($http, $auth, $location, Upload, $timeout) {

  var self = this;

  $http.get("/api/auth/manufacturer-accounts/" + $auth.getPayload().sub).success(data => {
    if(data.status === 1){
      alert('账号已认证!');
      $location.path(LOGIN_REDIRECT_TO);
    }
  });

  $http.get('/api/auth/manufacturers').success(function(result) {
    self.manufacturers = result;
  });

  this.select = function(id) {
    $http.get('/api/auth/manufacturer/' + id + '/select').success(function(result) {
      $auth.setToken(result.token);
      $location.path(LOGIN_REDIRECT_TO);
    }).error(function() {
      alert('失败');
    });
  };

  this.createNewManufacturer = function(entity) {
    $http.post('/api/auth/manufacturers', entity).success(function() {
      alert('成功');
    }).error(function() {
      alert('失败');
    });
  };

  this.authManufacturer = function(entity) {
    entity.file.load = Upload.upload({
      url: '/upload/image',
      data: entity
    }).then(function (response) {
      $timeout(function () {
        entity.businessLicenseUrl = response.data.url;
        delete entity.file;
        $http.post('/api/auth/manufacturer/auth', entity).success(function() {
          alert('认证已提交,请等待审核');
          $auth.logout();
          $location.path(LOGOUT_REDIRECT_TO);
        }).error(function() {
          alert('认证失败');
        });
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    });
  };

}

function ChangeOwnPwdController($scope, $http, notification, $auth, $location) {
  $scope.password = {
    oldPassword: "",
    newPassword: "",
    confirmPassport: ""
  };
  var signOutRedirectTo = LOGOUT_REDIRECT_TO;
  this.changepwd = function(pwd) {
    if (pwd.newPassword == "") {
      notification.log("Password can not be blank.", {
        addnCls: 'humane-flatty-error'
      });
    } else if (pwd.newPassword != pwd.confirmPassport) {
      notification.log("The pin code must be the same.", {
        addnCls: 'humane-flatty-error'
      });
    } else {
      $http.post("/api/auth/manufacturer/changeOwnPwd", {
        oldPassword: pwd.oldPassword,
        newPassword: pwd.newPassword
      }).success((reply) => {
        if (reply.code == 200) {
          notification.log("Password has been changed.", {
            addnCls: 'humane-flatty-success'
          });
          $auth.logout();
          $location.path(signOutRedirectTo);
        } else {
          notification.log("Change Password error.", {
            addnCls: 'humane-flatty-error'
          });
        }
      });
    }
  }
}

function ResetPwdController($scope, $http, notification) {
  this.resetPwd = function(email) {
    $http.post('/api/manufacturer/resetPwd', {
      email
    }).success((data) => {
      if (data.code == 200) {
        notification.log('We have send a email to your email, please check your email.', {
          addnCls: 'humane-flatty-success'
        });
      } else {
        notification.log(data.msg, {
          addnCls: 'humane-flatty-error'
        });
      }
      console.log(data);
    }).error(console.log);
  }
}

function SetPwdController($scope, $http, notification, $location, $state) {
  this.changepwd = function(credentials) {
    var token = $location.search().token;
    if (credentials.password != credentials.confirm) {
      notification.log("The pin code must be the same.", {
        addnCls: 'humane-flatty-error'
      });
    } else {
      $http.post('/api/manufacturer/setPwd', {
        token,
        password: credentials.password
      }).success(function(data) {
        if (data.code == 200) {
          $state.go(LOGIN_STATE_NAME)
        } else {
          notification.log(data.msg, {
            addnCls: 'humane-flatty-error'
          });
        }
      });
    }
  }
}

// function requestInterception(RestangularProvider){
//   RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
//     console.log(element);
//     console.log(operation);
//     console.log(what);
//     console.log(url);
//     console.log(headers);
//     console.log(params);
//     console.log(httpConfig);
//   });
// }

function responseInterception(RestangularProvider){
  RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response) {
    if(data.code === 401){
      alert('账号未认证,请先认证!');
      // $location.path(LOGIN_REDIRECT_TO);
      window.location.replace('/manufacturer');
      return null;
    }
    return data;
  });
}
