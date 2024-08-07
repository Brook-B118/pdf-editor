import { displayPDF } from './displayingPDF.js';


document.querySelectorAll('.element-block').forEach((block) => {
    block.addEventListener('click', (e) => {
        const newElement = document.createElement('div');
        newElement.className = 'draggable';
        newElement.style.position = 'absolute';
        const overlayRect = document.getElementById('overlay').getBoundingClientRect();
        const elementWidth = 100;
        const elementHeight = 50;
        newElement.style.left = `${e.clientX - overlayRect.left - elementWidth / 2}px`;
        newElement.style.top = `${e.clientY - overlayRect.top - elementHeight / 2}px`;
        // newElement.style.background = 'rgba(0, 0, 255, 0.5)';
        newElement.contentEditable = true;
        document.getElementById('overlay').appendChild(newElement);

        newElement.addEventListener('mousedown', function (e) {
            let offsetX = e.clientX - newElement.getBoundingClientRect().left;
            let offsetY = e.clientY - newElement.getBoundingClientRect().top;
            // we could use e.offset(X or Y) instead, however using e.client(X or Y) + getBoundingClientRect() will help if a user needs to scroll through multiple pages while dragging the element for example.

            let overlay = document.getElementById('overlay');
            let overlayRect = overlay.getBoundingClientRect();

            function mouseMoveHandler(e) {
                let newLeft = e.clientX - offsetX - overlayRect.left;
                let newTop = e.clientY - offsetY - overlayRect.top;

                newElement.style.left = `${newLeft}px`;
                newElement.style.top = `${newTop}px`;
            }

            function mouseUpHandler() {
                let canvas = document.querySelector('canvas');
                let canvasBoundries = canvas.getBoundingClientRect();
                let elementBoundries = newElement.getBoundingClientRect();

                if (elementBoundries.left < canvasBoundries.left && elementBoundries.right <= canvasBoundries.right && elementBoundries.right > canvasBoundries.left) {
                    newElement.style.left = `${canvasBoundries.left - elementBoundries.left}px`; // automatically move the element inside the canvas if the right is inside canvas but left isnt.
                    console.log("element left:", elementBoundries.left)
                    console.log("canvas left:", canvasBoundries.left)
                    console.log(`Adjusted left to: ${newElement.style.left}`);
                } else if (elementBoundries.right > canvasBoundries.right && elementBoundries.left >= canvasBoundries.left && elementBoundries.left < canvasBoundries.right) {
                    newElement.style.left = `${canvasBoundries.right - elementBoundries.right}px`;
                    console.log(`Adjusted right to: ${newElement.style.left}`);
                }
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    });
});






// e.client(X or Y) is the distance of the user's cursor from the edge of the browser window. (X is from left of the user's cursor Y is from the top)
// screen(X or Y) is another tool that measures cursor position, however it measures from your entire screen, not the browser window.
// page(X or Y) is useful for when your page in the website is bigger than the browser window. (Think like lucid chart)
// offset(X or Y) is the user's cursor distance from the left or top of the specific element you click. (if the element is in the middle and you click the left of the element, offsetX would show: (e.clientX - (the distance between the left edge of the element + the left edge of the browser window))
// source = https://www.youtube.com/watch?v=dxADq_DlS-w

// getBoundingClientRect():
// returns something called a "DOM rectangle object"
// source = https://www.youtube.com/watch?v=MKpZadkuT-0


// Convo with duck for further explanation of e.offset(X or Y) vs let offsetX = e.clientX - getBoundingClientRect().left:

// Using e.offsetX and e.offsetY
// PROS:

// Simplicity: Directly gives you the position relative to the target element.
// Performance: Slightly faster as it doesn't require additional calculations.
// CONS:

// Limited Scope: Only useful if you need the position relative to the element itself.
// Example Use Case:

// Dragging within a single element: If you are dragging elements within a fixed container (like your overlay), e.offsetX and e.offsetY are straightforward and efficient.
// Using e.clientX and getBoundingClientRect()
// Pros:

// Flexibility: Can be used to calculate positions relative to the viewport or document.
// Accuracy: Accounts for transformations, scrolling, and other layout changes.
// Cons:

// Complexity: Requires more calculations and understanding of the document layout.