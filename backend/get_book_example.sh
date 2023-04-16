#!/bin/bash

JSON='{"isbn":"9264567890123", "a": "123", "title":"testTitle", "publisher":"testPublisher", "pageNumber":123,
"summary":"testSummary", "language":"testLanguage", "authors":["johnsmith"], "keywords":[], "categories":[]}'

curl -X GET 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d "{}"

