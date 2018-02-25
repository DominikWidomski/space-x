"use strict";

const __DEBUG__ = false;
const canvas = document.querySelector('.js-playarea');
const ctx = canvas.getContext('2d');

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

const vertexScale = 8;
function drawVertex(x, y) {
	ctx.fillStyle = 'yellow';
	ctx.fillRect(x - vertexScale/2, y - vertexScale/2, vertexScale, vertexScale);
}

/**
 * Line - y = m * x + b
 * 
 * todo: edge cases of infinite gradient etc.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} gradient
 * @param {number} yIntercept
 */
function drawInfiniteLineParametric(ctx, gradient, yIntercept) {
	const yStart = gradient * 0 + yIntercept;
	const yEnd = gradient * canvas.width + yIntercept
	
	ctx.beginPath();
	ctx.moveTo(0,yStart);
	ctx.lineTo(canvas.width,yEnd);
	ctx.stroke();
}

/**
 * Draw infinite line passing through two points
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} v1
 * @param {Object} v2
 */
function drawInfiniteLine(ctx, v1, v2) {	
	// drawVertex(v1.x, v1.y);
	// drawVertex(v2.x, v2.y);
	// gradient = rise / run;
	const m = (v2.y - v1.y) / (v2.x - v1.x);
	// y-intercept
	const b = v1.y - m * v1.x;

	drawInfiniteLineParametric(ctx, m, b);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} v1
 * @param {Object} v2
 */
function drawLine(ctx, v1, v2) {
	ctx.beginPath();
	ctx.moveTo(v1.x, v1.y);
	ctx.lineTo(v2.x, v2.y);
	ctx.stroke();
}

class Rect {
	constructor(x, y, w, h) {
		this._x = x;
		this._y = y;
		this._w = w;
		this._h = h;

		this._calcVerts();
	}

	_calcVerts() {
		this._vertices = [
			{x: this._x 		 , y: this._y},
			{x: this._x + this._w, y: this._y},
			{x: this._x 		 , y: this._y + this._h},
			{x: this._x + this._w, y: this._y + this._h},
		];
	}

	get x() { return this._x; }
	set x(newVal) {
		this._x = newVal;
		this._calcVerts();
	}

	get y() { return this._y;}
	set y(newVal) {
		this._y = newVal;
		this._calcVerts();
	}

	get w() { return this._w }
	set w(newVal) {
		this._w = newVal;
		this._calcVerts();
	}
	get h() { return this._h }
	set h(newVal) {
		this._h = newVal;
		this._calcVerts();
	}
	get vertices() { return this._vertices; }

	pointIntersects(x, y) {
		return x > this._x
			&& x < (this._x + this._w)
			&& y > this._y
			&& y < (this._y + this._h);
	}

	render(ctx) {
		ctx.fillStyle = this === hoveredObject ? 'red' : 'salmon';
		ctx.fillRect(this._x, this._y, this._w, this._h);

		if (__DEBUG__) {
			this._vertices.forEach(vertex => {
				const {x, y} = vertex;
				drawVertex(x, y);
			});
		}
	}
}

const rect = new Rect(canvas.width/2 - 100, 100, 30, 30);

ctx.clearRect(0, 0, canvas.width, canvas.height);

// Scales thrust vector by a preset arbitrary amount to illustrate it, not scaled
function renderThrust(ctx, position, dir, f) {
	const { x, y } = position;
	const { x: vx, y: vy } = dir;

	let v = add(position, dir);
	const mag = distance(x, y, v.x, v.y);
	const unit = {x: vx / mag, y: vy / mag};
	unit.x *= 10 * f;
	unit.y *= 10 * f;
	v = add({x, y}, {x: unit.x, y: unit.y});

	ctx.strokeStyle = 'yellow';
	drawLine(ctx, {x: x, y: y}, {x: v.x, y: v.y});
}

const degToRad = deg => deg * Math.PI / 180;

// 2D Vector cross product
const cross = (a, b) => {
	return (a.x * b.x) - (a.y * b.y);
};

// subtract 2D vectors
const subtract = (v1, v2) => ({
	x: v2.x - v1.x,
	y: v2.y - v1.y
});

let trace = [];

rect.x = 300;
rect.y = 300;
rect.w = 20;
rect.h = 80;
rect.rot = 0;
rect.L = 0.1; // angular momentum, in degrees, IRL it's kilogram meters squared per second (kg-m^2/sec)

const thrusters = [
	{ position: {x: 0, y: 0}, dir: {x: -1, y: 0}, f: 0},
	{ position: {x: rect.w, y: 0}, dir: {x: 1, y: 0}, f: 0},
	{ position: {x: rect.w / 2, y: rect.h}, dir: {x: 0, y: -1}, f: 0},
];

let lastTime = 0;
function render(t) {
	const frameTime = t - lastTime;
	lastTime = t;
	const dt = frameTime / 1000;

	ctx.fillStyle = '#222';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// sum up thrust
	let thrust = thrusters.reduce((thrust, thruster) => {
		const { dir, f } = thruster;

		thrust.x += dir.x * f;
		thrust.y += dir.y * f;

		return thrust;
	}, {x: 0, y: 0});
	thrust.x *= dt;
	thrust.y *= dt;

	// sum up angular velocity
	let angularVelocity = thrusters.reduce((angVel, thruster) => {
		const { position, dir, f } = thruster;

		// Thruster positions are relative to the rect.
		const tPos = add({
			x: rect.x,
			y: rect.y
		}, position);

		const r = {x: tPos.x - (rect.w / 2), y: tPos.y - (rect.h / 2)};
		angVel += f * cross(dir, r);

		return angVel;
	}, 0);
	angularVelocity *= dt;

	//*
	// Thrust
	rect.x += thrust.x;
	rect.y += thrust.y;

	// Rotation + angular momentum, in 
	rect.rot += angularVelocity;
	rect.rot %= 360;
	//*/

	ctx.translate(rect.x, rect.y);
	ctx.rotate(degToRad(rect.rot));
	ctx.translate(-(rect.w / 2), -(rect.h / 2));

	ctx.fillStyle = "red";
	ctx.fillRect(0, 0, rect.w, rect.h);

	ctx.fillStyle = "yellow";
	ctx.fillRect(-2, -2, 4, 4);

	ctx.fillStyle = "yellow";
	ctx.fillRect((rect.w / 2) - 2, (rect.h / 2) - 2, 4, 4);

	thrusters.map(({position, dir, f}) => {
		renderThrust(ctx, position, dir, f);
	});

	// trace.push({
	// 	x: rect.x + (rect.w / 2),
	// 	y: rect.y + (rect.h / 2),
	// });
	// if (trace.length > 500) {
	// 	trace = trace.slice(1);
	// }

	// reset transform matrix to identity matrix
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.font = '20px serif';
	ctx.fillText(`L: ${angularVelocity}`, rect.x + rect.w + 20, rect.y);
	ctx.fillText(`${rect.x}, ${rect.y}`, rect.x + rect.w + 20, rect.y + 20);

	// ctx.translate(-(rect.w / 2), -(rect.h / 2));
	// ctx.beginPath();
	// ctx.moveTo(trace[0].x, trace[0].y);
	// for (let pos of trace) {
	// 	ctx.lineTo(pos.x, pos.y);
	// }
	// ctx.stroke();
	// ctx.setTransform(1, 0, 0, 1, 0, 0);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);

const leftThruster = thrusters[0];
const rightThruster = thrusters[1];
const bottomThruster = thrusters[2];

document.addEventListener('keydown', ({ key }) => {
	switch (key) {
		case 'q':
		case 'Q':
			leftThruster.f = 10;
			break;

		case 'e':
		case 'E':
			rightThruster.f = 10;
			break;

		case 'w':
		case 'W':
			bottomThruster.f = 10;
			break;
	}
});

document.addEventListener('keyup', ({ key }) => {
	switch (key) {
		case 'q':
		case 'Q':
			leftThruster.f = 0;
			break;

		case 'e':
		case 'E':
			rightThruster.f = 0;
			break;

		case 'w':
		case 'W':
			bottomThruster.f = 0;
			break;
	}
});
