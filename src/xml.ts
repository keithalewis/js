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

//   attribute ::= Name '=' String
//   attributes ::= attribute*
type AttributeValue = string | number; // convert number to string when needed
type Attributes = Record<string, AttributeValue>;
// 'k1="v1" k2="v2" ... '
function toString(attributes: Attributes): string
{
	return Object.entries(attributes).map(([k,v]) => { return `${k}="${escapeXml(String(v))}"`; }).join(" ");
}
//console.log({"a": 1} as Attributes);
//console.log(toString({"a": 1} as Attributes));
//console.assert(toString({"a": 1, "b": 2} as Attributes) === 'a="1" b="2"', "toString(Attributes) failed");

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

class Element {
	tag: string;
	attribute: Attributes;
	contents: Content[];

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
		Object.assign(this.attributes, as);

		return this;
	}

	// Append new Content. No getContent.
	content(content: Element | string): this
	{
		this.contents.push(new Content(content));

		return this;
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
