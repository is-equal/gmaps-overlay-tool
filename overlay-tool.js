let map;
let drawingManager;
let overlay;
let overlayBounds;
let overlayPointA;
let overlayPointB;

let rlPressed = false;
let rrPressed = false;

// Commands
function Copy(id) {
    const copyText = document.getElementById(id);
    copyText.select(); // Select the text field
    document.execCommand('copy'); // Copy the text inside the text field 
}

document.getElementById('toggleOverlayTool').addEventListener('click', event => {
    const target = document.getElementById('overlay-tool');
    if (target.className == 'hidden') {
        target.className = 'visible';
        document.getElementById('toggleOverlayTool').innerText = '<';
    } else {
        target.className = 'hidden';
        document.getElementById('toggleOverlayTool').innerText = '>';
    }
});

// Image 
document.getElementById('imageForm').addEventListener('submit', event => {
    event.preventDefault();

    const imageURL = document.getElementById('imageURL').value;
    overlay.setImage(imageURL);
});

// Bounding Box
document.getElementById('boundsForm').addEventListener('submit', event => {
    event.preventDefault();

    try {
        let bounds;
        let value = document.getElementById('jbbox').value;

        if (value.trim() != '') {
            let bbox = JSON.parse(value);
            bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(bbox.south, bbox.west),
                new google.maps.LatLng(bbox.north, bbox.east)
            );
        } else {
            value = document.getElementById('nbbox').value;

            if (value.trim() != '') {
                value = value.trim().split(',');
                bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(value[0], value[1]),
                    new google.maps.LatLng(value[2], value[3])
                );
            } else {
                throw new Error('Undefined bounding box!');
            }
        }

        updateBBoxValues(bounds);
        overlay.updateBounds(bounds);
        overlayPointA.setPosition(bounds.getSouthWest());
        overlayPointB.setPosition(bounds.getNorthEast());
        map.fitBounds(bounds);
    } catch (err) {
        alert('Error on read bounding box value!');
        console.error(err);
    }
});

function updateBBoxValues(bbox) {
    document.getElementsByName('jbbox')[0].value = JSON.stringify(bbox.toJSON());
    document.getElementsByName('nbbox')[0].value = bbox.toUrlValue();
    document.getElementsByName('bbox')[0].value = `[${JSON.stringify(bbox.getSouthWest().toJSON())}, ${JSON.stringify(bbox.getNorthEast().toJSON())}]`;
}

// Rotation
document.getElementById('rotationForm').addEventListener('submit', event => {
    event.preventDefault();

    const angle = parseFloat(document.getElementById('rotation').value);
    overlay.setAngle(angle);
});

document.getElementById('rl').addEventListener('mouseup', event => clearInterval(rlPressed));
document.getElementById('rl').addEventListener('mousedown', event => {
    const click = () => {
        let rate = document.getElementById('rate');
        let angle = overlay.getAngle() - parseFloat(rate.value);

        overlay.setAngle(angle);
        document.getElementById('rotation').value = angle;
    };

    click();
    if (!rlPressed) rlPressed = setInterval(click, 500);
});

document.getElementById('rr').addEventListener('mouseup', event => clearInterval(rrPressed))
document.getElementById('rr').addEventListener('mousedown', event => {
    const click = () => {
        let rate = document.getElementById('rate');
        let angle = overlay.getAngle() + parseFloat(rate.value);

        overlay.setAngle(angle);
        document.getElementById('rotation').value = angle;
    };

    click();
    if (!rrPressed) rrPressed = setInterval(click, 500);
});

// Map

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: new google.maps.LatLng(0, 0)
    });

    class OverlayTool extends window.google.maps.OverlayView {

        constructor(bounds, image, map) {
            super();
            this._bounds = bounds;
            this._image = image;
            this._map = map;
            this._target = null;
            this._angle = 0;
            this._opacity = 0.5;
            this.setMap(map);
        }

        onAdd() {
            this._target = document.createElement('div');
            this._target.className = 'overlay';
            this._target.style.borderStyle = 'none';
            this._target.style.borderWidth = '0px';
            this._target.style.transform = 'rotate(' + this._angle + 'deg)';
            this._target.style.position = 'absolute';
            this._target.style.opacity = this._opacity;
            this._target.style.transition = 'transform 0.3s ease-out';

            let img = document.createElement('img');
            img.src = this._image;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.position = 'absolute';
            this._target.appendChild(img);

            let panes = this.getPanes();
            panes.overlayLayer.appendChild(this._target);
        }

        draw() {
            const overlayProjection = this.getProjection();
            const sw = overlayProjection.fromLatLngToDivPixel(this._bounds.getSouthWest());
            const ne = overlayProjection.fromLatLngToDivPixel(this._bounds.getNorthEast());

            this._target.style.left = sw.x + 'px';
            this._target.style.top = ne.y + 'px';
            this._target.style.width = (ne.x - sw.x) + 'px';
            this._target.style.height = (sw.y - ne.y) + 'px';
            this._target.style.opacity = this._opacity;
            this._target.style.transform = 'rotate(' + this._angle + 'deg)';
        }


        updateBounds(bounds) {
            this._bounds = bounds;
            this.draw();
        }

        onRemove() {
            if (this._target) {
                if (this._target.parentNode) this._target.parentNode.removeChild(this._target);
                this._target = null;
            }
        }

        setImage(url) {
            this._image = url;
            this._target.children[0].src = url;
        }

        getAngle() {
            return this._angle;
        }

        setAngle(angle) {
            this._angle = angle;
            this.draw();
        }

        setOpacity(opacity) {
            this._opacity = opacity;
            this.draw();
        }

    }

    // Drawing Tools
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
        },
    });

    drawingManager.setMap(map);

    drawingManager.addListener('markercomplete', marker => console.log(`[Marker] Position: ${JSON.stringify(marker.getPosition().toJSON())}`));
    drawingManager.addListener('circlecomplete', circle => console.log(`[Circle] Center: ${JSON.stringify(circle.getCenter().toJSON())} Radius: ${circle.getRadius()}`));
    drawingManager.addListener('polygoncomplete', polygon => console.log(`[Polygon] Paths: ${JSON.stringify(polygon.getPath())}`));
    drawingManager.addListener('polylinecomplete', polyline => console.log(`[Polyline] ${JSON.stringify(polyline.getPath())}`));
    drawingManager.addListener('rectanglecomplete', rectangle => console.log(`[Rectangle] ${JSON.stringify([rectangle.getBounds().getNorthEast().toJSON(), rectangle.getBounds().getSouthWest().toJSON()])}`));


    // Overlay Tool
    overlayBounds = new google.maps.LatLngBounds(new google.maps.LatLng(0, 0), new google.maps.LatLng(0, 0));

    let srcImage = '';
    overlay = new OverlayTool(overlayBounds, srcImage, map);

    overlayPointA = new google.maps.Marker({
        position: overlayBounds.getSouthWest(),
        map: map,
        draggable: true
    });

    overlayPointB = new google.maps.Marker({
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
}

initMap();