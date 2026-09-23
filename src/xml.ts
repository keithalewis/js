// xml.ts - XML helpers
/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/

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

// Mini XML BNF grammar:
// element ::= emptyElement | startTag content endTag
// emptyElement ::= '<' Name attributes? '/>'
// startTag ::= '<' Name attributes? '>'
// content ::= (element | text)*
// endTag ::= '</' Name '>'
//   attributes ::= attribute*
//   attribute ::= Name '=' String

type AttributeValue = string | number;
class Attribute {
	name: string;
	value: string;

	// escape entities and convert numbers to string
	constructor(name: string, value: AttributeValue)
	{
		this.name = name;
		this.value = escapeXml(String(value), true);
	}
}
type Attributes = Record<string, AttributeValue>;
// 'k1="v1" k2="v2" ... kn="vn"'
function toString(attributes: Attributes): string
{
	return Object.values(attributes).map((a) => { return a.toString(); }).join(" ");
}
//console.log(new Attribute("a", 1));
//console.log(new Attribute("a", 1).toString());
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

	constructor(name: string, attribute?: Attributes, contents?: Content[]) {
		this.name = name;
		this.attribute = attribute ?? {};
		this.contents = contents ?? [];
	}
	// Avoid circular references when copying.
	static copy(e: Element): Element {
		return new Element(
			e.name,
			e.attribute,
			e.contents.map((c) => new Content(
				typeof c.content === "string" ? c.content : Element.copy(c.content)
			))
		);
	}
	// add attributes({k1: v1, k1: v2, ...})
	attributes(as: Attributes): this
	{
		Object.assign(this.attribute, as);

		return this;
	}

	// Append new Content. No getContent.
	content(content: Element | string): this
	{
		if (typeof content !== "string") {
			content.parent = this as Element;
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

/*
let e = new Element("tag");
console.log(e);
console.log(e.toString());
e.attributes({k: "v", k2: 2});
console.log(e);
console.log(e.toString());
let c = Element.copy(e);
c.attributes({k3: "v3"});
console.log(c);
e.content(c);
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
