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
 * Returns the range for a given report error.
 * @param {string} file
 * @param {number} line
 * @param {string} severity
 * @param {string} language 
 * @param {string} subgroup 
 * @returns {vscode.Range}
 */
function getReportErrorRange(file, line, severity, language, subgroup) {
	var endChar = 69420;

	return new vscode.Range(line - 1, 0, line - 1, endChar);
}

module.exports = {
    getCurrentDateAsString,
    getSeverityAsVSCode,
    getReportErrorRange
}
