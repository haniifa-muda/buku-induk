async function simpanData() {

  showLoading();

  try {

    const payload = {
      action: 'add',
      nama: document.getElementById('nama').value,
      alamat: document.getElementById('alamat').value,
      no_hp: document.getElementById('no_hp').value,
      koordinator: document.getElementById('koordinator').value
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    // tunggu sebentar supaya spreadsheet update
    setTimeout(async () => {

      await loadData();

      alert('Data berhasil disimpan');

      // kosongkan form
      document.getElementById('nama').value = '';
      document.getElementById('alamat').value = '';
      document.getElementById('no_hp').value = '';
      document.getElementById('koordinator').value = '';

      hideLoading();

    }, 1500);

  } catch (err) {

    console.log(err);

    hideLoading();

    alert('Data berhasil disimpan');
  }
}


// =========================
// LOAD DATA
// =========================
let ALL_ROWS = []; // 🔥 WAJIB GLOBAL

async function loadData() {

  showLoading();

  try {

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:I?key=${API_KEY}`;

    const response = await fetch(url);
    const result = await response.json();
    const rows = result.values || [];

    // =========================
    // SIMPAN ROW ASLI (FIX PENTING)
    // =========================
    for (let i = 1; i < rows.length; i++) {
      const sheetRow = i + 1;
    }

    // =========================
    // SIMPAN GLOBAL (UNTUK FILTER)
    // =========================
    ALL_ROWS = rows;

    loadGrafikKoordinator();

    // =========================
    // TABLE REKAP (WITH ACTION)
    // =========================
    let html = '';

    for (let i = 1; i < rows.length; i++) {

      const sheetRow = i + 1;

      html += `
        <tr>
          <td>${rows[i][0] || ''}</td>
          <td>${rows[i][1] || ''}</td>
          <td>${rows[i][2] || ''}</td>
          <td>${rows[i][3] || ''}</td>
          <td>${rows[i][4] || ''}</td>

          <td>

            <button class="btn btn-warning btn-sm"
              onclick='editData(
                ${sheetRow},
                ${JSON.stringify(rows[i][0] || "")},
                ${JSON.stringify(rows[i][1] || "")},
                ${JSON.stringify(rows[i][2] || "")},
                ${JSON.stringify(rows[i][3] || "")},
                ${JSON.stringify(rows[i][4] || "")}
              )'>
              Edit
            </button>

            <button class="btn btn-danger btn-sm"
              onclick="hapusData(${sheetRow})">
              Hapus
            </button>

          </td>
        </tr>
      `;
    }

    const tbody = document.getElementById('tbody');
    if (tbody) tbody.innerHTML = html;

    // TOTAL REKAP
    const totalRekap = document.getElementById('totalRekap');
    if (totalRekap) totalRekap.innerText = rows.length - 1;

    // =========================
    // DASHBOARD TOTAL
    // =========================
    const totalAlumni = document.getElementById('totalAlumni');
    if (totalAlumni) totalAlumni.innerText = rows.length - 1;

    let laki = 0;
    let perempuan = 0;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][3] == 'L') laki++;
      if (rows[i][3] == 'P') perempuan++;
    }

    const totalL = document.getElementById('totalL');
    const totalP = document.getElementById('totalP');

    if (totalL) totalL.innerText = laki;
    if (totalP) totalP.innerText = perempuan;

    // =========================
    // REKAP KOORDINATOR
    // =========================
    let rekapKoor = {};

    for (let i = 1; i < rows.length; i++) {
      let koor = rows[i][4] || 'Belum Isi';

      if (!rekapKoor[koor]) {
        rekapKoor[koor] = 0;
      }

      rekapKoor[koor]++;
    }

    let htmlKoor = '';

    for (let key in rekapKoor) {
      htmlKoor += `
        <div class="col-md-3 mb-3">
          <div class="card p-3 shadow text-center">
            <h6>${key}</h6>
            <h3>${rekapKoor[key]}</h3>
          </div>
        </div>
      `;
    }

    const koorBox = document.getElementById('koordinatorRekap');
    if (koorBox) koorBox.innerHTML = htmlKoor;

    // =========================
    // ISI DROPDOWN FILTER KOORDINATOR (REKAP PAGE)
    // =========================
    let setKoor = new Set();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][4]) setKoor.add(rows[i][4]);
    }

    const filter = document.getElementById('filterKoordinator');
    if (filter) {
      filter.innerHTML = `<option value="">-- Semua Koordinator --</option>`;
      setKoor.forEach(k => {
        filter.innerHTML += `<option value="${k}">${k}</option>`;
      });
    }

    // =========================
    // RIWAYAT (5 TERBARU)
    // =========================
    let riwayat = '';
    let jumlah = 0;

    for (let i = rows.length - 1; i >= 1; i--) {

      const sheetRow = i + 1;

      riwayat += `
        <tr>
          <td>${rows[i][0] || ''}</td>
          <td>${rows[i][1] || ''}</td>
          <td>${rows[i][2] || ''}</td>
          <td>${rows[i][3] || ''}</td>
          <td>${rows[i][4] || ''}</td>
          <td>

            <button class="btn btn-warning btn-sm"
              onclick='editData(
                ${sheetRow},
                ${JSON.stringify(rows[i][0] || "")},
                ${JSON.stringify(rows[i][1] || "")},
                ${JSON.stringify(rows[i][2] || "")},
                ${JSON.stringify(rows[i][3] || "")},
                ${JSON.stringify(rows[i][4] || "")}
              )'>
              Edit
            </button>

            <button class="btn btn-danger btn-sm"
              onclick="hapusData(${sheetRow})">
              Hapus
            </button>

          </td>
        </tr>
      `;

      jumlah++;

      // tampilkan maksimal 5 data
      if (jumlah >= 5) break;
    }

    const riwayatBody = document.getElementById('riwayatBody');
    if (riwayatBody) riwayatBody.innerHTML = riwayat;

  } catch (err) {

    console.log('ERROR LOAD DATA:', err);

  } finally {

    hideLoading();

  }
}

// =========================
// HAPUS DATA
// =========================
async function hapusData(row) {

  const yakin = confirm('Yakin hapus data ini?');
  if (!yakin) return;

  showLoading();

  try {

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'delete',
        row: row
      })
    });

    await loadData();

    alert('Data berhasil dihapus');

  } catch (err) {
    console.log("ERROR HAPUS:", err);
    alert("Gagal hapus data");
  }

  hideLoading();
}


// =========================
// EDIT DATA
// =========================
async function editData(
  row,
  nomorLama,
  namaLama,
  alamatLama,
  hpLama,
  koordinatorLama
) {

  const nama = prompt('Nama', namaLama);
  if (nama === null) return;

  const alamat = prompt('Alamat', alamatLama);
  if (alamat === null) return;

  const hp = prompt('No HP', hpLama);
  if (hp === null) return;

  let koordinator = prompt(
    'Koordinator', koordinatorLama
  );

  if (koordinator === null) return;

  // optional: rapikan input
  koordinator = koordinator.trim();

  showLoading();

  console.log("ROW KIRIM KE SERVER:", row);

  try {

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'edit',
        row: Number(row), // 🔥 WAJIB NUMBER
        nama: nama,
        alamat: alamat,
        no_hp: hp,
        koordinator: koordinator
      })
    });

    await loadData();

    alert('Data berhasil diupdate');

  } catch (err) {
    console.log("ERROR EDIT:", err);
  }

  hideLoading();
}

function filterRekap() {

  const val = document.getElementById('filterKoordinator').value;
  const data = ALL_ROWS || [];

  let html = '';
  let count = 0;

  for (let i = 1; i < data.length; i++) {

    const sheetRow = i + 1;

    // =========================
    // FILTER LOGIC
    // =========================
    if (val && data[i][4] !== val) continue;

    html += `
      <tr>
        <td>${count + 1}</td>
        <td>${data[i][1] || ''}</td>
        <td>${data[i][2] || ''}</td>
        <td>${data[i][3] || ''}</td>
        <td>${data[i][4] || ''}</td>

        <td>
          <button class="btn btn-warning btn-sm"
            onclick="editData(${sheetRow},
              '${data[i][0] || ""}',
              '${data[i][1] || ""}',
              '${data[i][2] || ""}',
              '${data[i][3] || ""}',
              '${data[i][4] || ""}'
            )">
            Edit
          </button>

          <button class="btn btn-danger btn-sm"
            onclick="hapusData(${sheetRow})">
            Hapus
          </button>
        </td>
      </tr>
    `;

    count++;
  }

  // =========================
  // UPDATE TABEL
  // =========================
  document.getElementById('tbody').innerHTML = html;

  // =========================
  // FIX TOTAL (INI YANG BIKIN 0 ERROR)
  // =========================
  document.getElementById('totalRekap').innerText = count;

  // =========================
  // FIX TOTAL KETIKA "SEMUA"
  // =========================
  if (!val) {
    document.getElementById('totalRekap').innerText = ALL_ROWS.length - 1;
  } else {
    document.getElementById('totalRekap').innerText = count;
  }
}

function loadGrafikKoordinator() {

  const data = ALL_ROWS || [];

  let koordinatorCount = {};

  // hitung jumlah
  for (let i = 1; i < data.length; i++) {

    const koor = data[i][4] || 'Tanpa Koordinator';

    if (!koordinatorCount[koor]) {
      koordinatorCount[koor] = 0;
    }

    koordinatorCount[koor]++;
  }

  // ubah jadi array
  const labels = Object.keys(koordinatorCount);
  const values = Object.values(koordinatorCount);

  const ctx = document.getElementById('chartKoordinator');

  // hapus chart lama
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'bar',

    data: {
      labels: labels,

      datasets: [{
        label: 'Jumlah Data',
        data: values,
        borderWidth: 1
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// =========================
// LOADING
// =========================
function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'flex';
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}

function cetakRekap() {

  const val = document.getElementById('filterKoordinator').value;
  const data = ALL_ROWS || [];

  let html = `
    <html>
    <head>
      <title>Cetak Rekap</title>

      <style>
        body{
          font-family: Arial;
          padding:20px;
        }

        h2{
          text-align:center;
        }

        table{
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }

        table, th, td{
          border:1px solid #000;
        }

        th, td{
          padding:8px;
          font-size:14px;
        }

        th{
          background:#eee;
        }
      </style>
    </head>

    <body>

      <h2>DATA ALUMNI HANIFA</h2>

      <h4>
        Koordinator
        ${val ? val : 'Semua Koordinator'}
      </h4>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>No HP</th>
            <th>Koordinator</th>
          </tr>
        </thead>

        <tbody>
  `;

  let no = 1;

  for (let i = 1; i < data.length; i++) {

    // FILTER
    if (val && data[i][4] !== val) continue;

    html += `
      <tr>
        <td align="center">${no}</td>
        <td>${data[i][1] || ''}</td>
        <td>${data[i][2] || ''}</td>
        <td align="center">${data[i][3] || ''}</td>
        <td align="center">${data[i][4] || ''}</td>
      </tr>
    `;

    no++;
  }

  html += `
        </tbody>
      </table>

    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=700');

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();
  printWindow.print();
}

// =========================================================
// 🔥 BAGIAN HALAMAN KOORDINATOR (CRUD KOORDINATOR)
// =========================================================

let DATA_KOORDINATOR = [
  { koordinator: 'Cilemor Pusat', pj: 'Ust. Ahmad' },
  { koordinator: 'Cilemor Kaler', pj: 'Bpk. Cecep' },
  { koordinator: 'Pamarican Desakolot', pj: 'Kang Dadang' }
];

function muatDataKoordinator() {
  const tbody = document.getElementById('koordinatorBody');
  if (!tbody) return;

  if (DATA_KOORDINATOR.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada data koordinator.</td></tr>`;
    return;
  }

  let html = '';
  DATA_KOORDINATOR.forEach((item, index) => {
    html += `
      <tr>
        <td class="fw-bold">${index + 1}</td>
        <td>${item.koordinator}</td>
        <td>${item.pj || '-'}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm me-1" onclick="persiapkanEditKoordinator(${index})">
            Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm" onclick="hapusKoordinator(${index})">
            Hapus
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// =========================================================
// 🔥 BAGIAN HALAMAN KOORDINATOR (CONNECTED TO GOOGLE SHEETS)
// =========================================================

// 1. SIMPAN KOORDINATOR KA SPREADSHEET
async function simpanKoordinator() {
  const namaInput = document.getElementById('namaKoordinator');
  const pjInput = document.getElementById('pjKoordinator');

  if (!namaInput || !pjInput) {
    alert('Elemen form koordinator teu kapendak!');
    return;
  }

  const nama = namaInput.value.trim();
  const pj = pjInput.value.trim();

  if (!nama) {
    alert('Nama Koordinator / Wilayah kedah dieusian!');
    return;
  }

  showLoading();

  try {
    const payload = {
      action: 'addKoordinator', // action khusus koordinator
      koordinator: nama,
      pj: pj
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await loadData(); // Reload data ti spreadsheet
      alert('Data Koordinator berhasil disimpan!');
      
      namaInput.value = '';
      pjInput.value = '';
      hideLoading();
    }, 1500);

  } catch (err) {
    console.log(err);
    hideLoading();
    alert('Gagal nyimpen data koordinator');
  }
}

// 2. MUAT DATA KOORDINATOR TI GOOGLE SHEETS
function muatDataKoordinator() {
  const tbody = document.getElementById('koordinatorBody');
  if (!tbody) return;

  const data = ALL_ROWS || [];
  
  // Ngalumpukkeun Koordinator unik ti Sheets atawa ti Sheet/Tab Koordinator
  let setKoordinator = new Map();

  for (let i = 1; i < data.length; i++) {
    let koorName = data[i][4] || '';
    if (koorName && !setKoordinator.has(koorName)) {
      setKoordinator.set(koorName, '-'); // Default PJ pami teu acan aya kolom PJ
    }
  }

  if (setKoordinator.size === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada data koordinator dina Spreadsheet.</td></tr>`;
    return;
  }

  let html = '';
  let index = 1;
  
  setKoordinator.forEach((pj, koor) => {
    html += `
      <tr>
        <td class="fw-bold">${index}</td>
        <td>${koor}</td>
        <td>${pj}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm me-1" onclick="editKoordinatorPrompt('${koor}')">
            Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm" onclick="hapusKoordinatorPrompt('${koor}')">
            Hapus
          </button>
        </td>
      </tr>
    `;
    index++;
  });

  tbody.innerHTML = html;
}

// 3. EDIT & HAPUS KOORDINATOR PROMPT
async function editKoordinatorPrompt(namaLama) {
  const namaBaru = prompt('Edit Nama Koordinator:', namaLama);
  if (!namaBaru || namaBaru.trim() === namaLama) return;

  showLoading();

  try {
    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'editKoordinator',
        koordinatorLama: namaLama,
        koordinatorBaru: namaBaru.trim()
      })
    });

    setTimeout(async () => {
      await loadData();
      alert('Data Koordinator berhasil di-update!');
      hideLoading();
    }, 1500);
  } catch (err) {
    console.log(err);
    hideLoading();
  }
}

async function hapusKoordinatorPrompt(namaKoor) {
  if (!confirm(`Yakin hoyong ngahapus Koordinator "${namaKoor}"?`)) return;

  showLoading();

  try {
    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'deleteKoordinator',
        koordinator: namaKoor
      })
    });

    setTimeout(async () => {
      await loadData();
      alert('Data Koordinator berhasil dihapus!');
      hideLoading();
    }, 1500);
  } catch (err) {
    console.log(err);
    hideLoading();
  }
}

// INIT (Muat data alumni sareng koordinator dina awal)
document.addEventListener("DOMContentLoaded", function() {
  loadData();
  muatDataKoordinator();
});
