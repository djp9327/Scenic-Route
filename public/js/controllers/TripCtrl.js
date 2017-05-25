// TripCtrl.js

var tripCtrl = angular.module('tripCtrl', ['gservice', 'appRoutes']);
tripCtrl.controller('tripCtrl', function($scope, $http, $location, $route, geolocation, gservice){
    $scope.init = function() {
        var photos = gservice.getPhotos();
        var placeTags = gservice.getPlaceTags();
        makeSlides(photos, placeTags);
    }

    var makeSlides = function(photos, placeTags) {
        var slideDiv = document.createElement("div");
        slideDiv.setAttribute("id", "slides");
        $(function () {
            $("#slides").slidesjs({
                width: 600,
                height: 600,
                pagination: {
                    active: false
                },
                navigation: {
                    active: false,
                    effect: "slide"
                }
            });
        });
        for(var i=0; i < photos.length; i++) {
            var img = document.createElement("img");
            var fig = document.createElement("figure");
            var figCaption = document.createElement("figurecaption");
            figCaption.innerHTML = "<br>" + placeTags[i];
            $(fig).css({"height": "500px", "width": "500px"});
            $(figCaption).css({"font-family": "Abril FatFace", "color": "#4482e5", "font-size": "20px"});
            var previous = document.createElement('a');
            var next = document.createElement('a');
            var prevIcon = document.createElement('i');
            var nextIcon = document.createElement('i');
            prevIcon.className = "fa fa-chevron-left icon-large";
            nextIcon.className = "fa fa-chevron-right icon-large";
            nextIcon.style.fontSize = "32px";
            prevIcon.style.fontSize = "32px";
            previous.href = "#";
            next.href = "#";
            next.className = "slidesjs-next slidesjs-navigation";
            previous.className = "slidesjs-previous slidesjs-navigation";
            previous.appendChild(prevIcon);
            next.appendChild(nextIcon);
            img.src = photos[i].getUrl({'maxWidth': 500, 'maxHeight': 500});
            fig.appendChild(img);
            fig.appendChild(figCaption);
            slideDiv.appendChild(fig);
        }

        slideDiv.appendChild(previous);
        slideDiv.appendChild(next);
        slideDiv.style.display = "none";
        var myDiv = document.getElementById("myCol7");
        myDiv.appendChild(slideDiv);
        //document.getElementById("myCol5").appendChild(slideDiv);
    }

});
