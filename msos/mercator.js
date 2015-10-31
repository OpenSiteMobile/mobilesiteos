
/*global define, window */
/*
Global Map Tiles as defined in Tile Map Service (TMS) Profiles
==============================================================

Functions necessary for generation of global tiles used on the web.
It contains classes implementing coordinate conversions for:

  - GlobalMercator (based on EPSG:900913 = EPSG:3785)
       for Google Maps, Yahoo Maps, Microsoft Maps compatible tiles
  - GlobalGeodetic (based on EPSG:4326)
       for OpenLayers Base Map and Google Earth compatible tiles

More info at:

    http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
    http://wiki.osgeo.org/wiki/WMS_Tiling_Client_Recommendation
    http://msdn.microsoft.com/en-us/library/bb259689.aspx
    http://code.google.com/apis/maps/documentation/overlays.html#Google_Maps_Coordinates

Created by Klokan Petr Pridal on 2008-07-03.
Google Summer of Code 2008, project GDAL2Tiles for OSGEO.
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.mercator");

msos.mercator.version = new msos.set_version(15, 10, 29);

msos.mercator.utils = function () {

    "use strict";


    var tileSize = 256,
        initialResolution = 2 * Math.PI * 6378137 / tileSize,
        originShift = 2 * Math.PI * 6378137 / 2,


        mercator = {


            tileSize: tileSize,


            // Resolution (meters/pixel) for given zoom level (measured at Equator)
            resolution: function (zoom) {
                return initialResolution / Math.pow(2, zoom);
            },


            // Zoom level for given resolution (measured at Equator)
            zoom: function (resolution) {
                return Math.round(Math.log(initialResolution / resolution) / Math.log(2));
            },


            // Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
            latLonToMeters: function (lat, lon) {
                var mx = lon * originShift / 180,
                    my = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
                my = my * originShift / 180;
                return [mx, my];
            },


            // Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum
            metersToLatLon: function (mx, my) {
                var lon = (mx / originShift) * 180,
                    lat = (my / originShift) * 180;
                lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
                return [lat, lon];
            },


            // Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
            pixelsToMeters: function (px, py, zoom) {
                var res = mercator.resolution(zoom),
                    x = px * res - originShift,
                    y = py * res - originShift;
                return [x, y];
            },


            // Converts EPSG:900913 to pixel coordinates in given zoom level
            metersToPixels: function (mx, my, zoom) {
                var res = mercator.resolution(zoom),
                    x = (mx + originShift) / res,
                    y = (my + originShift) / res;
                return [x, y];
            },

            // Converts given lat/lon in WGS84 Datum to pixel coordinates in given zoom level
            latLonToPixels: function (lat, lon, zoom) {
                var meters = mercator.latLonToMeters(lat, lon);
                return mercator.metersToPixels(meters[0], meters[1], zoom);
            },

            // Converts pixel coordinates in given zoom level to lat/lon in WGS84 Datum
            pixelsToLatLon: function (px, py, zoom) {
                var meters = mercator.pixelsToMeters(px, py, zoom);
                return mercator.metersToLatLon(meters[0], meters[1]);
            },

            // Returns a tile covering region in given pixel coordinates
            pixelsToTile: function (px, py) {
                return [Math.floor(px / tileSize), Math.floor(py / tileSize)];
            },


            // Returns tile for given mercator coordinates
            metersToTile: function (mx, my, zoom) {
                var pixels = mercator.metersToPixels(mx, my, zoom);
                return mercator.pixelsToTile(pixels[0], pixels[1]);
            },


            // Returns bounds of the given tile in EPSG:900913 coordinates
            tileBounds: function (tx, ty, zoom) {
                var min = mercator.pixelsToMeters(tx * tileSize, ty * tileSize, zoom),
                    max = mercator.pixelsToMeters((tx + 1) * tileSize, (ty + 1) * tileSize, zoom);
                return min.concat(max);
            },


            // Returns bounds of the given tile in latutude/longitude using WGS84 datum
            tileLatLonBounds: function (tx, ty, zoom) {
                var bounds = mercator.tileBounds(tx, ty, zoom),
                    min = mercator.metersToLatLon(bounds[0], bounds[1]),
                    max = mercator.metersToLatLon(bounds[2], bounds[3]);
                return min.concat(max);
            },


            tilePixelBounds: function (tx, ty, zoom) {
                var bounds = mercator.tileBounds(tx, ty, zoom),
                    min = mercator.metersToPixels(bounds[0], bounds[1], zoom),
                    max = mercator.metersToPixels(bounds[2], bounds[3], zoom);
                return min.concat(max);
            }
        };

       
    return mercator;

};