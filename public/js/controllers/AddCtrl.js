/**
 * Created by daniel.pereira on 3/9/2017.
 */

var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice', 'selector', 'appRoutes']);
addCtrl.controller('addCtrl', function($scope, $http, $location, $route, geolocation, gservice) {
    // Initialize variables
    // ------------------------------------------------------
    $scope.startingAddress;
    $scope.destination;
    $scope.numViews = 0;

    $scope.place_types_ids = [];

    $scope.place_types = [
        {value: "amusement_park", label: "Amusement Park"},
        {value: "art_gallery", label: "Art Gallery"},
        {value: "church", label: "Church"},
        {value: "city_hall", label: "City Hall"},
        {value: "embassy", label: "Embassy"},
        {value: "hindu_temple", label: "Hindu Temple"},
        {value: "hospital", label: "Hospital"},
        {value: "library", label: "Library"},
        {value: "local_government_office", label: "Local Government Office"},
        {value: "mosque", label: "Mosque"},
        {value: "museum", label: "Museum"},
        {value: "night_club", label: "Night Club"},
        {value: "park", label: "Park"},
        {value: "school", label: "School"},
        {value: "stadium", label: "Stadium"},
        {value: "synagogue", label: "Synagogue"},
        {value: "university", label: "University"},
        {value: "zoo", label: "Zoo"}
    ];

    var autocompleteStart;
    var autocompleteEnd;

    geolocation.getLocation().then(function(data) {
        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        gservice.refresh(coords.lat, coords.long);
    });

    // Functions
    // ------------------------------------------------------
    // Create new trip based on form fields
    var initAutcomplete = function() {
        var startInput = document.getElementById('startingAddress');
        var endInput = document.getElementById('destination');
        var options = {
            types: ['address']
        };
        autocompleteStart = new google.maps.places.Autocomplete(startInput, options);
        autocompleteEnd = new google.maps.places.Autocomplete(endInput, options);

    };

    function parseLocationData(address_components, location) {
        var data = {};
        for(i = 0; i < address_components.length; i++) {
            var component = address_components[i];
            var componentType = component.types[0];
            switch (componentType) {
                case "street_number":
                    data.houseNumber = component.long_name;
                    break;
                case "route":
                    data.street = component.long_name;
                    break;
                case "sublocality":
                    data.city = component.long_name;
                    break;
                case "locality":
                    data.city = component.long_name;
                    break;
                case "administrative_area_level_1":
                    data.state = component.long_name;
                    break;
            }
        }
        data.location = location;
        return data;
    }

    google.maps.event.addDomListener(window, 'load', initAutcomplete());
    $scope.createTrip = function() {
        var startAuto = autocompleteStart.getPlace();
        var endAuto = autocompleteEnd.getPlace();
        var startAddress_components = startAuto.address_components;
        var endAddress_components = endAuto.address_components;

        var startLocation = [startAuto.geometry.location.lat(), startAuto.geometry.location.lng()];
        var endLocation = [endAuto.geometry.location.lat(), endAuto.geometry.location.lng()];

        var tripData = {
            start : parseLocationData(startAddress_components, startLocation),
            end: parseLocationData(endAddress_components, endLocation),
            numViews: $scope.numViews,
            place_types: $scope.place_types_ids
        };

        // Save trip data to DB
        $http.post('/trips', tripData)
            .then(function success(data) {
            // Once complete, clear the form
            $scope.startingAddress = "";
            $scope.destination= "";
            $scope.numViews = 0;

            var photos = [];
            var promise = gservice.refresh(startLocation[0], startLocation[1]);
            promise.then(function (results) {
               console.log("At least we've got a defined object");
               $location.path('/slideshow');
               $route.reload();
            });

            }, function error(data) {
            console.log('Error' + data);
        });
    };
});