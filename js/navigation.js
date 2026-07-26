function tampilHalaman(halaman, menuElement) {

  // 1. Sembunyikan SEMUA halaman utama (kalebet diniyah, arwah, dll)
  const sadayaHalaman = [
    'dashboardPage',
    'inputPage',
    'koordinatorPage',
    'rekapPage',
    'diniyahPage',
    'arwahPage'
  ];

  sadayaHalaman.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 2. Sembunyikan form edit jika sedang terbuka
  const editBox = document.getElementById('editBox');
  if (editBox) editBox.style.display = 'none';

  const editKoordinatorBox = document.getElementById('editKoordinatorBox');
  if (editKoordinatorBox) editKoordinatorBox.style.display = 'none';

  // 3. Tampilkan halaman tujuan
  const pageTujuan = document.getElementById(halaman);
  if (pageTujuan) {
    pageTujuan.style.display = 'block';
  }

  // 4. Hapus class active di semua menu navbar
  const semuaMenu = document.querySelectorAll('.nav-link');
  semuaMenu.forEach(function(menu) {
    menu.classList.remove('active-menu');
  });

  // 5. Tambahkan class active ke menu yang diklik
  if (menuElement) {
    menuElement.classList.add('active-menu');
  }

  // 6. Triggers muat data otomatis jika diperlukan
  if (halaman === 'koordinatorPage' && typeof muatDataKoordinator === 'function') {
    muatDataKoordinator();
  }
  
  if (halaman === 'diniyahPage' && typeof muatDataDiniyah === 'function') {
    muatDataDiniyah();
  }
}
