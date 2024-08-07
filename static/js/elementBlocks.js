
function setupDragAndDrop(element) {
    // Remove existing event listeners
    element.replaceWith(element.cloneNode(true));
    element = document.getElementById(element.id); // Re-select the element

    // Add new event listeners
    element.addEventListener('mousedown', function (event) {
        let shiftX = event.clientX - element.offsetLeft;
        let shiftY = event.clientY - element.offsetTop;

        function moveAt(clientX, clientY) {
            element.style.left = clientX - shiftX + 'px';
            element.style.top = clientY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.clientX, event.clientY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });
    });
}

let text_box_counter = 0;

export function createTextBox(e, draggableElement) {
    console.log("draggable element id:", draggableElement.id)
    const overlayRect = e.target.getBoundingClientRect();

    // create container
    const textboxContainer = document.createElement('div');
    textboxContainer.classList.add("textboxContainer", "draggable")
    textboxContainer.setAttribute("draggable", "true")
    textboxContainer.style.position = 'absolute';
    textboxContainer.style.border = '1px solid red';
    textboxContainer.style.width = '100px';
    textboxContainer.style.height = '25px';
    textboxContainer.style.left = `${e.clientX - overlayRect.left}px`;
    textboxContainer.style.top = `${e.clientY - overlayRect.top}px`;
    console.log("Textbox container created");

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
    textbox.style.left = `${e.clientX - overlayRect.left}px`;
    textbox.style.top = `${e.clientY - overlayRect.top}px`;
    textbox.value = draggableElement.textContent;

    textboxContainer.appendChild(textbox);

    // Append the new textbox container to the overlay
    e.target.appendChild(textboxContainer);
    console.log("Textbox container appended to overlay");
    text_box_counter++;
    textboxContainer.id = `text-box-${text_box_counter}`;
    setupDragAndDrop(textboxContainer);

    textboxContainer.addEventListener('dragstart', e => {
        e.dataTransfer.setData("text/plain", e.target.id);
    });

    textboxContainer.addEventListener('dragend', e => {
        // Handle the drop logic here
        textboxContainer.style.left = `${e.clientX}px`;
        textboxContainer.style.top = `${e.clientY}px`;
    });
};



