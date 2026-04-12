import requests
import json

url = "http://localhost:8000/upload"
files = {'file': open('test.csv', 'rb')}
r = requests.post(url, files=files)
print(json.dumps(r.json(), indent=2))
