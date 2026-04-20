from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key=os.getenv("OPENAI_API_KEY")

def test_openai_key():
    """Simple function to test if OpenAI API key works"""
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=api_key)
        
        # Make a simple API call
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": "Explain AI in one short sentence"}
            ],
            max_tokens=50
        )
        
        # Get the response
        ai_answer = response.choices[0].message.content
        
        print("✅ SUCCESS! Your OpenAI API key is working!")
        print(f"\nAI Response: {ai_answer}")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("\nMake sure:")
        print("1. You have a .env file with OPENAI_API_KEY=your-key")
        print("2. Your API key is valid")
        print("3. You have installed: pip install openai python-dotenv")

if __name__ == "__main__":
    test_openai_key()