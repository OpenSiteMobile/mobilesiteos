/*
 * @name GmapsMarkerManager
 * @version 0.2
 * @author Alexander Kaupanin <kaupanin@gmail.com>
 *
 *          _____________300_______________
 *         |       _______200_______      |
 *         |      |                 |     |
 *        150    100    viewport    |     |
 *         |      |_________________|     |
 *         |______________________________|
 */

/*global
    msos: false,
    jQuery: false,
    google: false
*/

msos.provide("msos.marker.simple");

msos.marker.simple.version = new msos.set_version(13, 6, 14);


msos.marker.simple.manager = function (map, options) {
    "use strict";

    var obj = new google.maps.OverlayView();

    obj.options = options || {};
    obj.marker_size = new google.maps.Size(16, 32);
    obj.setMap(map);
    obj.map = map;

    obj.markers = [];
    obj.markers_infowindows = [];

    obj.view_port = {};
    obj.view_port.cell = {};
    obj.view_port.cells = [];
    obj.view_port.markers = [];
    obj.view_port.cell.width =  obj.options.cell ? (obj.options.cell.width  || false) : obj.marker_size.width  * 3.0;
    obj.view_port.cell.height = obj.options.cell ? (obj.options.cell.height || false) : obj.marker_size.height * 3.0;
    obj.view_port.height = obj.map.getDiv().offsetHeight;
    obj.view_port.width =  obj.map.getDiv().offsetWidth;
    obj.view_port.cols_count = Math.ceil(obj.view_port.width  / obj.view_port.cell.width);
    obj.view_port.rows_count = Math.ceil(obj.view_port.height / obj.view_port.cell.height);
    obj.initial = true;
    obj.on_zoom = false;

    obj.threshold_zoom = obj.options.threshold || 12;

    obj.group_icon_src =       obj.options.icon ? (obj.options.icon.src    || false) : false;
    obj.group_icon_shadow =    obj.options.icon ? (obj.options.icon.shadow || false) : false;

    obj.grid = {};
    obj.grid.cells = [];
    obj.grid.markers = [];

    obj.addMarker = function (marker, infowindow) {

        infowindow = infowindow || false;
        this.markers.push(marker);
        this.markers_infowindows.push(infowindow);
    };

    obj.removeMarkerByNumber = function (index) {

        this.markers[index].setMap(null);
        this.markers.splice(index, 1);
        this.initial = true;
        this.draw();
    };

    obj.clear = function (remove) {

        var i;

        for (i in this.markers) {
            if (typeof this.markers[i] === 'object') {
                this.markers[i].setMap(null); // ie fix
            }
        }
        if (remove) { this.markers = []; }
    };

    obj.draw = function () {

        var me = this;

        if (this.initial) {
            this.refresh();
        }

        google.maps.event.addListener(this.map, "zoom_changed", function () {
            me.initial = true;
        });
    };

    obj.refresh = function () {

        this.clear();
        this.clearGroupMarkers();
        this.buildMapGrid(this.initial);
        this.checkMarkers(this.markers, this.view_port.cells);
        this.groupMarkers();
        this.initial = false;
    };

    obj.clearGroupMarkers = function (remove) {

        var i = 0;

        for (i = 0; i < this.view_port.markers.length; i += 1) {
            if (this.view_port.markers[i].alias) {
                this.view_port.markers[i].alias.setMap(null);
            }
        }
        if (remove) {
          this.view_port.markers = [];
        }
        return true;
    };

    obj.buildMapGrid = function (force) {

        var i = 0;

        force = force || false;

        this.view_port.cells = this.buildGrid(this.calculateGridOptParams(this.markers));

        for (i = 0; i < this.view_port.cells.length; i += 1) {
            if (this.view_port.markers[i] === undefined || force) {
                this.view_port.markers[i] = {};
            }
        }
    };

    obj.calculateGridOptParams = function () {

        this.sanity = this.options.sanity || 1.5;

        var grid_params = {
            start: {
                x: -this.view_port.width  * this.sanity,
                y: -this.view_port.height * this.sanity
            },
            end: {
                x: this.view_port.width  + this.view_port.width  * this.sanity,
                y: this.view_port.height + this.view_port.height * this.sanity
            },
            cell: {
                width:  this.view_port.cell.width,
                height: this.view_port.cell.height
            }
        };
        return grid_params;
    };


    /*
     * @param {Object} params: {
     *    start:  { x: -300, y: -150  },
     *    end:    { x: 500,  y: 250   },
     *    cell:   { width: 48, height: 96 }
     * }
     */
    obj.buildGrid = function (params) {

        var cells = [],
            i = 0,
            j = 0;

        for (i = params.start.x; i < params.end.x; i += params.cell.width) {
            for (j = params.start.y; j < params.end.y; j += params.cell.height) {
                cells.push(new google.maps.LatLngBounds(
                    this.getProjection().fromDivPixelToLatLng(new google.maps.Point(i, j + params.cell.height)),
                    this.getProjection().fromDivPixelToLatLng(new google.maps.Point(i + params.cell.width, j)))
                );
            }
        }
        return cells;
    };

    obj.checkMarkers = function (markers, cells) {

        var i = 0,
            j = 0;

        for (i = 0; i < cells.length; i += 1) {
            this.view_port.markers[i].count = 0;
            this.view_port.markers[i].items = [];
            this.view_port.markers[i].bounds = cells[i];

            for (j = 0; j < markers.length; j += 1) {
                if (cells[i].contains(markers[j].getPosition())) {
                    this.view_port.markers[i].count += 1;
                    this.view_port.markers[i].items.push(markers[j]);
                }
            }
        }
        return true;
    };

    obj.groupMarkers = function () {

        this.threshold = this.map.getZoom() >= this.threshold_zoom ? true : false;

        var infowindow_baloon = new google.maps.InfoWindow(),
            i = 0,
            j = 0,
            me;

        for (i = 0; i < this.view_port.markers.length; i += 1) {
            if (this.view_port.markers[i].count && !this.view_port.markers[i].alias) {
                me = this;
                if (this.threshold) {
                    for (j = 0; j < this.view_port.markers[i].items.length; j += 1) {
                        this.view_port.markers[i].items[j].setMap(this.map);
                        google.maps.event.addListener(this.view_port.markers[i].items[j], "click", function () {
                            if (me.markers_infowindows[i]) {
                                infowindow_baloon.setContent(this.markers_infowindows[i]);
                                infowindow_baloon.open(me.map, this);
                            }
                        });
                    }
                } else {
                    for (j = 0; j < this.view_port.markers[i].items.length; j += 1) {
                      this.view_port.markers[i].items[j].setMap(null);
                    }

                    if (this.view_port.markers[i].count === 1) {
                        this.view_port.markers[i].alias = this.view_port.markers[i].items[0];
                        this.view_port.markers[i].alias.setMap(this.map);

                        google.maps.event.addListener(this.view_port.markers[i].alias, "click", function () {
                            if (me.markers_infowindows[i]) {
                                infowindow_baloon.setContent(this.markers_infowindows[i]);
                                infowindow_baloon.open(me.map, this);
                            }
                        });

                    } else {
                        this.view_port.markers[i].alias = new google.maps.Marker({
                            position:   this.view_port.markers[i].items[0].getPosition(),
                            title:      this.view_port.markers[i].count.toString()
                        });

                        if (this.group_icon_src) {
                            this.view_port.markers[i].alias.setIcon(new google.maps.MarkerImage(this.group_icon_src));
                        }
                        if (this.group_icon_shadow) {
                            this.view_port.markers[i].alias.setShadow(new google.maps.MarkerImage(this.group_icon_shadow));
                        }
                        this.view_port.markers[i].alias.setMap(this.map);
                      }
                }
            }
        }
    };

    return obj;
};
