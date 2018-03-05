const chalk = require('chalk');
const v = require('./vectorMaths');

const assert = {
	equals: (value, expected) => {
		if (value === expected) {
			console.log(chalk.green(`${value} === ${expected}`));
			return true;
		}
		console.log(chalk.red(`Fail: ${value} !== ${expected}`));
		return false;
	},

	/**
	 * If objects are similar in their properties and values
	 *
	 * @param {Object} value
	 * @param {Object} expected
	 *
	 * @return {boolean}
	 */
	same: (value, expected) => {
		if (Object.keys(value).length !== Object.keys(expected).length) {
			console.log(chalk.red('Not equal keys'), JSON.stringify(value), JSON.stringify(expected));
			return false;
		}

		if (Object.keys(value).find(key => expected[key] !== value[key])) {
			console.log(chalk.red('Value not equal', JSON.stringify(value), JSON.stringify(expected)));
			return false;
		}

		// TODO: candidate for tagged template literal to JSON.stringify objects
		console.log(chalk.green(`${JSON.stringify(value)} same as ${JSON.stringify(expected)}`));
	},

	/**
	 * If objects are similar, i.e. A is subset of B
	 * TODO: consider renaming to subset
	 */
	similar: (value, expected) => {

	}
}

function test(description, fn) {
	console.log(chalk.cyan(description));
	fn();
}

test('addition', () => {
	const a = {x: 1, y: 1};
	const b = {x: 1, y: 1};
	assert.same(v`${a} + ${b}`, {x: 2, y: 2});
});

test('subtraction', () => {
	const a = {x: 2, y: 1};
	const b = {x: 1, y: 0};
	assert.same(v`${a} - ${b}`, {x: 1, y: 1});
});

test('dot product', () => {
	const a = {x: 2, y: 1};
	const b = {x: 1, y: 0};
	assert.same(v`${a} . ${b}`, {x: 1, y: 1});
});

test('cross', () => {
	const a = {x: 2, y: 1};
	const b = {x: 1, y: 0};
	assert.same(v`${a} x ${b}`, {x: 1, y: 1});
});

test('distance', () => {
	const a = {x: 2, y: 1};
	const b = {x: 1, y: 0};
	assert.same(v`${a} -> ${b}`, {x: 1, y: 1});
});