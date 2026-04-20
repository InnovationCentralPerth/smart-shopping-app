# Smart-Shop Backend (FastAPI)

This is the backend service for the Smart Grocery List project. It is a small FastAPI application that exposes product data and uses the OpenAI client to generate product recommendations based on a list of requested items and a shopping preference.

## What it does

- Serves a static in-memory product database via `/api/products`.
- Exposes a recommendation endpoint `/api/recommend` that sends the user's items and preference to the OpenAI API and expects a JSON response containing product IDs. The service returns the matched product objects from the in-memory database.
- Basic CORS is enabled for the frontend origin `http://localhost:5173` (adjust as needed).

## Prerequisites

- Python 3.10+ (or a compatible Python 3.x)
- A valid OpenAI API key (set in an environment variable named `OPENAI_API_KEY`)
- Install dependencies from `requirements.txt`:

```bash
pip install -r requirements.txt
```

If your environment uses a virtualenv or venv, activate that first.

## Environment variables

Create a `.env` file in the `backend/` directory or set the environment variable directly. Example `.env` (do NOT commit real keys):

```
OPENAI_API_KEY=sk-...
```

The app uses `python-dotenv` to load `.env` automatically.

## Run the server

You can run the app either with uvicorn directly or with the small `if __name__ == '__main__'` entry in `main.py`.

Run with uvicorn (recommended for development):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run the module with Python (the file contains a `uvicorn.run` entry):

```bash
python main.py
```

The API will be available at: http://localhost:8000

## Endpoints

- GET /
  - Returns a small welcome JSON: `{ "message": "Smart Grocery List API" }`.

- GET /api/products
  - Returns the full in-memory product database.
  - Example response:
    ```json
    { "products": [ {"id":1, "name":"Coles Cream Cheese 250g", ...}, ... ] }
    ```

- POST /api/recommend
  - Accepts JSON body:
    ```json
    {
      "items": ["Cream Cheese", "Milk"],
      "preference": "budget"
    }
    ```
  - Sends the request to OpenAI (the backend expects the OpenAI API key) with a system prompt that requests only a JSON object with an `ids` array. The service then returns the full product objects matching those IDs.
  - Example success response:
    ```json
    { "products": [ {"id": 6, "name": "FreshFarm Cream Cheese 250g", ... }, ... ] }
    ```

  - If the OpenAI API key is missing the endpoint will return a 500 error with a clear message.

## Notes & Troubleshooting

- Make sure `OPENAI_API_KEY` is set in the environment where the server runs. Without it the `/api/recommend` endpoint will fail with a 500 error.
- The backend currently uses an in-memory product database defined in `main.py`. This is non-persistent and intended for local development and demos only.
- CORS allow list currently contains `http://localhost:5173` for the frontend; update that origin if your frontend runs on a different host/port.
- The OpenAI client in the code uses `from openai import OpenAI` and instantiates `OpenAI(api_key=...)`. Confirm the installed `openai` package version matches this usage.

## Example curl commands

Get the product list:

```bash
curl http://localhost:8000/api/products
```

Request recommendations (replace key and adjust payload as needed):

```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"items": ["Cream Cheese", "Milk"], "preference": "budget"}'
```

## Security

- Do not commit your `.env` file or your OpenAI API key to version control.
- For production, consider moving the OpenAI key into a secure secrets store and lock down CORS and networking appropriately.

## Next steps / Improvements

- Persist the product database in a real database (SQLite/Postgres) rather than keeping it in memory.
- Add unit tests and simple integration tests for the endpoints.
- Add request validation and rate limiting for the `/api/recommend` endpoint.

--
Generated README for the backend FastAPI application.
