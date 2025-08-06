let isSearching = false;
function searchMovie(searchTerm) {
    if (isSearching) return;
    isSearching = true;
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (!searchTerm) {
        resultsContainer.innerHTML = '<p>Search term is empty.</p>';
        isSearching = false;
    } else {
        fetch(`http://www.omdbapi.com/?apikey=89d38438&s=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    data.Search.forEach(movie => {
                        const movieDiv = document.createElement('div');
                        movieDiv.style.display = 'inline-block';
                        movieDiv.style.verticalAlign = 'top';
                        movieDiv.style.margin = '20px';
                        movieDiv.style.width = '300px';
                        movieDiv.className = 'movie-item';
                        movieDiv.innerHTML = `
                            <h3>${movie.Title} (${movie.Year}) <br>Type: ${movie.Type}</h3>
                            <img src="${movie.Poster !== "N/A" ? movie.Poster : ''}" alt="Poster" width="300">
                        `;
                        resultsContainer.appendChild(movieDiv);
                    });
                } else {
                    resultsContainer.innerHTML = `<p>No results found.</p>`;
                }
            })
            .catch(error => {
                resultsContainer.innerHTML = `<p>Error fetching data.</p>`;
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                isSearching = false;
            });
    }
}
// Add event listener for the search button
document.getElementById('searchButton').addEventListener('click', (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('searchInput').value;
    searchMovie(searchTerm);
});
// Add event listener for the Enter key (call searchMovie directly to avoid double search)
document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;
        searchMovie(searchTerm);
    }
});