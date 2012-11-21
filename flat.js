module.exports = function (exports) {
	if (!exports) return;

	var flat = [];

	Object.keys(exports).forEach(function (name) {
		flat.push(exports[name]);
	});

	return flat;
};
