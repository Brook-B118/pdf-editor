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
console.log("text_box_counter:", text_box_counter);

export function createTextBox(e, x, y, width, height, draggableElement, text, overlayId, font_family, font_size, element_id) {
    let overlayRect;
    if (e) {
        overlayRect = e.target.getBoundingClientRect();
    }

    // create container
    const textboxContainer = document.createElement('div');
    textboxContainer.classList.add("newElement", "resizable", "textboxContainer", "draggable"); // add .newEelement to all new elements to be able to save them.
    textboxContainer.setAttribute("draggable", "true");
    textboxContainer.style.position = 'absolute';
    textboxContainer.style.border = '2px solid green';
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
        textbox.value = draggableElement.textContent.trim();
        textbox.style.fontFamily = 'Arial';
        textbox.style.fontSize = `${16}px`;
    } else {
        textbox.style.left = `${x}px`;
        textbox.style.top = `${y}px`;
        textbox.value = text;
        textbox.style.fontFamily = font_family;
        textbox.style.fontSize = `${font_size}px`;

    }

    textboxContainer.appendChild(textbox);
    console.log("textboxcontainer data: ", textboxContainer)

    // Append the new textbox container to the overlay
    if (e) {
        e.target.appendChild(textboxContainer);
        console.log("Textbox container appended to overlay");
        text_box_counter++;
        console.log("inside function text_box_counter if e:", text_box_counter);
        textboxContainer.id = `text-box-${text_box_counter}`;
    }
    else {
        document.getElementById(overlayId).appendChild(textboxContainer);
        console.log("Textbox container appended to overlay");
        text_box_counter = parseInt(element_id.match(/\d+/));
        console.log("inside function text_box_counter no e:", text_box_counter);
        textboxContainer.id = `text-box-${text_box_counter}`;
    }
    // console.log("Textbox container appended to overlay");
    // text_box_counter++;
    // console.log("inside function text_box_counter:", text_box_counter);
    // textboxContainer.id = `text-box-${text_box_counter}`;

    // Add event listeners to container so click doesn't access the input field, dblclick accesses input field, and container can reposition with drag/drop
    // Created functions for the event listeners so I could remove them when textbox is in focus. This way we can drag the cursor or click inside the textbox without blurring it.
    function handleClick(e) {
        textbox.classList.add("readonly");
        textbox.blur();
        textboxContainer.focus();
    }

    function handleDblClick(e) {
        textbox.classList.remove("readonly");
        textboxContainer.blur();
        textbox.focus();
    }

    // Add event listeners
    textboxContainer.addEventListener("click", handleClick);
    textboxContainer.addEventListener("dblclick", handleDblClick);

    textboxContainer.addEventListener("dragstart", (e) => {
        textbox.classList.add("readonly");
        e.dataTransfer.setData("text/plain", textboxContainer.id);
    });

    textboxContainer.addEventListener("dragover", (e) => {
        textbox.blur();
        e.preventDefault();
    });

    textbox.addEventListener("focus", () => {
        textboxContainer.setAttribute("draggable", "false"); // This way dragging the cursor to highlight text won't drag the container instead.
        textboxContainer.removeEventListener("click", handleClick);
        textboxContainer.removeEventListener("dblclick", handleDblClick);
    })

    textbox.addEventListener("blur", () => {
        textboxContainer.setAttribute("draggable", "true"); // Give the draggability back when done with textbox.
        textboxContainer.addEventListener("click", handleClick);
        textboxContainer.addEventListener("dblclick", handleDblClick);
    })

    textboxContainer.addEventListener("focus", (e) => {
    textboxContainer.style.border = "2px solid rgb(0, 128, 192)";
    const sidepanel = document.querySelector(".sidepanel");
    while (sidepanel.firstChild) {
        sidepanel.removeChild(sidepanel.firstChild);
    }

    const container = document.createElement("div");
    container.id = "text-box-customize-container";
    container.classList.add("textbox-customize-section");

    const header = document.createElement("p");
    header.classList.add("text-box-customize-header");
    header.textContent = "Textbox Customization here";
    container.appendChild(header);

    [
        { id: "align-left", label: "Left" },
        { id: "align-center", label: "Center" },
        { id: "align-right", label: "Right" },
    ].forEach((alignment) => {
        const btn = document.createElement("button");
        btn.id = alignment.id;
        btn.textContent = alignment.label;
        btn.classList.add("text-box-customize-option", "align-option");
        btn.disabled = true;
        container.appendChild(btn);
    });

    const fontSelector = document.createElement("select");
    fontSelector.id = "font-selector";
    fontSelector.classList.add("text-box-customize-option");
    container.appendChild(fontSelector);

    const fontSizeSelector = document.createElement("select");
    fontSizeSelector.id = "font-size-selector";
    fontSizeSelector.classList.add("text-box-customize-option");
    container.appendChild(fontSizeSelector);

    const deleteButton = document.createElement("button");
    deleteButton.id = "delete-element";
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("text-box-customize-option");
    container.appendChild(deleteButton);

    sidepanel.appendChild(container);
    addTextboxEventListeners(textboxContainer.id);
    });


    textboxContainer.addEventListener("blur", (e) => {
        textboxContainer.style.border = '2px solid green';
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

export function createShape(e, x, y, width, height, overlayId, background_color, border_color, element_id) {
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
    shape.style.border = 'solid red';
    shape.style.borderWidth = '2px';

    if (e) {
        shape.style.width = '150px';
        shape.style.height = '50px';
        shape.style.left = `${e.clientX - overlayRect.left}px`;
        shape.style.top = `${e.clientY - overlayRect.top}px`;
        shape.style.backgroundColor = 'blue';
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
        console.log("Shape appended to overlay");
        shape_counter++;
        console.log("Shape_counter if e:", shape_counter);
        shape.id = `shape-${shape_counter}`;
    }
    else {
        document.getElementById(overlayId).appendChild(shape);
        console.log("Shape appended to overlay");
        shape_counter = parseInt(element_id.match(/\d+/));
        console.log("Shape_counter no e:", shape_counter);
        shape.id = `shape-${shape_counter}`;
    }
    console.log("Shape appended to overlay");
    // shape_counter++;
    // shape.id = `shape-${shape_counter}`;

    // Add event listeners to enable repositioning drag and drop

    shape.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", shape.id);
    });

    shape.addEventListener("dragover", (e) => {
        shape.blur();
        e.preventDefault();
    });

    shape.addEventListener("focus", (e) => {
        shape.style.boxShadow = "0 0 8px 4px rgba(0, 128, 192, 1)";

        const sidepanel = document.querySelector(".sidepanel");
        // Clear sidepanel content without using innerHTML
        while (sidepanel.firstChild) {
        sidepanel.removeChild(sidepanel.firstChild);
        }

        // Create outer container
        const container = document.createElement("div");
        container.id = "shape-customize-container";
        container.classList.add("shape-customize-section");

        // Header
        const header = document.createElement("p");
        header.classList.add("shape-customize-header");
        header.textContent = "Shape Customization here";
        container.appendChild(header);

        // First row (fill + border color)
        const colorRow = document.createElement("div");
        colorRow.classList.add("shape-customize-row");

        // Fill color
        const fillLabel = document.createElement("label");
        fillLabel.setAttribute("for", "fill-color-selector");
        fillLabel.textContent = "Fill Color:";
        colorRow.appendChild(fillLabel);

        const fillInput = document.createElement("input");
        fillInput.type = "color";
        fillInput.id = "fill-color-selector";
        fillInput.classList.add("shape-customize-option");
        colorRow.appendChild(fillInput);

        // Border color
        const borderLabel = document.createElement("label");
        borderLabel.setAttribute("for", "border-color-selector");
        borderLabel.textContent = "Border Color:";
        colorRow.appendChild(borderLabel);

        const borderInput = document.createElement("input");
        borderInput.type = "color";
        borderInput.id = "border-color-selector";
        borderInput.classList.add("shape-customize-option");
        colorRow.appendChild(borderInput);

        container.appendChild(colorRow);

        // Second row (delete button)
        const buttonRow = document.createElement("div");
        buttonRow.classList.add("shape-customize-row");

        const deleteButton = document.createElement("button");
        deleteButton.id = "delete-element";
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("shape-customize-option");

        buttonRow.appendChild(deleteButton);
        container.appendChild(buttonRow);

        // Add everything to sidepanel
        sidepanel.appendChild(container);

        // Hook up the event logic
        addShapeEventListeners(shape.id);

    });

    shape.addEventListener("blur", (e) => {
        shape.style.boxShadow = '0 0 0 0 rgb(0, 0, 0, 1)';
    })

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

export function createSignatureField(e, x, y, width, height, draggableElement, text, overlayId, font_family, font_size, element_id) {
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
        signatureField.value = draggableElement.textContent.trim();
        signatureField.style.fontFamily = 'Parisienne';
        signatureField.style.fontSize = '24px';
        // signatureField.style.backgroundColor = 'blue';
        // signatureField.style.border = 'solid red';
    } else {
        signatureField.style.width = `${width}px`;
        signatureField.style.height = `${height}px`;
        signatureField.style.left = `${x}px`;
        signatureField.style.top = `${y}px`;
        signatureField.value = text;
        signatureField.style.fontFamily = font_family;
        signatureField.style.fontSize = `${font_size}px`;
        // signatureField.style.backgroundColor = background_color;
        // signatureField.style.borderColor = border_color;
    }

    console.log("signatureField created");

    // create it's data-overlay-id attribute, do this to all new elements to be able to save their location.
    signatureField.setAttribute('data-overlay-id', overlayId);

    // Append the new signatureField to the overlay
    if (e) {
        e.target.appendChild(signatureField);
        console.log("signatureField appended to overlay");
        signatureField_counter++;
        console.log("signatureField_counter with e:", signatureField_counter);
        signatureField.id = `signatureField-${signatureField_counter}`;
    }
    else {
        document.getElementById(overlayId).appendChild(signatureField);
        console.log("signatureField appended to overlay");
        signatureField_counter = parseInt(element_id.match(/\d+/));
        console.log("signatureField_counter no e:", signatureField_counter);
        signatureField.id = `signatureField-${signatureField_counter}`;
    }
    // console.log("signatureField appended to overlay");
    // signatureField_counter++;
    // signatureField.id = `signatureField-${signatureField_counter}`;

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
        // Change sidepanel for signatureField customization:
        const sidepanel = document.querySelector(".sidepanel");
        // Clear contents safely
        while (sidepanel.firstChild) {
        sidepanel.removeChild(sidepanel.firstChild);
        }

        // Container
        const container = document.createElement("div");
        container.id = "signatureField-customize-container";
        container.classList.add("signatureField-customize-section");

        // Preview row
        const previewRow = document.createElement("div");
        previewRow.classList.add("signatureField-customize-row");

        const previewWrapper = document.createElement("div");
        previewWrapper.id = "signature-preview";

        const previewContent = document.createElement("div");
        previewContent.id = "signature-content";
        previewContent.textContent = "Your text here";

        previewWrapper.appendChild(previewContent);
        previewRow.appendChild(previewWrapper);
        container.appendChild(previewRow);

        // Header row
        const headerRow = document.createElement("div");
        headerRow.classList.add("signatureField-customize-row");

        const header = document.createElement("p");
        header.classList.add("signatureField-customize-header");
        header.textContent = "signatureField Customization here";
        headerRow.appendChild(header);
        container.appendChild(headerRow);

        // Input + sign button row
        const inputRow = document.createElement("div");
        inputRow.classList.add("signatureField-customize-row");

        const input = document.createElement("input");
        input.id = "type-signature";
        input.classList.add("signatureField-customize-option");
        input.setAttribute("maxlength", "100");

        const signBtn = document.createElement("button");
        signBtn.id = "submit-signature";
        signBtn.textContent = "Sign";
        signBtn.classList.add("signatureField-customize-option");

        inputRow.appendChild(input);
        inputRow.appendChild(signBtn);
        container.appendChild(inputRow);

        // Alignment buttons row
        const alignRow = document.createElement("div");
        alignRow.classList.add("signatureField-customize-row");

        ["Left", "Center", "Right"].forEach(align => {
        const btn = document.createElement("button");
        btn.id = `align-${align.toLowerCase()}`;
        btn.textContent = align;
        btn.classList.add("signatureField-customize-option", "align-option");
        btn.disabled = true;
        alignRow.appendChild(btn);
        });

        container.appendChild(alignRow);

        // Font + size selectors row
        const fontRow = document.createElement("div");
        fontRow.classList.add("signatureField-customize-row");

        const fontSelector = document.createElement("select");
        fontSelector.id = "font-selector";
        fontSelector.classList.add("signatureField-customize-option");

        ["Arial", "Times New Roman", "Parisienne"].forEach(font => {
        const option = document.createElement("option");
        option.value = font;
        option.textContent = font;
        fontSelector.appendChild(option);
        });

        const fontSizeSelector = document.createElement("select");
        fontSizeSelector.id = "font-size-selector";
        fontSizeSelector.classList.add("signatureField-customize-option");

        [12, 14, 16, 18, 24, 32].forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = `${size}px`;
        fontSizeSelector.appendChild(option);
        });

        fontRow.appendChild(fontSelector);
        fontRow.appendChild(fontSizeSelector);
        container.appendChild(fontRow);

        // Color pickers row
        const colorRow = document.createElement("div");
        colorRow.classList.add("signatureField-customize-row");

        const fillLabel = document.createElement("label");
        fillLabel.setAttribute("for", "fill-color-selector");
        fillLabel.textContent = "Fill Color:";

        const fillInput = document.createElement("input");
        fillInput.type = "color";
        fillInput.id = "fill-color-selector";
        fillInput.classList.add("signatureField-customize-option");
        fillInput.disabled = true;

        const borderLabel = document.createElement("label");
        borderLabel.setAttribute("for", "border-color-selector");
        borderLabel.textContent = "Border Color:";

        const borderInput = document.createElement("input");
        borderInput.type = "color";
        borderInput.id = "border-color-selector";
        borderInput.classList.add("signatureField-customize-option");
        borderInput.disabled = true;

        colorRow.appendChild(fillLabel);
        colorRow.appendChild(fillInput);
        colorRow.appendChild(borderLabel);
        colorRow.appendChild(borderInput);

        container.appendChild(colorRow);

        // Delete button row
        const deleteRow = document.createElement("div");
        deleteRow.classList.add("signatureField-customize-row");

        const deleteBtn = document.createElement("button");
        deleteBtn.id = "delete-element";
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("signatureField-customize-option");

        deleteRow.appendChild(deleteBtn);
        container.appendChild(deleteRow);

        // Final append
        sidepanel.appendChild(container);

        // Attach logic
        addsignatureFieldEventListeners(signatureField.id);
    });
};