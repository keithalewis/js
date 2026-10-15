/*
:!npx tsx %
:!npx tsc --noEmit
*/
import { Element } from "./xml.ts";
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

console.assert(JSON.stringify((new Point(1,2)).toAttributes("0")) === '{"x0":1,"y0":2}');


type viewBox = {
	x: number;
	y: number;
	w: number;
	h: number;
}

// svg width height
// https://www.w3.org/TR/SVG/struct.html#SVGElement
class Svg extends Element {
	// allow number or string. 
	constructor(width: number|string = "100%", height: number|string, xmlns: string = "http://www.w3.org/2000/svg")
	{
		super("svg", {width: width, height: height, xmlns: xmlns});
		// TODO: remove
		this.content(new Element(
			"rect", {x: 0, y: 0, width: "100%", height: "100%", 
			fill: "none", stroke: "hotpink", "stroke-width": 0.1}
		));
	}
	viewBox(x: number, y: number, w: number, h: number): this
	{
		this.attribute["viewBox"] = `${x} ${y} ${w} ${h}`;
		
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

const w = 4;
const h = 3;
const svg = new Svg("80%", "auto");
const g = svg.viewBox(0, 0, 2, 2).content(new Line(new Point(0.5, 0.5), new Point(1.5, 1.5)).width(0.1));
/*
const w = 10;
const h = 20;
const g = svg.drawBox(-1, -1, w, h);
svg.content(g);
>>>>>>> c39b46a (node_modules)
const x = new Line(new Point(0, 0), new Point(0, w*.9)).width(1/w).linecap("square");
console.log(x);
//console.dir(svg, {depth: null, colors: true});
_DEBUG && console.log(svg.toString());
*/
writeFileSync("output.svg", svg.toString(), "utf8");

