require('./index.js')();

var assert = require('assert');

var test = require('./test_dir/**');

assert(test.a === 'a');
assert(test.b === 'b');
assert(test['1/a'] === '1.a');
assert(test['1/b'] === '1.b');
assert(test['1/2/a'] === '1.2.a');
assert(test['1/2/b'] === '1.2.b');


var flatExports = [];

require('./enum')(test, function (exports, name, path, obj) {
	flatExports.push(exports);
});

assert(flatExports.join(',') === 'a,b,1.a,1.b,1.2.a,1.2.b');


flatExports = [];
test = require('./test_dir/*');

require('./enum')(test, function (exports) {flatExports.push(exports);});

assert(flatExports.join(',') === 'a,b');


try {
	var browserify = require('browserify');

} catch (err) {}

if (browserify) {
	var builder = browserify().addEntry(__dirname + '/test_dir/**'),
	    output = builder.bundle();

	assert(output);
	assert((/module.exports = 'a';/).test(output));
	assert((/module.exports = 'b';/).test(output));
	assert((/module.exports = '1.a';/).test(output));
	assert((/module.exports = '1.b';/).test(output));
	assert((/module.exports = '1.2.a';/).test(output));
	assert((/module.exports = '1.2.b';/).test(output));

	builder = browserify().addEntry(__dirname + '/test_browserify.js');
	output = builder.bundle();

	assert(output);
	assert((/module.exports = 'a';/).test(output));
	assert((/module.exports = 'b';/).test(output));
	assert((/module.exports = '1.a';/).test(output));
	assert((/module.exports = '1.b';/).test(output));
	assert((/module.exports = '1.2.a';/).test(output));
	assert((/module.exports = '1.2.b';/).test(output));
}


console.log('ok');
