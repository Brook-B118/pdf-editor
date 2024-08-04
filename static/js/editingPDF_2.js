import { displayPDF } from './displayingPDF.js';

document.querySelectorAll('.element-block').forEach(block => {
    block.addEventListener('click', (e) => {
        const newElement = document.createElement('div');
        newElement.className = 'draggable';
        newElement.style.position = 'absolute';
        const overlayRect = document.getElementById('overlay').getBoundingClientRect();
        const elementWidth = 100; // Width of the new element
        const elementHeight = 50; // Height of the new element
        newElement.style.left = `${e.clientX - overlayRect.left - elementWidth / 2}px`;
        newElement.style.top = `${e.clientY - overlayRect.top - elementHeight / 2}px`;
        // newElement.style.background = 'rgba(0, 0, 255, 0.5)';
        newElement.contentEditable = true;
        document.getElementById('overlay').appendChild(newElement);

        newElement.addEventListener('mousedown', function (e) {
            let offsetX = e.clientX - newElement.getBoundingClientRect().left;
            let offsetY = e.clientY - newElement.getBoundingClientRect().top;

            let overlay = document.getElementById('overlay');
            let overlayRect = overlay.getBoundingClientRect();

            function mouseMoveHandler(e) {
                let newLeft = e.clientX - offsetX - overlayRect.left;
                let newTop = e.clientY - offsetY - overlayRect.top;

                newElement.style.left = `${newLeft}px`;
                newElement.style.top = `${newTop}px`;
            }

            function mouseUpHandler() {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    });
});