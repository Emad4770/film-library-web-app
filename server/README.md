# API Design

Each API endpoint is described as follows:

- HTTP Method
- URL, optionally with parameter(s)
- Brief description of what this API is doing
- Sample request, with body (if any)
- Sample response, with body (if any)
- Error response(s), if any


## List of APIs offered by the server

### Film Management

#### Get all films

HTTP Method: `GET` URL: `api/films`

- Description: Get the full list of films or the films that match the query parameter
- Request body: _None_
- Request query parameter: _filter_ name of the filter to apply (filter-all, filter-favorite, filter-best,filter-lastmonth, filter-unseen)
- Response: `200 OK` (success)
- Response body: Array of objects, each describing a film:

``` json
[
  {
    "id": 1,
    "title": "Pulp Fiction",
    "favorite": true,
    "watchdate": "2023-08-10",
    "rating": 5,
    "userId": 2
  }
]
```
- Error response: `500 internal server error` (generic error)

#### Get film by id
