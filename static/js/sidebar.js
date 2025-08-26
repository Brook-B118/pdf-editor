// document.querySelector('.navbar-toggler').addEventListener('click', function () {
//     document.getElementById('sidebar-container').classList.toggle('expanded');
// });

// Called the hamburger icon 'collapsed-sidebar' but maybe there is a way to name it, not sure yet. Either way this allows me to open and close the sidebar.
document.querySelector('.collapsed-sidebar').addEventListener('click', function () {
    document.querySelector('.vertical-column-wrapper').classList.toggle('collapsed') // slides sidebar 
    document.querySelector('.pdf-container').classList.toggle('extended') // slides pdf container
})

// When the elements icon is clicked in the sidebar, the sidepanel inner html will display the element blocks
document.querySelector(".show-element-blocks-bar").addEventListener("click", function () {

    const sidepanel = document.querySelector(".sidepanel");
    sidepanel.innerHTML = ""; // clear old content

    const container = document.createElement("div");
    container.id = "elements-container";
    container.classList.add("elements-section");

    // element definition: include class name as well as data-type
    const elements = [
    {
        id: "new-text-box-block",
        type: "text-block",
        className: "new-text-box-block",
        label: "Text Block",
    },
    {
        id: "new-shape-block",
        type: "shape-block",
        className: "new-shape-block",
        label: "Shape Block",
    },
    {
        id: "new-signatureField-block",
        type: "signatureField-block",
        className: "new-signatureField-block",
        label: "Signature Block",
    },
    {
        id: null,
        type: "text-block",
        className: null,
        label: "Example Block",
    },
    ];

    for (const el of elements) {
    const block = document.createElement("div");
    block.classList.add("element-block");
    if (el.className) block.classList.add(el.className);
    if (el.id) block.id = el.id;
    block.setAttribute("data-type", el.type);
    block.textContent = el.label;

    container.appendChild(block);
    }

    sidepanel.appendChild(container);

    // Add the draggable functionality back to the element blocks whenever the sidepanel loads them
    document.querySelectorAll('.element-block').forEach((block) => {
        block.classList.add("draggable");
        block.setAttribute("draggable", "true");
        block.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", block.id);
        });
    });

    // document.querySelector(".sidepanel").innerHTML = `
    //     <div id="elements-container" class="elements-section">
    //         <div class="element-block new-text-box-block" id="new-text-box-block" data-type="text-block">Text Block</div>
    //         <div class="element-block new-shape-block" id="new-shape-block" data-type="shape-block">Shape Block</div>
    //         <div class="element-block new-signatureField-block" id="new-signatureField-block" data-type="signatureField-block">Signature Block</div>
    //         <div class="element-block" data-type="text-block">Example Block</div>
    //     </div>
    // `;
    // // Add the draggable functionality back to the element blocks whenever the sidepanel loads them
    // document.querySelectorAll('.element-block').forEach((block) => {
    //     block.classList.add("draggable");
    //     block.setAttribute("draggable", "true");
    //     block.addEventListener("dragstart", e => {
    //         e.dataTransfer.setData("text/plain", block.id);
    //     });
    // });
});

