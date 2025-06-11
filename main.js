document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');

  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Sample movie data
  const movies = [
    {id: 1, title: "Inception", genre: "Sci-Fi", duration: "148 min", rating: "PG-13"},
    {id: 2, title: "The Godfather", genre: "Drama", duration: "175 min", rating: "R"},
    {id: 3, title: "Spider-Man: No Way Home", genre: "Action", duration: "148 min", rating: "PG-13"},
    {id: 4, title: "Toy Story 4", genre: "Animation", duration: "100 min", rating: "G"},
    {id: 5, title: "Parasite", genre: "Thriller", duration: "132 min", rating: "R"}
  ];

  // Dashboard cards counts
  const movieCountElem = document.getElementById('movieCount');
  const showtimeCountElem = document.getElementById('showtimeCount');
  const bookingCountElem = document.getElementById('bookingCount');
  const userCountElem = document.getElementById('userCount');

  // For demo, mock counts for showtimes, bookings, and users
  const showtimeCount = 22;
  const bookingCount = 134;
  const userCount = 58;

  movieCountElem.textContent = movies.length;
  showtimeCountElem.textContent = showtimeCount;
  bookingCountElem.textContent = bookingCount;
  userCountElem.textContent = userCount;

  // Populate recent movies table
  const recentMoviesTableBody = document.querySelector('#recentMoviesTable tbody');
  recentMoviesTableBody.innerHTML = '';

  movies.forEach(movie => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.genre}</td>
      <td>${movie.duration}</td>
      <td>${movie.rating}</td>
      <td>
        <button class="edit-btn" data-id="${movie.id}" title="Edit">Edit</button>
        <button class="delete-btn" data-id="${movie.id}" title="Delete" style="background-color:#b04040;">Delete</button>
      </td>
    `;

    recentMoviesTableBody.appendChild(tr);
  });

  // Event delegation for edit and delete buttons on movie list
  recentMoviesTableBody.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-btn')) {
      const id = target.dataset.id;
      alert('Edit functionality for movie ID ' + id + ' is not implemented.');
      // Implement edit modal or navigation here
    } else if (target.classList.contains('delete-btn')) {
      const id = Number(target.dataset.id);
      // Confirm deletion
      if (confirm('Are you sure you want to delete this movie?')) {
        // Remove movie from movies array and update table and count
        const index = movies.findIndex(m => m.id === id);
        if (index !== -1) {
          movies.splice(index, 1);
          updateDashboard();
          populateMovieTable();
        }
      }
    }
  });

  // Functions to update dashboard and repopulate table after changes
  function updateDashboard() {
    movieCountElem.textContent = movies.length;
    // Other counts remain static for this demo
  }

  function populateMovieTable() {
    recentMoviesTableBody.innerHTML = '';
    movies.forEach(movie => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${movie.title}</td>
        <td>${movie.genre}</td>
        <td>${movie.duration}</td>
        <td>${movie.rating}</td>
        <td>
          <button class="edit-btn" data-id="${movie.id}" title="Edit">Edit</button>
          <button class="delete-btn" data-id="${movie.id}" title="Delete" style="background-color:#b04040;">Delete</button>
        </td>
      `;
      recentMoviesTableBody.appendChild(tr);
    });
  }

  // ApexCharts - sample movies added per day chart
  const options = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      },
      foreColor: '#eee'
    },
    series: [{
      name: 'Movies Added',
      data: [2, 1, 3, 2, 4, 0, 1]
    }],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: '#444466'
    },
    tooltip: {
      theme: 'dark'
    },
    colors: ['#ff5252']
  };

  const chartBarDiv = document.querySelector('#chart-bar');
  if(chartBarDiv){
    const chart = new ApexCharts(chartBarDiv, options);
    chart.render();
  }

  // Populate day filter dropdown (if present)
  const dayFilterSelect = document.getElementById('dayFilter');
  if(dayFilterSelect){
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      dayFilterSelect.appendChild(option);
    });
    // Filtering functionality (optional)
    dayFilterSelect.addEventListener('change', (e) => {
      // Filter logic can be added based on selected day
      alert(`Filter by day '${e.target.value}' not implemented.`);
    });
  }

});

