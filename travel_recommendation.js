const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");
const resultsContainer = document.getElementById("recommendation-results");

let recommendationData = null;

async function loadRecommendations() {
    try {
        const response = await fetch("travel_recommendation_api.json");

        if (!response.ok) {
            throw new Error(`Unable to load recommendations (${response.status}).`);
        }

        recommendationData = await response.json();
        console.log("Travel recommendation data:", recommendationData);
    } catch (error) {
        console.error("Error fetching travel recommendations:", error);
        showMessage(
            "Recommendations could not be loaded. Run this project through a local web server and try again."
        );
    }
}

function getAllRecommendations() {
    const cities = recommendationData.countries.flatMap((country) =>
        country.cities.map((city) => ({
            ...city,
            category: "country",
            country: country.name
        }))
    );

    const temples = recommendationData.temples.map((temple) => ({
        ...temple,
        category: "temple"
    }));

    const beaches = recommendationData.beaches.map((beach) => ({
        ...beach,
        category: "beach"
    }));

    return [...cities, ...temples, ...beaches];
}

function findRecommendations(keyword) {
    const query = keyword.trim().toLowerCase();
    const keywordVariations = {
        beach: "beach",
        beaches: "beach",
        temple: "temple",
        temples: "temple",
        country: "country",
        countries: "country"
    };
    const normalizedQuery = keywordVariations[query] || query;

    return getAllRecommendations().filter((place) => {
        const searchableText = [
            place.name,
            place.description,
            place.category,
            place.country || ""
        ]
            .join(" ")
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
    });
}

function displayRecommendations(recommendations) {
    resultsContainer.replaceChildren();

    if (recommendations.length === 0) {
        showMessage("No recommendations found. Try beaches, temples, or a country name.");
        return;
    }

    recommendations.forEach((place) => {
        const card = document.createElement("article");
        card.className = "recommendation-card";

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = `View of ${place.name}`;

        const content = document.createElement("div");
        content.className = "recommendation-card-content";

        const name = document.createElement("h2");
        name.textContent = place.name;

        const description = document.createElement("p");
        description.textContent = place.description;

        const localTime = document.createElement("p");
        localTime.className = "recommendation-time";
        localTime.textContent = `Local time: ${getLocalTime(place.name)}`;

        content.append(name, description, localTime);
        card.append(image, content);
        resultsContainer.append(card);
    });

    addDismissButton();
}

function getLocalTime(placeName) {
    const destinationTimeZones = {
        Sydney: "Australia/Sydney",
        Melbourne: "Australia/Melbourne",
        Tokyo: "Asia/Tokyo",
        Kyoto: "Asia/Tokyo",
        "Rio de Janeiro": "America/Sao_Paulo",
        "São Paulo": "America/Sao_Paulo",
        "Angkor Wat": "Asia/Phnom_Penh",
        "Taj Mahal": "Asia/Kolkata",
        "Bora Bora": "Pacific/Tahiti",
        "Copacabana Beach": "America/Sao_Paulo"
    };

    const destination = Object.keys(destinationTimeZones).find((name) =>
        placeName.includes(name)
    );
    const timeZone = destinationTimeZones[destination] || "UTC";
    const options = {
        timeZone,
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    };
    const localTime = new Date().toLocaleTimeString("en-US", options);

    console.log(`Current time in ${placeName}:`, localTime);
    return localTime;
}

function showMessage(message) {
    const messageElement = document.createElement("p");
    messageElement.className = "results-message";
    messageElement.textContent = message;
    resultsContainer.replaceChildren(messageElement);
    addDismissButton();
}

function addDismissButton() {
    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "results-dismiss";
    dismissButton.setAttribute("aria-label", "Clear and close recommendations");
    dismissButton.textContent = "×";
    dismissButton.addEventListener("click", clearResults);
    resultsContainer.append(dismissButton);
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) {
        showMessage("Enter a destination or keyword to search.");
        return;
    }

    if (!recommendationData) {
        showMessage("Recommendations are still loading. Please try again in a moment.");
        return;
    }

    displayRecommendations(findRecommendations(keyword));
});

function clearResults() {
    resultsContainer.replaceChildren();
    searchInput.value = "";
    searchInput.focus();
}

clearButton.addEventListener("click", clearResults);

loadRecommendations();
