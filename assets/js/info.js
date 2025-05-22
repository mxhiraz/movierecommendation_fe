// Function to get query parameters from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to display error message
function showError(message) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="error-container">
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">${message}</p>
    </div>
  `;
}

// Function to display movie information
function displayMovie(data) {
  const content = document.getElementById("content");

  // Create movie container structure
  content.innerHTML = `
    <div class="movie-container">
      <div class="movie-header">
        <div class="movie-poster">
          <img id="moviePoster" src="${data.Poster !== "N/A" ? data.Poster : "/api/placeholder/300/450"
    }" alt="${data.Title} Poster">
        </div>
        <div class="movie-info">
          <h2 class="movie-title">${data.Title}</h2>
          <p class="movie-year">${data.Year} • ${data.Type.charAt(0).toUpperCase() + data.Type.slice(1)
    }</p>
          <div class="movie-meta" id="movieMeta"></div>
          <p class="movie-plot">${data.Plot}</p>
        </div>
      </div>

      <div class="movie-details">
        <div class="detail-card">
          <h3>Cast & Crew</h3>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Writer:</strong> ${data.Writer}</p>
          <p><strong>Actors:</strong> ${data.Actors}</p>
        </div>

        <div class="detail-card">
          <h3>Ratings</h3>
          <div class="ratings" id="ratings"></div>
        </div>

        <div class="detail-card">
          <h3>Additional Information</h3>
          <p><strong>Released:</strong> ${data.Released}</p>
          <p><strong>Runtime:</strong> ${data.Runtime}</p>
          <p><strong>Language:</strong> ${data.Language}</p>
          <p><strong>Country:</strong> ${data.Country}</p>
          <p><strong>Awards:</strong> ${data.Awards}</p>
        </div>

        <div class="detail-card">
          <h3>Box Office</h3>
          <p><strong>Box Office:</strong> ${data.BoxOffice !== "N/A" ? data.BoxOffice : "Not Available"
    }</p>
          <p><strong>Type:</strong> ${data.Type.charAt(0).toUpperCase() + data.Type.slice(1)
    }</p>
          <p><strong>Rated:</strong> ${data.Rated}</p>
        </div>
      </div>
    </div>
  `;

  // Add genre meta items
  const metaContainer = document.getElementById("movieMeta");
  const genres = data.Genre.split(", ");
  genres.forEach((genre) => {
    const metaItem = document.createElement("span");
    metaItem.className = "meta-item";
    metaItem.textContent = genre;
    metaContainer.appendChild(metaItem);
  });

  // Add runtime meta
  const runtimeMeta = document.createElement("span");
  runtimeMeta.className = "meta-item";
  runtimeMeta.textContent = data.Runtime;
  metaContainer.appendChild(runtimeMeta);

  // Add rated meta
  const ratedMeta = document.createElement("span");
  ratedMeta.className = "meta-item";
  ratedMeta.textContent = data.Rated;
  metaContainer.appendChild(ratedMeta);

  // Add ratings items
  const ratingsContainer = document.getElementById("ratings");
  if (data.Ratings && data.Ratings.length > 0) {
    data.Ratings.forEach((rating) => {
      // Calculate percentage and color
      let percentage = 0;
      if (rating.Value.includes("%")) {
        percentage = parseInt(rating.Value);
      } else if (rating.Value.includes("/10")) {
        percentage = parseFloat(rating.Value) * 10;
      } else if (rating.Value.includes("/100")) {
        percentage = parseInt(rating.Value);
      }

      const colorClass =
        percentage >= 75
          ? "var(--rating-high)"
          : percentage >= 50
            ? "var(--rating-mid)"
            : "var(--rating-low)";

      ratingsContainer.innerHTML += `
        <div class="rating-item">
          <h4>${rating.Source}</h4>
          <div class="rating-value">${rating.Value}</div>
          <div class="progress-bar">
            <div class="progress" style="width: ${percentage}%; background-color: ${colorClass};"></div>
          </div>
        </div>
      `;
    });
  } else {
    ratingsContainer.innerHTML = "<p>No ratings available</p>";
  }
}

// Function to fetch movie data
async function fetchMovie() {
  const title = getQueryParam("title");

  if (!title) {
    showError(
      "No movie title provided. Add '?title=MovieName' to the URL."
    );
    return;
  }

  try {
    const response = await fetch(
      `https://formally-selected-iguana.ngrok-free.app/api/movie/?title=${encodeURIComponent(title)}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );
    const data = await response.json();

    if (data.Response === "False") {
      showError(`No movie found with the title "${title}".`);
      return;
    }

    displayMovie(data);
  } catch (error) {
    showError(
      "Failed to connect to the API. Please check if the server is running."
    );
    console.error(error);
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", fetchMovie);