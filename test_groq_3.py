import os
import requests
from dotenv import load_dotenv
load_dotenv()
url = "https://api.groq.com/openai/v1/chat/completions"
headers = {"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"}
payload = {
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "hello"}],
    "temperature": 0.2
}
response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.text)
