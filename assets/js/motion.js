(function () {
  // Sticky nav shadow
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  // Timeline scroll reveal
  var tl = document.querySelector('.timeline');
  if (tl) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { tl.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(tl);
  }

  // Reading progress bar
  var bar = document.querySelector('.read-progress');
  if (bar) {
    addEventListener('scroll', function () {
      var h = document.documentElement;
      bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    }, { passive: true });
  }
})();
