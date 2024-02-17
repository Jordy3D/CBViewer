class Chapter {
    constructor(name, files) {
        this.name = name;
        this.files = files;
    }
}

class Volume {
    constructor(name) {
        this.name = name;
        this.chapters = [];
        this.details = null;
    }

    addChapter(chapter) {
        this.chapters.push(chapter);
    }
}

const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

async function unzipCbv(file) {
    const zip = new JSZip();
    const data = await zip.loadAsync(file);
    const volumeName = file.name.split('.')[0];
    const volume = new Volume(volumeName);

    viewer.innerHTML = `<h1>Loading ${volumeName}...</h1>`;

    // count the number of .cbz files in the .cbv
    let chapterCount = Object.keys(data.files).filter(fileName => fileName.endsWith('.cbz')).length;
    let chapterIndex = 1;

    for (let fileName in data.files) {
        if (fileName.endsWith('.cbz')) {

            viewer.innerHTML = `<h1>Loading ${volumeName} | Chapter ${chapterIndex} of ${chapterCount}</h1>`;
            chapterIndex++;

            const fileData = await data.files[fileName].async('blob');
            const chapterZip = new JSZip();
            const chapterData = await chapterZip.loadAsync(fileData);
            const chapterName = fileName.split('.')[0];
            var chapterFiles = [];

            // extract the images from the chapter zip
            // TODO: try and do this as pages are requested instead of all at once to save memory, perhaps as an option for the user

            let pageCount = Object.keys(chapterData.files).filter(fileName => validImageExtensions.some(ext => fileName.endsWith(ext))).length;
            let pageIndex = 1;

            for (let fileName in chapterData.files) {
                if (validImageExtensions.some(ext => fileName.endsWith(ext))) {

                    viewer.innerHTML = `<h1>Loading ${volumeName} | Chapter ${chapterIndex} of ${chapterCount}</h1><h2>Page ${pageIndex} of ${pageCount}</h2>`;
                    pageIndex++;

                    const fileData = await chapterData.files[fileName].async('blob');
                    const file = new File([fileData], fileName);
                    const url = URL.createObjectURL(file);
                    chapterFiles.push(file);
                }
            }

            const chapter = new Chapter(chapterName, chapterFiles);
            volume.addChapter(chapter);
        }
        if (fileName.endsWith('.json')) {
            const fileData = await data.files[fileName].async('text');
            volume.details = JSON.parse(fileData);
        }
    }

    return volume;
}

async function unzipCbz(file) {
    const zip = new JSZip();
    const data = await zip.loadAsync(file);
    const volumeName = file.name.split('.')[0];
    const volume = new Volume(volumeName);

    viewer.innerHTML = `<h1>Loading ${volumeName}...</h1>`;

    // assume the .cbz is a single chapter
    const chapterName = volumeName;
    const chapterFiles = [];

    // extract the images from the chapter zip
    let pageCount = Object.keys(data.files).filter(fileName => validImageExtensions.some(ext => fileName.endsWith(ext))).length;
    let pageIndex = 1;

    for (let fileName in data.files) {
        if (validImageExtensions.some(ext => fileName.endsWith(ext))) {

            viewer.innerHTML = `<h1>Loading ${volumeName} | Chapter 1</h1><h2>Page ${pageIndex} of ${pageCount}</h2>`;
            pageIndex++;

            const fileData = await data.files[fileName].async('blob');
            const file = new File([fileData], fileName);
            const url = URL.createObjectURL(file);
            chapterFiles.push(file);
        }
    }

    const chapter = new Chapter(chapterName, chapterFiles);
    volume.addChapter(chapter);

    return volume;
}

async function unzipRar(file) {
    // not implemented yet
    viewer.innerHTML = '<h1>CBR files are not supported yet</h1>';
    return null;
}