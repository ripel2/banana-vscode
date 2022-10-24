const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const {getCurrentDateAsString, getSeverityAsVSCode, getReportErrorRange} = require('./utils.js');
// @ts-ignore
const codingStyleExtractData = require('../epitech_c_coding_style.json')

const bananaDiagnosticCollection = vscode.languages.createDiagnosticCollection('banana-coding-style');

const DOCKER_IMAGE_URL = 'ghcr.io/epitech/coding-style-checker:latest'
/**
 * Starts a command and returns a promise that resolves when the command is done.
 * @param {string} command 
 * @returns {Promise<>}
 */
async function startCommand(command) {
	return new Promise((resolve, reject) => {
		cp.exec(command, (err, stdout, stderr) => {
			if (err) {
				console.error(stderr)
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
}

/**
 * Processes a line from the report file and shows it in the editor diagnostics
 * @param {string} file 
 * @param {number} line 
 * @param {string} severity 
 * @param {string} language 
 * @param {string} subgroup 
 */
function processReportError(file, line, severity, language, subgroup) {
	let range = getReportErrorRange(file, line, severity, language, subgroup);
	let severityVSC = getSeverityAsVSCode(severity);
	let fullCode = `${language}-${subgroup}`;
	let message = fullCode; // default value if not found in the json

	for (let rule of codingStyleExtractData) {
		if (rule.subgroup === subgroup && rule.language === language) {
			message = rule.content.join("\n");
			break;
		}
	}

	let diagnostic = new vscode.Diagnostic(range, message, severityVSC);
	diagnostic.code = fullCode;
	diagnostic.source = 'Banana';

	let diagnostics = vscode.languages.getDiagnostics(vscode.Uri.file(file));
	diagnostics.push(diagnostic);

	bananaDiagnosticCollection.set(vscode.Uri.file(file), diagnostics);
}

/**
 * Processes the report file to display results in the editor.
 * @param {*} reportFile 
 * @returns {void}
 */
function processReportFile(reportFile) {
	const deliveryDir = `${vscode.workspace.workspaceFolders[0].uri.path}`;
	const errorRegex = new RegExp('(.*):([0-9]{0,4}): (MAJOR|MINOR|INFO):(C)-(.[0-9]{1,3})', 'gm');
	let fileContent = reportFile.toString()
	var match;

	while ((match = errorRegex.exec(fileContent)) !== null) {
		let [_, file, lineStr, severity, language, subgroup] = match;
		let line = parseInt(lineStr);

		file = deliveryDir + file.substring(1);
		processReportError(file, line, severity, language, subgroup);
	}
}

/**
 * Starts the check by pulling the official docker image and running it.
 * @returns {void}
 */
function startBanana() {
	if (vscode.workspace.workspaceFolders === undefined) {
		vscode.window.showErrorMessage("Banana: no workspace opened");
		return;
	}
	const deliveryDir = `${vscode.workspace.workspaceFolders[0].uri.path}`;
	const reportsDir = `${deliveryDir}/banana_reports/}`;

	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
	}, async (progress) => {
		var error;
		await startCommand(`mkdir -p "${reportsDir}"`);
		await startCommand(`chmod -R 777 "${reportsDir}"`);

		progress.report({ message: 'Running banana...' });
		await startCommand(`docker run --rm -i -v "${deliveryDir}":"/mnt/delivery" -v "${reportsDir}":"/mnt/reports" ${DOCKER_IMAGE_URL} "/mnt/delivery" "/mnt/reports"`)
		.catch((err) => {
			vscode.window.showErrorMessage("Banana failed: " + err);
			error = err;
		});
		if (error !== undefined) {
			console.error(error);
			return;
		}
		
		bananaDiagnosticCollection.clear();
		fs.readdirSync(reportsDir).forEach(file => {
			let fileObj = fs.readFileSync(`${reportsDir}/${file}`);

			processReportFile(fileObj);
		});

		await startCommand(`rm -rfd "${reportsDir}"`);
	});
}

/**
 * Removes all norm errors currently displayed in VSCode.
 * @returns {void}
 */
function clearAllBananaErrors() {
	bananaDiagnosticCollection.clear();
}

/**
 * Checks if the user is in the 'docker' user group.
 */
function checkDockerGroup() {
	startCommand('id -nG')
	.then((stdout) => {
		if (!stdout.includes('docker')) {
			vscode.window.showWarningMessage("Banana: user is not in the docker group. You may experience trouble while using the extension.",
			"Show me how to solve this")
			.then((choice) => {
				if (choice === "Show me how to solve this") {
					vscode.env.openExternal(vscode.Uri.parse("https://docs.docker.com/engine/install/linux-postinstall/"));
				}
			});
		}
	})
}

/**
 * Checks if Docker is installed on the system.
 */
function checkDockerIsInstalled() {
	startCommand('docker --version')
	.catch(() => {
		vscode.window.showErrorMessage("Banana: Docker is not installed on your system. Please install it to use this extension.",
		"Show me how to install Docker")
		.then((choice) => {
			if (choice === "Show me how to install Docker") {
				vscode.env.openExternal(vscode.Uri.parse("https://docs.docker.com/engine/install/"));
			}
		});
	});
}

/**
 * Pulls the latest docker image from the official repository.
 */
function pullLatestDockerImage() {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Banana',
	}, async (progress) => {
		progress.report({ message: 'Pulling latest docker image...' });
		await startCommand(`docker pull ${DOCKER_IMAGE_URL} && docker image prune -f`)
		.then(() => {
			progress.report({ message: 'Pulled latest docker image', increment: 100 });
		})
		.catch((err) => {
			console.error(err);
			progress.report({ message: 'Failed to pull latest docker image', increment: 0 });
		});

		await new Promise(resolve => setTimeout(resolve, 4000));
	});
}

function activate(context) {
	let startBananaDisp = vscode.commands.registerCommand('banana-vscode.startBanana', startBanana);
	let clearBananaDisp = vscode.commands.registerCommand('banana-vscode.clearAllBananaErrors', clearAllBananaErrors);

	context.subscriptions.push([clearBananaDisp, startBananaDisp]);
	checkDockerIsInstalled();
	checkDockerGroup();
	pullLatestDockerImage();
}

function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
