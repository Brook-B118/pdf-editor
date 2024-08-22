import { autoSave } from "./savingPDF.js";

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
        },
        end: function () {
            autoSave(documentId);
        },
    }
});


let text_box_counter = 0;

export function createTextBox(e, x, y, width, height, draggableElement, text, overlayId) {
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

    // // Create a toolbar for textbox
    // const toolbar = document.createElement('div');
    // toolbar.classList.add('toolbar');
    // toolbar.style.position = 'absolute';
    // toolbar.style.left = '0';
    // toolbar.style.top = '-30px'; // Adjust as needed
    // console.log("Toolbar created");

    // // Add buttons for bold, italic, etc.
    // const boldButton = document.createElement('button');
    // boldButton.textContent = 'B';
    // toolbar.appendChild(boldButton);

    // // Append Toolbar to Textbox Container
    // textboxContainer.appendChild(toolbar);

    // Create a new editable textbox
    const textbox = document.createElement('input')
    textbox.type = 'text';
    textbox.classList.add('resizable', 'textbox');
    textbox.style.width = '100%';
    textbox.style.height = '100%';
    textbox.style.boxSizing = 'border-box';
    textbox.classList.add("readonly");

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

    textboxContainer.addEventListener("dragstart", e => {
        textbox.classList.add("readonly");
        e.dataTransfer.setData("text/plain", textboxContainer.id);

    });
    textboxContainer.addEventListener("dragover", e => {
        textbox.blur();
        textboxContainer.focus();
        e.preventDefault();
    })
};
