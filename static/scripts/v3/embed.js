var linechart = {
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  "description": "A line chart showing the total amount of money committed every year between 1991 and 2010",
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

var barchart = {
"$schema": "https://vega.github.io/schema/vega-lite/v2.json",
"description": "A bar chart showing recipient countries who received more than 10 million between 1991 and 2010",
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

vega.embed("#linegraph", linechart);
vega.embed("#bargraph", barchart);
