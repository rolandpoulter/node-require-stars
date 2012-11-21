var path = require('path');

module.exports = function (exports, iterator, that) {
	if (!exports || !iterator) return;

	Object.keys(exports).forEach(function (name) {
		iterator.call(that, exports[name], name, exports,
			path.basename(name), path.dirname(name));
	});
};
