let isSearching = false;
let currentPage = 1;
let currentSearchTerm = '';
let totalResults = 0;
const apiKey = '89d38438';
let allMovies = [];

async function searchMovie(searchTerm, page = 1, append = false) {
    if (isSearching) return;
    isSearching = true;
    const resultsContainer = document.getElementById('results');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    if (!append) {
        resultsContainer.innerHTML = '';
        allMovies = [];
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
    // Loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = '<p>Loading...</p>';
    resultsContainer.appendChild(loadingDiv);

    if (!searchTerm) {
        resultsContainer.innerHTML = '<p>Search term is empty.</p>';
        isSearching = false;
        return;
    }

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}&page=${page}`);
        const data = await response.json();
        loadingDiv.remove();
        if (data.Response === "True") {
            if (!append) {
                totalResults = parseInt(data.totalResults, 10);
                // Show total results
                const totalDiv = document.createElement('div');
                totalDiv.id = 'total-results';
                totalDiv.innerHTML = `<p><b>Total Results:</b> ${totalResults}</p>`;
                resultsContainer.appendChild(totalDiv);
            }
            // Render basic info immediately
            const moviesBasic = data.Search.map(movie => ({ ...movie, imdbRating: 'Loading...' }));
            allMovies = allMovies.concat(moviesBasic);
            renderMovies();
            // Fetch full details for each movie to get imdbRating, update UI as each arrives
            data.Search.forEach(async (movie, idx) => {
                try {
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`);
                    const details = await res.json();
                    // Find the index in allMovies (offset by append)
                    const globalIdx = allMovies.findIndex(m => m.imdbID === movie.imdbID);
                    if (globalIdx !== -1) {
                        allMovies[globalIdx].imdbRating = details.imdbRating;
                        // Update only this movie's rating in the DOM
                        const ratingSpan = document.querySelector(`span[data-imdbid='${movie.imdbID}']`);
                        if (ratingSpan) {
                            let rating = details.imdbRating && !isNaN(parseFloat(details.imdbRating)) ? parseFloat(details.imdbRating) : null;
                            let ratingColor = '';
                            if (rating !== null) {
                                ratingColor = rating <= 5 ? 'red' : 'green';
                            }
                            ratingSpan.textContent = details.imdbRating || 'N/A';
                            ratingSpan.style.color = ratingColor;
                        }
                    }
                } catch {
                    // Ignore errors for individual movies
                }
            });
            // Show 'Show More' button if more results
            if ((allMovies.length) < totalResults) {
                showMoreBtn.style.display = 'inline-block';
            } else {
                showMoreBtn.style.display = 'none';
            }
            // Show 'Show Less' button if more than 10 results are shown
            if (allMovies.length > 10) {
                showLessBtn.style.display = 'inline-block';
            } else {
                showLessBtn.style.display = 'none';
            }
        } else {
            resultsContainer.innerHTML = `<p>No results found.</p>`;
        }
    } catch (error) {
        resultsContainer.innerHTML = `<p>Error fetching data.</p>`;
        console.error('Error fetching data:', error);
    } finally {
        isSearching = false;
    }
}

function renderMovies() {
    const resultsContainer = document.getElementById('results');
    const totalDiv = document.getElementById('total-results');
    resultsContainer.innerHTML = '';
    if (totalDiv) resultsContainer.appendChild(totalDiv);
    allMovies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.style.display = 'inline-block';
        movieDiv.style.verticalAlign = 'top';
        movieDiv.style.margin = '20px';
        movieDiv.style.width = '300px';
        movieDiv.className = 'movie-item';
        let rating = movie.imdbRating && !isNaN(parseFloat(movie.imdbRating)) ? parseFloat(movie.imdbRating) : null;
        let ratingColor = '';
        if (rating !== null) {
            ratingColor = rating <= 5 ? 'red' : 'green';
        }
        // Add data-imdbid to the rating span for targeted updates
        movieDiv.innerHTML = `
            <h3>${movie.Title} (${movie.Year}) <br>Type: ${movie.Type}</h3>
            <p><b>IMDb Rating:</b> <span data-imdbid="${movie.imdbID}" style="color:${ratingColor}; font-weight:bold;">${movie.imdbRating || 'N/A'}</span></p>
            <img src="${movie.Poster !== "N/A" ? movie.Poster : ''}" alt="Poster" width="300">
        `;
        resultsContainer.appendChild(movieDiv);
    });
}

// Add event listener for the search button
document.getElementById('searchButton').addEventListener('click', (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('searchInput').value;
    currentSearchTerm = searchTerm;
    currentPage = 1;
    searchMovie(searchTerm, 1, false);
});
// Add event listener for the Enter key (call searchMovie directly to avoid double search)
document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;
        currentSearchTerm = searchTerm;
        currentPage = 1;
        searchMovie(searchTerm, 1, false);
    }
});

// Show More and Show Less button logic
document.getElementById('showMoreBtn').addEventListener('click', () => {
    currentPage++;
    searchMovie(currentSearchTerm, currentPage, true);
});
document.getElementById('showLessBtn').addEventListener('click', () => {
    if (allMovies.length > 10) {
        allMovies = allMovies.slice(0, 10);
        renderMovies();
        document.getElementById('showLessBtn').style.display = 'none';
        document.getElementById('showMoreBtn').style.display = 'inline-block';
        currentPage = 1;
    }
});