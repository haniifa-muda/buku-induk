let ALL_DINIYAH = [];

document.addEventListener('DOMContentLoaded', () => {
  muatDataDiniyah();
});

// 1. SIMPAN DATA DINIYAH
async function simpanDiniyah() {
  const namaInput = document.getElementById('namaDiniyah');
  const alamatInput = document.getElementById('alamatDiniyah');
  const hpInput = document.getElementById('noHpDiniyah');
  const angkatanInput = document.getElementById('angkatanDiniyah');

  const namaVal = namaInput ? namaInput.value.trim() : '';
  const alamatVal = alamatInput ? alamatInput.value.trim() : '';
  const hpVal = hpInput ? hpInput.value.trim() : '';
  const angkatanVal = angkatanInput ? angkatanInput.value.trim() : '';

  if (!namaVal) {
    alert('⚠️ Ngaran Alumni wajib dieusian!');
    return;
  }

  showLoading();

  try {
    const payload = {
      action: 'addDiniyah',
      nama: namaVal,
      alamat: alamatVal,
      no_hp: hpVal,
      angkatan: angkatanVal
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await muatDataDiniyah();

      alert('✅ Data Alumni Diniyah berhasil disimpan!');
      
      // Reset Form
      if (namaInput) namaInput.value = '';
      if (alamatInput) alamatInput.value = '';
      if (hpInput) hpInput.value = '';
      if (angkatanInput) angkatanInput.value = '';

      hideLoading();
    }, 1500);

  } catch (err) {
    console.error(err);
    hideLoading();
    alert('❌ Gagal nyimpen data Alumni Diniyah');
  }
}

// 2. MUAT DATA TI SPREADSHEET
async function muatDataDiniyah() {
  try {
    const response = await fetch(`${WRITE_URL}?action=getDiniyah`);
    const data = await response.json();
    
    ALL_DINIYAH = Array.isArray(data) ? data : [];

    const tbody = document.getElementById('diniyahBody');
    const totalElem = document.getElementById('totalDiniyah');

    const filteredRows = ALL_DINIYAH.filter((row, index) => {
      if (index === 0 && (row[0] === 'No' || row[1] === 'Nama')) return false;
      return row && row.length > 1 && row[1];
    });

    if (totalElem) {
      totalElem.innerText = filteredRows.length;
    }

    if (!tbody) return;
    tbody.innerHTML = '';

    if (filteredRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tacan aya data alumni diniyah</td></tr>';
      return;
    }

    filteredRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const rowIndex = ALL_DINIYAH.indexOf(row) + 1;
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${row[1] || '-'}</strong></td>
        <td>${row[2] || '-'}</td>
        <td>${row[3] || '-'}</td>
        <td>${row[4] || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="hapusDiniyah(${rowIndex})">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error muat data diniyah:", err);
  }
}

// 3. HAPUS DATA
async function hapusDiniyah(rowNum) {
  if (!confirm('Naha anjeun yakin hoyong ngahapus data ieu?')) return;

  showLoading();

  try {
    const payload = {
      action: 'deleteDiniyah',
      row: rowNum
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await muatDataDiniyah();
      alert('✅ Data berhasil dihapus!');
      hideLoading();
    }, 1500);

  } catch (err) {
    console.error(err);
    hideLoading();
    alert('❌ Gagal ngahapus data');
  }
}

// 4. CETAK DATA DINIYAH
function cetakDiniyah() {
  const filteredRows = ALL_DINIYAH.filter((row, index) => {
    if (index === 0 && (row[0] === 'No' || row[1] === 'Nama')) return false;
    return row && row.length > 1 && row[1];
  });

  if (filteredRows.length === 0) {
    alert('⚠️ Tacan aya data pikeun dicetak!');
    return;
  }

  let tableRows = '';
  filteredRows.forEach((row, idx) => {
    tableRows += `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${row[1] || '-'}</td>
        <td>${row[2] || '-'}</td>
        <td>${row[3] || '-'}</td>
        <td>${row[4] || '-'}</td>
      </tr>
    `;
  });

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daftar Alumni Diniyah</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; text-transform: uppercase; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 13px; }
        th { background-color: #f2f2f2; text-align: center; }
      </style>
    </head>
    <body>
      <h2>Daftar Alumni Diniyah</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>No HP</th>
            <th>Angkatan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
