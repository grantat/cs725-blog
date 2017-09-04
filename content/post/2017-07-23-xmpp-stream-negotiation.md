---
title: "XMPP Stream Negotiation"
date: 2017-07-23T00:00:00-00:00
categories: ["XMPP"]
thumbnail: /img/XMPP_logo.svg
square_thumb: true
cover: /img/XMPP_logo.svg
cover_width: 320
cover_link: https://xmpp.org/
cover_title: 
description: Protocol problems with XMPP stream negotiation, and proposals for addressing them.
draft: true
---

The <abbr title="Extensible Messaging and Presence Protocol">XMPP</abbr>
connection process is a rather elegant protocol that sets up the session state
by constructing stateful <abbr title="Extensible Markup Language">XML</abbr>
"streams" and negotiating features.
In theory its simplicity makes it very easy to implement; in practice (like all
protocols), there are a number of small gotchas that catch people new to XMPP
off guard.
This post documents some of the gotchas that always trip me up, and discusses
possible fixes for a theoretical future XMPP stream negotiation protocol.
It assumes familiarity with the basics of XML and XMPP stream negotiation.


## Bind

During the initial handshake, stream features are represented as arbitrary XML
with a full name (local name and namespace) that is unique to the feature.
For instance, to advertise support for resource binding (the ability for the
server to assign a unique address to the client) and STARTTLS (note that these
probably generally wouldn't be advertised alongside one another, the server
probably would require TLS to be negotiated first) the server might send a list
of features that includes:

    <stream:features>
        <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'/>
        <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'>
          <required/>
        </starttls>
    </stream:features>

The clients response to this feature list depends on which feature the client
chooses to negotiate.
If a client in this example chose to negotiate TLS, it would send back an empty
`starttls` element qualified by the same namespace as the `starttls` feature:

    <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>

Because the response is not a stanza (an XMPP primitive with special meaning) it
cannot be accidentally routed to a third party — servers don't yet need to know
anything about routing, so a "to" attribute is meaningless.
It also means that session initialization code can be separated from code for
handling stanza semantics: because we don't know anything about stanzas or
stanza semantics, any security concerns related to stanzas don't necessarily
affect the handshake and session initialization logic.

Unfortunately, this all falls apart in the last step of the handshake, a step
called "resource binding".
When this feature is negotiated, clients are given a unique address; only after
clients become addressable on the network can they send routable stanzas to
other clients or servers.
Bind requests are themselves, however, stanzas.
Specifically, they're an <abbr title="Info-Query">IQ</abbr> which means they
have certain semantics such as requiring a unique ID, requiring a single
payload, requiring certain values for the type attribute on the request and
response, etc. meaning our session initialization code now has to know all about
IQs.
To select the `bind` feature in the previous example, a client must send
something like:

    <iq id='yhc13a95' type='set'>
      <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'>
        <resource>balcony</resource>
      </bind>
    </iq>

This requires that the client and server understand IQ semantics, and means that
the server can't simply match the start token of the feature to a list of start
tokens it send in the features list (it has to know that an IQ with a `bind`
payload matches the `bind` feature that it sent), complicating our code.

An experimental fix for this was proposed in [XEP-0386].
This also fixes several race conditions and begins to describe (although not yet
in any detail) a process for pipelining the initial connection.
In a hypothetical future XMPP 2.0 specification, I think it would be desirable
to mandate that stanzas cannot be sent until after resource binding is complete
(even if they are addressed to the server and do not need to be routed
publicly) and to mandate that features and responses must use the same name on
their start element tokens (if the server sends a feature called
`bind` with a certain namespace, the client must respond with an element called
`bind` in the same namespace).
This has the potential to make writing clients and servers much easier and to
separate the session initialization code from the stanza handling code.

[XEP-0386]: https://xmpp.org/extensions/xep-0386.html

## Stream Prefix

I confess: I have almost no understanding of XML.
This both means that there may be good reasons for some of the things I'm going
to complain about, but also is probably representative of the majority of
developers and makes getting started with XMPP harder.
In general XMPP uses a "sane" subset of XML that includes namespaces (one of
XMPPs primary benefits over other messaging protocols) but excludes comments,
directives, processing instructions, etc.
XMPP also avoids the use of namespace prefixes with a few minor
exceptions including the handshake.
There are two problems with prefixes:

1. They are not supported by some XML parsers
2. They aren't widely understood by developers

Neither of these would normally be a major problem, except that XMPPs use of
prefixes doesn't actually provide any benefit that I can see.
Since it is only a source of confusion for developers, and possibly a source of
bugs or will require workarounds in libraries with broken namespace support, it
doesn't seem worth having in the spec.

If it is necessary to give stream initiation elements their own namespace, it
may be better to elide the prefix and set that namespace as the default
namespace.
This moves responsibility to the spec itself to enforce that children (eg.
declared stream features) declare their own namespace and allows us to ban the
use of prefixes in XMPP:

    <!--
        Current real world format (XML comments are for example only and are not
        valid in XMPP)
    -->
    <stream:features>
        <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'>
            <required/>
        </starttls>
    </stream:features>

    <!-- Imaginary new format -->
    <features xmlns='http://etherx.jabber.org/streams'>
        <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'>
            <required/>
        </starttls>
    </features>

In theory it is already possible to do it this way (the XML is equivalent
assuming the "stream:" prefix has already been defined on the root node for the
prefixed version), but I suspect that many libraries in the real world are
specifically checking that an element is called "stream:features", not that it
is called "features" and has the given namespace.
This is a good example of where XML being overly complicated has encouraged
people to take shortcuts and make compatibility more difficult.
In a future XMPP spec, I think it would be desirable to ban stream prefixes
entirely.

## Required stream features

In the previous example we saw the STARTTLS stream feature being advertised with
a `<required/>` child element which, as you might expect, indicates that
STARTTLS is mandatory to negotiate:

    <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'>
        <required/>
    </starttls>

Unfortunately, this "required" element is not itself standardized across stream
features.
The working group noted that this is a problem:

> Informational Note: Because there is no generic format for
> indicating that a feature is mandatory-to-negotiate, it is
> possible that a feature that is not understood by the initiating
> entity might be considered mandatory-to-negotiate by the receiving
> entity, resulting in failure of the stream negotiation process.
> Although such an outcome would be undesirable, the working group
> deemed it rare enough that a generic format was not needed.
> <footer><cite>
> [RFC 6120 §4.3.2]
> </cite></footer>

Required stream features are meant to be negotiated first, followed by optional
stream features.
Since no generic format is defined for checking if a feature is required, this
means we can't know if features we don't support are required and if it results
in a problem error messages end up being rather meaningless.
It also means we have to fully parse the feature before we can know if it's
required.
Instead, it would be nice if we could only parse the start element token and
know if the feature was required or not and then take action based on that (eg.
skip the rest of the element, or parse it into a data structure for use later):

    <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls' required='true'/>

Ambiguity in a network protocol is bad, rare or no, and it would be nice to see
this fixed.
Unfortunately, the example I gave above has the required attribute namespaced
the same as the feature itself (meaning it would have a different namespace for
different features, and would not be "the same" required attribute).
This isn't really the end of the world, but it does break XML semantics a bit
which is ever so slightly annoying.
I think it's better than the alternative though (requiring namespaced
attributes).
As much as I wish XMPP used some format other than XML, I don't know of anything
else that's less complicated that is so well suited to stateful, streaming
protocols.

Another alternative would be to not allow required and optional features to be
advertised together (you'd advertise all required features first, then all
optional features second). This works well, but also means more round trips on
the first connection (supporting pipelining in the future makes it matter less
on subsequent connections).

[RFC 6120 §4.3.2]: https://tools.ietf.org/html/rfc6120#section-4.3.2
