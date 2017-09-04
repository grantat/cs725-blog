---
title: "The Case for interface{}"
date: 2017-08-05T07:00:00-00:00
categories: ["go", "programming"]
cover: https://farm7.staticflickr.com/6213/6301475136_d93ee3a82d_z_d.jpg
cover_link: https://www.flickr.com/photos/samwhited/6301475136/lightbox
thumbnail: https://farm7.staticflickr.com/6213/6301475136_d93ee3a82d_q_d.jpg
square_thumb: false
description: >
  Go’s “empty interface” type is easy to abuse, but can be useful in specific
  circumstances.
  In this post I propose three rules that can be used to determine if it is
  appropriate to use an empty interface.
draft: true
---


As we begin thinking about the [future of Go] with events like the
[Contributors Summit] and by writing [Experience Reports], one topic that's near
and dear to my heart is Go's use of the empty interface.
While the empty interface is often criticized for being overused, even labeled a
"mistake" by programmers who think it erases all type information, it does have
use cases for which it is very well suited.

In this post I propose three rules that can be used to determine if your (Go 1)
use of the empty interface will work out, or lead to heartache down the line.
I also look at two examples of the empty interface in real APIs, one good, and
one a necessary evil.

But first:


## What is an empty interface?

An interesting consequence of the [Go] type system (where types implicitly
satisfy interfaces if they have the correct methods) is the empty interface:

```go
interface{}
```

Because the empty interface does not require *any* methods to be satisfied, it
is satisfied by all types.
The following is valid Go:

<pre id="gopherize">
<code class="language-go">
var v interface{}

v = 1
v = "string"
v = 2.3

v = struct{
	a int
	b string
}{
	a: 3,
	b: "One hen",
}
</code>
</pre>

Though the underlying type is not entirely lost when we assign a value to a
binding that uses the empty interface, it is still a form of type erasure.
The underlying type is hidden: it cannot be recovered without type assertions or
reflection.

> interface{} says nothing.
>
> <footer>
> <cite>Rob Pike, Go Proverbs [<a href="https://www.youtube.com/watch?v=PAAkCSZUG1c&t=455">video</a>, <a href="https://go-proverbs.github.io/">text</a>], Gopherfest SV 2015</cite>
> </footer>

In this post I'll take it as a given that reflection should be avoided if
possible.
Suffice it to say that reflection can sometimes push compile time errors back to
runtime, and can make code difficult to read and maintain.

Let us also take it as a given that the ability of the empty interface to hold a
value of any type is very easy to misuse and thus, it is (widely and often).
Experience has taught us that use of the empty interface is an
anti-pattern[^anti-pattern], albeit an elegant one.

> Empty interface is elegant in the same sense that Java's Object is elegant:
> simplicity in form, but actually confusing in practice.
>
> <footer>
> <cite>Burrito, <a href="https://twitter.com/BreetzTweetz/status/891367941702156288">29 Jul 2017</a></cite>
> </footer>


## Hypothesis

I posit that 3 conditions must be met in order to use empty interface in an API
without making the code difficult to read or maintain:

1. The behavior of the type cannot be described by an existing, more specific,
   interface.
2. A new, more specific, interface cannot be written to describe the behavior of
   the type.
3. The code that assigns a value to an empty interface must also be the code
   that consumes the value in the empty interface.

The first two points are relatively straightforward.
Together, they can be simplified to:

> If we can use a more specific type, we should.

Unless you're being forced to use a static type system against your will, I
suspect this is not very controversial and I will ignore it for the rest of the
post.
The third postulate may need a bit of discussion, since there's actually quite a
lot crammed into this seemingly simple statement.


## Example: bad use of `interface{}`

Let's take a look at the [`xml.Marshal`] function:

    // Marshal returns the XML encoding of v.
    func Marshal(v interface{}) ([]byte, error)

This is a very simple API, and satisfies our first two postulates.
We can't always use a more specific type for `v` because in Go we cannot define
methods on types from other packages.
To use a more specific interface such as [`xml.Marshaler`] every single type
defined by every single package would need to provide a "marshaler" for every
single type of encoding.

This API does not satisfy the third postulate, however, because the consumer of
the value (`Marshal`) is not the same as the producer of the value (the caller
of `Marshal`).
The consequence of this is that the default behavior isn't actually all that
useful and the XML package uses reflection heavily to find information about the
underlying type at runtime to try and avoid hitting the default case for unknown
types and provide a better XML representation.

This package—and other similar packages such as [`encoding/json`]—make good use
of `interface{}` in their API, but at the cost of maintainability.
Note that I'm not suggesting that there is a better way to handle serialization
of arbitrary values in Go 1, just that this use of `interface{}` is not ideal.


## Example: good use of `interface{}`

So what is a good use of the empty interface that meets all three of our
original requirements?
<abbr title="Simple Authentication and Security Layer">SASL</abbr> is a standard
for authentication defined in [RFC 4422].
Let's take a look at my [`mellium.im/sasl`] package.

There are two main APIs in this package: the [`Negotiator`] API is meant for
application developers and is what you use to actually negotiate auth.
Given a representation of a SASL mechanism a `Negotiator` ensures that the state
machine cannot enter an invalid state, or step backwards to a previous state
which might be a security vulnerability.

The package also contains a [`Mechanism`] API.
This API is meant for library developers creating new authentication mechanisms.
A library author might create an [XOAUTH2] mechanism to be used by application
developers in conjunction with the `Negotiator` API from the `sasl` package to
perform authorization with an [OAuth2] bearer token.
This `Mechanism` API makes use of the empty interface.

```go
// NewClient creates a new SASL Negotiator that supports creating authentication
// requests using the given mechanism.
func NewClient(m Mechanism, opts ...Option) *Negotiator

// Mechanism represents a SASL mechanism such as PLAIN or SCRAM-SHA-256 that can
// be used by a Negotiator to generate challenges and responses.
type Mechanism struct {
    Name  string
    Start func(n *Negotiator) (more bool, resp []byte, cache interface{}, err error)
    Next  func(n *Negotiator, challenge []byte, data interface{})
                (more bool, resp []byte, cache interface{}, err error)
}
```

Because the `Negotiator` manages the state machine, `Mechanism`'s are stateless.
They can be reused, are easier to write, and are less likely to contain critical
security vulnerabilities.
Having `Negotiator` handle all the state does not, of course, guarantee that
there are no bugs or vulnerabilities in the SASL mechanism implementations, it
just makes it easier for authors to write bug free mechanisms.

Unfortunately, on each step of the state machine, the mechanism may generate
information that needs to be known in a future step.
For example: the [SCRAM-SHA-256] mechanism computes a proof-of-possession which
includes the bytes of the very first message that was sent at the beginning of
auth.
If we want our mechanism to be stateless, it can't remember the bytes it
returned earlier.

Instead, the `Negotiator` (which is already stateful) keeps track of the
required state for the mechanism that it is using.
This state might be entirely different (if it exists at all) for different
mechanisms so an `interface{}` is used to store it.
Each time the state machine advances, the mechanism's `Next` function is called
(or `Start` for the first step, which is different for reasons that don't matter
here), and each time it's called it may return any state it needs to use later
using the `cache` return parameter.
This data is then cached by the `Negotiator` and when the `Next` function is
invoked again, whatever data was returned from the previous step will be passed
back in via the `data` parameter.
The `Negotiator` does not know anything about the value it is storing.
It simply stores it after `Start` or `Next` is called, and blindly passes it
along to future invocations of `Next`.
The empty interface "says nothing", but "nothing" is sometimes exactly what's
required.
The `Mechanism` on the other hand can be written to always know the type of the
value that the `data` parameter will have, because it set that value in the
first place.

This meets all of our requirements for a good use of `interface{}`:

- We cannot be more specific about the type of data stored by
  the negotiator because any SASL mechanism spec could define a mechanism that
  needs to store any type of data with any behavior (requirements 1 and 2).
- The code in the `sasl` package where the `interface{}` was *declared* needs to
  know nothing about what is stored in the interface; the code in the package
  defining the mechanism, which both produces *and* consumes the value in the
  empty interface, can always assert on the type of the value (requirement 3).


## Conclusion

The empty interface is easy to misuse, and it is not obvious under what
circumstances it can be used without making code difficult to read and maintain.
Even when experienced users are aware of the dangers of using empty interface
too readily, it is often required due to other limitations in the type system.
However, it also has use cases for which it is an excellent solution.

Future versions of Go should provide users with alternatives to misusing the
empty interface in situations where the type of data is unknown, while still
supporting the use case of APIs that may take many different types of data, but
always know the type of the data they are using.

---

Thanks to [Christopher Agocs] and [Dave Cheney] for their reviews and criticism.
Gopher artwork by [Ashley McNamara] and based on an original work by
[Renee French].

<style>
#gopherize {
  background-image: url("/img/bowtiegopher.png");
  background-repeat: no-repeat;
  background-size: 25%;
  background-position: 62% 101%;
}
</style>

[^anti-pattern]: Go Anti Patterns. Edward Muller, GopherCon 2017, https://youtu.be/ltqV6pDKZD8?t=2019

[future of Go]: https://blog.golang.org/toward-go2
[Contributors Summit]: https://blog.golang.org/contributors-summit
[Experience Reports]: http://golang.org/wiki/experiencereports
[Go]: https://golang.org/
[`xml.Marshal`]: https://golang.org/pkg/encoding/xml/#Marshal
[`xml.Marshaler`]: https://golang.org/pkg/encoding/xml/#Marshaler
[`encoding/xml`]: https://golang.org/pkg/encoding/xml/
[`encoding/json`]: https://golang.org/pkg/encoding/json/
[`mellium.im/sasl`]: https://web.archive.org/web/20170729202455/https://godoc.org/mellium.im/sasl
[RFC 4422]: https://tools.ietf.org/html/rfc4422
[`Negotiator`]: https://web.archive.org/web/20170729202455/https://godoc.org/mellium.im/sasl#Negotiator
[`Mechanism`]: https://web.archive.org/web/20170729202455/https://godoc.org/mellium.im/sasl#Mechanism
[XOAUTH2]: https://developers.google.com/gmail/xoauth2_protocol
[OAuth2]: https://tools.ietf.org/html/rfc6749
[SCRAM-SHA-256]: https://tools.ietf.org/html/rfc7677
[Christopher Agocs]: https://agocs.org/
[Dave Cheney]: https://dave.cheney.net/
[Ashley McNamara]: https://twitter.com/ashleymcnamara
[Renee French]: http://reneefrench.blogspot.co.uk/
