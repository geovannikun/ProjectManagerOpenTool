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

app.factory('Project',['$cookies',function($cookies){
    var userID = $cookies.get('userID');
    return {
        selectedProject: "teste",
        users: {
            0: {name:"Fulano", img:"/img/default-user-image.png"}
        },
        projects: {
            "teste": {
                name:"Teste 1",
                boards:[
                    {
                        name:"To do",
                        tasks:[
                            {name:"teste", type:1, members:[0]},
                            {name:"teste", type:2, members:[0]}
                        ]
                    },
                    {name:"Doing",tasks:[{name:"teste"},{name:"teste"}]},
                    {name:"Done",tasks:[{name:"teste"},{name:"teste"}]}
                ]
            }
        }
    };
}]);

app.controller('AppCtrl', function($scope, $mdDialog, Project, $socket){
    console.log("App Controller Started");

    $scope.selectedProject = Project.selectedProject;
    $scope.projects = Project.projects;
    $scope.users = Project.users;

    $scope.status = {
        0: {title:"Error",icon:"img/icons/replay.svg"},
        1: {title:"Finished",icon:"img/icons/check.svg"},
        2: {title:"Downloading",icon:"img/icons/pause-circle-outline.svg"},
        3: {title:"Paused",icon:"img/icons/play.svg"},
        4: {title:"Stoped",icon:"img/icons/replay.svg"}
    };

    $scope.selectedDownload = 0;

    $socket.on('board:update', function (message) {
        console.log(message);
    });

    $scope.projectOptions = {
        0: {name:"KanBan", url:"/project/:projectID/kanban"}
    };

    $scope.selectProject = function(ev){
        $mdDialog.show({
            controller: selectProjectCtrl,
            templateUrl: '/modals/selectProject.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            focusOnOpen: false,
            clickOutsideToClose:true
        }).then(function(download) {
            $scope.downloads.push(download);
        }, function() {
            console.log("do nothing");
        });
    }

    window.setTimeout($scope.selectProject,500);

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

function selectProjectCtrl($scope, $mdDialog) {
    $scope.projects = [];
    $scope.selectedProject = "";
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.select = function() {
        $mdDialog.hide($scope.selectedProject);
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

function KanBanCtrl($scope,Project) {
    $scope.boards = Project.projects[$scope.selectedProject].boards;
    console.log($scope.boards);
}
