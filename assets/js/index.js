document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const movieSearch = document.getElementById("movie-search");
    const resultsContainer = document.getElementById("results-container");
    const movieGrid = document.getElementById("movie-grid");
    const loadingEl = document.getElementById("loading");
    const errorMessage = document.getElementById("error-message");


    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-container';
    searchForm.parentNode.insertBefore(autocompleteContainer, searchForm.nextSibling);

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    const fetchSuggestions = debounce(async (query) => {
        try {
            const response = await fetch(`https://formally-selected-iguana.ngrok-free.app/api/search/?query=${encodeURIComponent(query)}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await response.json();

            autocompleteContainer.innerHTML = '';

            data.matches.forEach(match => {
                const suggestion = document.createElement('div');
                suggestion.className = 'autocomplete-suggestion';
                suggestion.textContent = match.title;
                suggestion.addEventListener('click', () => {
                    movieSearch.value = match.title;
                    autocompleteContainer.innerHTML = '';
                });
                autocompleteContainer.appendChild(suggestion);
            });
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
        }
    }, 600);

    movieSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        if (query.length === 0) {
            autocompleteContainer.innerHTML = '';
            return;
        }

        fetchSuggestions(query);
    });

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const searchTerm = movieSearch.value.trim();

        if (!searchTerm) return;

        // Show loading state
        loadingEl.style.display = "block";
        resultsContainer.style.display = "none";
        errorMessage.style.display = "none";
        movieGrid.innerHTML = "";

        try {
            // Encode the search term for URL
            const encodedSearchTerm = encodeURIComponent(searchTerm);
            const response = await fetch(`https://formally-selected-iguana.ngrok-free.app/api/recommend/?title=${encodedSearchTerm}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();

            if (data.length === 0) {
                errorMessage.style.display = "block";
            } else {
                displayResults(data, searchTerm);
                resultsContainer.style.display = "block";
            }
        } catch (error) {
            console.error("Error fetching movie recommendations:", error);
            errorMessage.style.display = "block";
        } finally {
            loadingEl.style.display = "none";
        }
    });

    function displayResults(movies, searchTerm) {

        const container = document.getElementsByClassName('autocomplete-container')[0];
        if (container) container.style.display = 'none';

        movieGrid.innerHTML = "";

        const promises = movies.map(async (movie) => {
            try {
                const detailsRes = await fetch(`https://formally-selected-iguana.ngrok-free.app/api/movie/?title=${encodeURIComponent(movie.title)}`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                if (!detailsRes.ok) throw new Error("Details API error");

                const details = await detailsRes.json();
                return { ...movie, details };
            } catch (err) {
                console.error(`Error fetching details for ${movie.title}`, err);
                return { ...movie, details: null };
            }
        });

        Promise.all(promises).then((moviesWithDetails) => {
            moviesWithDetails.forEach(({ title, similarity_score, details }) => {
                const scorePercentage = Math.round(similarity_score * 100);

                const poster = details?.Poster && details.Poster !== "N/A" ? details.Poster : "assets/img/placeholder.png";
                const year = details?.Year || "Unknown Year";
                const rating = details?.imdbRating || "N/A";
                const plot = details?.Plot || "No description available";

                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";

                movieCard.innerHTML = `
                <div class="movie-image">
                    <img src="${poster}" alt="${title}" style="width: 100px; height: 150px; object-fit: cover;" />
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">
                        <a href="/info.html?title=${encodeURIComponent(title)}" style="color: inherit; text-decoration: none;">${title}</a>
                    </h3>
                    <p style="margin: 4px 0; font-size: 0.9rem;">${year} &nbsp;|&nbsp; ⭐ ${rating}</p>
                    <p style="margin: 6px 0 12px; font-size: 0.85rem; color: var(--on-surface);">${plot}</p>
                    <div class="movie-score">
                        <span>${scorePercentage}% match</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scorePercentage}%"></div>
                        </div>
                    </div>
                </div>
            `;

                movieGrid.appendChild(movieCard);
            });
        });

        // Update the results title
        document.querySelector(".results-title").innerText = `Recommended movies similar to "${searchTerm}":`;
    }

});


document.addEventListener("DOMContentLoaded", () => {
    fetch("assets/js/movies.json")
        .then((res) => res.json())
        .then((data) => renderMovies(data))
        .catch((err) => console.error("Error loading movies.json", err));
});

function renderMovies(moviesByGenre) {
    const resultsContainer = document.getElementById("recommend-container");
    const movieGrid = document.getElementById("movie-grid-mp");
    movieGrid.innerHTML = ''; // Clear default

    for (const [genre, movies] of Object.entries(moviesByGenre)) {
        const section = document.createElement("div");
        section.className = "movie-section-mp";

        const title = document.createElement("h3");
        title.className = "movie-row-title-mp";
        title.textContent = genre;

        const row = document.createElement("div");
        row.className = "movie-row-mp";

        movies.forEach((movie) => {
            const card = document.createElement("a"); // Changed from <div> to <a>
            card.className = "movie-card-mp";
            card.href = `${window.location.origin}/info.html?title=${encodeURIComponent(movie.title)}`;
            card.style.textDecoration = "none";
            card.style.color = "inherit";

            card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" />
        <h4 title="${movie.title}">${movie.title}</h4>
        <p>${movie.year} &nbsp;|&nbsp; ⭐ ${movie.rating}</p>
    `;

            row.appendChild(card);
        });



        section.appendChild(title);
        section.appendChild(row);
        movieGrid.appendChild(section);
    }

    resultsContainer.style.display = "block";
}
