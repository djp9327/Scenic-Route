// TripService.js
/**
angular.module('TripService', []).factory('Trip', ['$http', function($http) {
	return {
			get : function() {
				return $http.get('/api/trip');
			},

			create : function(tripData) {
				return $http.post('/api/trip/', tripData);
			},

			delete : function(id) {
				return $http.delete('/api/trip' + id);
			}
	}
}]);**/
