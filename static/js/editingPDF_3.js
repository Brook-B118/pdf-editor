import { displayPDF } from './displayingPDF.js';
import { pages } from './displayingPDF.js';


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
            const overlayRect = e.target.getBoundingClientRect();

            // Create a new editable textbox
            const textbox = document.createElement('input');
            textbox.type = 'text';
            textbox.classList.add('textbox');
            textbox.style.position = 'absolute';
            textbox.style.left = `${e.clientX - overlayRect.left}px`;
            textbox.style.top = `${e.clientY - overlayRect.top}px`;
            textbox.value = draggableElement.textContent;
            // Append the new textbox to the overlay
            e.target.appendChild(textbox);
        });
    }
}


// Ensure this function is called after displayPDF is done
displayPDF(url).then(() => {
    addEventListeners();
});