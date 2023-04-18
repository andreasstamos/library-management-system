import pytest

def jsonsort(item):
    if isinstance(item, dict):
        return sorted((key, jsonsort(values)) for key, values in item.items())
    if isinstance(item, list):
        return sorted(jsonsort(x) for x in item)
    else:
        return item

def test_get(client):
    response = client.get("/book/", json={})
    assert response.status_code == 200
    assert response.json == {"success": True, "books": []}

def test_insert_get(client):
    response = client.post("/book/publisher/", json={"publisher_name": "testPublisher"})
    assert response.status_code == 201, response.json
    assert response.json == {"success": True}, response.json

    new_book = {"isbn":"9164567890123", "title":"testTitle", "publisher_name":"testPublisher", "page_number":123,
            "summary":"testSummary", "language":"testLanguage", "authors":["johnsmith", "johndoe"],
            "keywords":["testKeyword"], "categories":[]}
    response = client.post("/book/", json=new_book)
    assert response.json == {"success": True}, response.json
    assert response.status_code == 201, response.json
    
    for fieldName, value in new_book.items():
        if value == []: continue
        response = client.get("/book/", json={fieldName: value})
        assert jsonsort(response.json) == jsonsort({"success": True, "books": [new_book]}), response.json
        assert response.status_code == 200, response.json

