


export function createTextBox(e, draggableElement) {
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
    console.log("Toolbar created");

    // Add buttons for bold, italic, etc.
    const boldButton = document.createElement('button');
    boldButton.textContent = 'B';
    toolbar.appendChild(boldButton);
    toolbar.style.position = 'absolute';
    toolbar.style.left = '0';
    toolbar.style.top = '-30px'; // Adjust as needed

    // Append Toolbar to Textbox Container
    textboxContainer.appendChild(toolbar);
    console.log("Toolbar appended to textbox container");

    // Create a new editable textbox
    const textbox = document.createElement('input');
    textbox.type = 'text';
    textbox.classList.add('textbox');
    console.log("Textbox created");
    textbox.style.width = '100%';
    textbox.style.height = '100%';
    textbox.style.boxSizing = 'border-box';
    textbox.style.left = `${e.clientX - overlayRect.left}px`;
    textbox.style.top = `${e.clientY - overlayRect.top}px`;
    textbox.value = draggableElement.textContent;
    textboxContainer.appendChild(textbox);
    console.log("Textbox appended to textbox container");


    // Append the new textbox container to the overlay
    e.target.appendChild(textboxContainer);
    console.log("Textbox container appended to overlay");

};
