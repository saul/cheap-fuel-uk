import L from "leaflet";
import applegreen from "./dist/applegreen_data.json";
import asda from "./dist/asda_data.json";
import bp from "./dist/bp_data.json";
import esso from "./dist/esso_data.json";
import mfg from "./dist/mfg_data.json";
import morrisons from "./dist/morrisons_data.json";
import rontec from "./dist/rontec_data.json";
//import shell from "./dist/shell_data.json";
//import tesco from "./dist/tesco_data.json";
import { LatLngExpression } from "leaflet";

interface FuelPriceDoc {
  readonly last_updated: string;
  readonly stations: ReadonlyArray<FuelPriceStation>;
}

interface FuelPriceStation {
  readonly site_id: string;
  readonly brand: string;
  readonly address: string;
  readonly postcode: string;
  readonly location: LatLong;
  readonly prices: FuelPrices;
}

interface LatLong {
  readonly latitude: number;
  readonly longitude: number;
}

interface FuelPrices {
  readonly E5?: number;
  readonly E10?: number;
  readonly B7?: number;
  readonly SDV?: number;
}

document.addEventListener("DOMContentLoaded", () => {
  const defaultZoomLevel = 13;
  // todo: best to do this by IP
  const defaultLatLong: LatLngExpression = [51.505, -0.09];
  const map = L.map("map", { dragging: true }).setView(
    defaultLatLong,
    defaultZoomLevel
  );

  const currentLocation = L.circle(defaultLatLong, {
    color: "transparent",
    fillColor: "#3498db",
    fillOpacity: 0.5,
    radius: 0,
  }).addTo(map);

  map
    .locate({ watch: true })
    .on("locationerror", (e) => {
      console.log(e);
      alert("Location access has been denied.");
    })
    .on("locationfound", (e) => {
      console.log("Found location at", e.latlng);
      console.log("Distance:", map.getCenter().distanceTo(defaultLatLong));

      if (map.getCenter().distanceTo(defaultLatLong) == 0) {
        map.setView(e.latlng, defaultZoomLevel);
      }

      currentLocation.setLatLng(e.latlng).setRadius(e.accuracy);
    });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  [applegreen, asda, bp, esso, mfg, morrisons, rontec].forEach((doc) =>
    createMarkers(doc, map)
  );
});

function createMarkers(priceDoc: FuelPriceDoc, map: L.Map) {
  for (const station of priceDoc.stations) {
    L.marker([station.location.latitude, station.location.longitude])
      .bindTooltip(createTooltipContent(station), {
        permanent: true,
        direction: "top",
      })
      .addTo(map);
  }
}

function createTooltipContent(station: FuelPriceStation) {
  return `Price: ${formatPrice(station.prices.E10)}p`;
}

function formatPrice(price?: number) {
  if (!price) return "???";

  price = price < 10 ? price * 100 : price;
  return price.toFixed(1);
}
