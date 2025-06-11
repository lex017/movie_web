document.addEventListener('DOMContentLoaded', () => {
      const sidebar = document.getElementById('sidebar');
      const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });

      // Sample movies data
      let movies = [
        {
          id: 1,
          title: "Inception",
          genre: "Sci-Fi",
          duration: "148 min",
          rating: "PG-13",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"]
        },
        {
          id: 2,
          title: "The Godfather",
          genre: "Drama",
          duration: "175 min",
          rating: "R",
          showtimes: ["2:00 PM", "7:00 PM"]
        },
        {
          id: 3,
          title: "Toy Story 4",
          genre: "Animation",
          duration: "100 min",
          rating: "G",
          showtimes: ["11:00 AM", "3:00 PM", "6:00 PM"]
        },
      ];

      const tbody = document.querySelector('#movieTable tbody');
      const btnAddMovie = document.getElementById('btnAddMovie');

      function renderMovies() {
        tbody.innerHTML = '';
        movies.forEach(movie => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.duration}</td>
            <td>${movie.rating}</td>
            <td>${movie.showtimes.join(', ')}</td>
            <td>
              <button class="edit-btn" data-id="${movie.id}" title="Edit">Edit</button>
              <button class="delete-btn" data-id="${movie.id}" title="Delete" style="background-color:#b04040;">Delete</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      tbody.addEventListener('click', e => {
        if(e.target.classList.contains('edit-btn')) {
          const id = Number(e.target.dataset.id);
          alert(`Edit functionality for movie ID ${id} is not implemented.`);
          // Implement edit modal or navigation
        }
        if(e.target.classList.contains('delete-btn')) {
          const id = Number(e.target.dataset.id);
          if(confirm('Are you sure you want to delete this movie?')) {
            movies = movies.filter(m => m.id !== id);
            renderMovies();
          }
        }
      });

      btnAddMovie.addEventListener('click', () => {
        // Redirect to add movie page or show add movie modal
        window.location.href = 'add_movie.html';
      });

      renderMovies();
    });