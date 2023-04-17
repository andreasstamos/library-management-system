#!/bin/bash

JSON='{"old_isbn":"9164567890123", "page_number":321, "keywords": ["abcdef"]}'

curl -X PATCH 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d "$JSON"

