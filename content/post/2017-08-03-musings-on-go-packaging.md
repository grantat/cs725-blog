---
title: "Musings on the Future of Go Package Management"
date: 2017-08-03T05:42:00-00:00
categories: []
cover: /img/coffeegopher.png
cover_link: https://gopherize.me/
cover_width: 625
thumbnail: /img/coffeegopher.png
square_thumb: false
description: >
              Thoughts on finding a balance between centralized and distributed
              package management that works well for package authors, consumers,
              and companies with strict package management policies.
---

The [`go`] tool generally pulls packages directly from version control and
import paths are tightly coupled with the domain of the version control service
that hosts the package.
There is no "package management", per say, just version control (mostly GitHub).
This works great, right up until the moment when GitHub gets purchased and
decides to rebrand as `github.microsoft.com`.
One would hope they would keep the old domain, but you never know.

A more likely issue is that GitHub (or Bitbucket, Launchpad, etc.) becomes
defunct for one reason or another (remember [code.google.com]?).
If you're concerned about this (I am), the `go` tool also supports
"[vanity imports]": a way of decoupling the package import path from the
<abbr title="version control service">VCS</abbr> that hosts the actual code by
serving a special HTML meta tag via HTTP on a domain under the authors control
(or a service that manages the redirect for you).
They are rarely used.

Recently a member of the Go team posted the following on Twitter:

> Non vanity import paths are considered harmful. If you are a serious project,
> enforce a vanity import path. [#golang]
>
> <footer>
> <cite>Jaana B. Dogan, <a href="https://twitter.com/rakyll/status/892805962867683328">03 Aug 2017</a></cite>
> </footer>

I agree wholeheartedly, I do not like giving ownership of my package to whomever
owns `github.com`, or even `golang.org`.
I want to be able to change my hosting provider without breaking other peoples
code.

However—as is always the case—not everyone agrees, and there are downsides to
vanity imports.
Not everyone owns a domain, or wants to go through the trouble or
expense of getting one.
Even if you do own a domain, you may not want to run an HTTP server on that
domain, or may not be able to modify the HTTP already being served there to
include a vanity import meta tag.
Also, moving entirely to vanity imports means that every time a package author
stops maintaining it and the domain expires, it becomes unavailable (whereas on
GitHub it could live on for many years, unmaintained but still reachable).

There are also problems with using a centralized service run by the language
authors.
The [Rust] team decided to go with a centralized package management service,
[crates.io], as a lazy way to get around the "leftpad problem" (where a package
maintainer removes a package from the internet and breaks all the code that
depends on it) <sup>[citation needed]</sup>.
In a nutshell, their solution to the problem is: centralize package management
and then refuse to let authors delete their packages.
This works okay too, but what if I just don't want to publish to your service
for some reason?
What if Google (a public company) ran a centralized package management service
for Go, but had to comply with U.S. export laws that require them to deny access
to anyone accessing the service from Iran?
Can you no longer use the Go tooling from within Iran?
What if the company running the service is a competitor and you don't want to
publish your packages on one of their web properties?
What if the name of your package is already taken by a squatter and you don't
want to make up a silly name that doesn't actually tell anyone what your package
is for (if you're not already familiar with Rust, care to take a guess what the
"tokio" package does)?

It's important to find a balance between a centralized package management system
like the one used by [Rust], and more distributed systems where packages are
pulled directly from their source like the [`go get`] tool.

## Users and Use Cases

If we were to try and design such a system, what are the use cases we must
support?

- Discovery — as a package consumer, I want to be able to enter the name of a
  package and have it download without having to specify any other information.
- Auditability — as a company I want my developers to only be able to use
  packages that have been audited and published to an internal server; even if
  the original author deletes the package from its original location, it should
  remain on my internal server so that builds do not break.
- Publishing — as a package author I want to publish my package to a third party
  service with good uptime, but I do not want to be locked in to that service or
  lose access to my package name if the service is shut down.
- Ownership — as a package author, I want to host my own packages and have them
  be just as easy to discover and use as packages from a "blessed" package
  repository maintained by the language authors.
- Namespacing — as a package author, I don't want to worry about whether a
  common package name such as "xmpp" or "tls" is already taken.

Also, in the case of Go, "backwards compatibility" — we need to support fetching
existing packages that may or may not use a vanity import path.

## Federated package management

I think the previous use cases (and many more) are best served by a
(more-or-less) federated package management system that reuses DNS for discovery
(no HTML or HTTP) and optionally lets package authors or companies run their own
package distribution server.
I see this working as follows:

When the user runs `go get` (or `dep`) the tool checks a local config file for
the users preferred package management server.
If a config file is present, `go get` asks the server specified in the config
file (the "local server") for the package by sending the server the fully
qualified package name (eg. `mydomain.com/mypackage` or
`github.com/myname/mypackage`).
If no config file is present, the client reaches out to the domain directly,
performing the following steps as if it *were* the local server.
If the local server has the package cached, it returns it.
If not, the local server performs a [DNS SRV] lookup to discover where the
package management server responsible for packages namespaced under the domain
live.
If SRV records are returned, the local server reaches out to the server
specified in the chosen SRV record (the "authoritative server") and asks for the
package, then returns it to the client.
If no SRV records exist, the local server falls back to current behavior and
attempts to fetch an HTTP page from the domain and check for a legacy `<meta>`
redirect and follow that to the version control system or clone the source from
one of the special cased version control providers.

If a service provided the ability to host packages, not just fetch them it would
verify ownership of the domain (eg. by asking the user to publish a TXT record
containing a random string), and verify that it is the authoritative server for
the domain (by checking for the presence of SRV records pointing to the correct
place), and then would begin responding to queries for packages uploaded by the
user for the domain.
If it ever detected that the SRV records no longer listed it as the
authoritative package server for the domain, it would flush its cache of all
packages for the domain and would either reject future requests for them since
it no longer owns the packages, or would download, cache and return the packages
from the new authoritative server.

This all becomes a matter of server policy: the `golang.org` server (if such a
thing ever exists) might only serve packages for which it is the authoritative
server (possibly under a `golang.org` namespace, or possibly under custom user
domains), while an internal company server might download and serve any package
that meets a set of corporate requirements.
As a package author this also allows me to run my own server and make it the
authoritative server for my domain, or move my packages to a package hosting
service at a later date without losing control of the package import path.

A single server does not have to be written to take into account all policies
that might be desired by companies, hosting providers, and package authors; as
long as the protocol for client to server and server to server communication is
standardized, a very simple server could be shipped with Go and companies with
stringent rules could make or buy more advanced servers or services with
customizable policies.

**UPDATE:** Someone on Twitter [pointed out] that this had [just been proposed] a
few hours ago and the issue of DNS security was raised.
This is an issue that would have to be considered in more detail than a
handful of GitHub comments or a quick outline blog post (eg. if a real proposal
were ever written).
One solution would be to only allow DNS-based discovery for new-style packages
using a packaging server (which you then contact over TLS, verifying the
certificate).
This does lose you some convenience since a server is always required, and makes
delegation to another service harder without giving them a cert corresponding to
your domain.
Food for thought.

---

Gopher artwork by [Ashley McNamara] and based on an original work by
[Renee French].

[`go`]: https://golang.org/
[Rust]: https://www.rust-lang.org/
[crates.io]: https://crates.io/
[`go get`]: https://golang.org/doc/articles/go_command.html#tmp_3
[vanity imports]: https://golang.org/cmd/go/#hdr-Remote_import_paths
[code.google.com]: https://code.google.com/archive/
[#golang]: https://twitter.com/hashtag/golang
[DNS SRV]: https://tools.ietf.org/html/rfc2782
[Ashley McNamara]: https://twitter.com/ashleymcnamara
[Renee French]: http://reneefrench.blogspot.co.uk/
[pointed out]: https://twitter.com/zekjur/status/892990357650231296
[just been proposed]: https://github.com/golang/go/issues/21284
