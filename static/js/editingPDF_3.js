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
            console.log(`Dragover event triggered on overlay-${i}`);
        });

        document.getElementById(`overlay-${i}`).addEventListener("drop", e => {
            e.preventDefault();
            console.log("Drop event triggered");
            const id = e.dataTransfer.getData("text/plain");
            const draggableElement = document.getElementById(id);
            console.log(draggableElement);
            console.log(draggableElement.classList);

            if (draggableElement.classList.contains('text-box-block')) {
                console.log("Condition met, calling createTextBox");
                createTextBox(e, draggableElement);
            }
        });
    }
};


// Ensure this function is called after displayPDF is done
displayPDF(url).then(() => {
    addEventListeners();
});


