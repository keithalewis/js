# SVG

Simple Typescript wrappers for generating SVG. 

## `<xml>`

An _XML document_ is a tree of _nodes_. Every document tree has
a _root node_. Every node in a document
can have any number of _child nodes_. The XML standard defines _descendants_
and _ancestors_ in the usual way.

An XML document is just an optional prolog `<?xml version="major.minor" ...?>` followed by an _element_ and zero or more miscellaneous nodes we can ignore and get by
with "major.minor" = "1.0" until you run into problems requiring more
advanced XML features.

```
document ::= '<?xml version="1.0"?>' element misc*
```

Every element is a node, but not every node is an element.

```
element ::= emptyElement
          | startTag content endTag

emptyElement ::= '<' Name attributes? '/>'

startTag ::= '<' Name attributes? '>'

endTag ::= '</' Name '>'
```

Empty elements are not necessarily empty. They can contain
_attribute_ nodes associated with the _name_ of the element.

```
attributes ::= attribute*

attribute ::= Name '=' String
```

Attributes are nodes, but do not participate in the tree of nodes hierarchy.
They associate a key-value map with element names.

content ::= (element | text)*

text ::= Char*
```

```
let e = new Element("tag", attributes?);
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
