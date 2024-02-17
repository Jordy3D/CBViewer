
// Dropzone courtesy of https://jsfiddle.net/oL2akhtz/
// Modified in a few places

const dropZone = document.getElementById('dropzone');
var visible = false;

function setDropZoneVisibility(vis) {
    dropZone.style.visibility = vis ? "visible" : "hidden";
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
    loadVolume(file).then((volume) => {
        if (volume)
            displayPage(volume, chapterIndex, pageIndex);
    });
}

// 1
window.addEventListener('dragenter', function (e) {
    if (!visible) setDropZoneVisibility(true);
});

// 2
dropZone.addEventListener('dragenter', allowDrag);
dropZone.addEventListener('dragover', allowDrag);

// 3
dropZone.addEventListener('dragleave', function (e) {
    // if dragleave results in entering a child element, ignore it
    if (!e.relatedTarget || !this.contains(e.relatedTarget))
        setDropZoneVisibility(false);
});

// 4
dropZone.addEventListener('drop', handleDrop);