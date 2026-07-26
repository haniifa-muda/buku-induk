async function simpanData() {
  const namaInput = document.getElementById('nama');
  const alamatInput = document.getElementById('alamat');
  const hpInput = document.getElementById('no_hp');
  const koorInput = document.getElementById('koordinator');

  const namaVal = namaInput ? namaInput.value.trim().replace(/\s+/g, ' ') : '';
  const alamatVal = alamatInput ? alamatInput.value.trim() : '';
  const hpVal = hpInput ? hpInput.value.trim() : '';
  const koorVal = koorInput ? koorInput.value.trim() : '';

  // 1. Validasi Input Kosong
  if (!namaVal || !koorVal) {
    alert('Nama sareng Koordinator wajib dieusian!');
    return;
  }

  // 2. 🔥 CEGAH DATA DUPLIKAT
  console.log("Data ALL_ROWS ayeuna:", ALL_ROWS); // Cobi tingali dina Console F12

  const dataSami = ALL_ROWS.find(row => {
    // Upami ALL_ROWS wujudna Array (misal: [ID, Nama, Alamat, NoHP, Koordinator])
    if (Array.isArray(row)) {
      const namaDiSheet = (row[1] || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
      const koorDiSheet = (row[4] || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();

      return namaDiSheet === namaVal.toLowerCase() && koorDiSheet === koorVal.toLowerCase();
    } 
    // Upami ALL_ROWS wujudna Object (misal: { nama: "...", koordinator: "..." })
    else if (typeof row === 'object' && row !== null) {
      const namaDiSheet = (row.nama || row.Nama || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
      const koorDiSheet = (row.koordinator || row.Koordinator || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();

      return namaDiSheet === namaVal.toLowerCase() && koorDiSheet === koorVal.toLowerCase();
    }
    return false;
  });

  if (dataSami) {
    alert(`⚠️ DATA DUPLIKAT!\n\nNama "${namaVal}" tos aya dina Koordinator "${koorVal}".\nData henteu tiasa disimpen deui.`);
    return; // Eureunkeun proses simpan
  }

  // 3. Proses Simpan Ka Google Sheets
  showLoading();

  try {
    const payload = {
      action: 'add',
      nama: namaVal,
      alamat: alamatVal,
      no_hp: hpVal,
      koordinator: koorVal
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    // Tunggu sebentar supados spreadsheet update
    setTimeout(async () => {
      await loadData();

      alert('Data berhasil disimpan!');

      // Kosongkeun form
      if (namaInput) namaInput.value = '';
      if (alamatInput) alamatInput.value = '';
      if (hpInput) hpInput.value = '';
      if (koorInput) koorInput.value = '';

      hideLoading();
    }, 1500);

  } catch (err) {
    console.error(err);
    hideLoading();
    alert('Gagal nyimpen data');
  }
}

// =========================
// LOAD DATA
// =========================
let ALL_ROWS = []; // 🔥 WAJIB GLOBAL
let DATA_KOORDINATOR = []; // 🔥 GLOBAL KOORDINATOR

async function loadData() {

  showLoading();

  try {

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:I?key=${API_KEY}`;

    const response = await fetch(url);
    const result = await response.json();
    const rows = result.values || [];

    // =========================
    // SIMPAN GLOBAL (UNTUK FILTER)
    // =========================
    ALL_ROWS = rows;

    loadGrafikKoordinator();
    await muatDataKoordinator(); // 🔥 Auto load tab Koordinator
    await muatDropdownKoordinator(); // 🔥 Auto load dropdown Koordinator

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

  koordinator = koordinator.trim();

  showLoading();

  try {

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'edit',
        row: Number(row),
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

  const tbody = document.getElementById('tbody');
  if (tbody) tbody.innerHTML = html;

  const totalRekap = document.getElementById('totalRekap');
  if (totalRekap) {
    totalRekap.innerText = !val ? (ALL_ROWS.length - 1) : count;
  }
}

function loadGrafikKoordinator() {

  const data = ALL_ROWS || [];

  let koordinatorCount = {};

  for (let i = 1; i < data.length; i++) {

    const koor = data[i][4] || 'Tanpa Koordinator';

    if (!koordinatorCount[koor]) {
      koordinatorCount[koor] = 0;
    }

    koordinatorCount[koor]++;
  }

  const labels = Object.keys(koordinatorCount);
  const values = Object.values(koordinatorCount);

  const ctx = document.getElementById('chartKoordinator');
  if (!ctx) return;

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
        Koordinator: 
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
      action: 'addKoordinator',
      koordinator: nama,
      pj: pj
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await loadData();
      await muatDataKoordinator();
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

// 2. MUAT DATA KOORDINATOR TI TAB KOORDINATOR (SPREADSHEET)
async function muatDataKoordinator() {
  const tbody = document.getElementById('koordinatorBody');
  if (!tbody) return;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Koordinator!A:C?key=${API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();
    const rows = result.values || [];

    DATA_KOORDINATOR = rows; // Simpan ka variabel global pikeun fungsi cetak

    if (rows.length <= 1) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada data koordinator dina Spreadsheet.</td></tr>`;
      return;
    }

    let html = '';
    for (let i = 1; i < rows.length; i++) {
      const koor = rows[i][1] || '';
      const pj = rows[i][2] || '-';
      
      html += `
        <tr>
          <td class="fw-bold">${i}</td>
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
    }
    tbody.innerHTML = html;
  } catch (err) {
    console.log("Error muat data koordinator:", err);
  }
}

// 3. MUAT DROPDOWN FILTER & FORM INPUT TI TAB KOORDINATOR
async function muatDropdownKoordinator() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Koordinator!B2:B?key=${API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();
    const rows = result.values || [];

    const listKoor = rows.map(r => r[0]).filter(Boolean);

    // Update Dropdown Filter Rekap
    const filterSelect = document.getElementById('filterKoordinator');
    if (filterSelect) {
      filterSelect.innerHTML = `<option value="">-- Semua Koordinator --</option>`;
      listKoor.forEach(k => {
        filterSelect.innerHTML += `<option value="${k}">${k}</option>`;
      });
    }

    // Update Dropdown Form Input Alumni
    const inputSelect = document.getElementById('koordinator');
    if (inputSelect) {
      inputSelect.innerHTML = `<option value="">-- Pilih Koordinator --</option>`;
      listKoor.forEach(k => {
        inputSelect.innerHTML += `<option value="${k}">${k}</option>`;
      });
    }

  } catch (err) {
    console.log("Error muat dropdown koordinator:", err);
  }
}

// 4. EDIT KOORDINATOR PROMPT
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
      await muatDataKoordinator();
      alert('Data Koordinator berhasil di-update!');
      hideLoading();
    }, 1500);
  } catch (err) {
    console.log(err);
    hideLoading();
  }
}

// 5. HAPUS KOORDINATOR PROMPT
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
      await muatDataKoordinator();
      alert('Data Koordinator berhasil dihapus!');
      hideLoading();
    }, 1500);
  } catch (err) {
    console.log(err);
    hideLoading();
  }
}

// 🔥 6. FUNGSI CETAK KOORDINATOR
function cetakKoordinator() {
  const data = DATA_KOORDINATOR || [];

  if (data.length <= 1) {
    alert("Teu aya data koordinator pikeun dicetak.");
    return;
  }

  let html = `
    <html>
    <head>
      <title>Cetak Data Koordinator</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; margin-bottom: 5px; }
        h4 { text-align: center; color: #555; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table, th, td { border: 1px solid #000; }
        th, td { padding: 10px; font-size: 14px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        td.center, th.center { text-align: center; }
      </style>
    </head>
    <body>
      <h2>DAFTAR KOORDINATOR & PJ</h2>
      <h4>Buku Induk Alumni Hanifa</h4>

      <table>
        <thead>
          <tr>
            <th class="center" style="width: 10%;">No</th>
            <th style="width: 45%;">Koordinator / Wilayah</th>
            <th style="width: 45%;">Penanggung Jawab (PJ)</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (let i = 1; i < data.length; i++) {
    html += `
      <tr>
        <td class="center">${i}</td>
        <td>${data[i][1] || '-'}</td>
        <td>${data[i][2] || '-'}</td>
      </tr>
    `;
  }

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// INIT (Muat data dina awal)
document.addEventListener("DOMContentLoaded", function() {
  loadData();
});
