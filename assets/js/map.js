// const HOUSE_MAP_REQUEST = new Request("/assets/misc/utah-house-map.html");
// fetch("/assets/misc/utah-house-map.html")
//   .then((response) => response.text())
//   .then((json) => console.log(json));

// async function DrawMap() {
//     SCRIPT.nextElementSibling.innerHTML = await GetData("/assets/misc/utah-house-map.html")
// }

class Map {
    constructor(script) {
        this.MAP_CONTAINER = script.parentElement.children[1]
        
        this.isSenate = false; // false for house || true for senate
        this.HOUSE_MAP = null;
        this.SENATE_MAP = null;
        this.init()
    }

    async init() {
        fetch("/assets/misc/utah-house-map.html").then(response => response.text()).then(response => {
            this.HOUSE_MAP = response;
            this.DrawMap()
            // this.MAP_CONTAINER.innerHTML = this.HOUSE_MAP
        })
        fetch("/assets/misc/utah-senate-map.html").then(response => response.text()).then(response => {this.SENATE_MAP = response;})

        // this.SENATE_MAP = await fetch("/assets/misc/utah-senate-map.html").then(response => response.text())   

        this.MAP_CONTAINER.addEventListener("click", (e) => {this.Toggle()})
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
          districts[i].style.fill = "hsl("+percent+", 95%, 65%)";
        }
    }

    Toggle() {
        this.isSenate = !this.isSenate
        this.DrawMap()
    }
}

let script = document.currentScript
window.addEventListener('load', function () {
    let map = new Map(script);

    // console.log(SCRIPT.parentElement.children[1]);
})