import { displayPDF } from './displayingPDF.js';
import { pages } from './displayingPDF.js';
import { createTextBox, createShape, createSignatureField } from './elementBlocks.js';
import { autoSave } from './savingPDF.js';

document.querySelectorAll('.element-block').forEach((block) => {
    block.classList.add("draggable");
    block.setAttribute("draggable", "true");
    block.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", block.id);
    });
});

function addEventListeners() {
    for (let i = 1; i <= pages; i++) {
        let overlay = document.getElementById(`overlay-${i}`);
        overlay.addEventListener("dragover", e => {
            e.preventDefault();
        });

        document.getElementById(`overlay-${i}`).addEventListener("drop", e => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            const draggableElement = document.getElementById(id);

            console.log("draggable element =", draggableElement)

            if (draggableElement && draggableElement.id === 'new-text-box-block') {
                createTextBox(e, null, null, null, null, draggableElement, null, `overlay-${i}`);
            } else if (draggableElement && draggableElement.id === 'new-shape-block') {
                createShape(e, null, null, null, null, `overlay-${i}`);
            } else if (draggableElement && draggableElement.id === 'new-signatureField-block') {
                createSignatureField(e, null, null, null, null, draggableElement, null, `overlay-${i}`);
            } else {
                // Handle moving the existing element
                const overlayRect = overlay.getBoundingClientRect();
                const offsetX = e.clientX - overlayRect.left - draggableElement.offsetWidth / 2;
                const offsetY = e.clientY - overlayRect.top - draggableElement.offsetHeight / 2;
                draggableElement.style.left = `${offsetX}px`;
                draggableElement.style.top = `${offsetY}px`;

                // Update the data-overlay-id attribute
                draggableElement.setAttribute('data-overlay-id', `overlay-${i}`);

            }
            // Call autoSave after handling the drop
            autoSave(documentId);
            console.log("autosave function called")
        });
    }
};


// Ensure this function is called after displayPDF is done
displayPDF(url).then(() => {
    fetch(`/get_changes?document_id=${documentId}`)
        .then(response => response.json())
        .then(data => {
            let changes = data.changes;
            changes.forEach(change => {
                if (change.type === 'textboxContainer') {
                    createTextBoxWithSavedData(change);
                } else if (change.type === 'shape') {
                    createShapeWithSavedData(change);
                } else if (change.type === 'signatureField') {
                    createSignatureFieldWithSavedData(change);
                }
                // Add more conditions for other element types if needed
            });
            addEventListeners();
        })
        .catch(error => {
            console.error('Error fetching changes:', error);
        });
});

function createTextBoxWithSavedData(change) {
    console.log("change:", change);
    // Create the textbox element
    createTextBox(null, change.position_x, change.position_y, change.width, change.height, null, change.content, change.overlayId, change.font_family);
    // Reposition the element
    // let element = document.querySelector(`[data-overlay-id="${change.overlayId}"]`);
    // console.log("element in createTextBoxWithSavedData():", element);
}

function createShapeWithSavedData(change) {
    createShape(null, change.position_x, change.position_y, change.width, change.height, change.overlayId, change.background_color, change.border_color)
}

function createSignatureFieldWithSavedData(change) {
    createSignatureField(null, change.position_x, change.position_y, change.width, change.height, null, change.content, change.overlayId, change.font_family)
}

// besides just chatting with duck about draggable and droppable elements, this video helped as well: https://www.youtube.com/watch?v=OHTudicK7nY

