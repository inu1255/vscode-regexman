# regexman README

another easy way to run regex that you predefined

## Features

1. custom regex and keybinding
``` json
// demo: join line without space
{
	"command": "regexman.run",
	"key": "cmd+j",
	"when": "editorHasSelection",
	"args": ["\\s*\\n\\s*", ""]
}
```
2. run regex in chain
``` json
// demo: js convert to ts
{
	"command": "regexman.run",
	"key": "cmd+j",
	"when": "editorHasSelection",
	"args": [
		"(let|var|const) (\\w+) = require\\(('|\")([^'\"]+)\\3\\)", "import * as $2 from '$4'",
		"exports.(\\w+) = function", "export function $1"
	]
}
```
3. manage regexs in vscode configure `regexman.regexs`
4. pick and run regexs by `cmd+k cmd+r`