document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.querySelector('nav .toggle-sidebar');

    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Elements for dashboard counts
    const movieCountElem = document.getElementById('movieCount');
    const rewardCountElem = document.getElementById('rewardCount');
    const bookingCountElem = document.getElementById('bookingCount');
    const userCountElem = document.getElementById('userCount');
    const recentMoviesTableBody = document.querySelector('#recentMoviesTable tbody');
    const chartBarDiv = document.getElementById('ticketRevenueChart'); // For the main daily revenue chart

    // Elements for the new date range income filter
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyIncomeFilterBtn = document.getElementById('applyIncomeFilterBtn'); // New button ID
    const clearIncomeFilterBtn = document.getElementById('clearIncomeFilterBtn'); // New button ID
    const filteredIncomeElem = document.getElementById('filteredIncome'); // Element to display filtered income

    const API_BASE = 'http://localhost:8000';

    // Store all tickets data globally for filtering
    let allTicketsData = [];
    let dailyRevenueChartInstance = null; // To store the ApexCharts instance

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
            allTicketsData = await ticketsRes.json(); // Store full tickets data
            const users = await usersRes.json();

            movieCountElem.textContent = movies.length;
            rewardCountElem.textContent = rewards.length;
            bookingCountElem.textContent = allTicketsData.length; // Use allTicketsData length for total bookings
            userCountElem.textContent = users.length;

            populateMovieTable(movies);
            // Render chart with all tickets initially
            renderTicketRevenueChart(allTicketsData);
            // Also, calculate initial total income (for all tickets)
            calculateAndDisplayFilteredIncome(); // Call without arguments, it uses global allTicketsData

        } catch (err) {
            console.error('Error loading dashboard:', err);
            movieCountElem.textContent = rewardCountElem.textContent =
                bookingCountElem.textContent = userCountElem.textContent = 'Error';
            if (filteredIncomeElem) {
                filteredIncomeElem.textContent = 'Error loading income';
            }
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

    // ApexCharts - Ticket Revenue Chart (Daily Trend)
    function renderTicketRevenueChart(ticketsToDisplay) {
        if (!chartBarDiv) {
            console.error('Chart div element not found. Make sure an element with ID "ticketRevenueChart" exists.');
            return;
        }

        const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const revenuePerDay = Array(7).fill(0);

        ticketsToDisplay.forEach(ticket => {
            const date = new Date(ticket.booking_date); // <--- CHANGED from created_at to booking_date
            const dayIndex = date.getDay(); // 0 = Sun, ..., 6 = Sat
            const price = parseFloat(ticket.price) || 0;
            revenuePerDay[dayIndex] += price;
        });

        const chartOptions = {
            chart: {
                type: 'bar',
                height: 300,
                toolbar: { show: false },
                foreColor: '#eee'
            },
            series: [{
                name: 'รายได้ (₭)',
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
                    formatter: (val) => `₭${val.toFixed(2)}`
                }
            },
            colors: ['#00e676']
        };

        if (dailyRevenueChartInstance) {
            dailyRevenueChartInstance.updateOptions(chartOptions);
        } else {
            dailyRevenueChartInstance = new ApexCharts(chartBarDiv, chartOptions);
            dailyRevenueChartInstance.render();
        }
    }


    // Function to filter tickets by date range and calculate total income
    function calculateAndDisplayFilteredIncome() {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        let ticketsForIncomeCalculation = allTicketsData;

        // Only filter if both start and end dates are provided
        if (startDateValue && endDateValue) {
            const startDate = new Date(startDateValue);
            const endDate = new Date(endDateValue);
            // Set end date to end of day to include all transactions on that day
            endDate.setHours(23, 59, 59, 999);

            ticketsForIncomeCalculation = allTicketsData.filter(ticket => {
                const ticketDate = new Date(ticket.booking_date); // <--- CHANGED from created_at to booking_date
                // Normalize ticket date to start of day for accurate comparison
                ticketDate.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0); // Normalize filter start date
                endDate.setHours(23, 59, 59, 999); // Normalize filter end date

                return ticketDate >= startDate && ticketDate <= endDate;
            });
        }
        // If no dates selected, it uses allTicketsData as initialized

        const totalIncome = ticketsForIncomeCalculation.reduce((sum, ticket) => {
            return sum + (parseFloat(ticket.price) || 0);
        }, 0);

        if (filteredIncomeElem) {
            filteredIncomeElem.textContent = `รายได้รวม: ₭${totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        // You might also want to update the main daily revenue chart with the filtered data here
        // renderTicketRevenueChart(ticketsForIncomeCalculation); // Uncomment if you want the chart to also react to this filter
    }

    // Event listeners for the new income filter
    if (applyIncomeFilterBtn) {
        applyIncomeFilterBtn.addEventListener('click', calculateAndDisplayFilteredIncome);
    }
    if (clearIncomeFilterBtn) {
        clearIncomeFilterBtn.addEventListener('click', () => {
            startDateInput.value = '';
            endDateInput.value = '';
            calculateAndDisplayFilteredIncome(); // Recalculate with all data
        });
    }


    // Optional day filter dropdown (existing, but note it's not integrated with date range income)
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
            alert(`Filter by ${e.target.value} - not implemented for dashboard chart filtering.`);
            // This alert shows it's not hooked up. If you want this to filter the main chart,
            // you'd need logic here similar to the previous request's solution.
        });
    }

    // Load dashboard initially
    loadDashboard();
});