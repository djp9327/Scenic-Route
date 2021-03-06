// gservice.js

// Creates the gservice factory.  This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($http, $location, $q) {
        // Initialize Variables
        // ------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];
        var photos = [];
        var places = [];
        var placeTags = [];

        // Selected Location (intialize to center of America)
        var selectedLat = 39.50;
        var selectedLong = -98.35;

        var map;

        // Functions
        // ------------------------------------------------------
        googleMapService.getPhotos = function() {
            return photos;
        }

        googleMapService.getPlaceTags = function() {
            return placeTags;
        }

        // Refresh the Map with new data.  Function will take new latitiude and longitude coordinates.
        googleMapService.refresh = function (latitude, longitude) {
            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            var groupHeight1 = document.getElementById('myFormGroup1').clientHeight;
            var groupHeight2 = document.getElementById('myFormGroup2').clientHeight;
            var groupHeight3 = document.getElementById('myFormGroup3').clientHeight;
            var submitHeight = document.getElementById('submit').clientHeight;

            var promises = [];


            var promise = new Promise(function(resolve, reject) {
                $http.get('/trips').then(function (response) {
                    if(response.status == 200) {
                        resolve(response);
                    } else{
                        reject(Error(request.statusText));
                    }
                });
            });

             var prom1 = promise.then(function(response){
                 locations = convertLocationsToPoints(response);
                 initializeMap(latitude, longitude);
                 return locations;

            });

             var prom2 = prom1.then(function(response) {
                if(response.length > 0) {
                    return initializeDirections();
                }
            });

             return prom2;

        };

        var convertLocationsToPoints = function (response) {
            var locations = [];

            for (i = 0; i < response.data.length; i++) {
                var trip = response.data[i];

                var contentStartString =
                    '<p>' + trip.start.houseNumber + ' ' + trip.start.street +
                    '<br>' + trip.start.city + ' ' + trip.start.state +
                    '</p>';

                var contentEndString =
                    '<p>' + trip.end.houseNumber + ' ' + trip.end.street +
                    '<br>' + trip.end.city + ' ' + trip.end.state +
                    '</p>';

                locations.push({
                    latlonStart: new google.maps.LatLng(trip.start.location[0], trip.start.location[1]),
                    contentStart: contentStartString,
                    latlonEnd: new google.maps.LatLng(trip.end.location[0], trip.end.location[1]),
                    contentEnd: contentEndString,
                    place_types: trip.place_types
                });
            }

            return locations;
        };

        var initializeMap = function (latitude, longitude) {
            var myLatLong = {lat: selectedLat, lng: selectedLong};
            var infoWindow = new google.maps.InfoWindow({});

            if (!map) {
                    map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 3,
                    center: myLatLong
                });

                map.setZoom(8);
            }

            locations.forEach(function (n, i) {
                var latLongStart = new google.maps.LatLng(n.latlonStart.lat(), n.latlonStart.lng());
                var markerStart = new google.maps.Marker({
                    position: latLongStart,
                    map: map,
                    icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                });

                google.maps.event.addListener(markerStart, 'click', function (e) {
                    infoWindow.setContent(n.contentStart);
                    infoWindow.open(map, markerStart);
                });

                var latLongEnd = new google.maps.LatLng(n.latlonEnd.lat(), n.latlonEnd.lng());
                var markerEnd = new google.maps.Marker({
                    position: latLongEnd,
                    map: map,
                    icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                });
                google.maps.event.addListener(markerEnd, 'click', function (e) {
                    infoWindow.setContent(n.contentEnd);
                    infoWindow.open(map, markerEnd);
                });

                var update_timeout = null;
                var clicks = 0;

                google.maps.event.addListener(map, 'click', function (e) {
                    clicks++;
                    update_timeout = setTimeout(function () {
                        if(clicks == 1) {
                            console.log("SINGLE CLICK");
                            map.panTo(e.latLng);
                            clicks = 0;
                        }
                    }, 300);
                });

                google.maps.event.addListener(map, 'dblclick', function(e) {
                    clearTimeout(update_timeout);
                    clicks = 0;
                });
            });
        }

        var drawBoxes = function(boxes) {
            boxpolys = new Array(boxes.length)
            for (var i = 0; i < boxes.length; i++) {
                boxpolys[i] = new google.maps.Rectangle({
                    bounds: boxes[i],
                    fillOpacity: 0,
                    strokeOpacity: 1.0,
                    strokeColor: '#000000',
                    strokeWeight: 1,
                    map: map
                });
            }
        }

        var findPlaces = function(boxes, place_types, placesService) {
            var myLength = boxes.length * place_types.length;
            var promises = [];
            for(var j=0; j < place_types.length; j++) {
                for (var i = 0; i < 1; i++) {
                    var searchRequest = {
                        bounds: boxes[i],
                        types: [place_types[j]]
                    };
                    var place;
                    promises.push(new Promise(function(resolve, reject) {
                        placesService.nearbySearch(searchRequest, function (results, status) {
                            --myLength;
                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                for(var i=0; i < results.length; i++) {
                                    var rating = results[0].rating;
                                    if (results[0].rating > 2) {
                                        places.push(results[0]);
                                        resolve(results[0]);
                                    }
                                }
                            }
                            resolve();

                        });
                    }));
                }
            }
            return Promise.all(promises)
                .then(function(results) {
                    results.clean(undefined);
                    console.log("Got em all " + results);
                    return getPlaceDetails(places, placesService);
                });
        }


        var getPlaceDetails = function(places, placesService) {
            var myLength = places.length;
            var promises = [];
            //var deferred = $q.defer();
            for(var i=0; i < myLength; i++) {
                var detailsRequest = {
                    placeId: places[i].place_id
                };

                promises.push(new Promise(function (resolve, reject) {
                    placesService.getDetails(detailsRequest, function (results, status) {
                        --myLength;
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            if (results.photos) {
                                for (var j = 0; j < results.photos.length; j++) {
                                    var photo = results.photos[j];
                                    if (photo.height > 500 && photo.width > 500) {
                                        photos.push(photo);
                                        placeTags.push(results.name);
                                        resolve();
                                    }
                                }
                            }
                        }
                        resolve();
                    });
                }));

            }
            return Promise.all(promises)
                .then(function(results) {
                    results.clean(undefined);
                    console.log("Got em all " + results);
                    return;
                });
        }

        var initializeDirections = function(callback) {
            //var deferred = $q.defer();
            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();
            var placesService = new google.maps.places.PlacesService(map);

            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(map);

            var trip = locations[0];
            var start = trip.latlonStart
            var end = trip.latlonEnd;
            var place_types = trip.place_types;

            var request = {
                origin: start,
                destination: end,
                travelMode: 'WALKING'
            };

            var prom = new Promise(function(resolve, reject) {
                directionsService.route(request, function (result, status) {
                    if (status == 'OK') {
                        directionsDisplay.setDirections(result);
                    }
                    routeBoxer = new RouteBoxer();
                    var path = result.routes[0].overview_path;
                    var boxes = routeBoxer.box(path, 0.5);
                    drawBoxes(boxes);
                    var results = [];
                    //deferred.resolve(findPlaces(boxes, place_types, placesService));
                    //deferred.resolve();
                    return resolve(findPlaces(boxes, place_types, placesService));
                });
                //return deferred.promise;
            });

            return prom;
        }

        google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });