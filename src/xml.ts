/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/

"use strict";

// TODO: make idempotent?
function escapeXml(value: string, attribute = false): string
{
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(attribute ? /"/g : /$^/g, "&quot;")
        .replace(attribute ? /'/g : /$^/g, "&apos;");
}

// Simplified BNF grammar for XML:

// element ::= emptyElement | startTag content endTag
// emptyElement ::= '<' Name attributes? '/>'
// startTag ::= '<' Name attributes? '>'
// content ::= (element | text)*
// endTag ::= '</' Name '>'
//   attributes ::= attribute*
//   attribute ::= Name '=' String

// attribute ::= Name '=' String
type AttributeValue = string | number; // convert number to string when needed
class Attribute {
	name: string;
	value: string;

	// escape entities and convert numbers to string
	constructor(name: string, value: AttributeValue)
	{
		this.name = name;
		this.value = escapeXml(String(value), true);
	}
	// 'name="value"'
	toString(): string
	{
		return `${this.name}="${this.value}"`;
	}
}

// attributes ::= attribute*
type Attributes = Record<string, AttributeValue>;
// 'k1="v1" k2="v2" ... kn="vn"'
function toString(attributes: Attributes): string
{
	return Object.entries(attributes).map(([k,v]) => { return `${k}="${v}"`; }).join(" ");
}
//console.assert(toString({"a": 1, "b": 2} as Attributes) === 'a="1" b="2"', "toString(Attributes) failed");
//console.log(({"a": 1, "b": 2} as Attributes));
//console.log(toString({"a": 1, "b": 2} as Attributes));

// content ::= (element | text)*
class Content {
	content: Element | string;
	constructor(content: Element | string)
	{
		this.content = content;
	}
	toString(): string
	{
		return this.content.toString();
	}
}

console.assert(new Content("abc").toString() === "abc", "Content failed.");

// ??? class Node Element|Attribute|string|...

// element ::= emptyElement | startTag content endTag
class Element {
	name: string;
	attribute: Attributes;
	contents: Content[];
	parent?: Element;

	constructor(name: string, attributes: Attributes = {}) {
		this.name = name;
		this.attribute = attributes;
		this.contents = [];
	}
	// Avoid references when copying.
	static copy(e: Element): Element {
		const copy = new Element(e.name, e.attribute);
		for (const c of e.contents) {
			copy.content(typeof c.content === "string" ? c.content : Element.copy(c.content));
		}
		return copy;
	}
	// add/replace attributes({k1: v1, k1: v2, ...})
	attributes(as: Attributes): this
	{
		Object.assign(this.attribute, as);

		return this;
	}

	// Append new Content. No getContent.
	content(content: Element | string): this
	{
		if (typeof content !== "string") {
			content.parent = this;
		}
		this.contents.push(new Content(content));

		return this;
	}
	// Return attribute value given key in current or ancestors. 
	lookupAttributeValue(key: string): AttributeValue | undefined
	{
		const value = this.attribute[key];
		if (value) {
			return value;
		}
		const parent = this.parent;
		if (parent) {
			return parent.lookupAttributeValue(key);
		}
		
		return undefined;
	}
	// element ::= emptyElement | startTag content endTag
	toString(): string {
		let attributes = "";
		for (const [k,v] of Object.entries(this.attribute)) {
			// attribute ::= Name '=' String
			attributes += ` ${k}="${v}"`;
		}
		if (this.contents.length === 0) {
			// emptyElement ::= '<' Name attributes? '/>'
			return `<${this.name}${attributes}/>`;
		}
		else {
			// startTag ::= '<' Name attributes? '>'
			const contents = this.contents.map((c) => c.toString()).join("");
			return `<${this.name}${attributes}>${contents}</${this.name}>`;
		}
	}
}

export { Element };
//export { Attribute, Content, Element };

function testElement()
{
	let e = new Element("tag");
	console.log(e);
	console.log(e.toString());
	console.assert(e.toString() === "<tag/>");
}
function testElementAttributes()
{
	let e0 = new Element("tag", {k: "v", k2: 2});
	let e1 = new Element("tag");
	e1.attributes({k: "v", k2: 2});
	console.log(e0);
	console.log(e1);
	console.assert(e0.toString() === e1.toString());
	e0.attributes({k: "w"});
	e1.attribute["k"] = "w";
	console.log(e0);
	console.log(e1);
	console.assert(e0.toString() === e1.toString());
}
function testElementContent()
{
	let e = new Element("tag");
	e.content("contents");
	console.log(e);
	let c = Element.copy(e);
	//let e1 = Element.copy(e);
	e.content(c);
	console.log(e);
	console.log(e.toString());
}
function testXml()
{
	testElement();
	testElementAttributes();
	testElementContent();
}
testXml();
/*
console.log(e.toString());
e.content("content");
console.log(e);
console.log(e.toString());
let c = Element.copy(e);
c.attributes({k3: "v3"});
console.log(c);
e.content(c);
const c: Content = new Content("a");
console.log(c.toString());

let e = new Element("name");
console.log(e);
console.log(e.toString());
console.log(".");
console.log(c.lookupAttributeValue("k3"));
console.log(c.lookupAttributeValue("k2"));


e.attribute["k"] = "v";
console.log(e);
console.log(e.toString());
e.attribute["k1"] = "v2";
console.log(".");

e.content("c");
console.log(e);
console.log(e.toString());
console.log(".");

const v: Element = Element.copy(e);
console.log("v = " + v);
console.log("v = " + v.toString());
const ev: Content = new Content(v);
console.log("ev = " + ev.toString());
e.content(v);
console.log(e);
console.log(e.toString());
console.log(".");
*/
