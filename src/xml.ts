/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/

"use strict";

// Simplified BNF grammar for XML:

// element ::= emptyElement | startTag content endTag
// emptyElement ::= '<' Name attributes? '/>'
// startTag ::= '<' Name attributes? '>'
// content ::= (element | text)*
// endTag ::= '</' Name '>'
//   attributes ::= attribute*
//   attribute ::= Name '=' String

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
// Same as JSON `{k1:v1, k2:v2, ... kn:vn}` object.}
type Attributes = Record<string, AttributeValue>;
// 'k1="v1" k2="v2" ... kn="vn"'
function toString(attributes: Attributes): string
{
	return Object.entries(attributes)
		.map(([k,v]) => { return new Attribute(k,v).toString(); }).join(" ");
}

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
