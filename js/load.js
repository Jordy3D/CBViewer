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

    for (let fileName in data.files) {
        if (fileName.endsWith('.cbz')) {
            const fileData = await data.files[fileName].async('blob');
            const chapterZip = new JSZip();
            const chapterData = await chapterZip.loadAsync(fileData);
            const chapterName = fileName.split('.')[0];
            var chapterFiles = [];

            // extract the images from the chapter zip
            // TODO: try and do this as pages are requested instead of all at once to save memory, perhaps as an option for the user
            for (let fileName in chapterData.files) {
                if (validImageExtensions.some(ext => fileName.endsWith(ext))) {
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