var chapterIndex = 0;
var pageIndex = 0;

var volume = null;

const viewer = document.querySelector('.viewer');
const details = document.querySelector('.details');
const bookDetails = document.querySelector('.bookDetails');

const fileInput = document.getElementById('file');

const validFileTypes = [
    'cbv',
    'cbz',
    'zip',
    'cbr'
]

// set fileInput to accept all valid file types
fileInput.accept = validFileTypes.map(ext => `.${ext}`).join(',');


async function loadVolume(file) {
    // set the page to a loading screen
    viewer.innerHTML = '<h1>Loading...</h1>';

    // reset the chapter and page index
    chapterIndex = 0;
    pageIndex = 0;

    let ext = file.name.split('.').pop();

    if (!validFileTypes.includes(ext)) {
        console.log('Invalid file type');
        viewer.innerHTML = '<h1>Invalid file type</h1>';
        return;
    }
    else if (ext === 'cbv')
        volume = await unzipCbv(file);
    else if (ext === 'cbz' || ext === 'zip')
        volume = await unzipCbz(file);
    else if (ext === 'cbr')
        volume = await unzipRar(file);
    else
        viewer.innerHTML = '<h1>Error loading volume</h1>';

    displayDetails(volume);

    return volume;
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

const displayAsDiv = false;
async function displayPage(volume, chapterIndex, pageIndex) {
    viewer.innerHTML = '';

    var page = null;

    if (displayAsDiv) {
        page = document.createElement('div');
        const file = volume.chapters[chapterIndex].files[pageIndex];
        let pageUrl = URL.createObjectURL(file);
        page.classList.add('page');
        page.classList.add('shadow');
        page.style.backgroundImage = `url(${pageUrl})`;
        page.style.backgroundSize = 'contain';
        page.style.backgroundRepeat = 'no-repeat';
        page.style.backgroundPosition = 'center';
    }
    else {
        page = document.createElement('img');
        const file = volume.chapters[chapterIndex].files[pageIndex];
        let pageUrl = URL.createObjectURL(file);
        page.src = pageUrl;
        page.classList.add('page');
    }

    viewer.appendChild(page);

    displayPositionDetails();

    document.title = `${volume.name} | Chapter ${chapterIndex + 1} | Page ${pageIndex + 1}`;

    disableIfNoNextPrev();
}

function displayPositionDetails() {
    details.innerHTML = `Chapter <span class="chapterIndex">${chapterIndex + 1}</span> of <span class="chapterCount">${volume.chapters.length}</span> | Page <span class="pageIndex">${pageIndex + 1}</span> of <span class="pageCount">${volume.chapters[chapterIndex].files.length}</span>`;
    addSkipEvents();
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
    loadVolume(file).then((volume) => {
        if (volume)
            displayPage(volume, chapterIndex, pageIndex);
    });
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
    const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
    if (action && !isInput) action();
});

// add the ability to double-click the page to zoom in and out
// document.querySelector('.viewer').addEventListener('dblclick', (e) => {
//     if (e.target.classList.contains('page')) e.target.classList.toggle('zoom');
// });

// add toggle to #toggleFit to toggle between .viewer.fit and .viewer.width
document.getElementById('toggleFit').addEventListener('click', () => {
    viewer.classList.toggle('fit');
    viewer.classList.toggle('width');

    let fitToggle = document.getElementById('toggleFit');
    fitToggle.innerHTML = viewer.classList.contains('fit') ? 'Fit Height' : 'Fit Width';
});

// toggle .night existing on body
document.getElementById('toggleNight').addEventListener('click', () => {
    document.body.classList.toggle('night');
    let nightToggle = document.getElementById('toggleNight');
    nightToggle.innerHTML = document.body.classList.contains('night') ? 'Night Mode' : 'Day Mode';
});

// touch zones
document.getElementById('touchLeft').addEventListener('click', prevPage);
document.getElementById('touchRight').addEventListener('click', nextPage);
document.getElementById('touchLeftMinor').addEventListener('click', prevChapter);
document.getElementById('touchRightMinor').addEventListener('click', nextChapter);

// skip to chapter and page
function addSkipEvents() {
    const addSkipEvent = (selector, max, value, updateValue) => {
        document.querySelector(selector).addEventListener('click', () => {
            let element = document.querySelector(selector);
            element.replaceWith(createElement({ type: 'input', className: selector.slice(1) }));

            element = document.querySelector(selector);
            element.setAttribute('type', 'number');
            element.setAttribute('min', 1);
            element.setAttribute('max', max);
            element.setAttribute('value', value + 1);
            element.focus();

            const update = () => {
                const newValue = element.value - 1;
                if (newValue === value) {
                    displayPositionDetails();
                    return;
                }

                updateValue(newValue);
                displayPage(volume, chapterIndex, pageIndex);
            };

            element.addEventListener('blur', update);
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') update();
            });
        });
    };

    addSkipEvent('.chapterIndex', volume.chapters.length, chapterIndex, newValue => chapterIndex = newValue);
    addSkipEvent('.pageIndex', volume.chapters[chapterIndex].files.length, pageIndex, newValue => pageIndex = newValue);
}


// Mobile support

const fileSelector = document.getElementById('file');
document.querySelector('main').addEventListener('dblclick', () => {
    if (!volume)
        document.getElementById('file').click();
});

fileSelector.onchange = async () => {
    const file = fileSelector.files[0];
    loadVolume(file).then((volume) => {
        if (volume)
            displayPage(volume, chapterIndex, pageIndex);
    });
};


// Helpers

function createElement(options = {}) {
    const {
        type = 'div',
        text = '',
        className = '',
        id = ''
    } = options

    let element = document.createElement(type);
    if (text) element.textContent = text;
    if (className) element.className = className;
    if (id) element.id = id;

    return element;
}