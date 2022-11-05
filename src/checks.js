const vscode = require('vscode');

const {startCommand} = require('./system.js');

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

module.exports = {
    checkDockerGroup,
    checkDockerIsInstalled
}
