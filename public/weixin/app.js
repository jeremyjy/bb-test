angular.module('app', [
    'ui.router']);
angular.module('app').config(routeConfig);
angular.module('app').config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
angular.module('app').controller('NetworkCfgController', ['$scope', '$http',NetworkCfgController]);
angular.module('app').controller('UnbindingController', ['$scope', '$location','$http',UnbindingController]);

var baseUrl = 'http://120.24.230.248';

function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise(function($injector) {
        var $state = $injector.get('$state');
        $state.go('404');
    });


    $stateProvider.state('404', {
        url: '/404',
        templateUrl: 'views/404.html'
    });



    $stateProvider.state('network-configure', {
        url: '/network-configure',
        templateUrl: 'views/network-configure.html',
        controller: 'NetworkCfgController',
        controllerAs: 'networkCfgCtrl'
    });

    $stateProvider.state('unbind-device', {
        url: '/unbind-device',
        templateUrl: 'views/unbind-device.html',
        controller: 'UnbindingController',
        controllerAs: 'unbindingCtrl'
    });



}


function NetworkCfgController($scope, $http) {
    $scope.$on('$viewContentLoaded', function() {
        $http.get(baseUrl+'/api/wechat/getJsApiConfig').success(function(data) {
            wx.config(data.wechatConfig);
        });
    });
    this.networkCfg = function () {
            wx.invoke('configWXDeviceWiFi', {}, function(err, result) {
                alert(err.err_msg)
                if (err.err_msg === 'configWXDeviceWiFi:cancel') {
                    return alert('消费者取消了配网的动作');
                }
                alert(JSON.stringify(result, null, 2));
            });


    }
    }

function UnbindingController($scope,$location,$http) {
    $scope.$on('$viewContentLoaded', function() {
        var data = $location.search().data;
        if (!data) {
            return $scope.data = {wechatOpenId: null, deviceId: {}};
        }
        data = JSON.parse(data);
        if (!data.deviceId) {
             data.deviceId = {};
        }
        $scope.data = data;
    })
    this.unbind = function () {
        $http.get(baseUrl+'/api/wechat/unbindDevice?deviceId='+$scope.data.deviceId.wechatDeviceId+"&openId="+$scope.data.wechatOpenId).success(function(data) {
            alert(data);
        });
    }
}
