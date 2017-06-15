angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $state, OpenFB) {

    $scope.logout = function() {
        OpenFB.logout();
        $state.go('app.login');
    };

    $scope.revokePermissions = function() {
        OpenFB.revokePermissions().then(
            function() {
                $state.go('app.login');
            },
            function() {
                alert('Revoke permissions failed');
            });
    };

})

.controller('LoginCtrl', function($scope, $location, OpenFB) {

    $scope.facebookLogin = function() {

        OpenFB.login('email,publish_actions').then(
            function() {
                $location.path('/app/person/me/feed');
            },
            function() {
                alert('OpenFB login failed');
            });
    };

})

.controller('ShareCtrl', function($scope, OpenFB) {

    $scope.item = {};

    $scope.share = function() {
        OpenFB.post('/me/feed', $scope.item)
            .success(function() {
                $scope.status = "This item has been shared on OpenFB";
            })
            .error(function(data) {
                alert(data.error.message);
            });
    };

})

.controller('ProfileCtrl', function($scope, OpenFB) {
    OpenFB.get('/me').success(function(user) {
        $scope.user = user;
    });
})

.controller('PersonCtrl', function($scope, $stateParams, OpenFB) {
    OpenFB.get('/' + $stateParams.personId).success(function(user) {
        $scope.user = user;
    });
})

.controller('FriendsCtrl', function($scope, $stateParams, OpenFB) {
    OpenFB.get("/me/friends", { limit: 50 })
        .success(function(result) {
            $scope.friends = result.data;
        })
        .error(function(data) {
            alert(data.error.message);
        });
})

.controller('MutualFriendsCtrl', function($scope, $stateParams, OpenFB) {
    OpenFB.get('/' + $stateParams.personId + '/mutualfriends', { limit: 50 })
        .success(function(result) {
            $scope.friends = result.data;
        })
        .error(function(data) {
            alert(data.error.message);
        });
})

.controller('FeedCtrl', function($scope, $stateParams, OpenFB, $ionicLoading) {

    $scope.show = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Loading feed...'
        });
    };
    $scope.hide = function() {
        $scope.loading.hide();
    };

    function loadFeed() {
        $scope.show();
        OpenFB.get('/' + $stateParams.personId + '/home', { limit: 30 })
            .success(function(result) {
                $scope.hide();
                $scope.items = result.data;
                // Used with pull-to-refresh
                $scope.$broadcast('scroll.refreshComplete');
            })
            .error(function(data) {
                $scope.hide();
                alert(data.error.message);
            });
    }

    $scope.doRefresh = loadFeed;

    loadFeed();

})

.controller('FindCtrl', function($scope, $ionicModal) {



    $scope.launchAR = function() {
        // alert('Payment Connection Needed');
        //   window.location.href = "#/tab/ar";
        app.initialize();
    };



    var app = {

        // Url/Path to the augmented reality experience you would like to load
        // arExperienceUrl: "http://localhost/experience/index.html",
        arExperienceUrl: base_url + "/ar/" + "experience/index.html",
        //arExperienceUrl: "http://10.228.193.226:3000/experience/index.html",
        // The features your augmented reality experience requires, only define the ones you really need
        requiredFeatures: ["2d_tracking", "geo"],
        // Represents the device capability of launching augmented reality experiences with specific features
        isDeviceSupported: false,
        // Additional startup settings, for now the only setting available is camera_position (back|front)
        startupConfiguration: {
            "camera_position": "back"
        },
        // Application Constructor
        initialize: function() {
            this.bindEvents();
            //  this.worldLoadedFn();

        },



        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        // deviceready Event Handler

        onDeviceReady: function() {

            app.wikitudePlugin = cordova.require("com.wikitude.phonegap.WikitudePlugin.WikitudePlugin");
            app.wikitudePlugin.isDeviceSupported(app.onDeviceSupported, app.onDeviceNotSupported, app.requiredFeatures);
            // var launchDemoButton = document.getElementById('launch-demo');
            // launchDemoButton.onclick = function() {
            $scope.launchDemoButton = function() {
                //   alert('Hi');
                app.loadARchitectWorld();
                app.initialize();



            }
        },
        loadARchitectWorld: function() {
            app.wikitudePlugin.isDeviceSupported(function() {
                app.wikitudePlugin.loadARchitectWorld(function successFn(loadedURL) {}, function errorFn(error) {
                        alert('Loading AR web view failed: ' + error);
                    },


                    // cordova.file.dataDirectory + 'www/experience/index.html', ['2d_tracking'], { camera_position: 'back' }
                    cordova.file.dataDirectory + arExperienceUrl, ['2d_tracking'], { camera_position: 'back' }
                );
            }, function(errorMessage) {
                alert(errorMessage);
            }, ['2d_tracking']);
        },
        // Callback if the device supports all required features
        onDeviceSupported: function() {
            app.wikitudePlugin.loadARchitectWorld(
                app.onARExperienceLoadedSuccessful,
                app.onARExperienceLoadError,
                app.arExperienceUrl,
                app.requiredFeatures,
                app.startupConfiguration
            );
        },
        // Callback if the device does not support all required features
        onDeviceNotSupported: function(errorMessage) {
            alert(errorMessage);
        },
        // Callback if your AR experience loaded successful
        onARExperienceLoadedSuccessful: function(loadedURL) {
            /* Respond to successful augmented reality experience loading if you need to */
        },
        // Callback if your AR experience did not load successful
        onARExperienceLoadError: function(errorMessage) {
            alert('Loading AR web view failed: ' + errorMessage);
        },


    };

    //  app.initialize();

    $scope.open = function() {
        init().then(function() {
            $scope.modal.show();

        });
    }
    $scope.closeWithRemove = function() {
        $scope.modal.remove()
            .then(function() {
                $scope.modal = null;
            });
    };

    $scope.closeWithoutRemove = function() {
        $scope.modal.hide();
    };

});