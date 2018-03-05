// Use cases:
// a * b : matrix multiplication would need to check if valid number of rows and columns
// a -> b -> c : summed up distance of the path between vectors
// |a| : magnitude
// a < b : true if a is smaller than b, is there a case where this wouldn't be the magnitude?
// |a| < |b| : true if |a| is smaller than |b|
// a * n : scale vector, where a is a vector and n is a scalar
// a / n : ... also allowed to divide of course
// |a| * n : idea is to scale unit vector in direction of a by scalar n
// angles somehow??? what symbol?
// Can I use pipe (`|`) for something?
// 
// How to denote vector magnitude?
// How to denote a unit vector in direction?
// 
// How to make this a generic, i.e. an SDK almost for writing these kinds of syntaxes in JS
// that can cover both this vector case, and Moti's Animated case, and any arbitrary case.
// Provide tokenisation and AST engine and allow configuring the input and output.
// 
// Is there a case for such API:
// v('|(a + b)| * scale', {a, b, scale});
// i.e. pass object of variables in the scope as 2nd param, to have cleaner template string
// Or is there any way of passing the contaxt into it?

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 2D dot product
function dot(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}

// add two vectors
function add(v1, v2) {
	return {x: v1.x + v2.x, y: v1.y + v2.y};
}

// subtract 2D vectors
const subtract = (v1, v2) => ({
	x: v2.x - v1.x,
	y: v2.y - v1.y
});

// 2D Vector cross product
const cross = (a, b) => {
	return (a.x * b.x) - (a.y * b.y);
};

// Literally supports only format <vector><operation><vector>
const vectorMaths = (...parts) => {
	const strings = parts[0];
	const vectors = parts.slice(1);

	const operations = {
		'-': subtract,
		'+': add,
		// TODO: difference between DOT and CROSS products? why one - and other +?
		'.': dot,
		'x': cross,
		'->': distance
	};

	const operation = strings[1].trim();
	if (operations[operation]) {
		return operations[operation].apply(this, vectors);
	}

	return null;
}

module.exports = vectorMaths;