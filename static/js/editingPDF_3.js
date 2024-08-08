import { displayPDF } from './displayingPDF.js';
import { pages } from './displayingPDF.js';
import { createTextBox } from './elementBlocks.js';

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
                createTextBox(e, draggableElement, `overlay-${i}`);
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
        });
    }
};


// Ensure this function is called after displayPDF is done
displayPDF(url).then(() => {
    addEventListeners();
});


// besides just chatting with duck about draggable and droppable elements, this video helped as well: https://www.youtube.com/watch?v=OHTudicK7nY

