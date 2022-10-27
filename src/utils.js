const vscode = require('vscode');
const cp = require('child_process');

const {startCommand} = require('./system.js');

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
 * @param {string} file 
 * @param {number} line 
 * @param {string} severity 
 * @param {string} language 
 * @param {string} subgroup 
 * @param {Object} projectFile 
 * @returns {vscode.Range}
 */
function getSmartRange(file, line, severity, language, subgroup, projectFile) {
	var range = null;
	var skipTabsGroups = ["C3", "A1", "A2", "V1", "V2", "V3", "L5", "F8"];

	if (subgroup === "G7") {
		var lineContent = projectFile.lines[line - 1];
		var match = lineContent.match(/ +$/);

		if (match != null) {
			range = new vscode.Range(line - 1, match.index, line - 1, lineContent.length);
		}
	}
	if (subgroup === "F3") {
		range = new vscode.Range(line - 1, 79, line - 1, 69420);
	}
	if (subgroup === "L2") {
		var lineContent = projectFile.lines[line - 1];
		var match = lineContent.match(/^\s+/);

		if (match != null) {
			range = new vscode.Range(line - 1, 0, line - 1, match.index + match[0].length);
		}
	}
	if (skipTabsGroups.includes(subgroup)) {
		var lineContent = projectFile.lines[line - 1];
		var match = lineContent.match(/^\s+/);

		if (match != null && range) {
			range.start.translate(0, match.index + match[0].length);
		} else if (match != null) {
			range = new vscode.Range(line - 1, match.index + match[0].length, line - 1, 69420);
		}
	}
	return range;
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

/**
 * Checks if a given file is in the gitignore file of the project.
 * @param {string} file
 * @returns {boolean}
 */
function fileIsInGitignore(file) {
	const deliveryDir = `${vscode.workspace.workspaceFolders[0].uri.path}`;

	try {
		var result = cp.execSync(`cd ${deliveryDir} && git check-ignore ${file}`);

		return result.toString().trim() === file;
	} catch (err) {
		
	}
	return false;
}

module.exports = {
    getCurrentDateAsString,
    getSeverityAsVSCode,
    getReportErrorRange,
	fileIsInGitignore
}
