// app/routes.js

var path = require('path');

// grab trip model
var Trip = require('./models/trip.js');
var mongoose = require('mongoose');

    module.exports = function(app) {

        // server routes ===================================
        // handle things like api calls
        // authentication routes

        //sample api route
        app.get('/trips', function (req, res) {
            // use mongoose to retrieve all trips in the database
            Trip.find(function (err, trips) {

                // if there is an error retrieving, send the error.
                // noting after res.send(err) will execute
                if (err)
                    res.send(err);

                res.json(trips); // return all trips in json format
            });
        });

        app.post('/trips', function (req, res) {
            var newTrip = new Trip(req.body);

            newTrip.save(function (err) {
                if (err) {
                    console.log(err);
                    res.send(err);
                    return;
                }

                res.json(req.body);
            });
        });

        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // frontend routes =================================
        // route to handle all angular requests
        /**
        app.get('*', function(req, res) {
            var myPath2 = path.resolve()
            res.sendFile(path.resolve(__dirname, '../public/index.html'));
        });**/

    };
