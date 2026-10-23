/*
:!npx tsx %
:!npx tsc --noEmit
*/
import { XmlElement } from "./xml.ts";
import { writeFileSync } from "node:fs";

const _DEBUG = true;

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  translate(dx: number, dy: number): this {
    this.x += dx;
    this.y += dy;

    return this;
  }
  scale(sx: number, sy: number = sx): this {
    this.x *= sx;
    this.y *= sy;

    return this;
  }
  rotate(theta: number): this {
    const x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
    const y = this.x * Math.sin(theta) + this.y * Math.cos(theta);
    this.x = x;
    this.y = y;

    return this;
  }
  toAttributes(suffix: string | number = ""): Record<string, number> {
    const s = String(suffix);
    return { [`x${s}`]: this.x, [`y${s}`]: this.y };
  }
}

console.assert(
  JSON.stringify(new Point(1, 2).toAttributes("0")) === '{"x0":1,"y0":2}',
);

class viewBox {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  toString(): string {
    return `${this.x} ${this.y} ${this.w} ${this.h}`;
  }
}

// svg width height
// https://www.w3.org/TR/SVG/struct.html#SVGElement
class Svg extends XmlElement {
  // allow number or string.
  constructor(
    width?: number | string,
    height?: number | string,
    xmlns: string = "http://www.w3.org/2000/svg",
  ) {
    super("svg", {
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
      xmlns: xmlns,
      preserveAspectRatio: "xMidYMid meet",
    });
  }
  viewBox(x: number, y: number, w: number, h: number): this {
    this.setAttributes({ viewBox: new viewBox(x, y, w, h) });

    return this;
  }
  plotBox(x: number, y: number, w: number, h: number): XmlElement {
    this.viewBox(-x, -y, w + 2 * x, h + 2 * y);
    let g = new XmlElement("g", { transform: `translate(0, ${h})` });
    this.addChild(g);

    return g;
  }
}

// https://www.w3.org/TR/SVG/shapes.html#LineElement
class Line extends XmlElement {
  p1: Point;
  p2: Point;
  constructor(p1: Point, p2: Point, color: string = "black") {
    super("line");
    this.p1 = p1.translate(0, -2 * p1.y);
    this.p2 = p2.translate(0, -2 * p2.y);
    this.setAttributes({
      ...this.p1.toAttributes(1),
      ...this.p2.toAttributes(2),
      stroke: color,
      "vector-effect": "non-scaling-stroke",
      "stroke-width": 1,
    });
  }
  length(): number {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  animate(duration: string = "2s"): this {
    this.addChild(
      new XmlElement("animate", {
        attributeName: "x2",
        from: this.p1.x,
        to: this.p2.x,
        dur: duration,
        fill: "freeze",
      }),
    );
    this.addChild(
      new XmlElement("animate", {
        attributeName: "y2",
        from: this.p1.y,
        to: this.p2.y,
        dur: duration,
        fill: "freeze",
      }),
    );

    return this;
  }
  color(color: string): this {
    this.attribute["stroke"] = color;
    return this;
  }
  width(width: number): this {
    //const sx = this.lookupAttributeValue("sx");
    //_DEBUG && console.log(`sx = ${sx}`);
    this.attribute["stroke-width"] = width;
    return this;
  }
  opacity(opacity: number): this {
    this.attribute["stroke-opacity"] = opacity;
    return this;
  }
  linecap(linecap: "butt" | "round" | "square"): this {
    this.attribute["stroke-linecap"] = linecap;
    return this;
  }
}

class Xtick extends Line {
  constructor(x: number, y1: number, y2: number) {
    super(new Point(x, y1), new Point(x, y2));
  }
}

class Ytick extends Line {
  constructor(x1: number, x2: number, y: number) {
    super(new Point(x1, y), new Point(x2, y));
  }
}

const TextAlignment: Record<string, object> = {
  below: { "text-anchor": "middle", "dominant-baseline": "hanging" },
  above: { "text-anchor": "middle", "dominant-baseline": "baseline" },
  left: { "text-anchor": "end", "dominant-baseline": "middle" },
  right: { "text-anchor": "start", "dominant-baseline": "middle" },
};

// https://www.w3.org/TR/SVG/text.html
class Text extends XmlElement {
  p: Point;
  constructor(text: string, x: number, y: number, fontSize: number = 1) {
    super(
      "text",
      {
        x: x,
        y: y,
        "font-size": fontSize,
        "font-family": "STIX Two Math, Cambria Math, Latin Modern Math, serif",
      },
      [text],
    );
    this.p = new Point(x, y);
  }
  align(
    position: "below" | "above" | "left" | "right",
    padding: number = 0,
  ): this {
    const alignment = TextAlignment[position];
    this.setAttributes(TextAlignment[position]);   
    switch (position) {
      case "below":
        this.p.translate(0, -padding);
        break;
      case "above":
        this.p.translate(0, padding);
        break;
      case "left":
        this.p.translate(-padding, 0);
        break;
      case "right":
        this.p.translate(padding, 0);
        break;
    }
    this.setAttributes(this.p.toAttributes());
    
    return this;
  }
}

class MathML extends XmlElement {
  constructor(math: string, x: number, y: number) {
    super("foreignObject", { x: x, y: y, width: 1, height: 1 });
    const div = new XmlElement("div", {
      xmlns: "http://www.w3.org/1999/xhtml",
      style: {
        margin: "0",
        padding: "0",
        position: "absolute",
        left: "0",
        top: "0",
      },
    });
    div.addChild(new XmlElement("math", {}, [math]));
    this.addChild(div);
  }
}

const w = 4;
const h = 3;
const fontSize = 0.2;
let svg = new Svg("80%", "60%");
const g = svg.plotBox(1, 1, 4, 3);
g.addChild(new Line(new Point(0, 0), new Point(4, 0)));
g.addChild(new Line(new Point(0, 0), new Point(0, 3)));
g.addChild(new Line(new Point(0, 0), new Point(4, 3)));
//g.addChild(new Text("Ω = (0,0)", 0, 0, 0.5));
g.addChild(new Xtick(3, -0.1, 0.1));
g.addChild(new Xtick(1, -0.1, 0.1));
g.addChild(new Ytick(-0.1, 0.1, 2));
g.addChild(
  new Text("label", 3, 0.1, fontSize).setAttributes({
    "text-anchor": "middle",
    "dominant-baseline": "hanging",
  }),
);
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
