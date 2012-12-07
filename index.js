var path = require('path'),
    fs = require('fs');

var enumerate = require('./enum');


module.exports = function (Module, browserifyWrap) {
	Module = Module || require('module');

	patchModuleSystem(Module);

	try {
		browserifyWrap = (browserifyWrap || require('browserify/lib/wrap'))({cache: false}).constructor;

	} catch (err) {}

	if (browserifyWrap) patchBrowserify(browserifyWrap);
};


function patchModuleSystem(Module) {
	if (Module.starPatched) return;

	Module.starPatched = true;

	var _load = Module._load;

	Module._load = function (request, parent, isMain) {
		var filename = resolveFilename(request, parent),
		    base = path.basename(filename, path.extname(filename));

		if (base !== '*' && base !== '**') return _load.call(this, request, parent, isMain);

		if (Module._cache[filename]) return Module._cache[filename].exports;

		return Module._cache[filename] =
			requireDir(path.join(filename, '..'), base === '**', parent.require.bind(parent), {},
				Object.keys(Module._extensions));
	};

	function resolveFilename(request, parent) {
		return (request.substr(0, 2) === './' && parent && parent.filename) ?
			path.join(path.dirname(parent.filename), request) : request;
	}
}


function patchBrowserify(browserifyWrap) {
	if (browserifyWrap.starPatched) return;

	browserifyWrap.starPatched = true;

	var _require = browserifyWrap.prototype.require,
	    _addEntry = browserifyWrap.prototype.addEntry;

	browserifyWrap.prototype.require = function (mfile, opts) {
		var imports = {},
		    base = path.basename(mfile, path.extname(mfile)),
		    that = this,
		    body,
		    file;

		if (base !== '*' && base !== '**') return _require.call(this, mfile, opts);

		file = path.join(opts.dirname || '', mfile);

		if (this.files[file]) return this;

		body = [];

		requireDir(path.join(file, '..'), base === '**', function (file, _, _, path) {
			_require.call(that, file, {
				dirname: opts.dirname,
				fromFile: opts.fromFile
			});

			return 'require("./' + path + '")';
		}, imports, this.extensions);

		enumerate(imports, function (require, path) {
			body.push('"' + path + '":' + require);
		});

		this.files[file] = {body: 'module.exports = {' + body.join(',') + '};'};

		return this;
	};

	browserifyWrap.prototype.addEntry = function (file_, opts) {
		var imports = {},
		    base = path.basename(file_, path.extname(file_)),
		    that = this,
		    body;

		if (base !== '*' && base !== '**') return _addEntry.call(this, file_, opts);

		if (this.entries[file_]) return this;

		body = [];

		requireDir(path.join(file_, '..'), base === '**', function (file, _, _, path) {
			_require.call(that, file);

			return 'require("./' + path + '")';
		}, imports, this.extensions);

		enumerate(imports, function (require, path) {
			body.push('"' + path + '":' + require);
		});

		this.entries[file_] = {body: 'module.exports = {' + body.join(',') +  '};'};

		return this;
	};
}


function requireDir(dir, deep, require, exports, extentions, _path) {
	exports = exports || {};
	_path = _path || '';

	var dirs = [],
	    nextPath;

	fs.readdirSync(dir).forEach(function (file) {
		file = path.join(dir, file);

		var stat = fs.statSync(file),
		    extn = path.extname(file),
		    name = path.basename(file, extn);

		nextPath = _path ? _path + '/' + name : name;

		if (stat.isFile()) {
		  if (name.charAt(0) === '.') return;

		  if (!extn || extentions.indexOf(extn) !== -1) {
		    exports[nextPath] = require(file, undefined, undefined, nextPath);
		  }

		} else if (deep && stat.isDirectory()) {
		  dirs.push({file: file, nextPath: nextPath});
		}
	});

	dirs.forEach(function (dir) {
		requireDir(dir.file, deep, require, exports, extentions, dir.nextPath);
	})

	return exports;
}
