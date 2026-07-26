// Array pikeun nampung data arwah
let ALL_ARWAH = [];

// Muat data nalika kaca tos siap
document.addEventListener('DOMContentLoaded', () => {
  muatDropdownArwah();
  muatDataArwah();
});

// 1. MUAT DROPDOWN KOORDINATOR KHUSUS DAFAR ARWAH
async function muatDropdownArwah() {
  try {
    const response = await fetch(`${WRITE_URL}?action=getKoordinator`);
    const data = await response.json();

    const selectArwah = document.getElementById('koordinatorArwah');
    if (!selectArwah) return;

    let optionsHtml = '<option value="">-- Pilih Koordinator --</option>';

    if (Array.isArray(data)) {
      data.forEach(row => {
        const namaKoor = row[1];
        if (namaKoor && namaKoor !== 'Koordinator') { // Skip header
          optionsHtml += `<option value="${namaKoor}">${namaKoor}</option>`;
        }
      });
    }

    selectArwah.innerHTML = optionsHtml;
  } catch (err) {
    console.error("Error muat dropdown koordinator arwah:", err);
  }
}

// 2. SIMPAN DATA ARWAH
async function simpanArwah() {
  const namaInput = document.getElementById('namaArwah');
  const binInput = document.getElementById('binArwah');
  const koorInput = document.getElementById('koordinatorArwah');

  const namaVal = namaInput ? namaInput.value.trim().replace(/\s+/g, ' ') : '';
  const binVal = binInput ? binInput.value.trim().replace(/\s+/g, ' ') : '';
  const koorVal = koorInput ? koorInput.value.trim() : '';

  if (!namaVal || !koorVal) {
    alert('⚠️ Ngaran Almarhum/ah sareng Koordinator wajib dieusian!');
    return;
  }

  // Cek duplikat arwah dina koordinator anu sami
  const isDuplicate = ALL_ARWAH.some(row => {
    const namaDiSheet = (row[1] || '').toString().trim().toLowerCase();
    const koorDiSheet = (row[3] || '').toString().trim().toLowerCase();
    return namaDiSheet === namaVal.toLowerCase() && koorDiSheet === koorVal.toLowerCase();
  });

  if (isDuplicate) {
    alert(`⚠️ DATA DUPLIKAT!\n\nNgaran "${namaVal}" tos kasimpen dina Koordinator "${koorVal}".`);
    return;
  }

  showLoading();

  try {
    const payload = {
      action: 'addArwah',
      nama: namaVal,
      bin: binVal,
      koordinator: koorVal
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await muatDataArwah();

      alert('✅ Data Arwah berhasil disimpan!');
      if (namaInput) namaInput.value = '';
      if (binInput) binInput.value = '';
      if (koorInput) koorInput.value = '';

      hideLoading();
    }, 1500);

  } catch (err) {
    console.error(err);
    hideLoading();
    alert('❌ Gagal nyimpen data arwah');
  }
}

// 3. MUAT DATA ARWAH TI SPREADSHEET
async function muatDataArwah() {
  try {
    const response = await fetch(`${WRITE_URL}?action=getArwah`);
    const data = await response.json();
    
    // Simpen data ka ALL_ARWAH
    ALL_ARWAH = Array.isArray(data) ? data : [];

    const tbody = document.getElementById('arwahBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Nyaring lamun data kosong atawa ukur header wungkul
    const filteredRows = ALL_ARWAH.filter((row, index) => {
      if (index === 0 && (row[0] === 'No' || row[1] === 'Nama Almarhum/ah')) return false;
      return row && row.length > 1 && row[1]; // Memastikan aya namina
    });

    if (filteredRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tacan aya data arwah</td></tr>';
      return;
    }

    filteredRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const rowIndex = ALL_ARWAH.indexOf(row) + 1; // Posisi baris di Google Sheet
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${row[1] || '-'}</td>
        <td>${row[2] || '-'}</td>
        <td>${row[3] || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="hapusArwah(${rowIndex})">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error muat data arwah:", err);
  }
}

// 4. HAPUS DATA ARWAH
async function hapusArwah(rowNum) {
  if (!confirm('Naha anjeun yakin hoyong ngahapus data arwah ieu?')) return;

  showLoading();

  try {
    const payload = {
      action: 'deleteArwah',
      row: rowNum
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await muatDataArwah();
      alert('✅ Data Arwah berhasil dihapus!');
      hideLoading();
    }, 1500);

  } catch (err) {
    console.error(err);
    hideLoading();
    alert('❌ Gagal ngahapus data arwah');
  }
}
