document.getElementById('usernameForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const repositoriesContainer = document.getElementById('repositories');
    const userCard = document.getElementById('userCard');
    const userAvatar = document.getElementById('userAvatar');
    const userDetails = document.getElementById('userDetails');
    const loader = document.getElementById('loader');
    const searchContainer = document.getElementById('searchContainer');

    repositoriesContainer.innerHTML = ''; // Clear previous results

    loader.innerHTML = '<p>Loading...</p>';
    loader.classList.remove('hidden');
    searchContainer.classList.add('hidden');

    const perPage = parseInt(document.getElementById('perPage').value);
    const userApiUrl = `https://api.github.com/users/${username}`;

    fetch(userApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            userCard.classList.remove('hidden');
            userAvatar.src = user.avatar_url;
            userDetails.innerHTML = `<h2>${user.name || user.login}</h2><p>${user.bio || 'No bio available.'}</p><p>Followers: ${user.followers || 0}</p><p>Following: ${user.following || 0}</p>`;

            const firstPageUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=1`;
            return fetch(firstPageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json().then(repositories => ({ repositories, response }));
                });
        })
        .then(({ repositories, response }) => {
            fetchRepositories(repositories, response, repositoriesContainer);
        })
        .catch(error => {
            repositoriesContainer.innerHTML = '<p>Error fetching user data.</p>';
            loader.classList.add('hidden');
            console.error('Error fetching user data:', error);
        });
});

function fetchRepositories(repositories, response, repositoriesContainer) {
    const loader = document.getElementById('loader');

    repositoriesContainer.innerHTML = '';

    repositories.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'repository-card';
        const techLogos = getTechLogos(); // Placeholder function for technology logos
        const techIcons = techLogos.map(logo => `<img src="${logo}" alt="${logo}">`).join('');

        repoCard.innerHTML = `<a href="${repo.html_url}" target="_blank"><h3>${repo.name}</h3></a>
                             <p>${repo.description || 'No description available.'}</p>
                             <div>${techIcons}</div>`;
        repositoriesContainer.appendChild(repoCard);
    });

    loader.classList.add('hidden');

    // Check if there are more pages and display pagination
    if (response.headers.get('Link')) {
        const linkHeader = response.headers.get('Link').split(', ');
        const nextPage = linkHeader.find(link => link.includes('rel="next"'));
        if (nextPage) {
            const nextPageUrl = nextPage.split(';')[0].slice(1, -1);
            const nextPageButton = document.createElement('button');
            nextPageButton.innerText = 'Load More';
            nextPageButton.addEventListener('click', function () {
                fetch(nextPageUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json().then(nextPageRepositories => ({ nextPageRepositories, response }));
                    })
                    .then(({ nextPageRepositories, response }) => {
                        fetchRepositories(nextPageRepositories, response, repositoriesContainer);
                    })
                    .catch(error => {
                        repositoriesContainer.innerHTML = '<p>Error fetching repositories.</p>';
                        loader.classList.add('hidden');
                        console.error('Error fetching repositories:', error);
                    });
            });
            repositoriesContainer.appendChild(nextPageButton);
        }
    }
}

function getTechLogos() {
    // Placeholder function to return an array of technology logos
    return [
        'path/to/logo1.png',
        'path/to/logo2.png',
        'path/to/logo3.png',
        // Add more logos as needed
    ];
}
