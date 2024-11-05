const accessKey = "kU_PjQS8qrdnKr3yz6ZpbsoHCywz5QSZ_BfNbJh8nqA";

const formEl = document.querySelector("form");
const inputEl = document.getElementById("search-input");
const searchResults = document.querySelector(".search-results");
const showMore = document.getElementById("show-more-button");

let inputData = "";
let page = 1;

// Function to toggle an image in the favorites gallery
const toggleFavorite = (imageData, likeButton) => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        alert("Please log in to manage favorites.");
        return;
    }

    const userFavoritesKey = `favorites_${loggedInUser}`;
    const userFavorites = JSON.parse(localStorage.getItem(userFavoritesKey)) || [];

    // Check if the image is already in the favorites
    const imageIndex = userFavorites.findIndex((img) => img.url === imageData.urls?.small);

    if (imageIndex > -1) {
        // If the image is already in favorites, remove it
        userFavorites.splice(imageIndex, 1);
        likeButton.classList.remove("liked"); // Remove the red color
    } else {
        // If not, add it to favorites
        const favoriteImage = {
            url: imageData.urls?.small,
            alt: imageData.alt_description || "Favorite Image",
            link: imageData.links?.html,
        };

        userFavorites.push(favoriteImage);
        likeButton.classList.add("liked"); // Add red color
    }

    // Update local storage
    localStorage.setItem(userFavoritesKey, JSON.stringify(userFavorites));
};

// Function to search images and display results with a like button
const searchImages = async () => {
    inputData = inputEl.value;
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        const results = data.results || [];

        if (page === 1) {
            searchResults.innerHTML = "";
        }

        results.forEach((result) => {
            const imageWrapper = document.createElement("div");
            imageWrapper.classList.add("search-result");

            const image = document.createElement("img");
            image.src = result.urls?.small;
            image.alt = result.alt_description || "Image";

            const imageLink = document.createElement("a");
            imageLink.href = result.links?.html;
            imageLink.target = "_blank";
            imageLink.textContent = result.alt_description || "View Image";

            // Create and configure the like button with a heart icon
            const likeButton = document.createElement("button");
            likeButton.classList.add("like-btn", "btn", "mt-2");
            likeButton.innerHTML = '<i class="bi bi-heart-fill"></i>';

            // Check if the image is already in the favorites and toggle the heart color
            const loggedInUser = localStorage.getItem("loggedInUser");
            const userFavorites = JSON.parse(localStorage.getItem(`favorites_${loggedInUser}`)) || [];
            if (userFavorites.some((img) => img.url === result.urls?.small)) {
                likeButton.classList.add("liked"); // Set to red if in favorites
            }

            // Event listener to toggle favorite status on click
            likeButton.onclick = () => toggleFavorite(result, likeButton);

            imageWrapper.appendChild(image);
            imageWrapper.appendChild(imageLink);
            imageWrapper.appendChild(likeButton);

            searchResults.appendChild(imageWrapper);
        });

        page++;
        showMore.style.display = results.length > 3 ? "block" : "none";
    } catch (error) {
        console.error("Error fetching images:", error);
    }
};

// Event listeners for search and show more functionality
formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    page = 1;
    searchImages();
});
showMore.addEventListener("click", (event) => {
    event.preventDefault();
    searchImages();
});
