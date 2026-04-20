from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

app = FastAPI()

# Configure CORS - Updated for brannigan
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://100.81.70.37:5174",
        "http://brannigan.taila277ca.ts.net:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
api_key=os.getenv("OPENAI_API_KEY")
# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# Product database - load from external JSON file for easier maintenance
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), "products.json")
try:
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        PRODUCT_DATABASE = json.load(f)
except Exception as e:
    # Fall back to an empty list and log a warning. Endpoints will still work but return no products.
    PRODUCT_DATABASE = []
    print(f"Warning: Failed to load product database from {PRODUCTS_FILE}: {e}")

# Request/Response models
class RecommendationRequest(BaseModel):
    items: List[str]
    preference: str
    other_info: str = ""

class ImageExtractionRequest(BaseModel):
    image: str
    media_type: str

@app.get("/")
def read_root():
    return {"message": "Smart Grocery List API"}

@app.post("/api/recommend")
async def get_recommendations(request: RecommendationRequest):
    try:
        # Verify API key is set
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured. Please set OPENAI_API_KEY in .env file")

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart grocery shopping assistant. You must respond ONLY with a JSON object containing an 'ids' array of product IDs."
                },
                {
                    "role": "user",
                    "content": f"""Given a list of items or meals and shopping preference, recommend specific products from the database.
If it's a meal, search online for main ingredients, recommend specific products from the database.

Items requested: {', '.join(request.items)}
Shopping preference: {request.preference}
Other Information: {request.other_info}
Product Database: {json.dumps(PRODUCT_DATABASE)}

Recommend products based on the preference:
- budget: cheapest options with good stock
- quality: premium quality items or high popularity
- inspiration: recommend two more items that customer might like
- **Crucially, all recommendations MUST respect the 'Other Information'. For example, if 'gluten-free' is mentioned, only recommend products where the 'tags' list includes 'gluten-free'. If no products match, do not recommend one for that item.**

Return ONLY a JSON object with an 'ids' key containing an array of product IDs. Example: {{"ids": [1, 4, 10, 13]}}
Each items requested must be represented by ONLY ONE product ID in the response.
DO NOT include more than one product ID per requested item.
DO NOT include any other text or explanations."""
                }
            ],
            temperature=0.1,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )

        # Parse response
        response_text = response.choices[0].message.content.strip()
        parsed = json.loads(response_text)
        # Extract IDs from response
        product_ids = parsed.get("ids", [])
        if not isinstance(product_ids, list):
            product_ids = list(parsed.values())[0] if parsed else []

        # Get full product details for recommended IDs
        recommended_products = [
            product for product in PRODUCT_DATABASE
            if product["id"] in product_ids
        ]

        return {"products": recommended_products}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/api/products")
def get_products():
    return {"products": PRODUCT_DATABASE}

@app.post("/api/extract-text")
async def extract_text_from_image(request: ImageExtractionRequest):
    try:
        # Verify API key is set
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        # Call OpenAI Vision API to extract text from image
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Extract all grocery items from this handwritten shopping list image.
                            Return the items as plain text, one item per line.
                            Only include the item names, no quantities or other details.
                            If the image doesn't contain a shopping list, return 'ERROR: Not a shopping list'."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{request.media_type};base64,{request.image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=800
        )

        extracted_text = response.choices[0].message.content.strip()

        if extracted_text.startswith("ERROR:"):
            raise HTTPException(status_code=400, detail=extracted_text)

        return {"items": extracted_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
