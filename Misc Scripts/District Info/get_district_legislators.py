from pathlib import Path
import requests
import json

_SECRET_PATH = (Path(__file__).parent / 'secret.txt')

if (not _SECRET_PATH.exists()):
    print('ERROR | Utah legislation "secret.txt" developer api key file is missing.')
    exit()
SECRET_KEY = (Path(__file__).parent / 'secret.txt').read_text()

data = {"house":[], "senate":[]}

for i in range (1,76):
    data["house"].append(requests.get(f"https://glen.le.utah.gov/legislator/H/{i}/{SECRET_KEY}").json())

for i in range (1, 30):
    data["senate"].append(requests.get(f"https://glen.le.utah.gov/legislator/S/{i}/{SECRET_KEY}").json())

with open (Path(__file__).parent / 'legislators.json', 'w') as f:
    json.dump(data, f)
