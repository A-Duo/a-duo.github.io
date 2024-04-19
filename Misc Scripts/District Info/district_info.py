from pathlib import Path
import json

CUR_PATH = Path(__file__).parent

LEGISLATOR_INFO_PATH = "legislators.json"
HOUSE_GEO_INFO_PATH = 'UtahHouseDistricts2022to2032_-7438567037174145176.csv'
SENATE_GEO_INFO_PATH = 'UtahSenateDistricts2022to2032_-2057536239830280254.csv'

info = {"house":[], "senate": []}

with open(CUR_PATH / LEGISLATOR_INFO_PATH, 'r') as f:
    data = json.load(f)
    for i in range(0, 75):
        temp = {}

        temp["name"] = data["house"][i]["formatName"]
        temp["imgUrl"] = data["house"][i]["image"]

        info["house"].append(temp)

    for i in range(0, 29):
        temp = {}

        temp["name"] = data["senate"][i]["formatName"]
        temp["imgUrl"] = data["senate"][i]["image"]

        info["senate"].append(temp)

with open(CUR_PATH / HOUSE_GEO_INFO_PATH, 'r') as f:
    lines = f.readlines()
    for i in range(0, 75):
        info["house"][i]["area"] = float(lines[i+1].split(',')[3])

with open(CUR_PATH / SENATE_GEO_INFO_PATH, 'r') as f:
    lines = f.readlines()
    for i in range(0, 29):
        info["senate"][i]["area"] = float(lines[i+1].split(',')[3])

with open (CUR_PATH / 'utah-district-info.json', 'w') as f:
    json.dump(info, f)