import { displayPDF } from './displayingPDF.js';


// console.log(PDFDocument);

// async makes a function return a promise and allows us to use "await"
// await lets us wait for a promise to finish before continuing.
// Pretty sure fetch also returns a promise.
// Instead of using ".then" to wait for a promise to finish and then take the next step, we can use "await"
// Basically, "await" lets us write asynchronus code like synchronus code (1 line at a time)
// Important note: We can only use await when were INSIDE an async function.

let pages;
let pageObjects;

class Page {
    constructor(page) {
        const { width, height } = page.getSize();
        this.width = width;
        this.height = height;
    }
}

async function modifyPdf() {
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes)
    // const pages = pdfDoc.getPages()
    // const firstPage = pages[0]
    // const { width, height } = firstPage.getSize()
    pages = pdfDoc.getPages();
    pageObjects = pages.map(page => new Page(page));
}


async function editPDF(clientX, clientY, canvas) {
    const pdfDoc = await PDFLib.PDFDocument.load(await fetch(url).then(res => res.arrayBuffer()));
    const pages = pdfDoc.getPages();
    const text_size = 12; // Example size

    for (let i = 0; i < pageObjects.length; i++) {
        const page = pageObjects[i];
        const canvasRect = canvas.getBoundingClientRect();
        const finalX = clientX - canvasRect.left;
        const finalY = clientY - canvasRect.top;
        let cursorPage = pages[i];

        if (finalX >= 0 && finalX <= cursorPage.getWidth() && finalY >= 0 && finalY <= cursorPage.getHeight()) {
            cursorPage.drawText('Your Text Here', {
                x: finalX,
                y: finalY,
                size: text_size,
            });
        }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}




displayPDF(url).then(() => {
    return modifyPdf();
}).then(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.addEventListener('mousedown', (event) => {
            const initialX = event.clientX;
            const initialY = event.clientY;
            // console.log(`Initial coordinates: (${initialX}, ${initialY})`); // the ${} is like f strings in python but for javascript.
        });
        canvas.addEventListener('mousemove', (event) => {
            // Update coordinates as the user drags
            const updatedX = event.clientX;
            const updatedY = event.clientY;
            // console.log(`Updated coordinates: (${updatedX}, ${updatedY})`);
        });
        canvas.addEventListener('mouseup', (event) => {
            // Finalize coordinates and draw text
            editPDF(event.clientX, event.clientY, canvas).then((pdfBytes) => {
                console.log('PDF saved');
                console.log('Clearing and re-rendering PDF');
                const displayDiv = document.getElementById('pdf-display');
                while (displayDiv.firstChild) {
                    displayDiv.removeChild(displayDiv.firstChild);
                }
                const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
                displayPDF(url);
                console.log('called displayPDF');
            });
        });
    } else {
        console.error("Canvas not found");
    }
}).catch(error => {
    console.error("Error loading PDF:", error);
});




















// canvas.addEventListener('mousedown', (event) => {
//     // Capture initial coordinates
//     const initialX = event.clientX;
//     const initialY = event.clientY;
//     console.log(`Initial coordinates: (${initialX}, ${initialY})`); // the ${} is like f strings in python but for javascript.

// });

// canvas.addEventListener('mousemove', (event) => {
//     // Update coordinates as the user drags
// });

// canvas.addEventListener('mouseup', (event) => {
//     // Finalize coordinates and draw text
//     const text_x = event.clientX;
//     const text_y = event.clientY;
//     const text_size = 12; // Example size
//     firstPage.drawText('Your Text Here', {
//         x: text_x,
//         y: text_y,
//         size: text_size,
//     });
// });

// fetch(url)
//     .then(response => response.arrayBuffer())
//     .then(buffer => {
//         // Now you can use buffer with PDFDocument.load()
//     });

