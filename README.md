## Require Star ##

Requires entire directories with one call to require.

### How to install ###

	npm install require-star

### How to run the tests ###

	node ./test

### How to use ###

Require shallow directory

	require('require-star')();

	requrie('./myDir/*');


Require recursivley:

	require('./myDir/**');


Enumerate directory exports:

	var list = [],
	    flat = {};

	require('require-star/enum')(require('./myDir/**'), function (exports, name, path, obj) {
		list.push(exports);
		flat[path] = exports;
	}, this);
