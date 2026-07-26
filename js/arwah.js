// Array pikeun nampung data arwah
let ALL_ARWAH = [];

// Load data arwah nalika kaca dimuat
document.addEventListener('DOMContentLoaded', () => {
  muatDataArwah();
});

// 1. SIMPAN DATA ARWAH
async function simpanArwah() {
  const namaInput = document.getElementById('namaArwah');
  const binInput = document.getElementById('binArwah');
  const koorInput = document.getElementById('koordinatorArwah');

  const namaVal = namaInput ? namaInput.value.trim().replace(/\s+/g, ' ') : '';
  const binVal = binInput ? binInput.value.trim() : '';
  const koorVal = koorInput ? koorInput.value.trim() : '';

  if (!namaVal || !koorVal) {
    alert('⚠️ Nama Almarhum/ah sareng Koordinator wajib dieusian!');
    return;
  }

  // Cek duplikat arwah dina koordinator anu sami
  const isDuplicate = ALL_ARWAH.some(row => {
    const namaDiSheet = (row.nama || row[1] || '').toString().trim().toLowerCase();
    const koorDiSheet = (row.koordinator || row[3] || '').toString().trim().toLowerCase();
    return namaDiSheet === namaVal.toLowerCase() && koorDiSheet === koorVal.toLowerCase();
  });

  if (isDuplicate) {
    alert(`⚠️ DATA DUPLIKAT!\n\nNama "${namaVal}" tos kasimpen dina Koordinator "${koorVal}".`);
    return;
  }

  showLoading();

  try {
    const payload = {
      action: 'addArwah', // Action anyar dina Google Apps Script
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

// 2. MUAT DATA ARWAH TI SPREADSHEET
async function muatDataArwah() {
  try {
    const response = await fetch(`${WRITE_URL}?action=getArwah`);
    const data = await response.json();
    ALL_ARWAH = data || [];

    const tbody = document.getElementById('arwahBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tacan aya data arwah</td></tr>';
      return;
    }

    data.forEach((row, index) => {
      if (index === 0 && row[0] === 'ID') return; // Skip header

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${row[1] || '-'}</td>
        <td>${row[2] || '-'}</td>
        <td>${row[3] || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="hapusArwah('${row[0]}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error muat data arwah:", err);
  }
}
