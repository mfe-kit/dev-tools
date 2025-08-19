(function () {
  const { manifest } = window.PLAYGROUND;

  const CONTENT_ID = 'playground-content';
  const CONTROLS_ID = 'playground-controls';
  const CONTROLS_BTN_ID = 'playground-controls-btn';

  function injectMFE() {
    const component = document.createElement(manifest.tag);
    const container = document.getElementById(CONTENT_ID);
    const attributes = getAttributesForMFE();
    for (const key in attributes) {
      component.setAttribute(key, attributes[key]);
    }
    container.appendChild(component);
    createControls();
  }

  function getAttributesForMFE() {
    const hasQueryParams = window.location.search.length > 1;
    if (hasQueryParams) {
      // MFE attributes from query params
      return getAttributesFromQueryParams();
    } else {
      // MFE attributes from manifest
      setQueryParams(manifest.example.attributes);
      return manifest.example.attributes;
    }
  }

  function createControls() {
    const elements = [];
    const controlsContainerEl = document.getElementById(CONTROLS_ID);
    // generate control using manifest
    manifest.attributes.forEach((control) => {
      elements.push(generateControlItem(control));
    });
    // add APPLY button to the end of controls
    elements.push(
      `<div class="item"><button class="apply-btn" id="${CONTROLS_BTN_ID}">Apply</button></div>`,
    );
    controlsContainerEl.innerHTML = elements.join('');
    // fill controls with values from query/manifest(example)
    setControlsValues();

    document.getElementById(CONTROLS_BTN_ID).addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const values = getControlsValues();
      setQueryParams(values);
      window.location.reload();
    });
  }

  function generateControlItem(control) {
    let template = '';
    // generate html select
    if (control.schema.enum) {
      const options = control.schema.enum
        .map((val) => `<option value="${val}">${val}</option>`)
        .join('');

      template = `
        <select id="${control.name}" required="${control.required}">
          ${options}
        </select>
      `;
    } else {
      // generate html inputs
      const type = control.schema.type === 'boolean' ? 'checkbox' : 'text';
      template = `
        <input id="${control.name}" type="${type}" required="${control.required}"/>
      `;
    }

    return `
      <div class="item">
        <label for="${control.name}">${control.name}:</label>
        ${template}
      </div>
    `;
  }

  function getAttributesFromQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  function getControlsValues() {
    const controls = {};
    manifest.attributes.forEach((attribute) => {
      const el = document.getElementById(attribute.name);
      controls[attribute.name] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return controls;
  }

  function setControlsValues() {
    const attributes = getAttributesFromQueryParams();
    for (const key in attributes) {
      const el = document.getElementById(key);
      if (el.type === 'checkbox') {
        el.checked = attributes[key] === 'true';
      } else {
        el.value = attributes[key];
      }
    }
  }

  function setQueryParams(data) {
    const queryString = new URLSearchParams(data).toString();
    const url = new URL(window.location.href);
    url.search = queryString;
    window.history.replaceState({}, '', url);
  }

  injectMFE();
})();
