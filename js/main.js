var chapterIndex = 0;
var pageIndex = 0;

var volume = null;

const viewer = document.querySelector('.viewer');
const details = document.querySelector('.details');
const bookDetails = document.querySelector('.bookDetails');

async function loadVolume(file) {
    // set the page to a loading screen
    viewer.innerHTML = '<h1>Loading...</h1>';

    // reset the chapter and page index
    chapterIndex = 0;
    pageIndex = 0;

    // load the volume
    volume = await unzipCbv(file);
    console.log(volume);

    displayDetails(volume);
}

function displayDetails(volume) {
    if (!volume.details) {
        bookDetails.innerHTML = 'No details found.';
        return;
    }
    
    bookDetails.innerHTML = '';
    bookDetails.innerHTML = `<h2>${volume.name}</h2>`;

    // display the details
    for (let detail in volume.details) {
        let detailName = detail.replace(/_/g, ' ');
        detailName = detailName.replace(/\b\w/g, l => l.toUpperCase());
        // if detailName is "Isbn", change it to "ISBN"
        if (detailName === 'Isbn') detailName = 'ISBN';

        let detailValue = volume.details[detail];

        // if the detail is a list, display it as a list
        if (Array.isArray(detailValue)) {
            let list = detailName === 'Chapters' ? '<ol>' : '<ul>';
            for (let item of detailValue)
                list += `<li>${item}</li>`;
            list += detailName === 'Chapters' ? '</ol>' : '</ul>';
            detailValue = list;
        }

        bookDetails.innerHTML += `<div class="detail"><span class="detailName">${detailName}</span> <span class="detailValue">${detailValue}</span></div>`;
    }
}

async function displayPage(volume, chapterIndex, pageIndex) {
    viewer.innerHTML = '';

    const page = document.createElement('div');
    const file = volume.chapters[chapterIndex].files[pageIndex];
    let pageUrl = URL.createObjectURL(file);
    page.classList.add('page');
    page.classList.add('shadow');
    page.style.backgroundImage = `url(${pageUrl})`;
    page.style.backgroundSize = 'contain';
    page.style.backgroundRepeat = 'no-repeat';
    page.style.backgroundPosition = 'center';

    viewer.appendChild(page);

    details.innerHTML = '';
    details.innerHTML = `Chapter ${chapterIndex + 1} of ${volume.chapters.length} | Page ${pageIndex + 1} of ${volume.chapters[chapterIndex].files.length}`;

    document.title = `${volume.name} | Chapter ${chapterIndex + 1} | Page ${pageIndex + 1}`;

    disableIfNoNextPrev();
}

function prevPage() {
    if (pageIndex > 0) {
        pageIndex--;
        displayPage(volume, chapterIndex, pageIndex);
    }
    // wrap around to the last page of the previous chapter
    else if (chapterIndex > 0) {
        chapterIndex--;
        pageIndex = volume.chapters[chapterIndex].files.length - 1;
        displayPage(volume, chapterIndex, pageIndex);
    }
}

function nextPage() {
    if (pageIndex < volume.chapters[chapterIndex].files.length - 1) {
        pageIndex++;
        displayPage(volume, chapterIndex, pageIndex);
    }
    // wrap around to the first page of the next chapter
    else if (chapterIndex < volume.chapters.length - 1) {
        chapterIndex++;
        pageIndex = 0;
        displayPage(volume, chapterIndex, pageIndex);
    }
}

function nextChapter() {
    if (chapterIndex < volume.chapters.length - 1) {
        chapterIndex++;
        pageIndex = 0;
        displayPage(volume, chapterIndex, pageIndex);
    }
}

function prevChapter() {
    if (chapterIndex > 0) {
        chapterIndex--;
        pageIndex = 0;
        displayPage(volume, chapterIndex, pageIndex);
    }
}

function disableIfNoNextPrev() {
    document.getElementById('prevChapter').disabled = chapterIndex === 0;
    document.getElementById('prevPage').disabled = chapterIndex === 0 && pageIndex === 0;
    document.getElementById('nextPage').disabled = chapterIndex === volume.chapters.length - 1 && pageIndex === volume.chapters[chapterIndex].files.length - 1;
    document.getElementById('nextChapter').disabled = chapterIndex === volume.chapters.length - 1;
}


// EVENT LISTENERS

document.getElementById('submit').addEventListener('click', async () => {
    const file = document.getElementById('file').files[0];
    volume = await loadVolume(file).then(() =>
        displayPage(volume, chapterIndex, pageIndex)
    );
});

document.getElementById('prevChapter').addEventListener('click', prevChapter);
document.getElementById('prevPage').addEventListener('click', prevPage);
document.getElementById('nextPage').addEventListener('click', nextPage);
document.getElementById('nextChapter').addEventListener('click', nextChapter);

const keyMap = {
    'ArrowLeft': prevPage,
    'ArrowRight': nextPage,
    'ArrowUp': nextChapter,
    'ArrowDown': prevChapter
};

document.addEventListener('keydown', (e) => {
    const action = keyMap[e.key];
    if (action) action();
});

// add the ability to double-click the page to zoom in and out
document.querySelector('.viewer').addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('page')) e.target.classList.toggle('zoom');
});