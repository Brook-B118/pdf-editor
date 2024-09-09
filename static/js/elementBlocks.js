import { autoSave } from "./savingPDF.js";
import { addTextboxEventListeners } from "./textboxCustomization.js";
import { addShapeEventListeners } from "./shapeCustomization.js";
import { addsignatureFieldEventListeners } from "./signatureCustomization.js"

interact('.resizable').resizable({
    edges: { bottom: '.resize-handle', right: '.resize-handle' },
    modifiers: [
        interact.modifiers.restrictEdges({
            outer: 'parent',
        }),
        interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
        })
    ],
    listeners: {
        move: function (event) {
            let { x, y } = event.target.dataset

            x = (parseFloat(x) || 0) + event.deltaRect.left
            y = (parseFloat(y) || 0) + event.deltaRect.top

            Object.assign(event.target.style, {
                width: `${event.rect.width}px`,
                height: `${event.rect.height}px`,
                transform: `translate(${x}px, ${y}px)`
            })

            Object.assign(event.target.dataset, { x, y })

            // Adjust the textarea height to match the container
            const textarea = event.target.querySelector('textarea');
            if (textarea) {
                textarea.style.height = '100%';
            }
        },
        end: function () {
            autoSave(documentId);
        },
    }
});


let text_box_counter = 0;

export function createTextBox(e, x, y, width, height, draggableElement, text, overlayId, font_family) {
    let overlayRect;
    if (e) {
        overlayRect = e.target.getBoundingClientRect();
    }

    // create container
    const textboxContainer = document.createElement('div');
    textboxContainer.classList.add("newElement", "resizable", "textboxContainer", "draggable"); // add .newEelement to all new elements to be able to save them.
    textboxContainer.setAttribute("draggable", "true");
    textboxContainer.style.position = 'absolute';
    textboxContainer.style.border = '2px solid red';
    textboxContainer.setAttribute("tabindex", "0"); // Divs are not normally focusable but input and textarea fields are. This line makes the div textboxContainer focusable as well as tabable with the tab button.

    if (e) {
        textboxContainer.style.width = '150px';
        textboxContainer.style.height = '50px';
        textboxContainer.style.left = `${e.clientX - overlayRect.left}px`;
        textboxContainer.style.top = `${e.clientY - overlayRect.top}px`;
    } else {
        textboxContainer.style.width = `${width}px`;
        textboxContainer.style.height = `${height}px`;
        textboxContainer.style.left = `${x}px`;
        textboxContainer.style.top = `${y}px`;
    }

    console.log("Textbox container created");

    // create it's data-overlay-id attribute, do this to all new elements to be able to save their location.
    textboxContainer.setAttribute('data-overlay-id', overlayId);

    // Create the resizeable circle for the container in bottom right

    const resize_handle = document.createElement('div');
    resize_handle.classList.add('resize-handle')
    textboxContainer.appendChild(resize_handle);


    // Create a new editable textbox
    const textbox = document.createElement('textarea')
    // textbox.type = 'text'; Do not need anymore because we are not making an input field.
    textbox.classList.add('resizable', 'textbox');
    textbox.style.width = '100%';
    textbox.style.height = '100%';
    textbox.style.lineHeight = '1'; // The line-height property controls the amount of space between lines of text. When you set it to a fixed pixel value like 2px, it makes the space between lines very small, causing overlap. Using a relative value like 1.5 means the line height will be 1.5 times the font size, which maintains readability and proper spacing.
    textbox.style.textAlign = "left";
    textbox.style.verticalAlign = "top";
    textbox.style.boxSizing = 'border-box';
    textbox.classList.add("readonly");
    textbox.style.overflow = 'hidden';

    // If I want the container to not increase when the user enters more lines, this means user has to manually increase size of container with the resize handle.
    // textbox.addEventListener("input", () => {
    //     textboxContainer.style.height = `${textarea.scrollHeight}px`;
    // });

    textbox.oninput = function () {
        this.style.height = 'auto'; // Reset the height to auto to recalculate
        const paddingAndBorder = 4; // 2px padding + 2px border (the textbox was popping out because of 2px border and 2px padding which is default for textarea)
        console.log("scrollHeight: ", this.scrollHeight);

        if (this.value === '') {
            this.style.height = '50px'; // Set a minimum height when empty
            textboxContainer.style.height = '54px'; // Set container height accordingly
        } else {
            this.style.height = (this.scrollHeight + paddingAndBorder) + 'px';
            textboxContainer.style.height = (this.scrollHeight + paddingAndBorder + 4) + 'px';
        }
    };

    // Add event listeners for autosave

    textbox.addEventListener("focus", function () {
        textbox.dataset.initialValue = textbox.value;
    });

    textbox.addEventListener("blur", function () {
        if (textbox.value !== textbox.dataset.initialValue) {
            autoSave(documentId);
        }
        textbox.classList.add("readonly");
    });

    if (e) {
        textbox.style.left = `${e.clientX - overlayRect.left}px`;
        textbox.style.top = `${e.clientY - overlayRect.top}px`;
        textbox.value = draggableElement.textContent;
    } else {
        textbox.style.left = `${x}px`;
        textbox.style.top = `${y}px`;
        textbox.value = text;
        textbox.style.fontFamily = font_family;
    }

    textboxContainer.appendChild(textbox);
    console.log("textboxcontainer data: ", textboxContainer)

    // Append the new textbox container to the overlay
    if (e) {
        e.target.appendChild(textboxContainer);
    }
    else {
        document.getElementById(overlayId).appendChild(textboxContainer);
    }
    console.log("Textbox container appended to overlay");
    text_box_counter++;
    textboxContainer.id = `text-box-${text_box_counter}`;

    // Add event listeners to container so click doesn't access the input field, dblclick accesses input field, and container can reposition with drag/drop

    textboxContainer.addEventListener("click", (e) => {
        textbox.classList.add("readonly");
        textbox.blur();
        textboxContainer.focus();
    });

    textboxContainer.addEventListener("dblclick", (e) => {
        textbox.classList.remove("readonly");
        textboxContainer.blur();
        textbox.focus();

    });

    textboxContainer.addEventListener("dragstart", (e) => {
        textbox.classList.add("readonly");
        e.dataTransfer.setData("text/plain", textboxContainer.id);
    });

    textboxContainer.addEventListener("dragover", (e) => {
        textbox.blur();
        e.preventDefault();
    });

    textboxContainer.addEventListener("focus", (e) => {
        textboxContainer.style.border = '2px solid green';
        // Change sidepanel for textbox customization:
        document.querySelector(".sidepanel").innerHTML = `
          <div id="text-box-customize-container" class="textbox-customize-section">
              <p class="text-box-customize-header">Textbox Customization here</p>
              <button id="align-left" class="text-box-customize-option align-option">Left</button>
              <button id="align-center" class="text-box-customize-option align-option">Center</button>
              <button id="align-right" class="text-box-customize-option align-option">Right</button>
              <select id="font-selector" class="text-box-customize-option">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <!-- Add more font options here -->
              </select>
              <select id="font-size-selector" class="text-box-customize-option">
                <!-- Add font size options here -->
              </select>
              <button id="delete-element" class="text-box-customize-option">Delete</button>
          </div>
          `;
        // Add event listeners to customization buttons and pass the specific textbox that should be impacted as an argument"
        addTextboxEventListeners(textboxContainer.id);
    });

    textboxContainer.addEventListener("blur", (e) => {
        textboxContainer.style.border = '2px solid red';
    });
};


// Shape Block Section

interact('.resizable-shape').resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    modifiers: [
        interact.modifiers.restrictEdges({
            outer: 'parent',
        }),
        interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
        })
    ],
    listeners: {
        move: function (event) {
            let { x, y } = event.target.dataset

            x = (parseFloat(x) || 0) + event.deltaRect.left
            y = (parseFloat(y) || 0) + event.deltaRect.top

            Object.assign(event.target.style, {
                width: `${event.rect.width}px`,
                height: `${event.rect.height}px`,
                transform: `translate(${x}px, ${y}px)`
            })

            Object.assign(event.target.dataset, { x, y })
        },
        end: function () {
            autoSave(documentId);
        },
    }
});

let shape_counter = 0;

export function createShape(e, x, y, width, height, overlayId, background_color, border_color) {
    let overlayRect;
    if (e) {
        overlayRect = e.target.getBoundingClientRect();
    }

    // create shape (no need for container)
    const shape = document.createElement('div');
    shape.classList.add("newElement", "resizable-shape", "shape", "draggable"); // add .newEelement to all new elements to be able to save them.
    shape.setAttribute("draggable", "true");
    shape.style.position = 'absolute';
    shape.setAttribute("tabindex", "0");
    shape.style.border = 'solid';
    shape.style.borderWidth = '2px';

    if (e) {
        shape.style.width = '150px';
        shape.style.height = '50px';
        shape.style.left = `${e.clientX - overlayRect.left}px`;
        shape.style.top = `${e.clientY - overlayRect.top}px`;
        shape.style.backgroundColor = 'blue';
        shape.style.border = 'solid red';
    } else {
        shape.style.width = `${width}px`;
        shape.style.height = `${height}px`;
        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;
        shape.style.backgroundColor = background_color;
        shape.style.borderColor = border_color;
    }

    console.log("Shape created");

    // create it's data-overlay-id attribute, do this to all new elements to be able to save their location.
    shape.setAttribute('data-overlay-id', overlayId);

    // Append the new shape to the overlay
    if (e) {
        e.target.appendChild(shape);
    }
    else {
        document.getElementById(overlayId).appendChild(shape);
    }
    console.log("Shape appended to overlay");
    shape_counter++;
    shape.id = `shape-${shape_counter}`;

    // Add event listeners to enable repositioning drag and drop

    shape.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", shape.id);
    });

    shape.addEventListener("dragover", (e) => {
        shape.blur();
        e.preventDefault();
    });

    shape.addEventListener("focus", (e) => {
        // shape.style.border = '2px solid green';
        // Change sidepanel for textbox customization:
        document.querySelector(".sidepanel").innerHTML = `
          <div id="shape-customize-container" class="shape-customize-section">
            <p class="shape-customize-header">Shape Customization here</p>
            <div class="shape-customize-row">
            <label for="fill-color-selector">Fill Color:</label>
            <input type="color" id="fill-color-selector" class="shape-customize-option">
            <label for="border-color-selector">Border Color:</label>
            <input type="color" id="border-color-selector" class="shape-customize-option">
            </div>
            <div class="shape-customize-row">
            <button id="delete-element" class="shape-customize-option">Delete</button>
            </div>
          </div>
          `;
        // Add event listeners to customization buttons and pass the specific textbox that should be impacted as an argument"
        addShapeEventListeners(shape.id);
    });

};


// Signature block section

interact('.resizable-signatureField').resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    modifiers: [
        interact.modifiers.restrictEdges({
            outer: 'parent',
        }),
        interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
        })
    ],
    listeners: {
        move: function (event) {
            let { x, y } = event.target.dataset

            x = (parseFloat(x) || 0) + event.deltaRect.left
            y = (parseFloat(y) || 0) + event.deltaRect.top

            Object.assign(event.target.style, {
                width: `${event.rect.width}px`,
                height: `${event.rect.height}px`,
                transform: `translate(${x}px, ${y}px)`
            })

            Object.assign(event.target.dataset, { x, y })
        },
        end: function () {
            autoSave(documentId);
        },
    }
});

let signatureField_counter = 0;

export function createSignatureField(e, x, y, width, height, draggableElement, text, overlayId, font_family) {
    let overlayRect;
    if (e) {
        overlayRect = e.target.getBoundingClientRect();
    }

    // create signatureField (no need for container)
    const signatureField = document.createElement('input');
    signatureField.classList.add("newElement", "resizable-signatureField", "signatureField", "draggable"); // add .newEelement to all new elements to be able to save them.
    signatureField.setAttribute("draggable", "true");
    signatureField.style.position = 'absolute';
    signatureField.setAttribute("tabindex", "0");
    signatureField.style.fontFamily = 'Parisienne';
    signatureField.style.fontSize = '24px';
    signatureField.style.textAlign = 'center';
    signatureField.style.padding = '2px';
    signatureField.setAttribute("readonly", true);
    signatureField.type = 'text';
    // signatureField.style.border = 'solid';
    // signatureField.style.borderWidth = '2px';

    if (e) {
        signatureField.style.width = '200px';
        signatureField.style.height = '100px';
        signatureField.style.left = `${e.clientX - overlayRect.left}px`;
        signatureField.style.top = `${e.clientY - overlayRect.top}px`;
        signatureField.value = draggableElement.textContent;
        // signatureField.style.backgroundColor = 'blue';
        // signatureField.style.border = 'solid red';
    } else {
        signatureField.style.width = `${width}px`;
        signatureField.style.height = `${height}px`;
        signatureField.style.left = `${x}px`;
        signatureField.style.top = `${y}px`;
        signatureField.value = text;
        signatureField.style.fontFamily = font_family;
        // signatureField.style.backgroundColor = background_color;
        // signatureField.style.borderColor = border_color;
    }

    console.log("signatureField created");

    // create it's data-overlay-id attribute, do this to all new elements to be able to save their location.
    signatureField.setAttribute('data-overlay-id', overlayId);

    // Append the new signatureField to the overlay
    if (e) {
        e.target.appendChild(signatureField);
    }
    else {
        document.getElementById(overlayId).appendChild(signatureField);
    }
    console.log("signatureField appended to overlay");
    signatureField_counter++;
    signatureField.id = `signatureField-${signatureField_counter}`;

    // Add event listeners to enable repositioning drag and drop

    signatureField.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", signatureField.id);
    });

    signatureField.addEventListener("dragover", (e) => {
        signatureField.blur();
        e.preventDefault();
    });


    signatureField.addEventListener("click", () => {
        // signatureField.style.border = '2px solid green';
        // Change sidepanel for textbox customization:
        document.querySelector(".sidepanel").innerHTML = `
          <div id="signatureField-customize-container" class="signatureField-customize-section">
            <div class="signatureField-customize-row">
                <div id="signature-preview">
                    <div id="signature-content">Your text here</div>
                </div>
            </div>
            <div class="signatureField-customize-row">
                <p class="signatureField-customize-header">signatureField Customization here</p>
            </div>
            <div class="signatureField-customize-row">
                <input id="type-signature" class="signatureField-customize-option" maxlength="100">
                <button id="submit-signature" class="signatureField-customize-option">Sign</button>
            </div>
            <div class="signatureField-customize-row">
                <button id="align-left" class="signatureField-customize-option align-option">Left</button>
                <button id="align-center" class="signatureField-customize-option align-option">Center</button>
                <button id="align-right" class="signatureField-customize-option align-option">Right</button>
            </div>
            <div class="signatureField-customize-row">
                <select id="font-selector" class="signatureField-customize-option">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Parisienne">Parisienne</option>
                    <!-- Add more font options here -->
                </select>
                <select id="font-size-selector" class="signatureField-customize-option">
                    <!-- Add font size options here -->
                </select>
            </div>
            <div class="signatureField-customize-row">
                <label for="fill-color-selector">Fill Color:</label>
                <input type="color" id="fill-color-selector" class="signatureField-customize-option">
                <label for="border-color-selector">Border Color:</label>
                <input type="color" id="border-color-selector" class="signatureField-customize-option">
            </div>
            <div class="signatureField-customize-row">
                <button id="delete-element" class="signatureField-customize-option">Delete</button>
            </div>
          </div>
          `;
        // Add event listeners to customization buttons and pass the specific textbox that should be impacted as an argument"
        addsignatureFieldEventListeners(signatureField.id);
    });

};