"use strict";

let elementForm = document.getElementById('element-form');

const addField = prop => {
    let field = document.createElement('fieldset');

    let legend = document.createElement('legend');
    legend.attributes.for = prop;
    legend.innerHTML = `<span class="no-actions">${prop}</span>`;

    let input = document.createElement('input');
    input.name = prop;
    input.type = 'text';

    field.appendChild(legend);
    field.appendChild(input);
    elementForm.appendChild(field)
};

_.each(elemProperties, addField);
_.each(elmStyles, addField);

const OpenModal = () => {
    let modal = document.getElementById('modal-edit-element');
    modal.className = 'visible';
};

const CloseModal = () => {
    let modal = document.getElementById('modal-edit-element');
    modal.className = 'hidden';
    selectedElement = {};
};

elementForm.addEventListener('change', event => {
    let data = new FormData(elementForm);
    let properties = {};
    let styles = {};

    _.each(elemProperties, prop => {
        if (data.get(prop)) properties[prop] = data.get(prop);
    });
    _.each(elmStyles, prop => {
        if (data.get(prop)) styles[prop] = data.get(prop);
    });

    selectedElement.overlay.set('properties', properties);
    selectedElement.overlay.set('styles', styles);

    _.each(googleElmStyles, style => {
        if (styles[style]) selectedElement.overlay.set(style, styles[style]);
        else if (style == 'icon' && selectedElement.type == 'marker')
            if (properties['image']) selectedElement.overlay.set('icon', properties['image']);
    });
});