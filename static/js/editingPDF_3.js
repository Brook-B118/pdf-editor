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
                createTextBox(e, draggableElement);
            } else {
                // Handle moving the existing element
                const overlayRect = overlay.getBoundingClientRect();
                const offsetX = e.clientX - overlayRect.left - draggableElement.offsetWidth / 2;
                const offsetY = e.clientY - overlayRect.top - draggableElement.offsetHeight / 2;
                draggableElement.style.left = `${offsetX}px`;
                draggableElement.style.top = `${offsetY}px`;
            }
        });
    }
};


// Ensure this function is called after displayPDF is done
displayPDF(url).then(() => {
    addEventListeners();
});





// Add mousedown event listener to handle dragging
// addedElement.addEventListener('mousedown', function (event) {
//     let shiftX = event.clientX - addedElement.offsetLeft;
//     let shiftY = event.clientY - addedElement.offsetTop;

//     function moveAt(clientX, clientY) {
//         addedElement.style.left = clientX - shiftX + 'px';
//         addedElement.style.top = clientY - shiftY + 'px';
//     }

//     moveAt(event.clientX, event.clientY);

//     function onMouseMove(event) {
//         moveAt(event.clientX, event.clientY);
//     }

//     document.addEventListener('mousemove', onMouseMove);

//     function onMouseUp() {
//         console.log("Mouse up event fired");
//         document.removeEventListener('mousemove', onMouseMove);
//         document.removeEventListener('mouseup', onMouseUp);
//     }

//     document.addEventListener('mouseup', onMouseUp);
// });

