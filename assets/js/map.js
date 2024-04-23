// const HOUSE_MAP_REQUEST = new Request("/assets/misc/utah-house-map.html");
// fetch("/assets/misc/utah-house-map.html")
//   .then((response) => response.text())
//   .then((json) => console.log(json));

// async function DrawMap() {
//     SCRIPT.nextElementSibling.innerHTML = await GetData("/assets/misc/utah-house-map.html")
// }

class LegMap {
    constructor(script) {
        this.HOUSE_BUTTON = script.parentElement.querySelector("#house-button");
        this.SENATE_BUTTON = script.parentElement.querySelector("#senate-button");

        this.MAP_CONTAINER = script.parentElement.querySelector("#map-bounding-box");
        this.INFO_CONTAINER = script.parentElement.querySelector("#map-info-panel");
        this.LEGISLATIVE_ACTION_CONTAINER = script.parentElement.querySelector("#legislative-action-container");
        this.VOTE_CHART_CANVAS = script.parentElement.querySelector("#vote-chart");

        this.EMPTY_INFO_PANEL_CONTENT = this.INFO_CONTAINER.innerHTML;
        
        this.isSenate = false; // false for house || true for senate

        this.DISTRICT_DATA = null;
        this.BILL_DATA = null
        this.HOUSE_MAP = null;
        this.SENATE_MAP = null;
        this.VOTE_CHART = null;
        this.VOTE_CHART_DATA = {'house': null, 'senate': null};

        this.init()
    }

    async init() {
        fetch("/assets/misc/utah-district-info.json").then(response => response.json()).then(response => {
            this.DISTRICT_DATA = response
            fetch("/assets/misc/utah-bills.json").then(response => response.json()).then(data => {
                this.BILL_DATA = data

                let VOTE_TYPES = ['yea', 'nay', 'abs']
                let CHAMBERS = ['house', 'senate']
        
                for (let chamber of CHAMBERS) {
                    for (let rep of this.DISTRICT_DATA[chamber]) {
                        for (let type of VOTE_TYPES) {
                            rep[type] = []
                        }
                    }
                }
        
                for (let i = 0; i < data.length; i++) {
                    for (let chamber of CHAMBERS) {
                        let voteData = data[i][chamber+'Vote']
                        
                        if (voteData == undefined) {
                            continue
                        }
        
                        for (let type of VOTE_TYPES) {
                            for (let district of voteData[type]) {
                                this.DISTRICT_DATA[chamber][district - 1][type].push(i)
                            }
                        }
                    }
                }

                for (let chamber of CHAMBERS) {
                    let chamber_data = this.DISTRICT_DATA[chamber];
                    let temp_data = [];
                    for (let i = 0; i < chamber_data.length; i++) {
                        let district = chamber_data[i];

                        temp_data.push([district['area'], i, (district.nay.length/(district.yea.length + district.nay.length)) * 100]);
                    }
                    temp_data = temp_data.sort((a, b) => b[0] - a[0])


                    let labels = []
                    let data = []

                    for (let i = 0; i < chamber_data.length; i++) {
                        labels.push('District #' + (temp_data[i][1] + 1))
                        data.push(temp_data[i][2])
                    }

                    this.VOTE_CHART_DATA[chamber] = {labels: labels, data: data}
                }

                this.VOTE_CHART = new Chart(this.VOTE_CHART_CANVAS, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: '% of Votes Pro-Trans',
                            data: [],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                        y: {
                            suggestedMax: 100,
                            beginAtZero: true
                        }
                        }
                    }
                    });

                fetch("/assets/misc/utah-house-map.html").then(response => response.text()).then(response => {
                    this.HOUSE_MAP = response;
                    this.DrawMap();
                })
            })
        })

        fetch("/assets/misc/utah-senate-map.html").then(response => response.text()).then(response => {this.SENATE_MAP = response})

        this.HOUSE_BUTTON.addEventListener("click", (e) => {this.ChamberButtonClicked(false)})
        this.SENATE_BUTTON.addEventListener("click", (e) => {this.ChamberButtonClicked(true)})
    }

    DrawMap() {
        if (this.isSenate) {
            this.MAP_CONTAINER.innerHTML = this.SENATE_MAP;
            this.VOTE_CHART.data.datasets[0].backgroundColor = getComputedStyle(document.body).getPropertyValue('--brand-color-secondary');
            this.VOTE_CHART.data.datasets[0].borderColor = getComputedStyle(document.body).getPropertyValue('--brand-color-secondary-dark');
        } else {
            this.MAP_CONTAINER.innerHTML = this.HOUSE_MAP;
            this.VOTE_CHART.data.datasets[0].backgroundColor = getComputedStyle(document.body).getPropertyValue('--brand-color-primary');
            this.VOTE_CHART.data.datasets[0].borderColor = getComputedStyle(document.body).getPropertyValue('--brand-color-primary-dark');
        }
         
        let voteData = this.VOTE_CHART_DATA[this.GetChamber()]
        this.VOTE_CHART.data.labels = voteData.labels;
        this.VOTE_CHART.data.datasets[0].data = voteData.data;
        this.VOTE_CHART.update();


        let districts = this.MAP_CONTAINER.querySelector("#svg-districts").children;

        for (let i = 0; i < districts.length; i++) {
            let elm = districts[i]
            let curDistrict = this.DISTRICT_DATA[this.GetChamber()][i]

            let approved = curDistrict['yea'].length
            let total = approved + curDistrict['nay'].length
            // let percent = ((total-approved)/total)*120; // hue
            let percent = ((total-approved)/total)*100; // sat

            // let baseColor = "hsl("+percent+", 100%, 65%)";
            let baseColor = "hsl(" + (this.isSenate ? "335" : "190") + ", "+ percent +"%, 65%)";
            elm.style.fill = baseColor

            elm.addEventListener("mouseenter", (e) => {
                // elm.style.fill="hsl("+percent+", 100%, 75%)";
                elm.style.fill = "hsl(" + (this.isSenate ? "335" : "190") + ", "+ percent +"%, 75%)";
            })

            elm.addEventListener("mouseout", (e) => {
                elm.style.fill = baseColor
            })

            elm.addEventListener("click", (e) => {
                this.UpdateInfoCard(i);
                this.UpdateLegislativeInfo(i);
            })
        }
    }

    Toggle() {
        this.isSenate = !this.isSenate;

        let prev, cur = null;
        if (this.isSenate) {
            cur = this.SENATE_BUTTON;
            prev = this.HOUSE_BUTTON;
        } else {
            cur = this.HOUSE_BUTTON;
            prev = this.SENATE_BUTTON;
        }

        cur.classList.add("active");
        prev.classList.remove("active");
        
        this.DrawMap();
        this.INFO_CONTAINER.innerHTML = this.EMPTY_INFO_PANEL_CONTENT;
        this.LEGISLATIVE_ACTION_CONTAINER.innerHTML = '';
    }

    ChamberButtonClicked(isSenateButton) {
        if (isSenateButton != this.isSenate) {
            this.Toggle()
        }
    }

    GetChamber() {
        return this.isSenate ? 'senate' : 'house';
    }

    UpdateInfoCard(districtNum) {
        let DATA = this.DISTRICT_DATA[this.GetChamber()][districtNum]

        let content = '<h1>District ' + (districtNum + 1)+'</h1><img src="'+DATA["imgUrl"]+'" style="width:106px;height:144px;border-radius:1.5ch; border:3px solid #ccc">'
        content += '<a href="' + (this.isSenate ? 'https://senate.utah.gov/sen/' : 'https://house.utleg.gov/rep/') + DATA['imgUrl'].match(/\/([^\/]*)\.[^\.]*$/)[1] +'/" target="_blank"><div class="fa-solid fa-user-tie" style="margin:1ch 0 2ch 0"></div> '+DATA["name"]+'</a>'

        content += '<div class="mid-lined" style="--color:#ccc;width:100%" style="margin:0"><b>Legislative Action</b></div>'
        // content += '<div style="border: 0 solid #666; border-left: 3px">'
        content += '<div class="alternating-table"><div class="table-body">'
        content += '<div class="table-row tooltip-hover"><div class="tooltip-anchor fa-solid fa-scale-unbalanced table-data" style="color:#2cb52c"><span class="tooltip-text">Opposed</span></div><div class="icon-table-row table-data" style="text-align:center">' + DATA['nay'].length + '</div></div>'
        content += '<div class="table-row tooltip-hover tb-odd"><div class="tooltip-anchor fa-solid fa-scale-unbalanced-flip table-data" style="color:#d64242"><span class="tooltip-text">Supported</span></div><div class="icon-table-row table-data" style="text-align:center">' + DATA['yea'].length + '</div></div>'
        content += '<div class="table-row tooltip-hover"><div class="tooltip-anchor fa-solid fa-scale-balanced table-data" style="color:#888"><span class="tooltip-text">Abstained</span></div><div class="icon-table-row table-data" style="text-align:center">' + DATA['abs'].length + '</div></div>'
        content += '</div></div>'
        // content += '<p>Supported</p><ul>'
        // for (let id of DATA['yea']) {
        //     content += '<li>' + this.BILL_DATA[id]['title'] + '</li>'
        // }
        // content += '</ul>'

        this.INFO_CONTAINER.innerHTML = content
    }

    UpdateLegislativeInfo(districtNum) {
        let DATA = this.DISTRICT_DATA[this.GetChamber()][districtNum]

        let content = ''

        for (let type of [['nay', 'Opposed', '#2cb52c', '100ms'], ['yea', 'Supported', '#d64242', '500ms'], ['abs', 'Absent', '#888', '900ms']]) {
            content += '<div class="unveil" style="--delay: '+ type[3] +'">'
            content += '<div class="mid-lined" style="--color: '+ type[2] +'"><b>Anti-Trans Bills ' + type[1] + '</b></div>'
            content += '<ul>'
            for (let bill of DATA[type[0]]) {
                content += '<li billId="'+ this.BILL_DATA[bill].info.replace('/', '') +'" class="fake-link">' + this.BILL_DATA[bill].title + '</li>'
            }
            content += '</ul></div>'
        }

        this.LEGISLATIVE_ACTION_CONTAINER.innerHTML = content;

        for (let elm of this.LEGISLATIVE_ACTION_CONTAINER.querySelectorAll('li')) {
            elm.addEventListener("click", (e) => {this.LoadBillPopup(elm.getAttribute('billId'))})
        }
    }

    LoadBillPopup(id) {
        fetch('/partials/'+id.toLowerCase()+'.html').then(response => response.text()).then(response => {
            if (response.slice(0, 2) != '<!') {
                let popup = document.getElementById('popupElm');
                popup.innerHTML = response;

                document.body.style.overflowY = 'hidden';
                let container = popup.querySelector('.popup-container')
                container.addEventListener('click', (e) => {if (e.target == container) {this.ClosePopup()}});
            }
        });
    }

    ClosePopup() {
        document.getElementById('popupElm').innerHTML = '';
        document.body.style.overflowY = '';
    }
}

let script = document.currentScript
window.addEventListener('load', function () {
    let map = new LegMap(script);

    // console.log(SCRIPT.parentElement.children[1]);
})