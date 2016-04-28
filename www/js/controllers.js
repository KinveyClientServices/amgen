angular.module('starter.controllers', ['kinvey', 'ngCordova'])

.controller('DashCtrl', function($scope) {

    $scope.myTest = function() {
        console.log('inside myTest');
        $ionicSideMenuDelegate.toggleLeft();
    };


})


.controller('SearchCtrl', function($scope, $kinvey, $sce) {

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('load search view');

        var activeUser = $kinvey.getActiveUser();
        var access_token = activeUser.vaccesstoken;

        var query = new $kinvey.Query();

        query.equalTo('authentication_token', access_token);
        query.equalTo('start_date', '2016-03-01T00:00:00+00:00');


        $kinvey.DataStore.find('userroutine', query).then(function(routines) {
            console.log(routines);
            $scope.routines = routines;
        });
    });

})





.controller('ProductCtrl', function($scope, $kinvey, $cordovaInAppBrowser, $rootScope) {

    $scope.$on('$ionicView.beforeEnter', function() {

        console.log('inside productctrl');

        var activeUser = $kinvey.getActiveUser();
        var access_token = activeUser.vaccesstoken;

        var query = new $kinvey.Query();

        query.equalTo('authentication_token', access_token);

        $kinvey.DataStore.find('userprofile', query).then(function(products) {
            console.log(products);
            $scope.products = products;
        });
    });

    $scope.connectme = function($scope) {
        console.log('register device');

        var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'no'
        };

        var activeUser = $kinvey.getActiveUser();

        console.log(  activeUser );

        console.log( activeUser.vaccesstoken);

        var access_token = activeUser.vaccesstoken;
        
        


        $cordovaInAppBrowser.open('https://app.validic.com/5412de4e965fe22a1c000149/' + access_token, '_blank', options)

        .then(function(event) {
            console.log('success');
            console.log(event);
        })

        .catch(function(event) {
            console.log('error');
            console.log(event);
        });

    }
})


.controller('ClinicalCtrl', function($scope, $kinvey, $cordovaInAppBrowser, $rootScope) {

    $scope.products = [{'city':'Boston'}, {'city':'Kansas City'}, {'city':'Seattle'}];
    $scope.clinics = [];

    $scope.$on('$ionicView.beforeEnter', function() {

        console.log('inside clinicalctrl');

        /*var activeUser = $kinvey.getActiveUser();
        var access_token = activeUser.vaccesstoken;

        var query = new $kinvey.Query();

        query.equalTo('authentication_token', access_token);

        $kinvey.DataStore.find('userprofile', query).then(function(products) {
            console.log(products);
            $scope.products = products;
        });*/
    });

    $scope.changeme = function() {
        console.log('changeclinicals');

        var mycity = document.getElementById("chosenProduct").value;
        console.log(mycity);

        var query = new Kinvey.Query();
        query.equalTo('term', mycity);

        $kinvey.DataStore.find('search', query).then(function(clinics) {
            console.log(clinics);
            $scope.clinics = clinics;
        });
    }

      $scope.doQuery = function() {
        console.log('run query');

        var myquery = document.getElementById("queryterm").value;
        console.log(myquery);

        var query = new Kinvey.Query();
        query.equalTo('term', myquery);

        $kinvey.DataStore.find('search', query).then(function(clinics) {
            console.log(clinics);
            $scope.clinics = clinics;
        });
    }
})





.controller('MenuCtrl', function($scope, $kinvey, $ionicSideMenuDelegate, $ionicModal) {
    console.log('inside menuctrl');
    $scope.toggleLeft = function() {
        console.log('inside toggleleft');
        $ionicSideMenuDelegate.toggleLeft();
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
        $scope.modal = modal;
    }, {
        animation: 'slide-in-up'
    });
})



.controller('HomeCtrl', function($scope, $kinvey, $ionicSideMenuDelegate, $rootScope) {
    console.log('home');

    $scope.$on('$ionicView.beforeEnter', function() {
        // we're authenticated, grab logo and color scheme
        console.log('home');
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
            $rootScope.productsname = brand[0].ProductsName;
        });
    });


})



.controller('AccountCtrl', function($scope, $state, $kinvey, $cordovaPush, $http, $rootScope) {
    $scope.userData = {
        email: "",
        password: ""
    };


    $scope.validateUser = function() {
        var promise = $kinvey.User.login({
            username: $scope.userData.email,
            password: $scope.userData.password
        });
        promise.then(
            function(response) {
                //Kinvey login finished with success
                console.log(response);
                console.log("|" + response.vuid + "|");
                console.log( response.vaccesstoken);
                


                if (response.vuid == null) {
                    // validic user has been registered
                    console.log('no validic user registered');
                    // call to register validic user
                    var promise = $kinvey.execute('validicRegister', {
                        _id: response._id,
                        org: '5412de4e965fe22a1c000149'
                    });
                    promise.then(function(response) {
                        console.log(response);
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    console.log('user has been registered with validic');
                }
                $scope.submittedError = false;
                $state.go('menu.tabs.home');
            },
            function(error) {
                //Kinvey login finished with error
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log("Error login " + error.description); //
            }
        );
    };


    $scope.signUp = function() {
        var promise = $kinvey.User.signup({
            username: $scope.userData.email,
            password: $scope.userData.password,
            email: $scope.userData.email
        });
        console.log("signup promise");
        promise.then(
            function() {
                //Kinvey signup finished with success
                $scope.submittedError = false;
                console.log("signup success");
                $state.go('menu.tabs.home');
            },
            function(error) {
                //Kinvey signup finished with error
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log("signup error: " + error.description);
            }
        );
    };

    $scope.logout = function() {
        //Kinvey logout starts
        var promise = $kinvey.User.logout();
        promise.then(
            function() {
                //Kinvey logout finished with success
                console.log("user logout");
                $kinvey.setActiveUser(null);
            },
            function(error) {
                //Kinvey logout finished with error
                alert("Error logout: " + JSON.stringify(error));
            }
        );
    }

});