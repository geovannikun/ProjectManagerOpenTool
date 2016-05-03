var app = angular.module('getInServerApp', ['ngRoute','ngMessages','ngMaterial','dndLists','contenteditable','ngSocket','ngCookies']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/project/:projectId', {
        templateUrl: 'views/kanban.html',
        controller: 'KanBanCtrl',
        controllerAs: 'kanban'
    })
    .when('/project/:projectId/kanban', {
        templateUrl: 'views/kanban.html',
        controller: 'KanBanCtrl',
        controllerAs: 'kanban'
    });

    $locationProvider.html5Mode(true);
}]);

app.factory('project',['$http','$cookies',function($http, $cookies){
    this.userID = $cookies.get('userID');
    var _self = this;
    var _return = {
        selectedProject : {},
        projects : [],
        updateProjects: function(callback){
            $http.get('/api/project').then(function(data) {
                _return.projects = data.data;
                callback();
            });
        }
    };
    return _return;

}]);

app.controller('AppCtrl', function($scope, $mdDialog, project, $socket){
    console.log("App Controller Started");

    $scope.selectedProject = project.selectedProject;
    $scope.projects = project.projects;
    $scope.users = project.users;

    $scope.status = {
        0: {title:"Error",icon:"img/icons/replay.svg"},
        1: {title:"Finished",icon:"img/icons/check.svg"},
        2: {title:"Downloading",icon:"img/icons/pause-circle-outline.svg"},
        3: {title:"Paused",icon:"img/icons/play.svg"},
        4: {title:"Stoped",icon:"img/icons/replay.svg"}
    };

    $socket.on('board:update', function (message) {
        console.log(message);
    });

    $scope.projectOptions = {
        0: {name:"KanBan", url:"/project/:projectID/kanban"}
    };

    window.setTimeout(function(){selectProject($mdDialog,project)}, 500);

    $scope.showSettings = function(ev){
        $mdDialog.show({
            controller: SettingCtrl,
            templateUrl: 'modals/settings.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            focusOnOpen: false,
            clickOutsideToClose:true
        }).then(function(download) {
            //$scope.downloads.push(download);
        }, function() {
            console.log("do nothing");
        });
    }
});

app.controller('LoginCtrl', function($scope, $http){
    $scope.loginData = {};
    $scope.login = function(){
        console.log($scope.loginData);
        $http({
            method  : 'POST',
            url     : '/api/login',
            data    : $scope.loginData,
        }).success(function(data) {
            console.log(data);
            if (data.success){
                window.location = "/";
            }else{
                console.log("error");
            }
        });
    }
});

app.controller('KanBanCtrl', KanBanCtrl);

function selectProjectCtrl($scope, $mdDialog, $http, project) {
    $scope.projects = project.projects;
    $scope.selectedProject = project.projects[0];
    project.updateProjects(function(){
        $scope.projects = project.projects;
        $scope.selectedProject = project.projects.length?project.projects[0]:{};
    });
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.select = function() {
        $mdDialog.hide($scope.selectedProject);
    };
    $scope.add = function() {
        $mdDialog.show({
            controller: addProjectCtrl,
            templateUrl: '/modals/addProject.html',
            parent: angular.element(document.body),
            focusOnOpen: false,
            clickOutsideToClose:true
        }).then(function(proj) {
            project.updateProjects(function(){
                selectProject($mdDialog,project);
            });
        }, function() {
            console.log("do nothing");
        });
    };
}

function addProjectCtrl($scope,$http,$mdDialog) {
    $scope.project = {
        name: ""
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function() {
        $http({
            method  : 'POST',
            url     : '/api/project',
            data    : $scope.project,
        }).success(function(data) {
            if (data.success){
                $mdDialog.hide($scope.project);
                console.log(data.data);
            }else{
                console.log("error");
            }
        });
    };
}

function SettingCtrl($scope, $mdDialog) {
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function() {
        $mdDialog.hide("teste");
    };
}

function KanBanCtrl($scope,project) {
    $scope.boards = project.projects[$scope.selectedProject].boards;
    console.log($scope.boards);
}

function selectProject($mdDialog,project){
    $mdDialog.show({
        controller: selectProjectCtrl,
        templateUrl: '/modals/selectProject.html',
        parent: angular.element(document.body),
        focusOnOpen: false,
        clickOutsideToClose:true
    }).then(function(proj) {
        if(proj)
            project.selectedProject = JSON.parse(proj);
    }, function() {
        console.log("do nothing");
    });
}
