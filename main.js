document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Elements
  const movieCountElem = document.getElementById('movieCount');
  const rewardCountElem = document.getElementById('rewardCount');
  const bookingCountElem = document.getElementById('bookingCount');
  const userCountElem = document.getElementById('userCount');
  const recentMoviesTableBody = document.querySelector('#recentMoviesTable tbody');
  // Define chartBarDiv here
  const chartBarDiv = document.getElementById('ticketRevenueChart'); // Assuming you have an element with this ID for your chart

  const API_BASE = 'http://localhost:8000';

  // Load all dashboard data
  async function loadDashboard() {
    try {
      const [moviesRes, rewardsRes, ticketsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/movie`),
        fetch(`${API_BASE}/reward`),
        fetch(`${API_BASE}/tickets`),
        fetch(`${API_BASE}/user`)
      ]);

      if (!moviesRes.ok || !rewardsRes.ok || !ticketsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch one or more endpoints');
      }

      const movies = await moviesRes.json();
      const rewards = await rewardsRes.json();
      const tickets = await ticketsRes.json();
      const users = await usersRes.json();

      movieCountElem.textContent = movies.length;
      rewardCountElem.textContent = rewards.length;
      bookingCountElem.textContent = tickets.length;
      userCountElem.textContent = users.length;

      populateMovieTable(movies);
      // Call renderTicketRevenueChart here after tickets data is fetched
      renderTicketRevenueChart(tickets);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      movieCountElem.textContent = rewardCountElem.textContent =
        bookingCountElem.textContent = userCountElem.textContent = 'Error';
    }
  }

  // Populate movie table
  function populateMovieTable(movies) {
    recentMoviesTableBody.innerHTML = '';
    movies.forEach(movie => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${movie.mv_name || '-'}</td>
        <td>${movie.genre || '-'}</td>
        <td>${movie.duration || '-'}</td>
        <td>${movie.status || '-'}</td>
      `;
      recentMoviesTableBody.appendChild(tr);
    });
  }

  // ApexCharts - Movie Add per Day
  async function renderTicketRevenueChart(tickets) {
    if (!chartBarDiv) {
      console.error('Chart div element not found. Make sure an element with ID "ticketRevenueChart" exists.');
      return;
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenuePerDay = Array(7).fill(0);

    tickets.forEach(ticket => {
      const date = new Date(ticket.created_at);
      const dayIndex = date.getDay(); // 0 = Sun, ..., 6 = Sat
      const price = parseFloat(ticket.price) || 0;
      revenuePerDay[dayIndex] += price;
    });

    const chart = new ApexCharts(chartBarDiv, {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        foreColor: '#eee'
      },
      series: [{
        name: 'Revenue (฿)',
        data: revenuePerDay
      }],
      xaxis: {
        categories: days,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: { borderColor: '#444466' },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => `฿${val.toFixed(2)}`
        }
      },
      colors: ['#00e676']
    });

    chart.render();
  }

  // Optional day filter dropdown
  const dayFilterSelect = document.getElementById('dayFilter');
  if (dayFilterSelect) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      dayFilterSelect.appendChild(option);
    });

    dayFilterSelect.addEventListener('change', (e) => {
      alert(`Filter by ${e.target.value} - not implemented`);
    });
  }

  // Load dashboard initially
  loadDashboard();
});