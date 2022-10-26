const vscode = require('vscode');

/**
 * Returns the current date as a string safe to use in a filename.
 * @returns {string}
 */
 function getCurrentDateAsString() {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const pad = (n) => n.padStart(2, '0');

	return `${year}-${pad(month)}-${pad(day)}_${pad(hours)}-${pad(minutes)}-${pad(seconds)}`;
}

/**
 * Returns the coding style error as a VSCode compatible DiagnosticSeverity
 * @returns {vscode.DiagnosticSeverity}
 */
function getSeverityAsVSCode(severity) {
	if (severity === "MAJOR" || severity === "MINOR") {
		return vscode.DiagnosticSeverity.Error
	}
	return vscode.DiagnosticSeverity.Information;
}

/**
 * Tries to find the best range to highlight in the editor using specific rules.
 * @param {*} file 
 * @param {*} line 
 * @param {*} severity 
 * @param {*} language 
 * @param {*} subgroup 
 * @param {*} projectFile 
 * @returns 
 */
function getSmartRange(file, line, severity, language, subgroup, projectFile) {
	if (subgroup === "G7") {
		var lineContent = projectFile.lines[line - 1];
		var match = lineContent.match(/ +$/);

		if (match != null) {
			return new vscode.Range(line - 1, match.index, line - 1, lineContent.length);
		}
	}
	if (subgroup === "F3") {
		return new vscode.Range(line - 1, 79, line - 1, 69420);
	}
	if (subgroup === "L2") {
		var lineContent = projectFile.lines[line - 1];
		var match = lineContent.match(/^\s+/);

		if (match != null) {
			return new vscode.Range(line - 1, 0, line - 1, match.index + match[0].length);
		}
	}
	return null;
}

/**
 * Returns the range for a given report error.
 * @param {string} file
 * @param {number} line
 * @param {string} severity
 * @param {string} language 
 * @param {string} subgroup 
 * @param {Object} projectFile The project file object containing the file path and the file contents.
 * @returns {vscode.Range}
 */
function getReportErrorRange(file, line, severity, language, subgroup, projectFile) {
	var endChar = 69420;

	if (projectFile != undefined) {
		var smartRange = getSmartRange(file, line, severity, language, subgroup, projectFile);

		if (smartRange != null) {
			return smartRange;
		}
	}
	return new vscode.Range(line - 1, 0, line - 1, endChar);
}

module.exports = {
    getCurrentDateAsString,
    getSeverityAsVSCode,
    getReportErrorRange
}
