const map = L.map('map').setView([40.42, -3.69], 2); // L -> LeafLet

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // método tileLayer
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const magFilter = document.getElementById('magFilter');
const dateBtn = document.getElementById('dateBtn');
let dataToFilter = [];
let markers = [];

magFilter.addEventListener('change', ({ target }) => {
    value = target.value;
    filtrarMag(value);
});

dateBtn.addEventListener('click', () => {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    console.log(startDateInput, endDateInput);
    getTerrremotosDate(startDateInput, endDateInput);
    magFilter.selectedIndex = 0; 
});

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(`Latitud: ${position.coords.latitude}\nLongitud: ${position.coords.longitude}`);
        const marker = L.marker([position.coords.latitude, position.coords.longitude], {
            color: 'yellow'
        }).addTo(map);
        marker.bindPopup('ZABRIDGE');
        marker._icon.classList.add("huechange");
    });
} else {
    console.warn("Tu navegador no soporta Geolocalización!! ");
}

const getTerremotos = async () => {
    try {
        const resp = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');

        if (resp.ok) {
            const data = await resp.json();
            dataToPaint = data.features;
            dataToFilter = data.features;
            return pintarTerremotos(dataToPaint);
        } else {
            throw resp;
        }
    } catch (error) {
        throw console.log(error.status);
    }
}


const getTerrremotosDate = async (startDate, endDate) => {
    try {
        const resp = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}`)

        if (resp.ok) {
            const data = await resp.json();
            console.log(data.features);
            dataToFilter = data.features;
            return pintarTerremotos(dataToFilter);
        } else {
            throw resp;
        }
    } catch (error) {
        throw console.log(error.status)
    }
}

pintarTerremotos = (arr) => {

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    arr.forEach(element => {
        const coords = element.geometry.coordinates;
        const marker = L.marker([coords[1], coords[0]]).addTo(map);
        markers.push(marker);
        const misc = element.properties;
        marker.bindPopup(`Título: ${misc.title}, Lugar: ${misc.place}, Fecha: ${new Date(misc.time)}, Código: ${misc.code}, Magnitud: ${misc.mag}, Tipo de medida: ${misc.magType}`);
        if (misc.mag >= 7) {
            marker._icon.classList.add("morado");
        } else if (misc.mag >= 6) {
            marker._icon.classList.add("rojo");
        } else if (misc.mag >= 5) {
            marker._icon.classList.add("naranja");
        } else if (misc.mag >= 4) {
            marker._icon.classList.add("amarilloOscuro");
        } else if (misc.mag >= 3) {
            marker._icon.classList.add("amarillo");
        } else if (misc.mag >= 2) {
            marker._icon.classList.add("verdeApagado");
        } else if (misc.mag >= 1) {
            marker._icon.classList.add("verde");
        } else {
            marker._icon.classList.add("blanco");
        }
    });
}

const filtrarMag = (value) => {
    let filtered;
    value === 'all' ?
        filtered = dataToFilter :
        filtered = dataToFilter.filter(element => element.properties.mag >= parseFloat(value) && element.properties.mag < parseFloat(value) + 1);

    pintarTerremotos(filtered);
}

getTerremotos();

