
export function addTextboxEventListeners(textboxContainerId) {
    const container = document.getElementById(textboxContainerId);
    const textbox = container.querySelector('textarea');

    // Customize textbox inside the container that was passed through

    document.getElementById('align-left').addEventListener('click', function () {
        textbox.style.textAlign = 'left';
    });

    document.getElementById('align-center').addEventListener('click', function () {
        textbox.style.textAlign = 'center';
    });

    document.getElementById('align-right').addEventListener('click', function () {
        textbox.style.textAlign = 'right';
    });

    document.getElementById('font-selector').addEventListener('change', function (event) {
        textbox.style.fontFamily = event.target.value;
    });

    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
    const fontSizeSelector = document.getElementById('font-size-selector');

    fontSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size}`;
        fontSizeSelector.appendChild(option);
    });

    fontSizeSelector.value = parseInt(window.getComputedStyle(textbox).fontSize);

    fontSizeSelector.addEventListener('change', function (event) {
        textbox.style.fontSize = `${event.target.value}px`; // the fontSize expects a value with units like 'px'.
    });

    document.getElementById('delete-element').addEventListener('click', function () {
        fetch('/remove_element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Includes CSRF token
            },
            body: JSON.stringify({
                document_id: documentId,
                element_id: textboxContainerId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(textboxContainerId).remove();
                    console.log('Sucess:', data);
                } else {
                    alert('Error removing Textbox container element')
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            });
    })
}

// Export the function if using modules
// export { addTextboxEventListeners };