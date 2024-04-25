import requests
from bs4 import BeautifulSoup
import re
from pathlib import Path
import json

BILL_LIST = [
    #2024
    #'2024HB0157', # Not sure on this one, listen to the hearings later.
    #'2024HB0253', #no vote
    '2024/HB0257',
    '2024/HB0261',
    '2024/HB0303',
    '2024/HB0316', #prettier formatting: https://le.utah.gov/~2024/bills/hbillenr/HB0316.pdf
    #'2024/HB0424', #Same sponsors as HB329 in 2023, the votes against correlate with anti-trans legislation but I wouldn't fight this on the grounds of being anti trans, nor does any major organization seem to do so. Only concerning text is line 62 which is incredibly vague, you commit lewdness by "performing any other act of lewness."
    #'2024HCR018', #supported
    #'2024HB0527', #no vote
    #'2024SB0150', Law makers did a good thing <3 https://www.ksl.com/article/50886545/utah-passes-religious-freedom-bill-with-language-to-prevent-anti-lgbtq-discrimination https://twitter.com/EqualityUtah/status/1760843275907527047

    #2023
    #'2023HB0132', #failed in committee
    '2023/HB0329', #https://www.sltrib.com/artsliving/2022/12/08/scott-d-pierce-hbos-drag-show/  https://www.qsaltlake.com/news/2023/03/04/bill-in-response-to-st-george-drag-shows-not-heard-before-end-of-utah-legislative-session/
    '2023/HB0463',
    #'2023HB0464', #line 137
    '2023/SB0016', #line 240
    '2023/SB0093', #line 229
    '2023/SB0100', #line 44

    #2022
    '2022/HB0011',
    '2022S3/HB3001', #protections for hb11 enforcement
    
    #2021
    '2021/HB0302' #https://attheu.utah.edu/facultystaff/statement-regarding-house-bill-302/ https://apnews.com/article/utah-bills-legislature-government-and-politics-242a4f69473dba80d8455d352a93eb41
]

def getLegislators(table):
    return list(map(lambda x: int(x), re.findall('href=".*dist=(\d*)\'\)', str(table))))

def scrapeData(url):
    url = url.replace("&amp;", "&")
    print(url)
    soup = BeautifulSoup(requests.get("https://le.utah.gov" + url).content, 'html.parser').find("body")
    
    data = {'url': url}
    
    TABLES = soup.findAll("table")

    data['status'] = re.search('<b>[^-]*[^-]*-[^-]*-\s([^\r\n]*)', str(soup)).group(1)
    data['yea'] = getLegislators(TABLES[0])
    data['nay'] = getLegislators(TABLES[1])
    data['abs'] = getLegislators(TABLES[2])

    return data
    
billData = []

for BILL in BILL_LIST:
    print('---------------------')
    _billUrl = BILL.split('/')
    url = f"https://le.utah.gov/~{_billUrl[0]}/bills/static/{_billUrl[1]}.html"
    print(url)
    billHtml = BeautifulSoup(requests.get(url).content, 'html.parser')

    data = {'info': BILL}

    data['title'] = re.search('class="heading">([^<]*)</h3>', str(billHtml.find(id='main-content'))).group(1)

    status = str(billHtml.find(id='billStatus'))

    # Think this is accurate, checks if the last action was done by the governor's office.
    # If passage status is inaccurate then this is why.
    data['passed'] = re.search('([^>]*)<[^<]*>[^>]*><[^>]*><[^>]*>(?:[^>]*<\/[^<>]*>[^<]*)*\Z', status).group(1) == 'Executive Branch - Lieutenant Governor'

    items = re.findall('<a href="([^"]*house=[HS])">\d', status)

    houseLink = None
    senateLink = None
    for item in items:
        if (item[-1] == 'S'):
            senateLink = item
        else:
            houseLink = item

    if houseLink:
        data["houseVote"] = scrapeData(houseLink)
    if senateLink:
        data["senateVote"] = scrapeData(senateLink)

    billData.append(data)

print(billData)

with open (Path(__file__).parent / 'utah-bills.json', 'w') as f:
    json.dump(billData, f)