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

      const showtimeMap = {};
      showtimes.forEach(st => {
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

    } catch (error) {
      console.error('Error loading data:', error);
      movieTableBody.innerHTML = `<tr><td colspan="5">❌ Failed to load data</td></tr>`;
    }
  }

  async function deleteMovie(id) {
    if (confirm('Are you sure you want to delete this movie?')) {
      try {
        const res = await fetch(`http://localhost:8000/movie/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert('✅ Movie deleted');
          fetchData();
        } else {
          alert('❌ Delete failed');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('❌ Delete error');
      }
    }
  }

  // 🧠 Event delegation for Edit/Delete
  movieTableBody.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('edit-btn')) {
      const id = target.getAttribute('data-id');
      window.location.href = `editmovie.html?id=${id}`;
    } else if (target.classList.contains('delete-btn')) {
      const id = target.getAttribute('data-id');
      deleteMovie(id);
    }
  });

  // Initial load
  fetchData();
});
