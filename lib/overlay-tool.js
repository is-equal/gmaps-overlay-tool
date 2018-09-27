"use strict";

class OverlayTool extends window.google.maps.OverlayView {

    constructor(bounds, image = '', angle = 0, opacity = 0.5, map) {
        super();
        this._bounds = bounds;
        this._image = image;
        this._map = map;
        this._target = null;
        this._angle = angle;
        this._opacity = opacity;
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

    onRemove() {
        if (this._target) {
            if (this._target.parentNode) this._target.parentNode.removeChild(this._target);
            this._target = null;
        }
    }

    getBounds() {
        return this._bounds;
    }

    updateBounds(bounds) {
        this._bounds = bounds;
        this.draw();
    }

    setImage(url) {
        this._image = url;
        if (this._target && this._target.children[0]) this._target.children[0].src = this._image;
    }

    setOpacity(opacity) {
        this._opacity = opacity;
        if (this._target) this._target.style.opacity = this._opacity;
    }

    getAngle() {
        return this._angle;
    }

    setAngle(angle) {
        this._angle = angle;
        if (this._target) this._target.style.transform = 'rotate(' + this._angle + 'deg)';
    }

}