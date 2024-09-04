import { autoSave } from "./savingPDF.js";

export function addsignatureFieldEventListeners(signatureFieldId) {
    const signatureField = document.getElementById(signatureFieldId);
    const signatureInput = document.getElementById('type-signature');
    const signaturePreview = document.getElementById('signature-content');

    // This part autofills the input field and the preview div with what is already in the signatureField
    // I am doing this so that users have to edit the signature in the sidepanel first (they can see changes live in the preview in the sidepanel) before signing.
    const currentSignature = signatureField.value; // Replace with the actual current signature
    const currentAlignment = signatureField.style.textAlign; // Replace with the actual current alignment
    const currentFontFamily = signatureField.style.fontFamily;
    const currentFontSize = signatureField.style.fontSize;

    signatureInput.value = currentSignature;
    signaturePreview.textContent = currentSignature;
    signaturePreview.style.textAlign = currentAlignment;
    signaturePreview.style.fontFamily = currentFontFamily;
    signaturePreview.style.fontSize = currentFontSize;


    signatureInput.addEventListener('input', function () {
        signaturePreview.textContent = signatureInput.value;
    });

    document.getElementById('submit-signature').addEventListener('click', function () {
        signatureField.value = signatureInput.value;
        signatureField.style.textAlign = signaturePreview.style.textAlign;
        signatureField.style.fontFamily = signaturePreview.style.fontFamily;
    })

    document.getElementById('align-left').addEventListener('click', function () {
        signaturePreview.style.textAlign = 'left';
    });

    document.getElementById('align-center').addEventListener('click', function () {
        signaturePreview.style.textAlign = 'center';
    });

    document.getElementById('align-right').addEventListener('click', function () {
        signaturePreview.style.textAlign = 'right';
    });

    document.getElementById('font-selector').addEventListener('change', function (event) {
        signaturePreview.style.fontFamily = event.target.value;
    });

    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
    const fontSizeSelector = document.getElementById('font-size-selector');

    fontSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size}`;
        fontSizeSelector.appendChild(option);
    });

    fontSizeSelector.value = parseInt(window.getComputedStyle(signaturePreview).fontSize);

    fontSizeSelector.addEventListener('change', function (event) {
        signaturePreview.style.fontSize = `${event.target.value}px`; // the fontSize expects a value with units like 'px'.
    });

    let computedStyle;
    // const computedStyle = window.getComputedStyle(signatureField).backgroundColor;

    // Customize signatureField inside the container that was passed through
    const namedColorsToHex = {
        red: "#FF0000",
        blue: "#0000FF",
        // Add more named colors as needed
    };


    function cssColorToHEX(color, computedStyle) {
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

    fillColorSelector.value = cssColorToHEX(signatureField.style.backgroundColor, computedStyle = window.getComputedStyle(signatureField).backgroundColor);

    fillColorSelector.addEventListener('change', function (event) {
        signatureField.style.backgroundColor = event.target.value;
        autoSave(documentId);
    })

    const borderColorSelector = document.getElementById('border-color-selector');

    borderColorSelector.value = cssColorToHEX(signatureField.style.borderColor, computedStyle = window.getComputedStyle(signatureField).borderColor);

    borderColorSelector.addEventListener('change', function (event) {
        signatureField.style.borderColor = event.target.value;
        autoSave(documentId);
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
                element_id: signatureFieldId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(signatureFieldId).remove();
                    console.log('Sucess:', data);
                } else {
                    alert('Error removing signatureFieldId element')
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            });
    })
}