let ALL_ARWAH = [];

document.addEventListener('DOMContentLoaded', () => {
  muatDataArwah();
});

// 1. SIMPAN DATA ARWAH
async function simpanArwah() {
  const namaInput = document.getElementById('namaArwah');
  const binInput = document.getElementById('binArwah');
  const ortuInput = document.getElementById('ortuArwah');

  const namaVal = namaInput ? namaInput.value.trim().replace(/\s+/g, ' ') : '';
  const binVal = binInput ? binInput.value : 'bin';
  const ortuVal = ortuInput ? ortuInput.value.trim().replace(/\s+/g, ' ') : '';

  if (!namaVal) {
    alert('⚠️ Ngaran Almarhum/ah wajib dieusian!');
    return;
  }

  // Format hasilna: "Aki Kholil bin Jayem" atanapi "Nyi Maryam binti Sukra"
  let namaLengkap = namaVal;
  if (ortuVal) {
    namaLengkap += ` ${binVal} ${ortuVal}`;
  }

  // Cek duplikat nami
  const isDuplicate = ALL_ARWAH.some(row => {
    const namaDiSheet = (row[1] || '').toString().trim().toLowerCase();
    return namaDiSheet === namaLengkap.toLowerCase();
  });

  if (isDuplicate) {
    alert(`⚠️ DATA DUPLIKAT!\n\nNgaran "${namaLengkap}" tos aya dina daftar.`);
    return;
  }

  showLoading();

  try {
    const payload = {
      action: 'addArwah',
      nama: namaLengkap
    };

    await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    setTimeout(async () => {
      await muatDataArwah();

      alert('✅ Data Arwah berhasil disimpan!');
      
      // Reset kabeh input form arwah
      if (namaInput) namaInput.value = '';
      if (binInput) binInput.value = 'bin';
      if (ortuInput) ortuInput.value = '';

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
    
    ALL_ARWAH = Array.isArray(data) ? data : [];

    const tbody = document.getElementById('arwahBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filteredRows = ALL_ARWAH.filter((row, index) => {
      if (index === 0 && (row[0] === 'No' || row[1] === 'Nama Almarhum/ah')) return false;
      return row && row.length > 1 && row[1];
    });

    if (filteredRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">Tacan aya data arwah</td></tr>';
      return;
    }

    filteredRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const rowIndex = ALL_ARWAH.indexOf(row) + 1;
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${row[1] || '-'}</strong></td>
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

// 3. HAPUS DATA ARWAH
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

// 4. FITUR CETAK DAFTAR ARWAH (LAYOUT MULTI-KOLOM)
function cetakArwah() {
  // Saring data arwah (miceun header)
  const filteredRows = ALL_ARWAH.filter((row, index) => {
    if (index === 0 && (row[0] === 'No' || row[1] === 'Nama Almarhum/ah')) return false;
    return row && row.length > 1 && row[1];
  });

  if (filteredRows.length === 0) {
    alert('⚠️ Tacan aya data arwah anu tiasa dicetak!');
    return;
  }

  // Nyusun list HTML pikeun dicetak
  let listItems = '';
  filteredRows.forEach((row, idx) => {
    listItems += `
      <div class="arwah-item">
        <span class="no">${idx + 1}.</span>
        <span class="nama">${row[1]}</span>
      </div>
    `;
  });

  // Buka jandela anyar pikeun cetak
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Cetak Daftar Arwah</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: Arial, sans-serif;
          color: #000;
          margin: 0;
          padding: 0;
        }
        h2.judul {
          text-align: center;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 22px;
          text-transform: uppercase;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }
        
        /* LAYOUT MULTI-KOLOM (Otomatis uih ka luhur belah katuhu) */
        .container-arwah {
          column-count: 3;           /* Dibagi janten 3 kolom */
          column-gap: 25px;          /* Jarak antarkolom */
          column-rule: 1px solid #ccc; /* Garis pembatas antarkolom */
          width: 100%;
        }
        
        .arwah-item {
          break-inside: avoid;       /* Mencegah teks terpotong di tengah kolom */
          font-size: 13px;
          padding: 4px 0;
          border-bottom: 1px dotted #ddd;
          display: flex;
        }
        .arwah-item .no {
          width: 28px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .arwah-item .nama {
          flex-grow: 1;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>

      <h2 class="judul">Daftar Arwah</h2>

      <div class="container-arwah">
        ${listItems}
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
