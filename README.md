# SVG

Simple Typescript wrappers for generating SVG. 

## `<xml>`

A simplified BNF grammar for XML is.

```
document ::= prolog? element

element ::= emptyElement
          | startTag content endTag

emptyElement ::= '<' Name attributes? '/>'

startTag ::= '<' Name attributes? '>'

endTag ::= '</' Name '>'

attributes ::= attribute*

attribute ::= Name '=' String

content ::= (element | text)*

text ::= Char*
```

```
let e = new Element("tag", attributes?, content[]?);
e.attributes({k:v, ...}); // add/change attributes
e.attribute[k] => v
e.lookupAttributeValue(k) => first value found in current or ancestors
e.content([string, ...]) // append test content
e.content([Element, ...]) // append element content
```

Use `static Element.copy(element): Element` to avoid circular references.

Use `Element.toString(): string` to generate XML text.

## `<svg>`

The `<svg>` element specifies a _viewport_ with `height` and `width` attributes
that determine the size displayed in a browser.
The attribute `viewBox="x y w h"` determines how user points are mapped
to viewport points. The user point `(u,v)` is mapped to the
viewport point `((u - x)*width/w, (v - y)*height/h)`.

Any group of SVG elements can be transformed prior to rendering in the viewport
by enclosing them in `<g transform="...">`.
The available transforms are
```
translate(tx, ty)
scale(sx, sy)
rotate(angle)
skewX(angle)
skewY(angle)
matrix(a,b,c,d,e,f)
```
Transforms are applied left to right.

We specify a `drawBox(x, y, w, h, s)` where `s` is the scale parameter.

```
plot = new Plot(x0, y0, w, h, s); // an svg element
```
