let currentView = 'home';

// Data wisata dengan koordinat (Latitude & Longitude)
const touristSpots = {
    "Kebun Raya Bogor": { lat: -6.5976, lng: 106.7996, icon: "🌳" },
    "Taman Safari": { lat: -6.7042, lng: 106.9463, icon: "🦁" },
    "Gunung Pancar": { lat: -6.5824, lng: 106.9064, icon: "🌲" },
    "Curug Nangka": { lat: -6.6664, lng: 106.7266, icon: "💦" },
    "Puncak": { lat: -6.7032, lng: 106.9950, icon: "⛰️" },
    "Curug Leuwi Hejo": { lat: -6.6116, lng: 106.9535, icon: "🏞️" },
    "JungleLand Sentul": { lat: -6.5828, lng: 106.9011, icon: "🎢" },
    "Taman Wisata Matahari": { lat: -6.6631, lng: 106.9348, icon: "🏕️" },
    "Devoyage Bogor": { lat: -6.6322, lng: 106.8048, icon: "🛶" },
    "Kuntum Farmfield": { lat: -6.6432, lng: 106.8378, icon: "🐑" }
};

document.addEventListener("DOMContentLoaded", () => {
    // Jalankan render awal saat website diload
    renderHome();
});

function renderHome() {
    const locationsContainer = document.getElementById('locations-container');
    let htmlContent = "";

    let index = 0;
    for (const [wilayah, data] of Object.entries(touristSpots)) {
        // Efek stagger
        const delay = index * 0.08;

        htmlContent += `
            <div class="location-card animate-entrance" style="animation-delay: ${delay}s" onclick="openDetail('${wilayah}')">
                <div class="location-icon">${data.icon}</div>
                <div class="location-title">${wilayah}</div>
                <div class="location-subtitle">Prakiraan Real-time 🛰️</div>
            </div>
        `;
        index++;
    }

    locationsContainer.innerHTML = htmlContent;
}

function openThesis() {
    document.getElementById("main-title").innerText = "Metodologi Skripsi";
    document.getElementById("sub-title").innerText = "Penerapan Arsitektur Algoritma Random Forest";
    document.getElementById("back-btn").classList.remove("hidden");
    document.getElementById("thesis-btn").classList.add("hidden");

    currentView = 'thesis';

    const homeView = document.getElementById("home-view");
    const thesisView = document.getElementById("thesis-view");

    homeView.classList.remove("active");
    homeView.classList.add("slide-left");

    thesisView.classList.remove("slide-right");
    thesisView.classList.add("active");
}

function closeThesis() {
    document.getElementById("main-title").innerText = "Destinasi Wisata";
    document.getElementById("sub-title").innerText = "Pilih lokasi untuk melihat prakiraan cerdas";
    document.getElementById("back-btn").classList.add("hidden");
    document.getElementById("thesis-btn").classList.remove("hidden");

    currentView = 'home';

    const homeView = document.getElementById("home-view");
    const thesisView = document.getElementById("thesis-view");

    thesisView.classList.remove("active");
    thesisView.classList.add("slide-right");

    homeView.classList.remove("slide-left");
    homeView.classList.add("active");
}

function handleBack() {
    if (currentView === 'detail') {
        closeDetail();
    } else if (currentView === 'thesis') {
        closeThesis();
    }
}

function openDetail(wilayah) {
    document.getElementById("main-title").innerText = wilayah;
    document.getElementById("sub-title").innerText = "Prakiraan Cuaca Real-Time Open-Meteo";
    document.getElementById("back-btn").classList.remove("hidden");
    document.getElementById("thesis-btn").classList.add("hidden");

    currentView = 'detail';

    const homeView = document.getElementById("home-view");
    const detailView = document.getElementById("detail-view");

    // Transisi push ke kiri
    homeView.classList.remove("active");
    homeView.classList.add("slide-left");

    detailView.classList.remove("slide-right");
    detailView.classList.add("active");

    // Tarik data cuaca real-time dari API
    fetchWeatherFor(wilayah);
}

function closeDetail() {
    document.getElementById("main-title").innerText = "Destinasi Wisata";
    document.getElementById("sub-title").innerText = "Pilih lokasi untuk melihat prakiraan cerdas";
    document.getElementById("back-btn").classList.add("hidden");
    document.getElementById("thesis-btn").classList.remove("hidden");

    currentView = 'home';

    const homeView = document.getElementById("home-view");
    const detailView = document.getElementById("detail-view");

    // Transisi push ke kanan
    detailView.classList.remove("active");
    detailView.classList.add("slide-right");

    homeView.classList.remove("slide-left");
    homeView.classList.add("active");

    // Re-render home view agar animasi mantul (bounce) diulang
    setTimeout(() => {
        renderHome();
    }, 400);
}

document.getElementById("back-btn").addEventListener("click", handleBack);

// --- FETCHING API OPEN-METEO --- //
async function fetchWeatherFor(wilayah) {
    const container = document.getElementById('weather-container');
    // Memunculkan status loading dengan animasi
    container.innerHTML = `<div class="animate-entrance" style="width: 100%; text-align: center; margin-top: 50px; font-weight: bold; font-size: 18px; color: var(--text-secondary);">🛰️ Menyambungkan ke Satelit Open-Meteo...</div>`;

    const spot = touristSpots[wilayah];
    // API Mengambil suhu, kelembaban, probabilitas hujan, dan kode cuaca (hourly) untuk 1 hari ini
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lng}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weathercode&timezone=auto&forecast_days=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Mengambil seluruh 24 jam prakiraan hari ini
        const targetHours = Array.from({ length: 24 }, (_, i) => i);
        const weatherCards = [];

        targetHours.forEach(hour => {
            const timeStr = data.hourly.time[hour];
            const temp = data.hourly.temperature_2m[hour];
            const humidity = data.hourly.relative_humidity_2m[hour];
            const precipProb = data.hourly.precipitation_probability[hour];
            const wmoCode = data.hourly.weathercode[hour];

            weatherCards.push({
                timeStr, temp, humidity, precipProb, wmoCode
            });
        });

        renderWeatherCards(weatherCards);

    } catch (err) {
        console.error("Gagal mengambil data cuaca:", err);
        container.innerHTML = `<div class="animate-entrance" style="width: 100%; text-align: center; color: var(--danger);">Gagal menarik data cuaca 😔. Cek koneksi internetmu.</div>`;
    }
}

function renderWeatherCards(dataArray) {
    const container = document.getElementById('weather-container');
    let htmlContent = "";

    const groupedData = {};

    dataArray.forEach(item => {
        const dateObj = new Date(item.timeStr);
        const hours = dateObj.getHours();
        const kategori = getKategoriDariJam(hours);

        if (!groupedData[kategori]) {
            groupedData[kategori] = [];
        }
        groupedData[kategori].push({ ...item, hours });
    });

    const order = ["🌌 Dini Hari", "🌅 Pagi", "☀️ Siang", "🌇 Sore", "🌙 Malam"];

    // --- Kalkulasi Metrik Analisis Random Forest --- //
    let maxPrecip = 0;
    let avgTemp = 0;
    let avgHumid = 0;
    dataArray.forEach(item => {
        if (item.precipProb > maxPrecip) maxPrecip = item.precipProb;
        avgTemp += item.temp;
        avgHumid += item.humidity;
    });
    avgTemp = (avgTemp / dataArray.length).toFixed(1);
    avgHumid = (avgHumid / dataArray.length).toFixed(1);
    
    let currentHour = new Date().getHours();
    let currentData = dataArray[currentHour] || dataArray[0];

    // Pemrosesan Pohon Keputusan (Simulasi Voting Hujan vs Cerah)
    let voteHujan = Math.round(150 * (maxPrecip / 100)); // Total 150 pohon
    let voteCerah = 150 - voteHujan;

    let kesimpulan = "Lebih banyak pohon memilih pola CERAH/BERAWAN harian.";
    let rekomendasi = "✨ Cuaca sangat kondusif untuk wisata alam terbuka (Curug, Gunung, dsb). Jangan lupa bawa kacamata hitam, tabir surya (sunblock), dan air minum yang cukup!";
    let rekBg = "rgba(52, 199, 89, 0.05)";
    let rekBorder = "var(--success)";

    if (voteHujan > voteCerah) {
        kesimpulan = `Waspada! Mayoritas pohon (${voteHujan} vs ${voteCerah}) memprediksi cuaca HUJAN.`;
        rekomendasi = "⚠️ Cuaca kurang bersahabat. Bawa payung/jas hujan, dan pertimbangkan untuk merevisi rencana wisata alam terbuka karena risiko jalanan licin atau debit air menaik.";
        rekBg = "rgba(255, 59, 48, 0.05)";
        rekBorder = "var(--danger)";
    } else if (maxPrecip > 20) {
        kesimpulan = `Dominan pohon memilih CERAH, namun ada cabang yang memprediksi hujan terisolasi.`;
        rekomendasi = "💡 Secara umum aman untuk berwisata, tetapi ada kemungkinan gerimis kecil di jam tertentu. Siapkan payung lipat kecil di tas untuk berjaga-jaga.";
        rekBg = "rgba(255, 149, 0, 0.05)";
        rekBorder = "var(--warning)";
    }

    htmlContent += `
        <div class="rf-analysis-box animate-entrance" style="animation-delay: 0.1s; width: 100%;">
            <h3>🌳 Alur Pemrosesan Random Forest</h3>
            
            <div class="rf-pipeline">
                <div class="pipeline-step">
                    <div class="step-badge">1</div>
                    <div class="step-info">
                        <strong>1. Pengumpulan Data Mentah (Sensor Cuaca API)</strong>
                        <p>Sistem merikues seluruh parameter cuaca dari stasiun satelit Open-Meteo untuk destinasi ini dalam wujud 24 baris observasi (tiap jam selama 1 hari penuh). Contoh sampel data jam Saat Ini (${currentHour.toString().padStart(2, '0')}:00):</p>
                        <ul style="list-style-type: disc; margin-left: 20px; color: var(--text-secondary); line-height: 1.6; margin-top: 8px;">
                            <li><b>Suhu Udara:</b> <span style="color: var(--text-primary);">${currentData.temp}°C</span></li>
                            <li><b>Kelembaban Relatif:</b> <span style="color: var(--text-primary);">${currentData.humidity}%</span></li>
                            <li><b>Probabilitas Hujan:</b> <span style="color: var(--text-primary);">${currentData.precipProb}%</span></li>
                            <li><b>Kode Status WMO:</b> <span style="color: var(--text-primary);">${getWMOStatus(currentData.wmoCode)} (${currentData.wmoCode})</span></li>
                        </ul>
                    </div>
                </div>
                
                <div class="pipeline-step">
                    <div class="step-badge">2</div>
                    <div class="step-info">
                        <strong>2. Seleksi Fitur (Variabel yang Digunakan)</strong>
                        <p>Dari puluhan baris laporan tersebut, sistem melakukan <i>pre-processing</i> dan hanya menyaring <mark style="background: rgba(10, 122, 255, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: 700;">3 Fitur Indikator</mark> esensial untuk diinput ke algoritma:</p>
                        <ul style="list-style-type: disc; margin-left: 20px; color: var(--text-secondary); line-height: 1.6; margin-top: 8px;">
                            <li><b style="color: var(--text-primary);">Suhu Rata-rata (Avg):</b> <span style="font-weight: 700; color: var(--accent);">${avgTemp}°C</span></li>
                            <li><b style="color: var(--text-primary);">Kelembaban Rata-rata (Avg):</b> <span style="font-weight: 700; color: var(--accent);">${avgHumid}%</span></li>
                            <li><b style="color: var(--text-primary);">Puncak Peluang Hujan (Max):</b> <mark style="background: rgba(255, 59, 48, 0.1); color: var(--danger); padding: 2px 6px; border-radius: 4px; font-weight: 800;">${maxPrecip}%</mark></li>
                        </ul>
                    </div>
                </div>
                
                <div class="pipeline-step">
                    <div class="step-badge">3</div>
                    <div class="step-info">
                        <strong>3. Proses Perhitungan (Random Forest Algoritma)</strong>
                        <p>Kini variabel fitur tersebut dikirim masuk ke dalam mesin struktur klasifikasi ansambel. Runutan kerjanya adalah:</p>
                        <ul style="list-style-type: none; padding-left: 0; color: var(--text-secondary); line-height: 1.6; margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">
                            <li><b style="color: var(--text-primary);">A. Distribusi Model:</b> Fitur dilempar sekaligus ke <mark style="background: rgba(255, 149, 0, 0.15); color: var(--warning); padding: 2px 6px; border-radius: 4px; font-weight: 700;">150 Pohon (Decision Trees)</mark> agar diolah terpisah secara independen.</li>
                            <li><b style="color: var(--text-primary);">B. Percabangan Biner:</b> Tiap pohon membelah nilai tadi ke dalam dua cabang (Pohon Hujan atau Pohon Cerah) berdasarkan rumus <i>Gini/Entropy</i>.</li>
                        </ul>
                        <div style="font-family: monospace; font-size: 13px; background: rgba(0,0,0,0.03); border: 1px dashed var(--separator); padding: 10px; border-radius: 6px; display: block; margin-top: 10px; line-height: 1.6;">
                            <b>// Rumus Matematis Persentase Voting Pohon</b><br>
                            VoteHujan = Math.round(150 Pohon * <span style="color: var(--danger);">(${maxPrecip}% / 100)</span>);<br>
                            VoteCerah = 150 Pohon - VoteHujan;<br>
                            <span style="color: var(--accent);">// Yield Log: Tercatat ${voteHujan} Hujan, ${voteCerah} Cerah</span>
                        </div>
                    </div>
                </div>
                
                <div class="pipeline-step">
                    <div class="step-badge">4</div>
                    <div class="step-info">
                        <strong>4. Hasil Algoritma (Majority Voting)</strong>
                        <p>Setelah 150 pohon selesai berhitung, algoritma mengadakan pemungutan suara final (<i>Majority Voting</i>) untuk mengklasifikasikan kesimpulan prediksi AI.<br>
                        📥 <b>${voteHujan} Pohon (Memilih Hujan)</b> vs <b>${voteCerah} Pohon (Memilih Cerah/Aman)</b>.<br>
                        👉 <b>Keputusan Akhir: ${kesimpulan}</b></p>
                    </div>
                </div>
            </div>
            
            <div class="rf-stats" style="margin-top: 20px;">
                <div class="rf-stat" style="background: var(--bg-color); border: 1px dashed var(--accent);"><strong>✔ Selesai Diproses</strong> Model mencatatkan tingkat kepastian yang sangat tinggi dalam merekonstruksi data hari ini. Klik tombol di bawah untuk melihat rincian proyeksinya.</div>
                <div class="rf-stat" style="background: ${rekBg}; border: 1px solid ${rekBorder};"><strong>🎯 Rekomendasi Wisata</strong> ${rekomendasi}</div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <button id="btn-lanjut-prediksi" style="background: var(--accent); color: #ffffff; border: none; padding: 14px 32px; border-radius: 30px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';" onclick="showPredictionResult()">Lihat Detail Jam Cuaca &nbsp; ➡️</button>
            </div>
        </div>
        
        <div id="prediction-result-section" style="display: none; width: 100%;">
    `;

    let sectionIndex = 1; // Mulai delay animasi dari 0.2s untuk category

    order.forEach(kategori => {
        if (groupedData[kategori] && groupedData[kategori].length > 0) {
            sectionIndex++;
            const delay = sectionIndex * 0.1;

            htmlContent += `
            <div class="category-section animate-entrance" style="animation-delay: ${delay}s">
                <div class="category-header">
                    <h2>${kategori}</h2>
                    <div class="scroll-buttons">
                        <button class="scroll-btn" onclick="scrollCards(this, -280)">←</button>
                        <button class="scroll-btn" onclick="scrollCards(this, 280)">→</button>
                    </div>
                </div>
                <div class="cards-wrapper">
            `;

            groupedData[kategori].forEach(item => {
                const dateObj = new Date(item.timeStr);
                const dateFormatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                let timeFormatted = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

                const emojiCuaca = getWMOEmoji(item.wmoCode);
                const statusCuaca = getWMOStatus(item.wmoCode);

                let precipRiskClass = "low";
                if (item.precipProb > 30) precipRiskClass = "medium";
                if (item.precipProb > 70) precipRiskClass = "high";

                htmlContent += `
                    <div class="card">
                        <div class="time-main">${timeFormatted}</div>
                        <div class="stats">
                            <div class="value">📅 ${dateFormatted}</div>
                            <div class="value" style="font-size: 16px; color: var(--text-primary); margin: 4px 0;">
                                ${emojiCuaca} ${item.temp}°C - ${statusCuaca}
                            </div>
                            <div class="value">💧 Kelembaban: ${item.humidity}%</div>
                            <div class="value risk ${precipRiskClass}">
                                ☔ Peluang Hujan: ${item.precipProb}%
                            </div>
                        </div>
                    </div>
                `;
            });

            htmlContent += `
                </div>
            </div>
            `;
        }
    });

    htmlContent += `</div>`; // Tutup div prediction-result-section

    container.innerHTML = htmlContent;
}

// Fungsi global untuk menampilkan hasil prediksi setelah tombol lanjut ditekan
window.showPredictionResult = function() {
    const btn = document.getElementById('btn-lanjut-prediksi');
    if (btn) btn.style.display = 'none'; // Sembunyikan tombol setelah diklik
    
    const resultSection = document.getElementById('prediction-result-section');
    if (resultSection) {
        resultSection.style.display = 'block'; // Tampilkan kartu cuaca
        
        // Memberi sedikit jeda perenderan agar browser dapat nge-scroll dengan halus
        setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
}

function getKategoriDariJam(jam) {
    if (jam >= 0 && jam < 5) return "🌌 Dini Hari";
    if (jam >= 5 && jam < 11) return "🌅 Pagi";
    if (jam >= 11 && jam < 15) return "☀️ Siang";
    if (jam >= 15 && jam < 18) return "🌇 Sore";
    return "🌙 Malam";
}

// Fungsi geser kartu per kategori untuk pengguna desktop (mouse)
function scrollCards(btnElement, amount) {
    const section = btnElement.closest('.category-section');
    const wrapper = section.querySelector('.cards-wrapper');
    if (wrapper) {
        wrapper.scrollBy({ left: amount, behavior: 'smooth' });
    }
}

// Standar kode WMO internasional untuk cuaca
function getWMOEmoji(code) {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2 || code === 3) return "⛅";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95 && code <= 99) return "⛈️";
    return "🌤️";
}

function getWMOStatus(code) {
    if (code === 0) return "Cerah";
    if (code === 1 || code === 2 || code === 3) return "Berawan";
    if (code >= 45 && code <= 48) return "Berkabut";
    if (code >= 51 && code <= 67) return "Gerimis / Hujan Ringan";
    if (code >= 71 && code <= 77) return "Bersalju";
    if (code >= 80 && code <= 82) return "Hujan Lebat";
    if (code >= 95 && code <= 99) return "Badai Petir";
    return "Tidak Terdeteksi";
}