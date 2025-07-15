document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');

  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Elements
  const movieCountElem = document.getElementById('movieCount');
  const showtimeCountElem = document.getElementById('showtimeCount');
  const bookingCountElem = document.getElementById('bookingCount');
  const userCountElem = document.getElementById('userCount');
  const recentMoviesTableBody = document.querySelector('#recentMoviesTable tbody');

  // Base API URL (adjust if deployed)
  const API_BASE = 'http://localhost:8000';

  // Load dashboard data
  async function loadDashboard() {
    try {
      const [moviesRes, showtimesRes, ticketsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/movie`),
        fetch(`${API_BASE}/showtime`),
        fetch(`${API_BASE}/tickets`),
        fetch(`${API_BASE}/user`)
      ]);

      if (!moviesRes.ok || !showtimesRes.ok || !ticketsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch some data');
      }

      const movies = await moviesRes.json();
      const showtimes = await showtimesRes.json();
      const tickets = await ticketsRes.json();
      const users = await usersRes.json();

      // Update counts
      movieCountElem.textContent = movies.length;
      showtimeCountElem.textContent = showtimes.length;
      bookingCountElem.textContent = tickets.length;
      userCountElem.textContent = users.length;

      // Populate movies table
      populateMovieTable(movies);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      movieCountElem.textContent = 'Error';
      showtimeCountElem.textContent = 'Error';
      bookingCountElem.textContent = 'Error';
      userCountElem.textContent = 'Error';
    }
  }

  // Populate movies table
  function populateMovieTable(movies) {
    recentMoviesTableBody.innerHTML = '';
    movies.forEach(movie => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${movie.mv_name || ''}</td>
        <td>${movie.genre || ''}</td>
        <td>${movie.duration || ''}</td>
        <td>${movie.status || ''}</td>
        
      `;
      recentMoviesTableBody.appendChild(tr);
    });
  }

  // Handle click on edit/delete buttons with event delegation
  recentMoviesTableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (target.classList.contains('edit-btn')) {
      const id = target.dataset.id;
      alert('Edit functionality for movie ID ' + id + ' is not implemented yet.');
      // You can implement your edit modal or page navigation here
    } else if (target.classList.contains('delete-btn')) {
      const id = target.dataset.id;
      if (confirm('Are you sure you want to delete this movie?')) {
        try {
          const res = await fetch(`${API_BASE}/movie/${id}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete movie');
          alert('Movie deleted successfully');
          await loadDashboard(); // refresh data after deletion
        } catch (err) {
          alert('Error deleting movie: ' + err.message);
        }
      }
    }
  });

  // ApexCharts - sample movies added per day chart
  const options = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
      foreColor: '#eee'
    },
    series: [{
      name: 'Movies Added',
      data: [2, 1, 3, 2, 4, 0, 1] // You can replace with real data if you want
    }],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: { borderColor: '#444466' },
    tooltip: { theme: 'dark' },
    colors: ['#ff5252']
  };

  const chartBarDiv = document.querySelector('#chart-bar');
  if(chartBarDiv){
    const chart = new ApexCharts(chartBarDiv, options);
    chart.render();
  }

  // Populate day filter dropdown (optional)
  const dayFilterSelect = document.getElementById('dayFilter');
  if(dayFilterSelect){
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      dayFilterSelect.appendChild(option);
    });
    dayFilterSelect.addEventListener('change', (e) => {
      alert(`Filter by day '${e.target.value}' is not implemented yet.`);
    });
  }

  // Initial load
  loadDashboard();
});
