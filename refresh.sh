#!/bin/bash

# See: https://www.gov.uk/guidance/access-fuel-price-data
filenames=(
  "tesco.json"
  "asda.json"
  "applegreen.json"
  "bp.json"
  "esso.json"
  "morrisons.json"
  "mfg.json"
  "rontec.json"
  "sainsburys.json"
  "shell.json"
)
urls=(
  "https://www.tesco.com/fuel_prices/fuel_prices_data.json"
  "https://storelocator.asda.com/fuel_prices_data.json"
  "https://applegreenstores.com/fuel-prices/data.json"
  "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json"
  "https://www.esso.co.uk/-/media/Project/WEP/Esso/Esso-Retail-UK/roadfuelpricingscheme"
  "https://images.morrisons.com/petrol-prices/petrol.json"
  "https://fuel.motorfuelgroup.com/fuel_prices_data.json"
  "https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json"
  "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json"
  "https://www.shell.co.uk/fuel-prices-data.html"
)

mkdir -p dist

for index in "${!filenames[@]}"; do
    filename="${filenames[$index]}"
    url="${urls[$index]}"
    
    # Save the content to the provided filename in the 'dist' folder
    output_file="dist/${filename}"
    echo "Downloading ${url}..."
    curl -sS -L --http1.1 -m 10 "${url}" -o "${output_file}" -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' -H 'accept-language: en-GB,en;q=0.9' -H 'cache-control: no-cache' -H 'pragma: no-cache' -H 'sec-ch-ua: "Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "macOS"' -H 'sec-fetch-dest: document' -H 'sec-fetch-mode: navigate' -H 'sec-fetch-site: none' -H 'sec-fetch-user: ?1' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' --compressed

    if [[ "$(head -c 1 "${output_file}")" == "[" ]]; then
        echo "[*] Detected JSON array, cleaning"
        cp "${output_file}" "${output_file}.tmp"
        jq -c '.[0]' "${output_file}.tmp" > "${output_file}"
        rm "${output_file}.tmp"
    fi

    if [[ "$(head -c 1 "${output_file}")" != "{" ]]; then
        echo "[!] Deleting invalid file: ${output_file}"
        rm "${output_file}"
    fi
done
