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

class Circle {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
	}

	pointIntersects(x, y) {
		return distance(this.x, this.y, x, y) < this.r;
	}

	render(ctx) {
		ctx.fillStyle = this === hoveredObject ? 'red' : 'orange';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		ctx.fill();

		if (__DEBUG__) {
			drawVertex(this.x, this.y);
		}
	}
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

let hoveredObject;
let dragging = false;
let dragPoint = {};
canvas.addEventListener('mousedown', event => {
	dragging = true;

	dragPoint.x = event.offsetX;
	dragPoint.y = event.offsetY;
});

// @TODO: make sure not to loose dragged object when dragging too fast
canvas.addEventListener('mousemove', event => {
	hoveredObject = undefined;

	// iterate in reverse order of render, to account for layer visibility
	const objects = [rect, circle];
	for (var i = objects.length - 1; i >= 0; i--) {
		if (objects[i].pointIntersects(event.offsetX, event.offsetY)) {
			hoveredObject = objects[i];
			break;
		}
	}

	// TODO: if not already dragging something, find something to drag
	if (dragging && hoveredObject) {
		hoveredObject.x = hoveredObject.x - dragPoint.x + event.offsetX;
		hoveredObject.y = hoveredObject.y - dragPoint.y + event.offsetY;

		dragPoint.x = event.offsetX;
		dragPoint.y = event.offsetY;
	}
});

canvas.addEventListener('mouseup', event => {
	dragging = false;
});

const circle = new Circle(canvas.width / 2, canvas.height / 2, 40);
const rect = new Rect(canvas.width/2 - 100, 100, 30, 30);

ctx.clearRect(0, 0, canvas.width, canvas.height);

function draw() {
	ctx.fillStyle = '#222';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	rect.render(ctx);
	circle.render(ctx);

	// center to verts
	// ctx.strokeStyle = "magenta";
	// rect.vertices.forEach(vertex => {
	// 	vertex = {x: vertex.x, y: vertex.y};
	// 	drawLine(ctx, circle, vertex);
	// });

	// center to center
	// const v2 = {x: rect.x + rect.w/2, y: rect.y + rect.h/2};
	// ctx.strokeStyle = 'yellow';
	// drawLine(ctx, circle, v2);

	// find nearest vert
	// let closestDistance = Infinity;
	// const closestVert = rect.vertices.reduce((closest, vertex) => {
	// 	const d = distance(circle.x, circle.y, vertex.x, vertex.y);

	// 	drawVertex(vertex.x, vertex.y);

	// 	if (d < closestDistance) {
	// 		closest = vertex;
	// 		closestDistance = d;
	// 	}

	// 	return closest;
	// }, undefined);

	// ctx.strokeStyle = 'pink';
	// drawInfiniteLine(ctx, circle, closestVert);
	// ctx.strokeStyle = 'yellow';
	// drawLine(ctx, circle, closestVert);

	// find nearest 2 verts
	const closestVerts = rect.vertices.sort((v1, v2) => {
		// @TODO: This could be memoized, think need to do that manually
		return distance(circle.x, circle.y, v1.x, v1.y) - distance(circle.x, circle.y, v2.x, v2.y);
	}).slice(0, 2);

	// lines to closest verts
	closestVerts.forEach(vertex => {
		ctx.strokeStyle = 'pink';
		drawInfiniteLine(ctx, circle, vertex);
		ctx.strokeStyle = 'yellow';
		drawLine(ctx, circle, vertex);
	});

	// projection of center onto line
	// const l1 = {x: 200, y: 300};
	// const l2 = {x: 400, y: 340};
	// find line with those points
	const l1 = closestVerts[0];
	const l2 = closestVerts[1];
	ctx.strokeStyle = "cyan";
	drawInfiniteLine(ctx, l1, l2);
	drawLine(ctx, l1, l2);

	// find nearest point to the center of circle to that line
	// Vector of those two points
	const vL = {x: l2.x - l1.x, y: l2.y - l1.y};
	// Vector from l1 to center of circle
	const vC = {x: circle.x - l1.x, y: circle.y - l1.y};

	// coefficient to multiply alongside the lineVector
	const C = dot(vC, vL) / dot(vL, vL);
	// point on line - multiply vector by C
	const p = {x: l1.x + vL.x * C, y: l1.y + vL.y * C};
	drawVertex(p.x, p.y);
	drawLine(ctx, circle, p);

	// can i find out if this point is outside of the limits of the two vertices...
	// in a simpler mathematical operation you know...
	// ... the projection is between 0 and 1 for the original vector!

	// Find the intersection point of line with circle
	// find point on circle towards closest vert
	const closestVert = closestVerts[0];
	const circleToVert = {x: circle.x - closestVert.x, y: circle.y - closestVert.y};
	const mag = distance(closestVert.x, closestVert.y, circle.x, circle.y);
	const unit = {x: circleToVert.x / mag, y: circleToVert.y / mag};
	const toEdge = {x: unit.x * circle.r, y: unit.y * circle.r};
	// TODO: why subract? is it because it's going like away from circle, which the original vector is from vertex to circle... ?
	drawVertex(circle.x - toEdge.x, circle.y - toEdge.y);

	// find tangent at point of intersection
	// as in, perpendicular line at point of intersection
	// @TODO THIS
	
	/**
	 * This turns out to be a way of finding a projection
	 */
	/*
	const lambda = (unit.x * (closestVerts[1].x - circle.x)) + (unit.y * (closestVerts[1].y - circle.y));
	const pt = {
		x: (unit.x * lambda) + circle.x,
		y: (unit.y * lambda) + circle.y
	}

	drawVertex(pt.x, pt.y);
	ctx.strokeStyle = 'white';
	drawInfiniteLine(ctx, closestVerts[1], pt);
	//*/

	/*
	// this actually find a sort of spotlight, cool example:
	// https://stackoverflow.com/questions/23117776/find-tangent-between-point-and-circle-canvas
	const target = closestVerts[1];
	//Alpha
	var a = Math.asin(circle.r / distance(circle.x, circle.y, target.x, target.y));
	//Beta
	var b = Math.atan2(circle.y, circle.x);
	//Tangent angle
	var t = b - a;
	//Tangent points
	var T1 = {
	    x: circle.x + circle.r * Math.sin(t),
	    y: circle.y + circle.r * -Math.cos(t)
	};

	t = b + a;
	var T2 = {
	    x: circle.x + circle.r * -Math.sin(t),
	    y: circle.y + circle.r * Math.cos(t)
	}

	drawInfiniteLine(ctx, target, T1);
	drawInfiniteLine(ctx, target, T2);
	drawVertex(T1.x, T1.y);
	// const perpendicularSlope = 2;
	// const perpendicularY = 100;
	// drawInfiniteLineParametric(ctx, perpendicularSlope, perpendicularY);
	//*/

	const circlePoint = {x:circle.x - toEdge.x, y: circle.y - toEdge.y};
	const t1 = find_tangents_through_point(circle, circle.r, circlePoint);

	console.log(t1);
	if (t1.x && t1.y) {
		drawInfiniteLine(ctx, t1, {x: circle.x - toEdge.x, y: circle.y - toEdge.y});
	}

	window.requestAnimationFrame(draw);
}

// Scales thrust vector by a preset arbitrary amount to illustrate it
function renderThrust(ctx, position, dir) {
	const { x, y } = position;
	const { x: vx, y: vy } = dir;

	let v = add(position, dir);
	const mag = distance(x, y, v.x, v.y);
	const unit = {x: vx / mag, y: vy / mag};
	unit.x *= 20;
	unit.y *= 20;
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
rect.rot = 0;
rect.L = 0.1; // angular momentum, in degrees, IRL it's kilogram meters squared per second (kg-m^2/sec)

let lastTime = 0;
function render(t) {
	const frameTime = t - lastTime;
	lastTime = t;
	const dt = frameTime / 1000;

	const thrusters = [
		{ position: {x: 0, y: 0}, dir: {x: 0, y: 1}, f: 10},
		{ position: {x: rect.w, y: rect.h}, dir: {x: 0, y: -1}, f: 10},
		{ position: {x: rect.w, y: rect.h}, dir: {x: 0, y: -1}, f: 5},
	];

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

		const r = {x: (rect.w / 2) - position.x, y: (rect.h / 2) - position.y};
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

	thrusters.map(({position, dir}) => {
		renderThrust(ctx, position, dir);
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

function find_tangents_through_point(circle_center, circle_radius, point) {
	// find the direction from the point to the center of the circle
	const dir = {x: point.x - circle_center.x, y: point.y - circle_center.y};
	// extract the length and angle
	const len = distance(point.x, point.y, circle_center.x, circle_center.y);
	const angle = Math.atan2(dir.y, dir.x);
	
	// derive the length of the tangent using pythagoras
	const tangent_len = Math.sqrt(len * len - circle_radius * circle_radius);
	// and the angle using trigonometry
	const tangent_angle = Math.asin(circle_radius / len);
	
	// there are 2 tangents, one either side
	const pos = angle + tangent_angle
	const neg = angle - tangent_angle
		
	// return the direction vector of each tanget (the starting point was passed in)
	return {x: Math.cos(pos), y: Math.sin(pos)};
	// vec2d(cos(neg), sin(neg))
};














