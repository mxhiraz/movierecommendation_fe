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
        movieGrid.innerHTML = "";

        movies.forEach((movie) => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";

            const scorePercentage = Math.round(movie.similarity_score * 100);

            movieCard.innerHTML = `
                    <div class="movie-info">
                        <h3 class="movie-title"><a href="/info.html?title=${encodeURIComponent(movie.title)}" style="color: inherit; text-decoration: none;">${movie.title}</a></h3>
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

        // Update the results title
        document.querySelector(
            ".results-title"
        ).innerText = `Recommended movies similar to "${searchTerm}":`;
    }
});

document.getElementById('search-form').addEventListener('submit', function (e) {
    const input = document.getElementById('movie-search').value.trim();
    if (input) {
      addToHistory(input);
    }
  });
  
  function addToHistory(movieTitle) {
    const list = document.getElementById('history-list');
    const item = document.createElement('li');
    item.textContent = movieTitle;
    item.addEventListener('click', () => {
      document.getElementById('movie-search').value = movieTitle;
      document.getElementById('search-form').dispatchEvent(new Event('submit'));
    });
    list.prepend(item);
  }
  