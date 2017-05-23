// appRoutes.js

angular.module('appRoutes', ['ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$routeProvider

			.when('/slideshow', {
					templateUrl: 'views/trip.html',
					controller: 'tripCtrl'
			})

            .otherwise({
                templateUrl: 'views/map.html',
                controller: 'addCtrl'
            });

		$locationProvider.html5Mode(true);
}]);
