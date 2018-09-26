"use strict";

(() => {
    window.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: new google.maps.LatLng(0, 0)
    });
    map.fitBounds(overlayBounds);
    map.addListener('click', () => {
        highlightedElement = {};
        updateElementsList(elements);
    });

    // Init Drawing Tools
    let drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'polygon', 'polyline']
        },
    });
    drawingManager.setMap(map);

    drawingManager.addListener('overlaycomplete', data => {
        const selectElement = () => {
            highlightedElement = data;
            updateElementsList(elements);
        };

        data.overlay.set('draggable', true);
        data.overlay.set('editable', true);
        data.overlay.set('clickable', true);

        data.overlay.addListener('dragstart', selectElement);
        data.overlay.addListener('click', selectElement);
        if (data.type == 'rectangle')
            data.overlay.addListener('bounds_changed', selectElement);
        if (data.type == 'circle') {
            data.overlay.addListener('radius_changed', selectElement);
            data.overlay.addListener('center_changed', selectElement);
        }
        if (data.type == 'polygon' || data.type == 'polyline') {
            data.overlay.addListener('insert_at', selectElement);
            data.overlay.addListener('remove_at', selectElement);
            data.overlay.addListener('set_at', selectElement);
        }
        elements.push(data);
        updateElementsList(elements);
    });

    // Init Overlay Tool
    window.overlay = new OverlayTool(overlayBounds, overlayImage, overlayRotation, overlayOpacity, map);

    window.overlayPointA = new google.maps.Marker({
        position: overlayBounds.getSouthWest(),
        map: map,
        draggable: true
    });

    window.overlayPointB = new google.maps.Marker({
        position: overlayBounds.getNorthEast(),
        map: map,
        draggable: true
    });

    const ondrag = () => {
        let newPointA = overlayPointA.getPosition();
        let newPointB = overlayPointB.getPosition();
        let newBounds = new google.maps.LatLngBounds(newPointA, newPointB);
        updateBBoxValues(newBounds);
        overlay.updateBounds(newBounds);
    };

    overlayPointA.addListener('drag', ondrag);
    overlayPointB.addListener('drag', ondrag);
})();
