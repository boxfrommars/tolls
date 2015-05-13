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
    vm.track = null;

    vm.entranceAreaRadius = 0.0002;

    vm.angleCoeff = 10;
    vm.anglePower = 4;

    vm.distanceCoeff = 0.17;
    vm.distancePower = 1; //1.4;
    vm.distanceMax = 10;


    var entrances = [{
      code: 'EN1',
      coordinates: [
        {"lat":42.34789571323296,"lng":-71.06101334095001, id: 0},
        {"lat":42.34717413897111,"lng":-71.06161415576935, id: 1},
        {"lat":42.34694418499349,"lng":-71.06207549571991, id: 2},
        {"lat":42.346904537670945,"lng":-71.06280505657196, id: 3},
        {"lat":42.346920396602954,"lng":-71.06350243091583, id: 4, entranceTo: 12} // jxень плохое представление графа, но так мне проще было менять
      ]
    }, {
      code: 'EN2',
      coordinates: [
        {"lat":42.34665872371306,"lng":-71.06118500232697, id: 100},
        {"lat":42.34669837119064,"lng":-71.06195747852325, id: 101},
        {"lat":42.34681731347333,"lng":-71.06281578540802, id: 102},
        {"lat":42.346920396602954,"lng":-71.06350243091583, id: 103, entranceTo: 12}
      ]
    }];

    var exits = [{
      code: 'EX1',
      coordinates: [
        {"lat":42.355293353966324,"lng":-71.11847698688507, id: 5},
        {"lat":42.35553120577965,"lng":-71.11850917339324, id: 6},
        {"lat":42.35618132947636,"lng":-71.1187881231308, id: 7},
        {"lat":42.35668081018698,"lng":-71.119185090065, id: 8}
      ]
    }, {
      code: 'EX2',
      coordinates: [
        {"lat":42.35087707511597,"lng":-71.11142814159393, id: 9},
        {"lat":42.3511902684889,"lng":-71.11167222261429, id: 10},
        {"lat":42.35155896248497,"lng":-71.1119082570076, id: 11}
      ]
    }];

    var toll =
      [
        {"lat":42.346920396602954,"lng":-71.06350243091583, id: 12}, // EN1 end
        {"lat":42.34703140901506,"lng":-71.06387257575989, id: 13},
        {"lat":42.34733272743112,"lng":-71.0651171207428, id: 14},
        {"lat":42.34757060937097,"lng":-71.06642067432404, id: 15},
        {"lat":42.34776884363319,"lng":-71.06793344020844, id: 16},
        {"lat":42.34788778389048,"lng":-71.06937110424042, id: 17},
        {"lat":42.34788778389048,"lng":-71.07088387012482, id: 18},
        {"lat":42.34789571323296,"lng":-71.07216060161589, id: 19},
        {"lat":42.34789571323296,"lng":-71.07349097728729, id: 20},
        {"lat":42.34781641976309,"lng":-71.08956277370453, id: 21},
        {"lat":42.34784813716305,"lng":-71.0910540819168, id: 22},
        {"lat":42.347832278465084,"lng":-71.09260976314545, id: 23},
        {"lat":42.347832278465084,"lng":-71.09417617321013, id: 24},
        {"lat":42.34780056105714,"lng":-71.09588205814362, id: 25},
        {"lat":42.34782434911458,"lng":-71.09746992588043, id: 26},
        {"lat":42.347792631702646,"lng":-71.09924018383026, id: 27},
        {"lat":42.34787192520248,"lng":-71.10080659389496, id: 28},
        {"lat":42.348086017152475,"lng":-71.10199749469757, id: 29},
        {"lat":42.348458693992754,"lng":-71.10413253307343, id: 30},
        {"lat":42.348767934799874,"lng":-71.10574185848236, id: 31},
        {"lat":42.34906924489222,"lng":-71.10720098018646, id: 32},
        {"lat":42.349481561625495,"lng":-71.1085957288742, id: 33},
        {"lat":42.35007624445802,"lng":-71.10997974872589, id: 34},
        {"lat":42.35087707511597,"lng":-71.11142814159393, id: 35, exitTo: {code: 'EX2', id: 9}}, // EX2 start
        {"lat":42.35146381585433,"lng":-71.11261904239655, id: 36},
        {"lat":42.351907832231745,"lng":-71.11368119716644, id: 37},
        {"lat":42.35236770303022,"lng":-71.11461460590363, id: 38},
        {"lat":42.35296235855687,"lng":-71.115762591362, id: 39},
        {"lat":42.353588722960616,"lng":-71.11693203449249, id: 40},
        {"lat":42.354326080651326,"lng":-71.11786544322966, id: 41},
        {"lat":42.355293353966324,"lng":-71.11847698688507, id: 42, exitTo: {code: 'EX1', id: 5}}, // EX1 start
        {"lat":42.3558562684687,"lng":-71.11879885196686, id: 43},
        {"lat":42.35644296272466,"lng":-71.11932456493378, id: 44},
        {"lat":42.35690280033964,"lng":-71.11988246440887, id: 45},
        {"lat":42.35724371226148,"lng":-71.1204832792282, id: 46},
        {"lat":42.35742605973958,"lng":-71.12112700939178, id: 47},
        {"lat":42.3575370535976,"lng":-71.1218672990799, id: 48}
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


      vm.markers = vm.markers.concat(_.map(entrance.coordinates, function(t){ return _.extend({
        message: JSON.stringify(t),
        icon: {
          type: 'awesomeMarker',
          icon: 'dot',
          markerColor: 'blue'
        }}, t); }));

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

        console.log('WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', pointToPointDistance(markers[0], markers[1]));

        vm.markers = markers;

        console.log(JSON.stringify(markers));
      });

    });

    var isSamePoint = function (point1, point2) {
      if (!point1 || !point2) {
        return false;
      }
      return (point2.lat == point1.lat) && (point2.lng == point1.lng);
    };

    // @TODO (для всех функций) учесть неизотропность координат
    var dotProduct = function(v1, v2){
      return v1.lat * v2.lat + v1.lng * v2.lng;
    };

    var cosEdges = function(edge1, edge2) {
      return dotProduct(pointDiffReal(edge1[0], edge1[1]), pointDiffReal(edge2[0], edge2[1])) / (Math.sqrt(Math.abs(dotProduct(pointDiffReal(edge1[0], edge1[1]), pointDiffReal(edge1[0], edge1[1])) * dotProduct(pointDiffReal(edge2[0], edge2[1]), pointDiffReal(edge2[0], edge2[1])))));
    };

    var pointDiff = function(point1, point2){
      return {
        lat: point2.lat - point1.lat,
        lng: point2.lng - point1.lng
      }
    };

    var pointDiffReal = function(point1, point2){
      return {
        lat: 100000 * (point2.lat - point1.lat),
        lng: 100000 * (point2.lng - point1.lng)
      }
    };

    var pointToPointDistance = function (point1, point2) {
      var v = pointDiff(point1, point2);
      return Math.sqrt(v.lat * v.lat + v.lng * v.lng);
    };

    var pointToEdgeDistance = function (point, edge){ // @TODO сделать проверку на одинаковость начала и конца ребра (влечёт деление на ноль)

      var edgeVector = pointDiff(edge[0], edge[1]);
      var dp = dotProduct(pointDiff(edge[0], point), edgeVector);

      if (dp <= 0) {
        return pointToPointDistance(point, edge[0]);
      }

      var edgeDotProduct = dotProduct(edgeVector, edgeVector); // нужно хранить в толле, так как не зависит от текущего пути автомобиля

      if (dp >= edgeDotProduct) {
        return pointToPointDistance(point, edge[1]);
      }

      var edgeLength = Math.sqrt(Math.abs(edgeDotProduct)); // может быть вычислено один раз для толла

      return ( // заметим, что первые множители в каждой строке зависят только от ребра толла, поэтому могут быть вычислены заранее и один раз
        (edge[0].lng - edge[1].lng) * point.lat +
        (edge[1].lat - edge[0].lat) * point.lng +
        edge[0].lat * edge[1].lng - edge[0].lng * edge[1].lat
      ) / edgeLength;
    };


    // jчень плохо, но на выходе мы получаем граф в виде adjacency list и ладно
    var getTollGraph = function (entrance, edge) {

      var addTollPart = function (entrancePointId) {

        var addExitParts = function (exitPoint) {
          var startGraph = false;
          var exit = _.findWhere(exits, {code: exitPoint.code});
          var firstVertex = _.findWhere(exit.coordinates, {id: exitPoint.id});
          var previousVertex = null;

          _.each(exit.coordinates, function(exitPoint){
            if (exitPoint.id == firstVertex.id) {
              startGraph = true;
            }

            if (startGraph) {
              adjacencyList[exitPoint.id] = {
                point: exitPoint,
                adjacencyList: [],
                isExit: true
              };

              if (previousVertex) {
                adjacencyList[previousVertex.id].adjacencyList.push(exitPoint.id);
              }
              previousVertex = exitPoint;
            }

          });
        };

        var startGraph = false;

        var firstVertex = _.findWhere(toll, {id: entrancePointId});
        var previousVertex = null;

        _.each(toll, function(tollPoint){
          if (tollPoint.id == firstVertex.id) {
            startGraph = true;
          } else {

          }

          if (startGraph) {
            adjacencyList[tollPoint.id] = {
              point: tollPoint,
              adjacencyList: []
            };

            if (previousVertex) {
              adjacencyList[previousVertex.id].adjacencyList.push(tollPoint.id);
            }
            previousVertex = tollPoint;

            if (tollPoint.exitTo) {
              addExitParts(tollPoint.exitTo);
              adjacencyList[tollPoint.id].adjacencyList.push(tollPoint.exitTo.id);
            }
          }

        });

      };

      var adjacencyList = {};
      var startGraph = false;

      var firstVertex = edge[0];
      var previousVertex = null;

      _.each(entrance.coordinates, function(entrancePoint){
        if (entrancePoint.id == firstVertex.id) {
          startGraph = true;
        }

        if (startGraph) {
          adjacencyList[entrancePoint.id] = {
            point: entrancePoint,
            adjacencyList: []
          };

          if (previousVertex) {
            adjacencyList[previousVertex.id].adjacencyList.push(entrancePoint.id);
          }
          previousVertex = entrancePoint;

          if (entrancePoint.entranceTo) {
            adjacencyList[entrancePoint.id].adjacencyList.push(entrancePoint.entranceTo);
            addTollPart(entrancePoint.entranceTo);
          }
        }


      });


      return adjacencyList;
    };

    var getNextEdges = function (graph, fistVertex) {
      var result = [];
      _.each(fistVertex.adjacencyList, function (id) {
        result.push([fistVertex, graph[id]]);
        result = result.concat(getNextEdges(graph, graph[id]));
      });
      return result;
    };

    var checkEdgeOnToll = function (tollEdge, trackEdge) {


      var tollPointEdge = [tollEdge[0].point, tollEdge[1].point];


      // x - 82822
      // y - 111260
      var distance =  Math.abs(pointToEdgeDistance(trackEdge[1], tollPointEdge) * 100000);
      var cos = cosEdges(tollPointEdge, trackEdge);

      //console.log(distance);


      var distanceResult = vm.distanceMax - vm.distanceCoeff * Math.pow(distance, vm.distancePower);
      var cosResult = vm.angleCoeff * Math.pow(cos, vm.anglePower);
      //var angleResult =

      //console.log(distance);

      //vm.angleCoeff = 10;
      //vm.anglePower = 4;
      //
      //vm.distanceCoeff = 0.17;
      //vm.distancePower = 1.4;
      //vm.distanceMax = 10;



      //var Sa =  vm.angleCoeff * ();


      return {
        distance: distance,
        distanseMeasure: distanceResult,
        cos: cosResult,
        total: cosResult + distanceResult
      };
    };

    var checkTrackEdge = function (trackEdge, currentTollEdge, tollGraph) {

      var firstCheckedVertexId = currentTollEdge[0].id;
      var firstCheckedVertex = tollGraph[firstCheckedVertexId];

      var trackResult = null;
      var trackResultTollEdge = null;

      //console.log(firstCheckedVertex, trackEdge, currentTollEdge);

      var nextEdges = getNextEdges(tollGraph, firstCheckedVertex);

      _.each(nextEdges, function (tollEdge) {

        if (!isSamePoint(tollEdge[0].point, tollEdge[1].point)) {
          var result = checkEdgeOnToll(tollEdge, trackEdge);
          if (_.isNull(trackResult) || result.total > trackResult.total) {
            trackResult = result;
            trackResultTollEdge = tollEdge;
          }
        }
      });

      if (trackResult.total > 10 && !_.isNull(trackResult)) {
        console.log(trackEdge, trackResult);

        vm.markers.push(_.extend({
          message: JSON.stringify({edge: trackEdge, result: trackResult}),
          icon: {
            type: 'awesomeMarker',
            icon: 'dot',
            markerColor: (trackResultTollEdge[1].isExit) ? 'red' : 'black'
          }}, trackEdge[1]));

        return {
          success: true,
          trackResult: trackResult,
          tollEdge: trackResultTollEdge,
          trackEdge: trackEdge
        }
      } else {

        vm.markers.push(_.extend({
          message: JSON.stringify({edge: trackEdge, result: trackResult}),
          icon: {
            type: 'awesomeMarker',
            icon: 'dot',
            markerColor: 'green'
          }}, trackEdge[1]));


        console.log('WAAAAAAAAAAAAAA', trackEdge, trackResult);

        return {
          success: false,
          trackResult: trackResult,
          tollEdge: trackResultTollEdge,
          trackEdge: trackEdge
        }
      }


    };

    var startTollRide = function (startEntrance, startEdge, startPoint, track) {
      //console.log(track);
      var fails = 0;
      var success = false;
      var currentTollEdge = startEdge;

      var tollGraph = getTollGraph(startEntrance, startEdge);

      console.log(tollGraph);

      var trackEdgesCount = track.length - 1;

      for (var i = 0; i < trackEdgesCount; i++) {
        var trackEdge = track.slice(i, i + 2);
        if (!isSamePoint(trackEdge[0], trackEdge[1])) {
          var trackEdgeResult = checkTrackEdge(trackEdge, currentTollEdge, tollGraph);
          if (trackEdgeResult.success) {
            fails = 0;
            if (currentTollEdge[1].isExit) {
              
            }
          } else {
            fails++;
            if (fails > 2) {
              return {
                success: false
              }
            }
          }
        }
      }

      return {
        success: success
      }
    };

    vm.calculateTolls = function () {

      vm.markers = [];

      var results = [];
      var result;

      _.every(vm.track, function (trackPoint, i) {
        var pointDistance = null;
        var nearestEdge = null;
        var nearestEntrance = null;

        _.each(entrances, function(entrance) {

          var previousEntrancePoint = null;

          _.each(entrance.coordinates, function (entrancePoint) {
            if (previousEntrancePoint && !isSamePoint(entrancePoint, previousEntrancePoint)) {
              var distance = pointToEdgeDistance(trackPoint, [previousEntrancePoint, entrancePoint]);
              //console.log(distance, [previousEntrancePoint, entrancePoint]);
              if (distance < pointDistance || _.isNull(pointDistance)) {
                pointDistance = distance;
                nearestEdge = [previousEntrancePoint, entrancePoint];
                nearestEntrance = entrance;
              }
            }

            previousEntrancePoint = entrancePoint;
          });
        });



        if (Math.abs(pointDistance) <= vm.entranceAreaRadius) {

          console.log(pointDistance, trackPoint, nearestEntrance.code, nearestEdge);
          vm.markers.push(_.extend({
            message: JSON.stringify(trackPoint),
            icon: {
              type: 'awesomeMarker',
              icon: 'dot',
              markerColor: 'red'
            }}, trackPoint));

          result = startTollRide(nearestEntrance, nearestEdge, trackPoint, vm.track.slice(i));

          console.log(result);

          if (result.success) {
            results.push();
            return true;
          } else {
            return true;
          }

        } else {
          return true;
        }


      });
    };

    var trackChanged = function () {
      vm.calculateTolls();
    };

    vm.trackSelected = function(){
      $http.post(
        TRACK_SERVER_BASE_URL + '/gettrack',
        'track=' + vm.currentTrack.id, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .success(function (response) {

          vm.map.paths.track.latlngs = [];

          vm.track = [];

          _.each(response.coords, function (coord, key) {
            var marker = {
              lat: +coord[0],
              lng: +coord[1]
            };
            vm.map.paths.track.latlngs.push(marker);
            vm.track.push(marker);

          });
          trackChanged();
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
        vm.currentTrack = _.findWhere(vm.tracks, {
          id: '61'
        });
        vm.trackSelected();
      });
  }]);
