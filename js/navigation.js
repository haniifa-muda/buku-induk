function tampilHalaman(halaman, menuElement) {

  // sembunyikan semua halaman
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('inputPage').style.display = 'none';
  document.getElementById('rekapPage').style.display = 'none';

  // tampilkan halaman aktif
  document.getElementById(halaman).style.display = 'block';

  // hapus active semua menu
  const semuaMenu = document.querySelectorAll('.nav-link');

  semuaMenu.forEach(function(menu) {
    menu.classList.remove('active-menu');
  });

  // tambahkan active
  if(menuElement){
    menuElement.classList.add('active-menu');
  }
}