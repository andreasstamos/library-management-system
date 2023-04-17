#!/bin/bash

curl -X GET 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d '{"authors": ["johnsmith"]}'
echo
curl -X GET 'http://localhost:5000/book/' -H 'Content-Type: application/json' -d '{}'
