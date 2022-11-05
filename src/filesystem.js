const fs = require('fs');

/**
 * Reads a file and returns all its lines as an array.
 * @param {string} file 
 * @returns {string[]}
 */
 function getAllFilesLines(file) {
	try {
		let lines = fs.readFileSync(file).toString().split("\n");

		return lines;
	} catch (err) {
		console.error(err);
		return [];
	}
}

/**
 * Reads all the project c source and header files and returns them as an array of objects
 * containing the file path and the file contents.
 * @param {string} folder
 * @param {string} subfolder
 * @returns {Array<{file: string, absolutePath: string, relativePath: string, lines: string[]}>}
 */
function getAllProjectFiles(folder, subfolder = '') {
	let files = fs.readdirSync(folder);
	let results = [];

	for (let file of files) {
		let absolutePath = `${folder}/${file}`;
		let stat = fs.statSync(absolutePath);

		if (stat.isDirectory()) {
			results = results.concat(getAllProjectFiles(absolutePath, subfolder + '/' + file));
		} else {
			if (!file.endsWith('.c') && !file.endsWith('.h') && file != 'Makefile') {
				continue;
			}
			results.push({
				file: file,
				absolutePath: absolutePath,
				relativePath: `.${subfolder}/${file}`,
				lines: getAllFilesLines(absolutePath)
			})
		}
	}
	return results;
}

module.exports = {
    getAllProjectFiles,
    getAllFilesLines
}
