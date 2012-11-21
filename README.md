## Require Stars ##

Requires entire directories with one call to require.

### How to install ###

	npm install require-stars

### How to run the tests ###

	node ./test

### How to use ###

Require shallow directory

	require('require-stars')();

	requrie('./myDir/*');


Require recursivley:

	require('./myDir/**');


Enumerate directory exports:

	var list = [],
	    flat = {};

	require('require-stars/enum')(require('./myDir/**'), function (exports, name, path, obj) {
		list.push(exports);
		flat[path] = exports;
	}, this);
