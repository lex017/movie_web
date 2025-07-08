document.addEventListener('DOMContentLoaded', () => {
  const movieTableBody = document.querySelector('#movieTable tbody');
  const btnAddMovie = document.getElementById('btnAddMovie');

  btnAddMovie.addEventListener('click', () => {
    window.location.href = 'add_movie.html';
  });

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('th-TH'); 
  }

  function formatTime(timeStr) {
    const [hour, min] = timeStr.split(':');
    return `${hour}:${min}`;
  }

  async function fetchData() {
  try {
    const [moviesRes, showtimesRes] = await Promise.all([
      fetch('http://localhost:8000/movie'),
      fetch('http://localhost:8000/showtime'),
    ]);

    const movies = await moviesRes.json();
    const showtimes = await showtimesRes.json();

    console.log('Movies:', movies);
    console.log('Showtimes:', showtimes);

    const showtimeMap = {};
    showtimes.forEach(st => {
      console.log('Showtime movie_id:', st.movie_id);
      const movieId = st.movie_id;
      const formattedDate = formatDate(st.show_date);
      const formattedTime = formatTime(st.showt_ime);
      const timeStr = `${formattedDate} ${formattedTime}`;

      if (!showtimeMap[movieId]) {
        showtimeMap[movieId] = [];
      }
      showtimeMap[movieId].push(timeStr);
    });

    movieTableBody.innerHTML = '';
    movies.forEach(movie => {
      console.log('Movie mv_id:', movie.mv_id);
      const times = showtimeMap[movie.mv_id]
        ? showtimeMap[movie.mv_id].join('<br>')
        : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${movie.mv_name}</td>
        <td>${movie.genre}</td>
        <td>${movie.duration} min</td>
        <td>${movie.price || '-'}</td>

        <td>
          <button class="edit-btn" data-id="${movie.mv_id}">Edit</button>
          <button class="delete-btn" data-id="${movie.mv_id}">Delete</button>
        </td>
      `;
      movieTableBody.appendChild(tr);
    });

    // ... event listeners code as before

  } catch (error) {
    console.error('Error loading data:', error);
    movieTableBody.innerHTML = `<tr><td colspan="6">❌ Failed to load data</td></tr>`;
  }
}


  function deleteMovie(id) {
    fetch(`http://localhost:8000/movie/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          alert('✅ Movie deleted');
          fetchData();
        } else {
          alert('❌ Delete failed');
        }
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ Delete error');
      });
  }

  fetchData();
});
