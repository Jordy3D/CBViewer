
// Dropzone courtesy of https://jsfiddle.net/oL2akhtz/

const dropZone = document.getElementById('dropzone');
var visible = false;

function setDropZoneVisibility(vis) {
    if (vis)
        dropZone.style.visibility = "visible";
    else
        dropZone.style.visibility = "hidden";

    visible = vis;
}

function allowDrag(e) {
    if (true) {  // Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
}

function handleDrop(e) {
    e.preventDefault();
    setDropZoneVisibility(false);

    // log the files that were dropped
    let file = e.dataTransfer.files[0];
    console.log(file);

    // handle the file
    volume = loadVolume(file).then(() =>
        displayPage(volume, chapterIndex, pageIndex)
    );
}

// 1
window.addEventListener('dragenter', function (e) {
    // if the dropzone is not already visible
    if (!visible)
        setDropZoneVisibility(true);
});

// 2
dropZone.addEventListener('dragenter', allowDrag);
dropZone.addEventListener('dragover', allowDrag);

// 3
dropZone.addEventListener('dragleave', function (e) {
    // if the dropzone is left into the page (not into a child element)
    if (e.target === dropZone)
        setDropZoneVisibility(false);
});

// 4
dropZone.addEventListener('drop', handleDrop);