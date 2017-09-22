---
title: "Visualization Implementation 3"
date: 2017-09-22T00:18:41-04:00
categories: []
cover:
cover_alt: ""
cover_caption:
cover_link:
cover_title: ""
cover_width: 640
thumbnail: ./images/v3/v3_logo.png
square_thumb: false
description: ""
excerpt: ""
draft: false
article_class:
content_class:
nocopy: false
---
Solution to Visualization Implementation 3 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI3).
This third assignment explores using Vega-Lite or NVD3 to visualize data.

<!--more-->

<link rel="stylesheet" type="text/css" href="../../../styles/home.css">



## Assignment

For this assignment we were assigned to use either Vega-Lite or NVD3 to visualize
aid data previously used in our in class work [1](http://www.cs.odu.edu/~mweigle/CS725-F17/ICW1).
My choice was to use Vega-Lite to complete this assignment.

## Chart 1

The questions we posed in our in class work involved mostly tracking money and I personally
found this easier to graph in this scenario. One of the questions we had was how much money
overall was donated each year? I decided to use this question for my line chart.

Before constructing the graph I transformed the data by extracting the two fields I needed,
year and commitment_amount, using a python script to make a JSON file as shown below:

```python
def yearAndAmounts():
    outjson = []
    newjson = {}
    with open('../../data/v3/aid_data_full.csv') as f, \
            open('../../data/v3/year_amount.json', 'w') as out:
        reader = csv.reader(f)
        next(f, None)
        next(f, None)
        for row in reader:
            year = int(row[1])
            amount = float(row[4])
            if year in newjson:
                newjson[year] += amount
            else:
                newjson[year] = 0.0
                newjson[year] += amount

        for i in newjson:
            temp = {}
            temp["year"] = i
            temp["amount"] = newjson[i]
            outjson.append(temp)
        json.dump(outjson, out, sort_keys=True, indent=4)
```

Then I could plot a line chart showing the trend of money over time as shown below.
One thing I find interesting is that there is a trend showing a significant recognition
for aids in the mid 90s but then it dies down once the early 2000s start. After the early
2000s it starting to get more and more of a popular cause to be donating to.

<div id="linegraph"></div>

The code to generate this graph is as follows:

```Javascript
var linechart = {
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  "description": "A line chart showing the total amount of money committed every
                  year between 1991 and 2010",
  "data": { "url": "../../../data/v3/year_amount.json"},
  "transform": [{"filter": "datum.year <= 2010"}],
  "mark": "line",
  "encoding": {
    "x": {
      "field": "year", "type": "ordinal",
      "axis": {"format": "%Y", "title": "years"}
    },
    "y": {
      "aggregate": "sum", "field": "amount", "type": "quantitative",
      "axis": {"title": "total funds (million)"}
    }
  }
};

vega.embed("#linegraph", linechart);
```

Remarks on ease: I felt this took a bit longer to get used to, but I actually like this
library to help me build graphs fast since its very simple.

Helpful links included:

- https://vega.github.io/editor/#/examples/vega-lite/line

## Chart 2


Another one of my groups questions was which recipients were the most most favored for
commitment money? There were a lot of recipients and we only wanted a select few. I decided
this would be easily display using a bar chart.

Again before creating a graph I had to transform my data. I did so using the following
python script:

```python
def recipientAndAmount():
        outjson = []
        newjson = {}
        with open('../../data/v3/aid_data_full.csv') as f, \
                open('../../data/v3/recip_amount.json', 'w') as out:
            reader = csv.reader(f)
            next(f, None)
            next(f, None)
            for row in reader:
                recip = row[3].strip()
                amount = float(row[4])
                if recip in newjson:
                    newjson[recip] += amount
                else:
                    newjson[recip] = 0.0
                    newjson[recip] += amount

            for i in newjson:
                temp = {}
                temp["recip"] = i
                temp["amount"] = newjson[i]
                outjson.append(temp)
            json.dump(outjson, out, sort_keys=True, indent=4)
```

When creating this graph I noticed that the total amount of money was often very
high for each recipient or very low. Therefore since I was looking for the top recipients
I decided to apply a filter of 10 million as the minimum amount to view for my chart. The graph
produced can be seen below.

What I found interesting is how many unspecified recipients actually received money.
When I was with my group we kind of assumed that this one would actually be fairly high.
I was also surprised to see South Africa lower in this set as its usually almost a stereotype
that it will be associated with aids relief. What can be taken away from the top recipient
is that there isn't necessarily a group that people are very closely tied to with bilateral,
unspecified almost doubling the next highest, Indonesia.



<div id="bargraph"></div>

The code for this graph is as follows:

```Javascript
var barchart = {
"$schema": "https://vega.github.io/schema/vega-lite/v2.json",
"description": "A bar chart showing recipient countries who received more
                than 10 million between 1991 and 2010",
"data": {
         "url": "../../../data/v3/recip_amount.json",
     "format": { "type": "json" }
        },
"signals": [
  {
    "name": "tooltip",
    "value": {},
    "on": [
      {"events": "rect:mouseover", "update": "datum"},
      {"events": "rect:mouseout",  "update": "{}"}
    ]
  }
],
"transform": [{"filter": "datum.amount >= 10000000"}],
"mark": "bar",
"encoding": {
  "x": {
    "field": "recip", "type": "ordinal",
    "sort": {"op": "sum", "field": "amount", "order": "descending"},
    "axis": {"title": "Recipient Countries"}
  },
  "y": {
    "aggregate": "sum", "field": "amount", "type": "quantitative",
    "axis": {"title": "Total Amount Received (million)"}
  },
  "tooltip": {"field": "amount", "type": "quantitative"}
}
};
```

Remarks on ease: After the first graph I felt somewhat eased into this one. Its practically
the same thing but you just have to apply and different type so it really wasn't difficult.


Helpful links included:

- https://vega.github.io/vega-lite/tutorials/getting_started.html


<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vega/3.0.2/vega.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vega-lite/2.0.0-rc3/vega-lite.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vega-embed/3.0.0-beta.20/vega-embed.js"></script>
<script src="../../../scripts/v3/embed.js"></script>
