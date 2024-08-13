let changes = [];
let existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
let pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes)

export function autoSave(documentId) {
    let versionHistory = JSON.parse(localStorage.getItem('versionHistory')) || {};
    let currentChanges = {
        timestamp: new Date().toISOString(),
        changes: []
    };

    document.querySelectorAll('.newElement').forEach(element => {
        const offsetX = parseFloat(element.style.left);
        const offsetY = parseFloat(element.style.top);
        const inputElement = element.querySelector('input.textbox');
        let elementType = 'textboxContainer';
        let text = '';
        if (inputElement) {
            text = inputElement.value;
        }

        currentChanges.changes.push({
            type: elementType,
            text: text,
            x: offsetX,
            y: offsetY,
            overlayId: element.getAttribute('data-overlay-id')
        });
    });

    if (!versionHistory[documentId]) {
        versionHistory[documentId] = [];
    }
    versionHistory[documentId].push(currentChanges);
    localStorage.setItem('versionHistory', JSON.stringify(versionHistory));
}


// Change this to download button
document.getElementById('save-button').addEventListener('click', () => {
    changes = [];
    document.querySelectorAll('.newElement').forEach(element => {
        const offsetX = parseFloat(element.style.left);
        const offsetY = parseFloat(element.style.top);
        const inputElement = element.querySelector('input.textbox');
        changes.push({
            text: inputElement.value,
            x: offsetX,
            y: offsetY,
            overlayId: element.getAttribute('data-overlay-id')
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
        // for the current change, it's page is the pages index of overlayID which was saved as `overlay[i]`
        // Have to use match method here to get the number itself, the match method with the regular expression \d+ will return
        // the entire sequence of digits as a single string, not individual digits. So for "overlay111", it will return ["111"], not ["1", "1", "1"].
        // the [0] after accesses the first match, so this will allow me to get only the index number from the overlayID.
        const pageIndex = parseInt(change.overlayId.match(/\d+/)[0]);
        const page = pages[pageIndex - 1]; // -1 because overlay-id had to start with 1 since pdf.js rendering starts with 1 and not 0. pdf-lib pages starts with 0 though.

        // PDF coordinates typically start from the bottom-left corner, 
        // whereas many web-based coordinate systems start from the top-left.

        // To adjust for this, you might need to transform the y-coordinate. 
        // Subtract the y-coordinate from the page height:
        const pageHeight = page.getHeight();
        const adjustedY = pageHeight - change.y;
        page.drawText(change.text, {
            x: change.x,
            y: adjustedY,
            size: 12,
            color: PDFLib.rgb(0, 0, 0),
        });
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