// const HOUSE_MAP_REQUEST = new Request("/assets/misc/utah-house-map.html");
// fetch("/assets/misc/utah-house-map.html")
//   .then((response) => response.text())
//   .then((json) => console.log(json));

// async function DrawMap() {
//     SCRIPT.nextElementSibling.innerHTML = await GetData("/assets/misc/utah-house-map.html")
// }

class Map {
    constructor(script) {
        this.MAP_CONTAINER = script.parentElement.querySelector("#map-bounding-box");
        this.INFO_CONTAINER = script.parentElement.querySelector("#map-info-panel");

        this.HOUSE_BUTTON = script.parentElement.querySelector("#house-button");
        this.SENATE_BUTTON = script.parentElement.querySelector("#senate-button");
        
        this.isSenate = false; // false for house || true for senate
        this.DISTRICT_DATA = null;
        this.HOUSE_MAP = null;
        this.SENATE_MAP = null;
        this.init()
    }

    async init() {
        fetch("/assets/misc/utah-district-info.json").then(response => response.json()).then(response => {this.DISTRICT_DATA = response})
        fetch("/assets/misc/utah-house-map.html").then(response => response.text()).then(response => {
            this.HOUSE_MAP = response;
            this.DrawMap()
        })
        fetch("/assets/misc/utah-senate-map.html").then(response => response.text()).then(response => {this.SENATE_MAP = response})

        this.HOUSE_BUTTON.addEventListener("click", (e) => {this.ChamberButtonClicked(false)})
        this.SENATE_BUTTON.addEventListener("click", (e) => {this.ChamberButtonClicked(true)})
    }

    DrawMap() {
        if (this.isSenate) {
            this.MAP_CONTAINER.innerHTML = this.SENATE_MAP;
        } else {
            this.MAP_CONTAINER.innerHTML = this.HOUSE_MAP;
        }

        let districts = this.MAP_CONTAINER.querySelector("#svg-districts").children;

        for (let i = 0; i < districts.length; i++) {
            let percent = (i/(districts.length-1))*120;
            // let percent = (Math.floor(Math.random() * districts.length)/(districts.length-1))*120;
            districts[i].style.fill = "hsl("+percent+", 100%, 65%)";

            districts[i].addEventListener("mouseenter", (e) => {
                districts[i].style.fill="hsl("+percent+", 100%, 75%)";
                // districts[i].style.filter="drop-shadow(1px 1px 5px #000)";
            })

            districts[i].addEventListener("mouseout", (e) => {
                districts[i].style.fill="hsl("+percent+", 100%, 65%)";
                // districts[i].style.filter="";
            })

            districts[i].addEventListener("click", (e) => {
                this.UpdateInfoCard(i);
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
        this.INFO_CONTAINER.innerHTML = '<h1>District ' + (districtNum + 1)+'</h1><img src="'+this.DISTRICT_DATA[this.GetChamber()][districtNum]["imgUrl"]+'" style="width:106px;height:144px;"><p>'+this.DISTRICT_DATA[this.GetChamber()][districtNum]["name"]+'</p><p>Insert legislative action here.</p>';
    }
}

let script = document.currentScript
window.addEventListener('load', function () {
    let map = new Map(script);

    // console.log(SCRIPT.parentElement.children[1]);
})