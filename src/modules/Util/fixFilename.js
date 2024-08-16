export const fixFilename = (filename) => {
    if (filename.indexOf('.') === 0) {
        return '[.]' + filename.substring(1);
    }

    return filename;
};