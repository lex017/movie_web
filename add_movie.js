 document.addEventListener('DOMContentLoaded', () => {
      const sidebar = document.getElementById('sidebar');
      const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });

      const form = document.getElementById('addMovieForm');
      const successMessage = document.getElementById('successMessage');

      form.addEventListener('submit', e => {
        e.preventDefault();
        successMessage.style.display = 'none';

        // Validate inputs manually (HTML5 built-in handles basic required and types)
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const title = form.title.value.trim();
        const genre = form.genre.value;
        const duration = Number(form.duration.value);
        const rating = form.rating.value;
        const showtimesRaw = form.showtimes.value.trim();
        const showtimes = showtimesRaw.split(',').map(s => s.trim()).filter(s => s);

        if (title.length === 0 || genre === '' || isNaN(duration) || duration <= 0 || rating === '' || showtimes.length === 0) {
          alert('Please fill all fields correctly');
          return;
        }

        // Here you would typically send the data to your backend server or database
        console.log({
          title,
          genre,
          duration,
          rating,
          showtimes
        });

        // Fake success and reset form
        successMessage.style.display = 'block';
        form.reset();

        // Optionally, you can redirect after a delay or let user decide
        // setTimeout(() => {
        //   window.location.href = 'movie_list.html';
        // }, 2000);
      });
    });