"use strict";

/**
 * UI - General
 */
const Copy = id => {
    const copyText = document.getElementById(id);
    copyText.select(); // Select the text field
    document.execCommand('copy'); // Copy the text inside the text field 
};

let tools = [
    document.getElementById('toggleOverlayTool'),
    document.getElementById('toggleElementsTool')
];

tools.forEach(button => {
    button.addEventListener('click', event => {
        const target = document.getElementById(button.attributes['target'].value);
        if (target.className == 'hidden') {
            target.className = 'visible';
            button.innerText = 'Hide';
        } else {
            target.className = 'hidden';
            button.innerText = 'Show';
        }
    });
});

/**
 * Elements
 */
const selectElement = elm => {
    selectedElement = elm;
    OpenModal();
};

const addElement = data => {
    const { type, overlay: elm } = data;
    let item = document.createElement('div');
    item.innerText = type;

    if (highlightedElement == data) item.className = 'hightlighted';
    else item.className = '';

    let editButton = document.createElement('button');
    editButton.className = 'action';
    editButton.innerHTML = '<i class="edit"></i>';
    editButton.onclick = event => selectElement(data);
    item.appendChild(editButton);

    if (!_.isEqual(type, 'overlay')) {
        let delButton = document.createElement('button');
        delButton.className = 'action';
        delButton.innerHTML = '<i class="delete"></i>';
        delButton.onclick = event => {
            _.remove(elements, o => data == o);
            updateElementsList(elements);
            elm.setMap(null);
        };
        item.appendChild(delButton);
    }

    document.getElementById('elements-tool').appendChild(item);
};

const updateElementsList = elements => {
    let node = document.getElementById('elements-tool');

    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
    _.each(elements, elm => addElement(elm));
};

elements.push({ type: 'overlay', overlay });
updateElementsList(elements);


/**
 * Overlay - Image
 */
let overlayImageValue = document.getElementById('imageURL');
overlayImageValue.value = overlayImage; // Input load default value

let overlayOpacityValue = document.getElementById('imageOpacity');
overlayOpacityValue.value = overlayOpacity; // Input load default value

let overlayOpacityValueViewer = document.getElementById('imageOpacityValue');
overlayOpacityValueViewer.innerText = overlayOpacity; // Viewer load default value

overlayOpacityValue.addEventListener('change', event => {
    overlayOpacityValueViewer.innerText = event.target.value

    overlayOpacity = overlayOpacityValue.value;
    overlay.setOpacity(overlayOpacity);
});

overlayImageValue.addEventListener('change', event => {
    overlayImage = overlayImageValue.value;
    overlay.setImage(overlayImage);
});

const RemoveOverlay = () => {
    document.getElementById('imageURL').value = "";
    overlay.setImage('');
}

/**
 * Overlay - Bounding Box
 */
let overlayBoundsJValue = document.getElementById('jbbox');
let overlayBoundsNValue = document.getElementById('nbbox');
const updateBBoxValues = bbox => {
    overlayBoundsJValue.value = JSON.stringify(bbox.toJSON());
    overlayBoundsNValue.value = bbox.toUrlValue();
    document.getElementById('bbox').value = `[${JSON.stringify(bbox.getSouthWest().toJSON())}, ${JSON.stringify(bbox.getNorthEast().toJSON())}]`;
};

updateBBoxValues(overlayBounds); // Load Default Values of BBox

overlayBoundsJValue.addEventListener('change', event => {
    const { value } = event.target;

    if (!_.isEmpty(_.trim(value))) {
        try {
            let bbox = JSON.parse(value);
            let bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(bbox.south, bbox.west),
                new google.maps.LatLng(bbox.north, bbox.east)
            );

            updateBBoxValues(bounds);
            overlay.updateBounds(bounds);
            overlayPointA.setPosition(bounds.getSouthWest());
            overlayPointB.setPosition(bounds.getNorthEast());
            map.fitBounds(bounds);
        } catch (err) {
            alert('Invalid json bounding box value!');
        }
    }
});

overlayBoundsNValue.addEventListener('change', event => {
    const { value } = event.target;

    if (!_.isEmpty(_.trim(value))) {
        try {
            let pos = _.trim(value).split(',');
            let bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(pos[0], pos[1]),
                new google.maps.LatLng(pos[2], pos[3])
            );

            updateBBoxValues(bounds);
            overlay.updateBounds(bounds);
            overlayPointA.setPosition(bounds.getSouthWest());
            overlayPointB.setPosition(bounds.getNorthEast());
            map.fitBounds(bounds);
        } catch (err) {
            alert('Invalid number bounding box value!');
        }
    }
});

/**
 * Overlay - Rotation
 */
let overlayRotationValue = document.getElementById('rotation');
let overlayRateRotationValue = document.getElementById('rate');
const updateRotationValue = value => {
    overlayRotation = parseFloat(value) || 0;
    overlayRotationValue.value = overlayRotation;
    overlay.setAngle(overlayRotation);
};

const AddRotation = clockwise => {
    let rate = parseFloat(overlayRateRotationValue.value) || 0;
    let angle;

    if (clockwise) angle = overlay.getAngle() + rate;
    else angle = overlay.getAngle() - rate;
    updateRotationValue(angle);
};

const AddRateRotation = clockwise => {
    let rate = parseFloat(overlayRateRotationValue.value) || 0;
    let step = parseFloat(overlayRateRotationValue.attributes['step'].value) || 0.5;

    if (clockwise) overlayRateRotationValue.value = (rate + step).toString();
    else overlayRateRotationValue.value = (rate - step).toString();
}

updateRotationValue(overlayRotation); // Load Default Value Rotation

overlayRotationValue.addEventListener('change', event => updateRotationValue(overlayRotationValue.value));