function tampilHalaman(halaman, menuElement) {

  // sembunyikan semua halaman (termasuk koordinatorPage)
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('koordinatorPage').style.display = 'none';
  document.getElementById('inputPage').style.display = 'none';
  document.getElementById('rekapPage').style.display = 'none';

  // sembunyikan form edit jika sedang terbuka
  const editBox = document.getElementById('editBox');
  if (editBox) editBox.style.display = 'none';

  const editKoordinatorBox = document.getElementById('editKoordinatorBox');
  if (editKoordinatorBox) editKoordinatorBox.style.display = 'none';

  // tampilkan halaman aktif
  const pageTujuan = document.getElementById(halaman);
  if (pageTujuan) {
    pageTujuan.style.display = 'block';
  }

  // hapus active semua menu
  const semuaMenu = document.querySelectorAll('.nav-link');

  semuaMenu.forEach(function(menu) {
    menu.classList.remove('active-menu');
  });

  // tambahkan active
  if (menuElement) {
    menuElement.classList.add('active-menu');
  }

  // Jika membuka halaman koordinator, muat datanya otomatis
  if (halaman === 'koordinatorPage' && typeof muatDataKoordinator === 'function') {
    muatDataKoordinator();
  }
}
