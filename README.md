# SVG

Simple Typescript wrappers for generating SVG. 

## `<xml>`

SVG is XML. A simplified BNF grammar for it is.

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

The user coordinates to viewport coordinates transformation corresponds to
`transform="translate(-x, -y) scale(width/w, height/h)"`.
Transforms are applied left to right.

For plotting graphs it is convenient to automatically generate the viewport
dimensions and flip the y-axis. We want to specify `(xmin, ymin)` and
`(xmax, ymax)` and use `(x,y)` user coordinates in the corresponding rectangle.
This requires the `viewBox="-xmin -ymin xmax-xmin ymax-ymin"`. To flip
the y-axis we translate by $(0, ymax-yming)$ and scale by `(1,-1)`.
