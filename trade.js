document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addCandyForm');
  const successMessage = document.getElementById('successMessage');
  const rewardTableBody = document.querySelector('#rewardTable tbody');

  async function loadReward() {
    try {
      const res = await fetch('http://localhost:8000/reward');
      if (!res.ok) throw new Error('Failed to fetch reward');
      const reward = await res.json();

      rewardTableBody.innerHTML = '';
      reward.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.re_id}</td>
          <td>${r.re_type}</td>
          <td>${r.re_name}</td>
          <td>${r.r_point}</td>
          <td><img src="${r.image_reward}" alt="${r.re_name}" style="width:80px; height:auto;"></td>
        `;
        rewardTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      rewardTableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Error loading reward</td></tr>';
    }
  }

  loadReward();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.style.display = 'none';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const re_type = form.re_type.value;
    const re_name = form.re_name.value.trim();
    const r_point = parseInt(form.r_point.value);
    const poster = form.poster.files[0];

    if (!poster) {
      alert("กรุณาเลือกรูปภาพขนมก่อน");
      return;
    }

    try {
      const posterData = new FormData();
      posterData.append("poster", poster);

      const uploadRes = await fetch("http://localhost:8000/uploadPoster", {
        method: "POST",
        body: posterData,
      });

      if (!uploadRes.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
      const uploadResult = await uploadRes.json();

      const candyData = {
        re_type,
        re_name,
        image_reward: uploadResult.url,
        r_point
      };

      const saveRes = await fetch("http://localhost:8000/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candyData),
      });

      if (!saveRes.ok) {
        const error = await saveRes.json();
        throw new Error(error.error || "บันทึกข้อมูลขนมไม่สำเร็จ");
      }

      successMessage.style.display = "block";
      form.reset();
      loadReward();
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.message);
    }
  });
});
