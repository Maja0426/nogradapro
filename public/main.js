// always close responsive nav after click
$('#collapsingNavbar li>a:not("[data-toggle]")').click(function () {
  $('.navbar-toggler:visible').click();
});