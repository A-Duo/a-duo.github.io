from pathlib import Path
import urllib.request
import json

CUR_PATH = Path(__file__).parent
LEGISLATOR_INFO_PATH = "legislators.json"

with open(CUR_PATH / LEGISLATOR_INFO_PATH, 'r') as f:
    data = json.load(f)
    for chamber, districts in data.items():
        for district in districts:
            urllib.request.urlretrieve('https://le.utah.gov/images/legislator/'+chamber+'/'+district['id']+'.jpg', CUR_PATH / ('photos/'+district['id']+'.jpg'))