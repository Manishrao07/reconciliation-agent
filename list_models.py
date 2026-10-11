import os
import requests
from dotenv import load_dotenv
load_dotenv()
response = requests.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"})
print(response.text)
