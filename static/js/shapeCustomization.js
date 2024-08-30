
export function addShapeEventListeners(shapeId) {
    const shape = document.getElementById(shapeId);
    const computedStyle = window.getComputedStyle(shape).backgroundColor;

    // Customize shape inside the container that was passed through

    const namedColorsToHex = {
        red: "#FF0000",
        blue: "#0000FF",
        // Add more named colors as needed
    };


    function cssColorToHEX(color) {
        if (namedColorsToHex[color]) {
            color = namedColorsToHex[color];
            return color;
        } else {
            const rgb = (color) => color.match(/\d+/g).map(Number);
            const rgbValues = rgb(computedStyle);
            const r = rgbValues[0];
            const g = rgbValues[1];
            const b = rgbValues[2];
            const rgbToHex = (r, g, b) => '#' + [r, g, b].map(color => color.toString(16).padStart(2, '0')).join('')
            return rgbToHex(r, g, b);
        }
    }

    const fillColorSelector = document.getElementById('fill-color-selector');

    fillColorSelector.value = cssColorToHEX(shape.style.backgroundColor);

    fillColorSelector.addEventListener('change', function (event) {
        shape.style.backgroundColor = event.target.value;
    })

    document.getElementById('delete-element').addEventListener('click', function () {
        fetch('/remove_element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Includes CSRF token
            },
            body: JSON.stringify({
                document_id: documentId,
                element_id: shapeId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(shapeId).remove();
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