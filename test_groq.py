import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {"Authorization": f"Bearer {api_key}"}
payload = {
    "model": "llama3-8b-8192",
    "messages": [{"role": "user", "content": "Respond ONLY with a JSON object: {\"explanation\": \"hello\"}"}],
    "temperature": 0.2
}
response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.text)
