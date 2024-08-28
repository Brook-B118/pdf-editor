import { autoSave } from "./savingPDF.js";
import { addTextboxEventListeners } from "./textboxCustomization.js";

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
          <div class="edit-document">
              <button id="save-button">Save and Download</button>
          </div>
          <div id="text-box-customize-container" class="textbox-customize-section">
              <p>Textbox Customization here</p>
              <button id="align-left" class="text-box-customize-option">Left</button>
              <button id="align-center" class="text-box-customize-option">Center</button>
              <button id="align-right" class="text-box-customize-option">Right</button>
              <input type="color" id="bg-color-picker" class="text-box-customize-option">
              <select id="font-selector" class="text-box-customize-option">
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <!-- Add more font options here -->
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


