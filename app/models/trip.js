// trip.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define trip schema
var TripSchema = new Schema ({
    start : {
        city: String,
        street: String,
        houseNumber: Number,
        state: String,
        location: {type: [Number], required: true}
    },
    end : {
        city: String,
        street: String,
        houseNumber: Number,
        state: String,
        location: {type: [Number], required: true}
    },
    numViews: {type: Number, min: 1, max: 50, required: true},
    place_types:[String],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

TripSchema.pre('save', function(next) {
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }

    next();
});

TripSchema.index({location: '2dsphere'});
var Trip = mongoose.model('Trip', TripSchema);

module.exports = Trip;
    
