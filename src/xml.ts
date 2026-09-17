// xml.ts - XML helpers
/*
:!npx tsx xml.ts
:!npx tsc --noEmit
*/

function escapeXml(value: string, attribute = false): string
{
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(attribute ? /"/g : /$^/g, "&quot;")
        .replace(attribute ? /'/g : /$^/g, "&apos;");
}

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
	value: AttributeValue;

	constructor(name: string, value: AttributeValue)
	{
		this.name = name;
		this.value = escapeXml(String(value), true);
	}
	// attribute ::= Name '=' String
	toString(): string
	{
		console.log("toString: " + this);
		return `${this.name}="${this.value}"`;
	}
}
type Attributes = Record<string, AttributeValue>;
// 'k1="v1" k2="v2" ... kn="vn"'
function toString(attributes: Attributes): string
{
	return Object.values(attributes).map((a) => { return a.toString(); }).join(" ");
}
console.log({"a": 1} as Attributes);
console.log(toString({"a": 1} as Attributes));
//console.assert(toString({"a": 1, "b": 2} as Attributes) === 'a="1" b="2"', "toString(Attributes) failed");
console.log(({"a": 1, "b": 2} as Attributes));
console.log(toString({"a": 1, "b": 2} as Attributes));

// content ::= (element | text)*
class Content {
	content: Element | string;
	constructor(content: Element | string)
	{
		this.content = content;
	}
	toString(): string
	{
		return typeof this.content === "string"
			? escapeXml(this.content)
			: this.content.toString();
	}
}

//console.assert(new Content("abc").toString() === "abc", "Content failed.");

//class Node Element|Attribute|string|...

class Element {
	tag: string;
	attribute: Attributes;
	contents: Content[];
	parent?: Element;

	constructor(tag: string, attribute?: Attributes, contents?: Content[]) {
		this.tag = tag;
		this.attribute = attribute ?? {};
		this.contents = contents ?? [];
	}
	// Avoid circular references when copying.
	static copy(e: Element): Element {
		return new Element(
			e.tag,
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
		if (Object.hasOwn(content, "attribute")) {
			content.attribute["parent"] = this;
		}
		this.contents.push(new Content(content));

		return this;
	}
	// Return attribute value given key in current or ancestors. 
	lookupAttributeValue(key: string): AttributeValue
	{
		const value = this.attribute[key];
		if (value) {
			return value;
		}
		const parent = this.parent;
		if (parent) {
			return this.parent.lookupAttributeValue(key);
		}
		
		return undefined;
	}
	// element ::= emptyElement | startTag content endTag
	toString(): string {
		const attributes = Object.keys(this.attribute).length > 0
			? " " + toString(this.attribute)
			: "";
		if (this.contents.length === 0) {
			// emptyElement ::= '<' Name attributes? '/>'
			return `<${this.tag}${attributes}/>`;
		}
		else {
			// startTag ::= '<' Name attributes? '>'
			const contents = this.contents.map((c) => c.toString()).join("");
			return `<${this.tag}${attributes}>${contents}</${this.tag}>`;
		}
	}
}

export { Element };
//export { Attribute, Content, Element };

/*
const c: Content = new Content("a");
console.log(c.toString());

let e = new Element("tag");
console.log(e);
console.log(e.toString());
console.log(".");

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
