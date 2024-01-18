document.getElementById('usernameForm').addEventListener('submit', function (event) {
    event.preventDefault();

    
    const username = document.getElementById('username').value;
    const perPage = parseInt(document.getElementById('perPage').value);
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
            userDetails.innerHTML = `
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || 'No bio available.'}</p>
            <p>Location: ${user.location || 'Not specified'}</p>
            <p>Followers: ${user.followers || 0}</p>
            <p>Following: ${user.following || 0}</p>
            <a href="${user.html_url}" target="_blank">GitHub Profile</a>
        `;
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
// function fetchRepositories(repositories, response, repositoriesContainer) {
//     const loader = document.getElementById('loader');

//     repositoriesContainer.innerHTML = '';

//     repositories.forEach(repo => {
//         const repoCard = document.createElement('div');
//         repoCard.className = 'repository-card';

//         fetch(`${repo.url}/topics`, {
//             headers: {
//                 Accept: 'application/vnd.github.mercy-preview+json', // Include this header for accessing topics API
//             },
//         })
//             .then(topicResponse => {
//                 if (!topicResponse.ok) {
//                     throw new Error(`HTTP error! Status: ${topicResponse.status}`);
//                 }
//                 return topicResponse.json();
//             })
//             .then(topics => {
//                 const topicBadges = getTopicBadges(topics.names); // Function to get badges for topics

//                 const topicIcons = topicBadges.map(badge => `<img src="${badge}" alt="${badge}">`).join('');

//                 repoCard.innerHTML = `<a href="${repo.html_url}" target="_blank"><h3>${repo.name}</h3></a>
//                                  <p>${repo.description || 'No description available.'}</p>
//                                  <div>${topicIcons}</div>`;
//                 repositoriesContainer.appendChild(repoCard);
//             }

//             )
//             .catch(error => {
//                 console.error('Error fetching repository topics:', error);
//             });
//     });

//     loader.classList.add('hidden');

//     // Check if there are more pages and display pagination
//     if (response.headers.get('Link')) {
//         const linkHeader = response.headers.get('Link').split(', ');
//         const nextPage = linkHeader.find(link => link.includes('rel="next"'));
//         if (nextPage) {
//             const nextPageUrl = nextPage.split(';')[0].slice(1, -1);
//             const nextPageButton = document.createElement('button');
//             nextPageButton.innerText = 'Load More';
//             nextPageButton.addEventListener('click', function () {
//                 fetch(nextPageUrl)
//                     .then(response => {
//                         if (!response.ok) {
//                             throw new Error(`HTTP error! Status: ${response.status}`);
//                         }
//                         return response.json().then(nextPageRepositories => ({ nextPageRepositories, response }));
//                     })
//                     .then(({ nextPageRepositories, response }) => {
//                         fetchRepositories(nextPageRepositories, response, repositoriesContainer);
//                     })
//                     .catch(error => {
//                         repositoriesContainer.innerHTML = '<p>Error fetching repositories.</p>';
//                         loader.classList.add('hidden');
//                         console.error('Error fetching repositories:', error);
//                     });
//             });
//             repositoriesContainer.appendChild(nextPageButton);
//         }
//     }
// }

function createPageButton(page, fetchFunction) {
    const button = document.createElement('button');
    button.innerText = page;
    button.addEventListener('click', function () {
        fetchFunction(page);
    });
    return button;
}

function fetchRepositories(repositories, response, repositoriesContainer, currentPage = 1) {
    const loader = document.getElementById('loader');
    const pageContainer = document.getElementById('pageContainer');

    repositoriesContainer.innerHTML = '';
    pageContainer.innerHTML = ''; // Clear previous page buttons

    repositories.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'repository-card';

        fetch(`${repo.url}/topics`, {
            headers: {
                Accept: 'application/vnd.github.mercy-preview+json',
            },
        })
            .then(topicResponse => {
                if (!topicResponse.ok) {
                    throw new Error(`HTTP error! Status: ${topicResponse.status}`);
                }
                return topicResponse.json();
            })
            .then(topics => {
                const topicBadges = getTopicBadges(topics.names); // Function to get badges for topics
    
                const topicIcons = topicBadges.map(badge => `<img src="${badge}" alt="${badge}">`).join('');
    
                repoCard.innerHTML = `<a href="${repo.html_url}" target="_blank"><h3>${repo.name}</h3></a>
                                     <p>${repo.description || 'No description available.'}</p>
                                     <div>${topicIcons}</div>`;
                repositoriesContainer.appendChild(repoCard);
            })
            .catch(error => {
                console.error('Error fetching repository topics:', error);
            });
    });

    loader.classList.add('hidden');

    // Check if there are more pages and display pagination
    if (response.headers.get('Link')) {
        const linkHeader = response.headers.get('Link').split(', ');
        const lastPage = linkHeader.find(link => link.includes('rel="last"'));
        if (lastPage) {
            const lastPageNumber = parseInt(lastPage.split(';')[0].slice(1, -1).split('page=')[1]);
            

            // Generate and append page number buttons
            for (let i = 1; i <= lastPageNumber; i++) {
                const pageButton = createPageButton(i, fetchPage);
                pageButton.style.display = 'inline-block';
                pageContainer.appendChild(pageButton);
            }
        }
    }
    function fetchPage(page) {


        const pageUrl = `https://api.github.com/users/${username.value}/repos?per_page=${perPage.value}&page=${page}`;
        fetch(pageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json().then(pageRepositories => ({ pageRepositories, response }));
            })
            .then(({ pageRepositories, response }) => {
                fetchRepositories(pageRepositories, response, repositoriesContainer, page);
            })
            .catch(error => {
                repositoriesContainer.innerHTML = '<p>Error fetching repositories.</p>';
                loader.classList.add('hidden');
                console.error('Error fetching repositories:', error);
            });
    }
}


function getTopicBadges(topics) {
    // Function to generate Shields.io badge URLs for each topic
    return topics.map(topic => `https://img.shields.io/badge/${encodeURIComponent(topic)}-brightgreen`);
}
