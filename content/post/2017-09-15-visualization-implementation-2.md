---
title: "Visualization Implementation 2"
date: 2017-09-15T00:00:00-04:00
categories: []
cover:
cover_alt: ""
cover_caption:
cover_link:
cover_title: ""
cover_width: 640
thumbnail: ./images/v2/v2_logo.png
square_thumb: false
description: ""
excerpt: ""
draft: false
article_class:
content_class:
nocopy: false
---

Solution to Visualization Implementation 2 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI2).
This second assignment explores using OpenRefine for data cleaning.

<!--more-->

<link rel="stylesheet" type="text/css" href="../../../styles/home.css">

## Tutorial part 1

Under "Clean up country names", what other countries had issues with spelling? List the variations and explain how you discovered them in your project README.md.

Besides the United States variations, I also found multiple countries to have issues with spelling or repetition.
I discovered another variation for the United States using the key collision method and keystring function metaphone3.
I also found "Russia" to be misspelled with "Rossija" with the key collision method and keystring function cologne-phonetic.
I found mistakes with Scotland such as "Scotland, UK" and "Scotland, United Kingdom" using the nearest neighbor method
with the PPM distance function with a radius of 10 block chars of 10.
This also applied to Netherlands which had a "the Netherlands" values. I also found that there were over 5000 values
that clustered with the United Kingdoms, however the United Kingdom is broken up into 4 regarded countries, so I didn't
alter these values unless they had "UK" instead of "United Kingdom".

## Tutorial part 2

<img class="img-limit center-block" alt="D3 Screenshot" src="../../../images/v2/endowments_vs_numstudents.png">

After walking through the tutorial steps I got to the "Exploring the data with scatter plots" section
and successfully created the graph and exported image as shown above. It should be noted that in the tutorial
I noticed that he/she had around 500 rows while I had about 1500 rows, this could have been caused
by my error in following the tutorial, my choice from the first step to merge other rows
or an error on their part for not updating the tutorial.

## Tutorial part 3

My exported, cleaned, comma-separated file can be found [here](../../../data/v2/cleaned-universityData.csv).

## Exercise: Is the 27 Club Real?

A few notes on the data:
- There was originally 65535 rows in the csv
- The columns were: all, artist, genre, birthdate 1-3 and deathdate 1-3

My process to clean and discover if the 27 club was real was determined with the following steps:

1. First I decided to clean the artist names. Some of them had parenthesis, some of them were misspelled
In any of these cases it caused creating extra rows. So I manually compared the differences in the
names using simply by the cluster produced by the key collision method. The keying functions used were
fingerprint and n-gram fingerprint as they most effectively found near-duplicate pairs.
An example for needed replacement, there were 4 different representations
of the same name, Marian Richero, shown as follows(ignoring the row count):
    - Marian Richero(2 rows)
    - MARIAN RICHERO(1 rows)
    - Marian richero(1 rows)
    - Richero Marian(1 rows)
2. I noticed that there still many names still left over from my name purge so I decided to performing
`edit cells -> blank down` then `Facet -> Customized facets -> Facet by blank` selecting all the blank
artists and applying `remove all` to these rows. This left me with 20985 rows. If I tried to facet this
I would find 20985 unique names which is what I was going for.
3. Then I decided to move on to the actual date cleaning. I noticed genre also had duplicate
entries as well, however, duplicate genres is allowed just not for the same person so I decided
not to handle that part quite yet. I decided this was a good time to use the functions the tutorial
provided that checks for null values So for birthdate and deathdate columns I applied
`Edit cells -> Common transformations -> To text` then `Edit cells -> Common transformations -> To date`.
If an artist had a birthdate or deathdate that was null or not correctly formatted I decided to throw
them out as they haven't died yet or we don't have a birthdate to tell if they were 27. This left
me with 3255 artists left to determine if this was real.
4. Lastly I applied the last two functions provided in the tutorial to determine if users were
27 years old, `value.match(/.*(\d{4}).*/)[0]` to get a year format which was then parsed as an
integer. Then I determined the difference of the deathdate subtracted by the birthdate,
`cells.deathdate.value - cells.birthdate.value`.
5. Without going any further than this 25 out of 3255 were age 27 at the time of their death.
There was still some dates that were not reasonable so I had to filter any artist below 10 and above 110.
Even then 25 people with ages of 27 isn't really an outstanding number in a set of a thousand. Therefore,
it is my conclusion that the 27 club is not real.

The files created in this tutorial are:

- [List of artists dead at 27](../../../data/v2/artists-with-age-27.csv)
- [Full list of end result](../../../data/v2/total-set-of-artists-with-agedeaths.csv)
