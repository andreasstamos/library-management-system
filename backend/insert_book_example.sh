#!/bin/bash

JSON='{"isbn":"9164567890123", "title":"testTitle", "publisher":"testPublisher", "page_number":123,
"summary":"testSummary", "language":"testLanguage", "authors":["johnsmith", "johndoe"], "keywords":["testKeyword"], "categories":[]}'

curl -X POST 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d "$JSON"

