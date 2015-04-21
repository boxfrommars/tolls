'use strict';

/**
 * @ngdoc function
 * @name tollsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tollsApp
 */
angular.module('tollsApp')
  .controller('MainController', ['$http', 'leafletData', function ($http, leafletData) {
    var TRACK_SERVER_BASE_URL = '//rnd.fasten.com';

    var drawnLine = new L.FeatureGroup();
    var drawnMarkers = new L.FeatureGroup();

    var vm = this;
    vm.tracks = [];
    vm.markers = [];
    vm.currentTrack = null;


    var entrances = [{
      code: 'EN1',
      coordinates: [
        {"lat":42.34789571323296,"lng":-71.06101334095001},
        {"lat":42.34717413897111,"lng":-71.06161415576935},
        {"lat":42.34694418499349,"lng":-71.06207549571991},
        {"lat":42.346904537670945,"lng":-71.06280505657196},
        {"lat":42.346920396602954,"lng":-71.06350243091583}
      ]
    }];

    var exits = [{
      code: 'EX1',
      coordinates: [
        {"lat":42.355293353966324,"lng":-71.11847698688507},
        {"lat":42.35553120577965,"lng":-71.11850917339324},
        {"lat":42.35618132947636,"lng":-71.1187881231308},
        {"lat":42.35668081018698,"lng":-71.119185090065}
      ]
    }, {
      code: 'EX2',
      coordinates: [
        {"lat":42.35087707511597,"lng":-71.11142814159393},
        {"lat":42.3511902684889,"lng":-71.11167222261429},
        {"lat":42.35155896248497,"lng":-71.1119082570076}
      ]
    }];

    var toll =
      [
        {"lat":42.346920396602954,"lng":-71.06350243091583}, // EN1 end
        {"lat":42.34703140901506,"lng":-71.06387257575989},
        {"lat":42.34733272743112,"lng":-71.0651171207428},
        {"lat":42.34757060937097,"lng":-71.06642067432404},
        {"lat":42.34776884363319,"lng":-71.06793344020844},
        {"lat":42.34788778389048,"lng":-71.06937110424042},
        {"lat":42.34788778389048,"lng":-71.07088387012482},
        {"lat":42.34789571323296,"lng":-71.07216060161589},
        {"lat":42.34789571323296,"lng":-71.07349097728729},
        {"lat":42.34781641976309,"lng":-71.08956277370453},
        {"lat":42.34784813716305,"lng":-71.0910540819168},
        {"lat":42.347832278465084,"lng":-71.09260976314545},
        {"lat":42.347832278465084,"lng":-71.09417617321013},
        {"lat":42.34780056105714,"lng":-71.09588205814362},
        {"lat":42.34782434911458,"lng":-71.09746992588043},
        {"lat":42.347792631702646,"lng":-71.09924018383026},
        {"lat":42.34787192520248,"lng":-71.10080659389496},
        {"lat":42.348086017152475,"lng":-71.10199749469757},
        {"lat":42.348458693992754,"lng":-71.10413253307343},
        {"lat":42.348767934799874,"lng":-71.10574185848236},
        {"lat":42.34906924489222,"lng":-71.10720098018646},
        {"lat":42.349481561625495,"lng":-71.1085957288742},
        {"lat":42.35007624445802,"lng":-71.10997974872589},
        {"lat":42.35087707511597,"lng":-71.11142814159393}, // EX2 start
        {"lat":42.35146381585433,"lng":-71.11261904239655},
        {"lat":42.351907832231745,"lng":-71.11368119716644},
        {"lat":42.35236770303022,"lng":-71.11461460590363},
        {"lat":42.35296235855687,"lng":-71.115762591362},
        {"lat":42.353588722960616,"lng":-71.11693203449249},
        {"lat":42.354326080651326,"lng":-71.11786544322966},
        {"lat":42.355293353966324,"lng":-71.11847698688507}, // EX1 start
        {"lat":42.3558562684687,"lng":-71.11879885196686},
        {"lat":42.35644296272466,"lng":-71.11932456493378},
        {"lat":42.35690280033964,"lng":-71.11988246440887},
        {"lat":42.35724371226148,"lng":-71.1204832792282},
        {"lat":42.35742605973958,"lng":-71.12112700939178},
        {"lat":42.3575370535976,"lng":-71.1218672990799}
      ];


    var mapPaths = {
      track: {
        color: 'red',
        weight: 2,
        latlngs: [],
        message: "<h3>Route from London to Rome</h3><p>Distance: 1862km</p>"
      }
    };

    _.each(entrances, function(entrance){
      mapPaths[entrance.code] = {
        color: 'blue',
        weight: 4,
        latlngs: entrance.coordinates,
        message: "<h3>" + entrance.code + "</h3>"
      };
    });

    _.each(exits, function(exit){
      mapPaths[exit.code] = {
        color: 'purple',
        weight: 4,
        latlngs: exit.coordinates,
        message: "<h3>" + exit.code + "</h3>"
      };
      vm.markers = vm.markers.concat(_.map(exit.coordinates, function(t){ return _.extend({message: JSON.stringify(t)}, t); }));
    });

    mapPaths.toll = {
      color: 'green',
      weight: 4,
      latlngs: toll,
      message: "<h3>Toll</h3>"
    };
    vm.markers = vm.markers.concat(_.map(toll, function(t){ return _.extend({
      message: JSON.stringify(t),
      icon: {
        type: 'awesomeMarker',
        icon: 'dot',
        markerColor: 'green'
      }}, t); }));

    console.log(mapPaths);

    vm.map = {
      controls: {
        position: 'topright',
        draw: {
          polyline: {},
          polygon: false,
          rectangle: false,
          circle: false,
          marker: false
        },
        edit: {
          featureGroup: drawnLine,
          remove: false
        }
      },
      center: {
        lat: 42.347638,
        lng: -71.058187,
        zoom: 14
      },
      layers: {
        baselayers: {
          googleRoadmap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
          }
        }
      },
      paths: mapPaths
    };




    leafletData.getMap().then(function (map) {

      map.addLayer(drawnLine);
      map.addLayer(drawnMarkers);

      map.on('draw:created', function (e) {
        var layer = e.layer;
        drawnLine.addLayer(layer);

        var markers = layer.toGeoJSON().geometry.coordinates.map(function(coord) {
          return {
            lat: +coord[1],
            lng: +coord[0]
          }
        });
        vm.markers = markers;

        console.log(JSON.stringify(markers));
      });

    });



    vm.trackSelected = function(){
      $http.post(
        TRACK_SERVER_BASE_URL + '/gettrack',
        'track=' + vm.currentTrack.id, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .success(function (response) {
          vm.map.paths.track.latlngs = [];
          _.each(response.coords, function (coord, key) {
            var marker = {
              lat: +coord[0],
              lng: +coord[1]
            };
            vm.map.paths.track.latlngs.push(marker);
          });
        });
    };


    $http.get(TRACK_SERVER_BASE_URL + '/list')
      .success(function(response) {
        vm.tracks = _.map(response.tracks, function (name, id) {
          return {
            name: name,
            id: id
          };
        });
        vm.currentTrack = {
          id: 61
        };
        vm.trackSelected();
      });
  }]);
