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

    console.log("KIRIM:", payload);

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    await loadData();

    alert('Data berhasil disimpan');

  } catch (err) {
    console.log("ERROR SIMPAN:", err);
    alert("Gagal simpan data");
  } finally {
    hideLoading();
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

    // =========================
    // DASHBOARD TOTAL
    // =========================
    const totalSiswa = document.getElementById('totalSiswa');
    if (totalSiswa) totalSiswa.innerText = rows.length - 1;

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

      if (i >= 5) break;
    }

    const riwayatBody = document.getElementById('riwayatBody');
    if (riwayatBody) riwayatBody.innerHTML = riwayat;

  } catch (err) {
    console.log('ERROR LOAD DATA:', err);
  }

  // =========================
  // TOTAL REKAP TABEL
  // =========================
  const totalRekap = document.getElementById('totalRekap');
  if (totalRekap) totalRekap.innerText = rows.length - 1;

  hideLoading();
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
        <td>${data[i][0] || ''}</td>
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


// INIT
loadData();