// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var config = {
    appKey: 'kid_bk7pmxxJkb',
    appSecret: '4aa9f98663aa4166a45c0ae074debaf8',
    sync: {
        enable: true
    },
    initialized: false
};

angular.module('starter', ['ionic', 'kinvey', 'starter.controllers', 'ngIOS9UIWebViewPatch', 'ngCordova'])

.run(function($ionicPlatform, $kinvey, $rootScope, $state, $location) {

    $rootScope.primarycolor = "#2162a5";


    $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        if (!config.initialized) {
            console.log('not initialized');
            event.preventDefault();
            Kinvey.MICAPIVersion = 2;

            // Kinvey initialization starts
            var promise = $kinvey.init(config).then(function() {
                config.initialized = true;
                // Kinvey initialization finished with success
                //alert("Kinvey init with success");
                window.addEventListener("offline", function() {
                    console.log('going offline');
                    $kinvey.Sync.offline();
                }, false);
                window.addEventListener("online", function() {
                    console.log("going online");
                    $kinvey.Sync.online({
                        conflict: $kinvey.Sync.clientAlwaysWins
                    });
                }, false);

                determineBehavior($kinvey, $rootScope, $state);
            }, function(errorCallback) {
                // Kinvey initialization finished with error
                alert("Kinvey init with error: " + JSON.stringify(errorCallback));
                determineBehavior($kinvey, $rootScope, $state);
            });

        } else {
            console.log('*BEEN THERE, DONE THAT');


        }
    });


    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });

    $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
        console.log('push received, root');
        //var payload = JSON.parse(event.payload);
        //console.log(JSON.stringify([notification]));
        console.log(event);
        console.log('here');
        if (notification.alert) {
            console.log(notification.alert);
            alert(notification.alert);
        }

        if (notification.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }

        if (notification.badge) {
            $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
                // Success!
            }, function(err) {
                console.log(err);
            });
        }
    });



})




.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
        .state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'MenuCtrl'
        })

    .state('menu.tabs', {
        url: "/tab",
        views: {
            'menuContent': {
                templateUrl: "templates/tabs.html"
            }
        }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('menu.tabs.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    })


    .state('menu.clinicals', {
        url: '/clinicals',
        views: {
            //'tab-clinicals': {
                'menuContent': {
                templateUrl: 'templates/clinicals.html',
                controller: 'ClinicalCtrl'
            }
           // }
        }
    })
  

    .state('menu.tabs.products', {
        url: '/products',
        views: {
            'tab-products': {
                templateUrl: 'templates/products.html',
                controller: 'ProductCtrl'
            }
        }
    })

    .state('menu.tabs.search', {
        url: '/search',
        views: {
            'tab-search': {
                templateUrl: 'templates/search.html',
                controller: 'SearchCtrl'
            }
        }
    })


    .state('menu.tabs.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('menu/tab/home');

});



//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $rootScope, $state, $scope) {
    var activeUser = $kinvey.getActiveUser();
    console.log("$state.current.name: " + $state.current.name);
    if (activeUser != null) {

        // we're authenticated, grab logo and color scheme
        var query = new Kinvey.Query();
        query.equalTo('ActiveBrand', true);
        $kinvey.DataStore.find('DemoBrandingData', query).then(function(brand) {
            console.log(brand);
            $rootScope.primarycolor = brand[0].PrimaryColor;

            if (brand[0].LogoFileName.indexOf('http') == -1) {
                console.log('local path');
                brand[0].LogoFileName = "img/" + brand[0].LogoFileName;
            }
            $rootScope.logo = brand[0].LogoFileName;
            $rootScope.screenText = brand[0].HomeScreenText;
            $rootScope.textColor = brand[0].PrimaryTextColor;
            $rootScope.customer = brand[0].CustomerName;
            $rootScope.accountsname = brand[0].AccountsName;
            $rootScope.tasksname = brand[0].TasksName;
            $rootScope.addtaskname = brand[0].AddTaskName;
            $rootScope.calcname = brand[0].CalculatorName;
        });


        console.log("activeUser not null determine behavior");
        if ($state.current.name != 'menu.tab.home') {
            $state.go('menu.tabs.home');


        }
    } else {
        console.log("activeUser null redirecting");
       
        if ($state.current.name != 'menu.tab.account') {
            $state.go('menu.tabs.account');
        }
    }
};