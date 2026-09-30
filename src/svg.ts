/*
:!npx tsx svg.ts
:!npx tsc --noEmit
*/
import { Element } from "./xml.js";
import { writeFileSync } from "node:fs";

const _DEBUG = true;

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	toAttributes(suffix: string | number = ""): Record<string, number> {
		const s = String(suffix);
		return { [`x${s}`]: this.x, [`y${s}`]: this.y };
	}
}
//function point(x: number, y: number): Point {
//	return { x, y };
//}

_DEBUG && console.log((new Point(1,2)).toAttributes("0"));
/*
_DEBUG && console.log((new Point(1,2)).toAttributes(2));
_DEBUG && console.log((new Point(1,2)).toString(1));
_DEBUG && console.log((new Point(1,2)).toString());
_DEBUG && console.log((new Point(1,2)).toString(1));
_DEBUG && console.log((new Point(1,2)).toAttributes(1));
*/

type viewBox = {
	x: number;
	y: number;
	w: number;
	h: number;
}

// svg width height
class Svg extends Element {
	// allow number or string. 
	constructor(width: number, height: number, xmlns: string = "http://www.w3.org/2000/svg")
	{
		super("svg", {width: width, height: height, xmlns: xmlns});
		// TODO: remove
		this.content(new Element(
			"rect", {x: 0, y: 0, width: "100%", height: "100%", 
			fill: "none", stroke: "red", "stroke-width": 1}
		));
	}
	plot(x: number, y: number, w: number, h: number): this
	{
		this.content(new Element("g", {x: x, y: y, width: w, height: h}));
		return this;
	}
}

// https://www.w3.org/TR/SVG/shapes.html#LineElement
class Line extends Element {
	constructor(p1: Point, p2: Point, color: string = "black")
	{
		super("line", {...p1.toAttributes(1), ...p2.toAttributes(2), stroke: color}) ;
	}
	color(color: string): this
	{
		this.attribute["stroke"] = color;
		return this;
	}
	width(width: number): this
	{
		//const sx = this.lookupAttributeValue("sx");
		//_DEBUG && console.log(`sx = ${sx}`);
		this.attribute["stroke-width"] = width;
		return this;
	}
	opacity(opacity: number): this
	{
		this.attribute["stroke-opacity"] = opacity;
		return this;
	}
	linecap(linecap: "butt" | "round" | "square"): this
	{
		this.attribute["stroke-linecap"] = linecap;
		return this;
	}
}

const w = 100;
const h = 200;
const svg = new Svg(w, h);
const x = new Line(new Point(0, 0), new Point(0, w * .9)).width(1/w).linecap("square");
_DEBUG && console.log(x);
/*
const svg = new Svg(100, 100);
//const g = svg.drawBox(0, 0, 2, 2).content(new Line(new Point(0.5, 0.5), new Point(1.5, 1.5)));
const w = 10;
const h = 20;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
console.log(g);
>>>>>>> c39b46a (node_modules)
const x = new Line(new Point(0, 0), new Point(0, w*.9)).width(1/w).linecap("square");
console.log(x);
//console.dir(svg, {depth: null, colors: true});
_DEBUG && console.log(svg.toString());
writeFileSync("output.svg", svg.toString(), "utf8");
*/
