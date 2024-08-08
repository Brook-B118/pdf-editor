

let text_box_counter = 0;

export function createTextBox(e, draggableElement, overlayId) {
    const overlayRect = e.target.getBoundingClientRect();

    // create container
    const textboxContainer = document.createElement('div');
    textboxContainer.classList.add("newElement", "textboxContainer", "draggable"); // add .newEelement to all new elements to be able to save them.
    textboxContainer.setAttribute("draggable", "true");
    textboxContainer.style.position = 'absolute';
    textboxContainer.style.border = '1px solid red';
    textboxContainer.style.width = '100px';
    textboxContainer.style.height = '25px';
    textboxContainer.style.left = `${e.clientX - overlayRect.left}px`;
    textboxContainer.style.top = `${e.clientY - overlayRect.top}px`;
    console.log("Textbox container created");

    // create it's data-overlay-id attribute, do this to all new elements to be able to save their location.
    textboxContainer.setAttribute('data-overlay-id', overlayId);

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
    console.log("textboxcontainer data: ", textboxContainer)

    // Append the new textbox container to the overlay
    e.target.appendChild(textboxContainer);
    console.log("Textbox container appended to overlay");
    text_box_counter++;
    textboxContainer.id = `text-box-${text_box_counter}`;
    textboxContainer.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", textboxContainer.id);
    });
    textboxContainer.addEventListener("dragover", e => {
        e.preventDefault();
    })
};



