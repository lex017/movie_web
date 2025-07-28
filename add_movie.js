document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('addMovieForm');
  const successMessage = document.getElementById('successMessage');
  const theaterSelect = document.getElementById('theater');

 
  try {
    const res = await fetch("http://localhost:8000/movie");
    if (!res.ok) throw new Error("Failed to fetch movies");
    const movies = await res.json();

    const takenTheaters = new Set(
      movies
        .filter(m => m.status && m.status.toLowerCase() === 'now')
        .map(m => String(m.theaters)) 
    );

    const theaterOptions = [
      { id: "1", name: "Theater 1" },
      { id: "2", name: "Theater 2" },
      { id: "3", name: "Theater 3" },
      { id: "4", name: "Theater 4" },
      { id: "5", name: "Theater 5" }
    ];

    theaterSelect.innerHTML = '<option value="">Select theater</option>';
    theaterOptions.forEach(t => {
      if (!takenTheaters.has(t.id)) {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.name;
        theaterSelect.appendChild(option);
      }
    });
  } catch (err) {
    console.error("Error loading theaters:", err.message);
    alert("Failed to load theater list.");
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.style.display = 'none';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const title = form.title.value.trim();
    const genre = form.genre.value;
    const theater = form.theater.value.trim();
    const status = form.status.value.trim();
    const releaseDate = form.releaseDate.value; 
    const description = form.description.value.trim();
    const price = Number(form.price.value);
    const duration = Number(form.duration.value);
    const poster = form.poster.files[0];
    const availableSeat = Number(form.availableSeat?.value) || 100;

    const times = [
      form.showtime1.value,
      form.showtime2.value,
      form.showtime3.value,
      form.showtime4.value
    ].filter(Boolean);

    if (!poster) {
      alert("Please upload a poster image.");
      return;
    }

    try {
      const posterData = new FormData();
      posterData.append("poster", poster);

      const uploadRes = await fetch("http://localhost:8000/uploadPoster", {
        method: "POST",
        body: posterData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload poster");
      const uploadResult = await uploadRes.json();
      if (!uploadResult.url) throw new Error("Poster upload did not return a URL");

     
      const movieData = {
        mv_name: title,
        description,
        duration,
        genre,
        status,
        release_date: releaseDate,   
        posterURL: uploadResult.url,
        price,
        theaters: theater,        
        seat: availableSeat          
      };

 
      const saveRes = await fetch("http://localhost:8000/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieData),
      });

      if (!saveRes.ok) {
        const error = await saveRes.json();
        throw new Error(error.error || "Failed to save movie");
      }

      const movieResult = await saveRes.json();
      const movieId = movieResult.movie_id;


      for (const time of times) {
        const showtimeData = {
          movie_id: movieId,
          theaters_id: theater,
          show_date: releaseDate,
          showt_ime: time,
  
        };

        const showtimeRes = await fetch("http://localhost:8000/showtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(showtimeData),
        });

        if (!showtimeRes.ok) {
          const err = await showtimeRes.json();
          throw new Error(err.error || "Failed to save showtime");
        }
      }

      successMessage.style.display = "block";
      form.reset();
    } catch (err) {
      console.error("❌", err);
      alert("❌ Error: " + err.message);
    }
  });
});
