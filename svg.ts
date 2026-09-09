class Point {
	constructor(public x: number, public y: number) { }
	translate(dx: number, dy: number): this
	{
		this.x += dx;
		this.y += dy;
		return this;
	}
	scale(sx: number, sy: number): this
	{
		this.x *= sx;
		this.y *= sy;
		return this;
	}
	rotate(theta: number): this
	{
		let ct = Math.cos(theta);
		let st = Math.sin(theta);

		[this.x, this.y] = [this.x*ct - this.y*st, this.x*st + this.y*ct];
		return this;
	}
	xml(postfix: string = ""): string
	{
		return `x${postfix}="${this.x}" y${postfix}="${this.y}"`;
	}
}
console.assert(`x="1" y="2"` === new Point(1,2).xml(), "Point.xml() failed");
console.assert(`x1="1" y1="2"` === new Point(1,2).xml("1"), "Point.xml(postfix) failed");
console.assert(`x="4" y="6"` === new Point(1,2).translate(3,4).xml(), "Point.translate failed()");
console.assert(`x="3" y="8"` === new Point(1,2).scale(3,4).xml(), "Point.scale(3,4) failed()");
console.assert(`x="-2" y="1.0000000000000002"` === new Point(1,2).rotate(Math.PI/2).xml(), "Point.rotate(pi/2) failed");

// XML style attribute
class Attribute {
	key: string;
	value: string | number | boolean | undefined;

	constructor(key: string, value:  string | number | boolean | undefined)
	{
		this.key = key;
		this.value = value;
	}
	xml(): string
	{
		return this.value === undefined ? "" : `${this.key}="${this.value}"`;
	}
}
console.assert(`key="value"` === (new Attribute("key", "value")).xml(), "Attribute.xml failed");

class SvgElement {
	static Content = class {
		content: (SvgElement|string)[];

		constructor(content: (SvgElement|string)[] = []) {
			this.content = content;
		}
		append(content: (SvgElement|string)[]): this {
			this.content.push(...content);
			return this;
		}
		xml(): string {
			return this.content.map((item) => typeof item === "string" ? item : item.xml()).join("");
		}
	}
	attributes: Attribute[] = [];
	content: InstanceType<typeof SvgElement.Content> = new SvgElement.Content();
	parent?: SvgElement;
	children: SvgElement[] = [];

	constructor(attributes?: Attribute[], content?: InstanceType<typeof SvgElement.Content>) {
		this.attributes = attributes ?? [];
		if (content) {
			this.content = content;
		}
	}

	empty(): boolean
	{
		return this.children.length === 0 && this.content.content.length === 0;
	}
	hasChildren(): boolean {
		return this.children.length > 0;
	}
	isLeaf(): boolean {
		return this.children.length === 0;
	}

	append(child: SvgElement): this
	{
		child.parent?.remove(child);
		child.parent = this;
		this.children.push(child);
		return this;
	}
}
console.log(new Element.Content().xml());
console.log(new Element.Content([]).xml());
console.log(new Element.Content(["foo", "bar"]).xml());

function element(tag: string, attr: Attribute[], content?: string): string
{
	let attrs = attr.map((a) => a.xml()).join(" ");

	return `<${tag}${attrs ? ` ${attrs}` : ""}${content === undefined ? "/>" : `>${content}</${tag}>`}`;
}

const svg = element("svg", [
	new Attribute("xmlns", "http://www.w3.org/2000/svg"),
	new Attribute("viewBox", "0 0 100 100"),
	new Attribute("width", 100),
	new Attribute("height", 100),
], element("line", [
	new Attribute("x1", 10),
	new Attribute("y1", 10),
	new Attribute("x2", 90),
	new Attribute("y2", 90),
	new Attribute("stroke", "black"),
	new Attribute("stroke-width", 1),
]));

console.log(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);

/*
type Attributes = Record<string, string | number | boolean | undefined>;

// replace obj keys by map
// TODO: handle array valued maps
function mapKeys(obj, map: Record<string,string>)
{
	return !obj ? {} : Object.fromEntries(Object.entries(obj).map(([key,value]) => [map[key] ?? key, value]));
}

function attrs(attr: Attributes): string
{
    return !attr ? "" :
		Object.entries(attr)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
}

function element(tag: string, attr: Attributes, content?: string): string
{
	return `<${tag} ${attrs(attr)}${content ? ">${content}</${tag}>" : "/>"}`;
}

class line {
	p1: Poing
}

// line from p1 to p2
interface lineArgs {
	p1: Point;
	p2: Point;

	color?: string;
	linecap?: "butt" | "round" | "square";
	opacity?: number;
	width?: number;
}
const lineKeys: Record<string,object> = {
	p1: ["x1", "y1"],
	p2: ["x2", "y2"],
	color: "stroke",
	linecap: "stroke-linecap",
	opacity: "stroke-opacity",
	width: "stroke-width"
};
function line(p1: Point, p2: Point, args: Attributes): string
{
	return element(`line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}"`, mapKeys(args,lineKeys));
}

function polyline(p: [Point], args: Attributes)
{
	const points = p.map(([x,y]) => `${x},${y}`).join(" ");
	return element(`polyline points="${points}"`, args);
}

interface viewBox {
	x: number;
	y: number;
	w: number;
	h: number;
};
// (x,y) in viewBox is sent to ((x - v.x)*width/v.w, (y - v.y)*height/v.h
// Want (0,0) -> (|v.x|, |v.y|) and (v.w, v.h) -> (width - |v.w|, height - |v.h|)
// 0 -> |v.x| iff (0 - v.x)*width/v.w = |v.x| iff width = v.w
// v.w -> width - |v.w| iff v.w = width - v.w iff 2v.w = width
function svg(content: string, view: viewBox, width?: number = 100, height?: number = 100)
{
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
style="border: 2px solid black;"
width="${width - view.x}" height="${height - view.y}" viewBox="${-view.x} ${view.y} ${width} ${height}">
<g transform="translate(${-view.x}, ${height + view.y}) scale(.9, -.9)">
${content}
</g>
</svg>`;
}

function graph(v: veiwBox)
{
	return {width: 
}

//var content = polyline([[0,4,0],[3,0]],{stroke: "black", width: 2, fill: "none"});
var content = line([10,10],[90,90],{stroke: "black", width: 1});

console.log(svg(content, {x:-10,y:-10,w:100,h:100}));
*/
