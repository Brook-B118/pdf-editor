// let changes = [];
// let existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
// let pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes)

const scale = 1.5;
const dpi = 96;
const padding = 2; // padding in pixels
const border = 4; // border in pixels

let saveQueue = Promise.resolve();

export function autoSave(documentId) {
    // Add the autosave function to the queue by attaching .then
    saveQueue = saveQueue.then(async () => {
        let currentChanges = {
            timestamp: new Date().toISOString(),
            data: []
        };

        document.querySelectorAll('.newElement').forEach(element => {
            const offsetX = parseFloat(element.style.left);
            const offsetY = parseFloat(element.style.top);
            const width = element.getBoundingClientRect().width;
            const height = element.getBoundingClientRect().height;
            const nestedInputElement = element.querySelector('input.textbox, textarea.textbox');
            let elementId = element.id;
            let background_color = '';
            let border_color = '';
            let elementType;
            let content = '';
            let font_family = '';

            if (element.classList.contains('textboxContainer')) {
                elementType = 'textboxContainer';
            } else if (element.classList.contains('shape')) {
                elementType = 'shape';
                background_color = element.style.backgroundColor;
                border_color = element.style.borderColor;
            } else if (element.classList.contains('signatureField')) {
                elementType = 'signatureField';
                content = element.value;
                font_family = element.style.fontFamily;
            }

            if (nestedInputElement) {
                if (nestedInputElement.tagName.toLocaleLowerCase() === 'textarea') {
                    content = nestedInputElement.value;
                    font_family = nestedInputElement.style.fontFamily;
                } else {
                    content = nestedInputElement.value;
                }
            }

            currentChanges.data.push({
                document_id: documentId,
                element_id: elementId,
                type: elementType,
                content: content,
                element_width: width,
                element_height: height,
                position_x: offsetX,
                position_y: offsetY,
                overlayId: element.getAttribute('data-overlay-id'),
                background_color: background_color,
                border_color: border_color,
                font_family: font_family
            });

        });


        try {
            // Use async/await to handle the fetch request
            let response = await fetch('/autosave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    document_id: documentId,
                    changes: currentChanges.data
                })
            });
            let data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
        }

    });
}

// Need this to put the css color into values that pdf-lib expects
const namedColors = {
    red: "rgb(255, 0, 0)",
    blue: "rgb(0, 0, 255)",
    // Add more named colors as needed
};

function cssColorToRgb(color) {
    if (namedColors[color]) {
        color = namedColors[color];
    }
    const rgb = color.match(/\d+/g).map(Number);
    return { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 };
}


// Change this to download button
document.getElementById('save-button').addEventListener('click', async () => {
    let changes = [];
    let existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    let pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const fontkit = window.fontkit;
    pdfDoc.registerFontkit(fontkit);
    const parisienneFontBytes = await fetch('/static/fonts/Parisienne-Regular.ttf').then(res => res.arrayBuffer());

    const timesNewRomanFont = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const parisienneFont = await pdfDoc.embedFont(parisienneFontBytes);
    console.log("new custom font:", parisienneFont);

    document.querySelectorAll('.newElement').forEach(element => {
        const offsetX = (parseFloat(element.style.left) + 2 * (padding - border)) * (72 / dpi);
        const offsetY = (parseFloat(element.style.top) + 2 * (padding + border + 1)) * (72 / dpi); // the + 1 is too account for the text being a bit too high, consider figuring out lineHeight and implementing it so this can be dynamic.
        const width = (element.getBoundingClientRect().width + 2 * (padding - border)) * (72 / dpi);
        const height = (element.getBoundingClientRect().height + 2 * (padding + border + 1)) * (72 / dpi); // the 2 * padding and border is to account for the padding and border top and bottom being the same.
        const nestedInputElement = element.querySelector('input.textbox, textarea.textbox'); //querySelector checks if the element has any input elements within it (like the textbox inside the container)

        let elementType = '';
        let borderColor = '';
        let fillColor = '';
        let borderWidth = '';
        let content = '';
        let font_family = '';


        if (element.classList.contains('textboxContainer')) {
            elementType = 'textboxContainer';
        } else if (element.classList.contains('shape')) {
            elementType = 'shape';
            borderColor = cssColorToRgb(element.style.borderColor);
            fillColor = cssColorToRgb(element.style.backgroundColor);
            borderWidth = parseInt(element.style.borderWidth.match(/\d+/)[0]);
        } else if (element.classList.contains('signatureField')) {
            elementType = 'signatureField';
            content = DOMPurify.sanitize(element.value); // Ensure you get the value directly from the element
            console.log("Element:", element); // Debug statement
            font_family = element.style.fontFamily;
            console.log("signatureField font family:", font_family);
        }

        if (nestedInputElement) {
            if (nestedInputElement.tagName.toLowerCase() === 'textarea') {
                content = DOMPurify.sanitize(nestedInputElement.value);
                font_family = nestedInputElement.style.fontFamily;
            } else {
                content = DOMPurify.sanitize(nestedInputElement.value);
            }
        }

        let fontFamilyBytes;

        if (font_family === 'Times New Roman') {
            fontFamilyBytes = timesNewRomanFont;
        } else if (font_family === 'Arial') {
            fontFamilyBytes = helveticaFont;
        } else if (font_family === 'cursive') {
            fontFamilyBytes = parisienneFont;
        }

        changes.push({
            type: elementType,
            element_width: width,
            element_height: height,
            borderColor: borderColor,
            fillColor: fillColor,
            borderWidth: borderWidth,
            text: content,
            x: offsetX,
            y: offsetY,
            overlayId: element.getAttribute('data-overlay-id'),
            font_family: fontFamilyBytes,
        });
    });
    applyChangesToPdf(pdfDoc, changes);
    savePdf(pdfDoc);
});


async function applyChangesToPdf(pdfDoc, changes) {
    // get the pdf pages
    const pages = pdfDoc.getPages();
    // loop through each change
    changes.forEach(change => {
        console.log("Applying change:", change);
        // for the current change, it's page is the pages index of overlayID which was saved as `overlay[i]`
        // Have to use match method here to get the number itself, the match method with the regular expression \d+ will return
        // the entire sequence of digits as a single string, not individual digits. So for "overlay111", it will return ["111"], not ["1", "1", "1"].
        // the [0] after accesses the first match, so this will allow me to get only the index number from the overlayID.
        const pageIndex = parseInt(change.overlayId.match(/\d+/)[0]);
        const page = pages[pageIndex - 1]; // -1 because overlay-id had to start with 1 since pdf.js rendering starts with 1 and not 0. pdf-lib pages starts with 0 though.

        // PDF coordinates typically start from the bottom-left corner, 
        // whereas many web-based coordinate systems start from the top-left.
        const firstPage = pages[0];
        console.log("first page height:", firstPage.getHeight());

        // To adjust for this, you might need to transform the y-coordinate. 
        // Subtract the y-coordinate from the page height:
        const pageWidth = (page.getWidth()) * scale; // for bug fixing
        const pageHeightBeforeScale = (page.getHeight()); // for bug fixing
        console.log('pageHeight before scale:', pageHeightBeforeScale) // for bug fixing
        const pageHeight = (page.getHeight());
        console.log('pageHeight:', pageHeight); // for bug fixing
        console.log('change.y:', change.y); // for bug fixing
        const adjustedY = pageHeight - (change.y);

        if (change.type === 'textboxContainer' || change.type === 'signatureField') {
            page.drawText(change.text, {
                x: change.x,
                y: adjustedY,
                size: 12,
                color: PDFLib.rgb(0, 0, 0),
                font: change.font_family,
            });
        } else if (change.type === 'shape') {
            // Add logic to draw shapes here, e.g., drawRectangle, drawEllipse, etc.
            page.drawRectangle({
                x: change.x / scale,
                y: (adjustedY / scale) - (change.element_height / scale),
                width: change.element_width / scale,
                height: change.element_height / scale,
                color: PDFLib.rgb(change.fillColor.r, change.fillColor.g, change.fillColor.b),
                borderColor: PDFLib.rgb(change.borderColor.r, change.borderColor.g, change.borderColor.b),
                borderWidth: change.borderWidth / scale,
            });
        }
    });
}

async function savePdf(pdfDoc) {
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}




// PDF coordinates typically start from the bottom-left corner, 
// whereas many web-based coordinate systems start from the top-left.

// To adjust for this, you might need to transform the y-coordinate. 
// Subtract the y-coordinate from the page height: