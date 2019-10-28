const vscode = require('vscode');

async function run(args) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) return;
	let selection = editor.selection;
	let content = editor.document.getText(selection);
	let prevSelection;
	if (!content) { // 当前没有选中尝试全选
		prevSelection = editor.selection;
		let maxLine = editor.document.lineCount - 1;
		let endChar = editor.document.lineAt(maxLine).range.end.character;
		selection = new vscode.Range(0, 0, maxLine, endChar);
	}
	content = editor.document.getText(selection);
	if (!content) return; // 全选也没有内容
	let s = content;
	let isAll = content.length == editor.document.getText().length;
	let dirty = false;
	for (let i = 0; i < args.length;) {
		let searchValue = args[i++]
		let replaceValue = args[i++]
		let regex = new RegExp(searchValue, 'g');
		if (i < args.length || isAll) {
			s = s.replace(regex, replaceValue)
			if (!dirty && s != content) dirty = true;
		} else {
			s = s.replace(/\$/g, '\\$$').replace(regex, function(x0) {
				dirty = true;
				if (replaceValue == null) replaceValue = x0;
				return x0.replace(regex, "${1:" + replaceValue + "}")
			})
		}
	}
	if (!dirty) return;
	if (isAll) {
		await editor.edit(function(eb) {
			eb.replace(selection, s)
		})
	} else {
		if (prevSelection) {
			let line = prevSelection.start.line;
			let i = 0;
			while (i < s.length && line) {
				s[i++] == '\n' && line--;
			}
			i += prevSelection.start.character
			s = s.slice(0, i) + '$0' + s.slice(i)
		}
		await editor.insertSnippet(new vscode.SnippetString(s), selection);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let prevIndex = 0;
	context.subscriptions.push(
		vscode.commands.registerCommand("regexman.run", run),
		vscode.commands.registerCommand("regexman.list", async () => {
			let config = vscode.workspace.getConfiguration('regexman')
			let items = config.regexs.map((x, id) => {
				return {
					id,
					label: x.title,
					detail: x.detail,
					description: x.description,
					args: x.args || [],
				}
			})
			if (prevIndex) items.unshift(...items.splice(prevIndex, 1))
			let select = await vscode.window.showQuickPick(items);
			if (!select) return;
			prevIndex = select.id;
			await run(select.args)
		}),
	);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}