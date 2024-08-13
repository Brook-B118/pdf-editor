import { autoSave } from "./savingPDF.js";


// document.addEventListener('DOMContentLoaded', () => {
//     interact('.newElement, .textbox').resizable({
//         edges: { left: true, right: true, bottom: true, top: true }
//     });
// });

interact('.newElement')
    .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
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
            }
        }
    })

let text_box_counter = 0;

export function createTextBox(e, x, y, width, height, draggableElement, text, overlayId) {
    let overlayRect;
    if (e) {
        overlayRect = e.target.getBoundingClientRect();
    }

    // create container
    const textboxContainer = document.createElement('div');
    textboxContainer.classList.add("newElement", "textboxContainer", "draggable"); // add .newEelement to all new elements to be able to save them.
    textboxContainer.setAttribute("draggable", "true");
    textboxContainer.style.position = 'absolute';
    textboxContainer.style.border = '1px solid red';
    if (e) {
        textboxContainer.style.width = '100px';
        textboxContainer.style.height = '25px';
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

    // Create a toolbar for textbox
    const toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');
    toolbar.style.position = 'absolute';
    toolbar.style.left = '0';
    toolbar.style.top = '-30px'; // Adjust as needed
    console.log("Toolbar created");

    // Add buttons for bold, italic, etc.
    const boldButton = document.createElement('button');
    boldButton.textContent = 'B';
    toolbar.appendChild(boldButton);

    // Append Toolbar to Textbox Container
    textboxContainer.appendChild(toolbar);

    // Create a new editable textbox
    const textbox = document.createElement('input')
    textbox.type = 'text';
    textbox.classList.add('textbox');
    textbox.style.width = '100%';
    textbox.style.height = '100%';
    textbox.style.boxSizing = 'border-box';

    // Add event listeners for autosave
    textbox.addEventListener("focus", function () {
        textbox.dataset.initialValue = textbox.value;
    });

    textbox.addEventListener("blur", function () {
        if (textbox.value !== textbox.dataset.initialValue) {
            autoSave(documentId);
        }
    });

    if (e) {
        textbox.style.left = `${e.clientX - overlayRect.left}px`;
        textbox.style.top = `${e.clientY - overlayRect.top}px`;
        textbox.value = draggableElement.textContent;
    } else {
        textbox.style.left = `${x}px`;
        textbox.style.top = `${y}px`;
        textbox.value = text;
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
    textboxContainer.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", textboxContainer.id);
    });
    textboxContainer.addEventListener("dragover", e => {
        e.preventDefault();
    })
};
