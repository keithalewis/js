import { expect, test } from "vitest";
import { Element } from "../src/xml.js"

	test.each([
		[new Element("tag"), '<tag/>'],
		[(new Element("tag", {"a": 1, "b": 2})),
			'<tag a="1" b="2"/>'],
		[(new Element("tag", {"a": 1, "b": 2}).content("contents")),
			'<tag a="1" b="2">contents</tag>']
	])("ElementTest", (actual, expected) => {
		expect(String(actual)).toBe(expected);
	});

//console.assert(toString({"a": 1, "b": 2} as Attributes) === 'a="1" b="2"', "toString(Attributes) failed");
//console.log(({"a": 1, "b": 2} as Attributes));
//console.log(toString({"a": 1, "b": 2} as Attributes));
//console.assert(new Content("abc").toString() === "abc", "Content failed.");
//
//function testElement()
//{
//	let e = new Element("tag");
//	console.log(e);
//	console.log(e.toString());
//	console.assert(e.toString() === "<tag/>");
//}
//function testElementAttributes()
//{
//	let e0 = new Element("tag", {k: "v", k2: 2});
//	let e1 = new Element("tag");
//	e1.attributes({k: "v", k2: 2});
//	console.log(e0);
//	console.log(e1);
//	console.assert(e0.toString() === e1.toString());
//	e0.attributes({k: "w"});
//	e1.attribute["k"] = "w";
//	console.log(e0);
//	console.log(e1);
//	console.assert(e0.toString() === e1.toString());
//}
//function testElementContent()
//{
//	let e = new Element("tag");
//	e.content("contents");
//	console.log(e);
//	let c = Element.copy(e);
//	//let e1 = Element.copy(e);
//	e.content(c);
//	console.log(e);
//	console.log(e.toString());
//}
//function testXml()
//{
//	testElement();
//	testElementAttributes();
//	testElementContent();
//}
//testXml();
///*
//console.log(e.toString());
//e.content("content");
//console.log(e);
//console.log(e.toString());
//let c = Element.copy(e);
//c.attributes({k3: "v3"});
//console.log(c);
//e.content(c);
//const c: Content = new Content("a");
//console.log(c.toString());
//
//let e = new Element("name");
//console.log(e);
//console.log(e.toString());
//console.log(".");
//console.log(c.lookupAttributeValue("k3"));
//console.log(c.lookupAttributeValue("k2"));
//
//
//e.attribute["k"] = "v";
//console.log(e);
//console.log(e.toString());
//e.attribute["k1"] = "v2";
//console.log(".");
//
//e.content("c");
//console.log(e);
//console.log(e.toString());
//console.log(".");
//
//const v: Element = Element.copy(e);
//console.log("v = " + v);
//console.log("v = " + v.toString());
//const ev: Content = new Content(v);
//console.log("ev = " + ev.toString());
//e.content(v);
//console.log(e);
//console.log(e.toString());
//console.log(".");
//*/
//
