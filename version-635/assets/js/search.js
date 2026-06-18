var movies = window.SEARCH_MOVIES || [];
var params = new URLSearchParams(window.location.search);
var initialQuery = params.get('q') || '';
var input = document.querySelector('[data-global-search]');
var results = document.querySelector('[data-search-results]');
var empty = document.querySelector('[data-empty-state]');

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

function card(movie) {
  var tags = movie.terms.slice(0, 3).map(function (term) {
    return '<span>' + term + '</span>';
  }).join('');
  return '<article class="movie-card" data-card>' +
    '<a class="poster-link" href="' + movie.href + '" aria-label="' + movie.title + '">' +
    '<img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">' +
    '<span class="poster-shade"></span>' +
    '<span class="year-badge">' + movie.year + '</span>' +
    '<span class="play-badge">▶</span>' +
    '</a>' +
    '<div class="card-body">' +
    '<a class="card-title" href="' + movie.href + '">' + movie.title + '</a>' +
    '<p class="card-desc">' + movie.description + '</p>' +
    '<div class="meta-row"><span>' + movie.region + '</span><span>' + movie.genre + '</span><span>★ ' + movie.rating + '</span></div>' +
    '<div class="tag-row">' + tags + '</div>' +
    '</div>' +
    '</article>';
}

function render() {
  var query = normalize(input ? input.value : initialQuery);
  var words = query.split(/\s+/).filter(Boolean);
  var matched = movies.filter(function (movie) {
    var text = normalize([movie.title, movie.year, movie.region, movie.genre, movie.category, movie.description, movie.terms.join(' ')].join(' '));
    return words.every(function (word) {
      return text.indexOf(word) !== -1;
    });
  }).slice(0, 96);

  if (results) {
    results.innerHTML = matched.map(card).join('');
  }
  if (empty) {
    empty.classList.toggle('is-visible', matched.length === 0);
  }
}

if (input) {
  input.value = initialQuery;
  input.addEventListener('input', render);
}

render();
