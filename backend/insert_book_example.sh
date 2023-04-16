#!/bin/bash

JSON='{"isbn":"3264567890123", "title":"testTitle", "publisher":"testPublisher", "pageNumber":123,
"summary":"testSummary", "language":"testLanguage", "authors":["johnsmith"], "keywords":[], "categories":[]}'

curl -X POST 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d "$JSON"

