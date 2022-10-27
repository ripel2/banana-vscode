const cp = require('child_process');

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

module.exports = {
    startCommand
}
