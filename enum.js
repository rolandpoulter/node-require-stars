module.exports = function (exports, iterator, that) {
	if (!exports) return;

	Object.keys(exports).forEach(function (name) {
		iterator.call(that, exports[name], name, exports);
	});
};
