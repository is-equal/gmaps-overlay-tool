"use strict";

/**
 * Element - Attributes
 */
let elements = [];

let selectedElement = {};

let highlightedElement = {};

let elemProperties = [
    'maptype',
    'floor',
    'zoomMin',
    'zoomMax',
    'title',
    'image',
    'content',
];

let elmStyles = [
    'textWidth',
    'textSize',
    'textColor',
    'textOffsetX',
    'textOffsetY',
    'strokeColor',
    'strokeWeight',
    'strokeOpacity',
    'fillColor',
    'fillOpacity'
];

let googleElmStyles = [
    'icon',
    'strokeColor',
    'strokeWeight',
    'strokeOpacity',
    'fillColor',
    'fillOpacity'
];

const featureTemplate = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: '',
        coordinates: []
    }
};

/**
 * Overlay - Image
 */
let overlayImage = '';
let overlayOpacity = 0.5; // 0 to 1 opacity

/**
 * Overlay - Bounding Box
 */
let overlayBounds = new google.maps.LatLngBounds({ "lat": 0, "lng": 0 }, { "lat": 0, "lng": 0 });

/**
 * Overlay - Rotation
 */
let overlayRotation = 0.0;

/**
 * Exports
 */
const saveJSON = json => {
    saveAs(new Blob([JSON.stringify(json, false, 4)], { type: "application/json" }), 'gmaps-overlay-tool.json');
};

const getProperties = ({ type, overlay: elm }, isCustom = false) => {
    if (isCustom) {
        if (type == 'overlay') return { ...elm.get('properties'), type: 'Overlay', image: overlayImage, angle: overlayRotation };
        else {
            if (type == 'marker') type = 'Point';
            if (type == 'polyline') type = 'LineString';
            if (type == 'polygon') type = 'Polygon';

            return { ...elm.get('properties'), type };
        }
    } else {
        return { ...elm.get('properties') };
    }
};

const getStyles = ({ type, overlay: elm }) => {
    return elm.get('styles');
};

const toFeature = (data, isCustom) => {
    return _.map(data, elm => {
        let type;
        let coordinates;

        if (elm.type == 'marker') {
            type = 'Point';
            const { lat, lng } = elm.overlay.getPosition().toJSON();
            coordinates = [lng, lat];
        } else if (elm.type == 'polygon') {
            type = 'Polygon';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => {
                const { lat, lng } = pos.toJSON();
                return [lng, lat];
            });
            coordinates.push(coordinates[0]);
            coordinates = [coordinates];
        } else if (elm.type == 'polyline') {
            type = 'LineString';
            let path = elm.overlay.getPath().getArray();
            coordinates = _.map(path, pos => {
                const { lat, lng } = pos.toJSON();
                return [lng, lat];
            });
        } else if (elm.type == 'overlay') {
            type = 'Polygon';
            const path = JSON.parse(document.getElementById('bbox').value);
            coordinates = [path];
        }

        if (type)
            if (isCustom)
                return {
                    ...featureTemplate,
                    properties: getProperties(elm, true) || {},
                    styles: getStyles(elm) || {},
                    geometry: {
                        ...featureTemplate.geometry,
                        type,
                        coordinates
                    }
                };
            else
                return {
                    ...featureTemplate,
                    properties: {
                        ...getProperties(elm),
                        ...getStyles(elm)
                    },
                    geometry: {
                        ...featureTemplate.geometry,
                        type,
                        coordinates
                    }
                };
    });
};

const ExportGeoJSON = () => {
    let data = [...elements];
    _.remove(data, o => _.isEqual(o.type, 'overlay'));
    saveJSON({ type: 'FeatureCollection', features: toFeature(data) });
};

const ExportCustom = () => saveJSON({ type: 'FeatureCollection', features: toFeature(elements, true) });
