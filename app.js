(function(){
  var page = document.getElementById('yuge');

  /* ------------------------------------------------------------------
     CARICAMENTO IMMAGINI
     Prova prima i file locali in assets/, poi i percorsi remoti.
     Se non trova niente, lascia il fallback (titolo pixel / SVG).
  ------------------------------------------------------------------ */
  var LOCAL = {
    logo:  ['assets/logo.png','assets/logo.jpg','assets/logo.webp'],
    banner:['assets/banner.png','assets/banner.jpg','assets/banner.webp'],
    idle:  ['assets/trump-idle.png'],
    wave:  ['assets/trump-wave.png'],
    jump:  ['assets/trump-jump.png']
  };
  var REMOTE = {                     // <-- opzionale: URL remoti di riserva
    logo:[], banner:[], idle:[], wave:[], jump:[]
  };

  function loadInto(img, key, ok, fail){
    var list = (LOCAL[key]||[]).concat(REMOTE[key]||[]);
    var i = 0, done = false, timer = null;
    function next(){
      if(done) return;
      if(i >= list.length){ if(fail) fail(); return; }
      clearTimeout(timer);
      timer = setTimeout(function(){ if(!done) next(); }, 1800);
      img.onerror = function(){ if(!done) next(); };
      img.onload  = function(){
        if(done) return;
        if(img.naturalWidth > 0){ done = true; clearTimeout(timer); if(ok) ok(list[i-1]); }
        else next();
      };
      img.src = list[i++];
    }
    next();
  }

  /* logo */
  document.querySelectorAll('.logoA').forEach(function(el){
    loadInto(el, 'logo', null, function(){ el.style.visibility = 'hidden'; });
  });

  /* banner hero (se manca, torna il titolo pixel) */
  var bImg = document.getElementById('bannerImg'), h1 = document.getElementById('h1fb');
  loadInto(bImg, 'banner',
    function(){ bImg.style.display = 'block'; h1.style.display = 'none'; },
    function(){});

  /* le tre pose del personaggio */
  var poses = {
    idle: document.getElementById('pIdle'),
    wave: document.getElementById('pWave'),
    jump: document.getElementById('pJump')
  };
  var URLs = {};
  ['idle','wave','jump'].forEach(function(k){
    loadInto(poses[k], k,
      function(url){ URLs[k] = url; poses[k].style.display = ''; },
      function(){ if(k === 'idle') poses.idle.style.display = 'none'; });
  });
  function setPose(n){
    for(var k in poses) poses[k].classList.toggle('on', k === n);
  }

  /* mini personaggi su card, peek e camminatore */
  ['mini1','mini2','mini3','peek'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) loadInto(el, 'wave', null, function(){ el.style.display = 'none'; });
  });
  var walker = document.getElementById('walker');
  loadInto(walker, 'idle', function(){ walker.style.display = 'block'; },
    function(){ walker.style.display = 'none'; });

  /* avatar nel blocco finale: saluta in hover */
  var avatar = document.getElementById('avatar');
  loadInto(avatar, 'idle', null, function(){ avatar.style.display = 'none'; });
  avatar.addEventListener('mouseenter', function(){ if(URLs.wave) avatar.src = URLs.wave; });
  avatar.addEventListener('mouseleave', function(){ if(URLs.idle) avatar.src = URLs.idle; });

  /* ------------------------------------------------------------------
     ANIMAZIONI PERSONAGGIO: fumetto, saluto casuale, salto
  ------------------------------------------------------------------ */
  var bubble = document.getElementById('bubble');
  var phrases = ['YUUGE!','x100','WAGMI','SO YUGE','BUY THE DIP','NO SELL'];
  function say(t){
    bubble.textContent = t; bubble.classList.add('on');
    setTimeout(function(){ bubble.classList.remove('on'); }, 1500);
  }

  var jt = -1;                                  // -1 = fermo
  function jump(){
    jt = 0; setPose('jump');
    setTimeout(function(){ if(jt < 0) setPose('idle'); }, 900);
  }
  setInterval(function(){
    if(jt >= 0) return;
    setPose('wave');
    if(Math.random() < .6) say(phrases[Math.floor(Math.random()*phrases.length)]);
    setTimeout(function(){ if(jt < 0) setPose('idle'); }, 1500);
  }, 6500);
  setTimeout(function(){ say('YUUGE!'); }, 900);

  /* ------------------------------------------------------------------
     CURSORE CUSTOM + SEGUI-CURSORE DEL SOLO PERSONAGGIO
  ------------------------------------------------------------------ */
  var cur = document.getElementById('cur'), tag = document.getElementById('curTag');
  var px = 0, py = 0, cx = 0, cy = 0;

  function onMove(e){
    var r = page.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    px = x; py = y;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var hot = el && el.closest && el.closest('.hot,.btn,a,button');
    cur.classList.toggle('hot', !!hot);
    tag.classList.toggle('on', !!hot);
    tag.style.transform = 'translate(' + (x + 16) + 'px,' + (y - 26) + 'px)';
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });

  var charL = document.getElementById('charL');
  var tx = 0, ty = 0, ax = 0, ay = 0;

  function loop(){
    var r = page.getBoundingClientRect();
    var ecx = r.left + page.clientWidth / 2, ecy = r.top + 180;
    var dx = (px + r.left) - ecx, dy = (py + r.top) - ecy;

    tx = Math.max(-22, Math.min(22, dx * .09));
    ty = Math.max(-18, Math.min(18, dy * .09));
    ax += (tx - ax) * .09;
    ay += (ty - ay) * .09;

    if(jt >= 0){ jt += .016; if(jt > .7) jt = -1; }
    var t  = jt >= 0 ? jt / .7 : 0;
    var sc = 1 + .16 * Math.sin(Math.PI * t);
    var jy = -34 * Math.sin(Math.PI * t);

    charL.style.transform =
      'translate(' + ax.toFixed(2) + 'px,' + (ay + jy).toFixed(2) + 'px) scale(' + sc.toFixed(3) + ')';
    requestAnimationFrame(loop);
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) loop();

  (function curLoop(){
    cx += (px - cx) * .22; cy += (py - cy) * .22;
    cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
    requestAnimationFrame(curLoop);
  })();

  /* ------------------------------------------------------------------
     PARTICELLE
  ------------------------------------------------------------------ */
  var cv = document.getElementById('stars');
  if(cv && cv.getContext){
    var ctx = cv.getContext('2d'), P = [];
    function size(){ cv.width = page.clientWidth; cv.height = page.clientHeight; }
    size(); window.addEventListener('resize', size);
    for(var i = 0; i < 70; i++)
      P.push({ x: Math.random()*cv.width, y: Math.random()*cv.height,
               r: Math.random()*1.6 + .3, s: Math.random()*.28 + .06, a: Math.random() });
    (function d(){
      ctx.clearRect(0, 0, cv.width, cv.height);
      for(var i = 0; i < P.length; i++){
        var p = P[i]; p.y -= p.s;
        if(p.y < -4){ p.y = cv.height + 4; p.x = Math.random()*cv.width; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(252,153,49,' + (p.a*.55) + ')'; ctx.fill();
      }
      requestAnimationFrame(d);
    })();
  }

  /* ------------------------------------------------------------------
     TICKER
  ------------------------------------------------------------------ */
  var items = ['<em>$YUUGE</em> PRE-LAUNCH','SUPPLY 1,000,000,000','TAX <i>0%</i>',
    'TARGET <em>x100</em>','LP BURNED','CONTRACT RENOUNCED','SOLANA','NO VC',
    '<em>WAGMI</em>','THE YUGEST COIN'];
  var track = document.getElementById('track');
  var html = items.map(function(s){ return '<span>' + s + '</span>'; }).join('');
  track.innerHTML = html + html;

  /* ------------------------------------------------------------------
     COUNTDOWN  <-- CAMBIA QUI LA DATA DI LANCIO
  ------------------------------------------------------------------ */
  var target = new Date('2026-11-05T18:00:00Z').getTime();
  function tick(){
    var d = Math.max(0, target - Date.now());
    var s = Math.floor(d/1000), m = Math.floor(s/60), h = Math.floor(m/60), dd = Math.floor(h/24);
    document.getElementById('cd').textContent = String(dd).padStart(2,'0');
    document.getElementById('ch').textContent = String(h % 24).padStart(2,'0');
    document.getElementById('cm').textContent = String(m % 60).padStart(2,'0');
    document.getElementById('cs').textContent = String(s % 60).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);

  /* ------------------------------------------------------------------
     FAQ
  ------------------------------------------------------------------ */
  var faqs = [
    ['What is $YUUGE?','A memecoin on Solana built around one character, one vibe and one number: x100. No utility promises, no fake partnerships.'],
    ['Is there a presale?','No presale and no whitelist. Everyone buys at the same time, at the same price, on the same chart.'],
    ['What are the taxes?','0% buy and 0% sell. What you swap is what you get.'],
    ['When does it launch?','The countdown on this page points at the launch window. Follow the Telegram so you do not miss the first candle.'],
    ['Why x100?','A 1B supply with a viral character and a relentless community. If the meme lands, the multiple is the easy part.']
  ];
  var fl = document.getElementById('faqList');
  fl.innerHTML = faqs.map(function(f,i){
    return '<div class="q"><button data-i="'+i+'">'+f[0]+'<span>+</span></button><div class="a"><p>'+f[1]+'</p></div></div>';
  }).join('');
  fl.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    var q = b.parentElement, open = q.classList.contains('open');
    fl.querySelectorAll('.q').forEach(function(x){
      x.classList.remove('open'); x.querySelector('span').textContent = '+';
    });
    if(!open){ q.classList.add('open'); b.querySelector('span').textContent = '-'; }
  });

  /* ------------------------------------------------------------------
     DONUT TOKENOMICS
  ------------------------------------------------------------------ */
  var C = 2 * Math.PI * 76;
  setTimeout(function(){
    document.getElementById('arc1').setAttribute('stroke-dasharray', (C*.50) + ' ' + C);
    document.getElementById('arc2').setAttribute('stroke-dasharray', (C*.25) + ' ' + C);
    document.getElementById('arc3').setAttribute('stroke-dasharray', (C*.15) + ' ' + C);
    document.getElementById('arc4').setAttribute('stroke-dasharray', (C*.10) + ' ' + C);
  }, 350);

  /* ------------------------------------------------------------------
     COPIA CONTRACT ADDRESS
  ------------------------------------------------------------------ */
  var toast = document.getElementById('toast');
  function showToast(m){
    toast.textContent = m; toast.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ toast.classList.remove('on'); }, 1600);
  }
  document.getElementById('chip').addEventListener('click', function(){
    var ca = document.getElementById('ca').textContent.trim();
    if(navigator.clipboard) navigator.clipboard.writeText(ca).catch(function(){});
    showToast('CA COPIED');
  });

  /* ------------------------------------------------------------------
     CONFETTI + SALTO SUI PULSANTI BUY
  ------------------------------------------------------------------ */
  var conf = null;
  import('https://esm.sh/canvas-confetti')
    .then(function(m){ conf = m.default || m; }).catch(function(){});
  ['buyTop','buyMain','buyBand'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    el.addEventListener('click', function(){
      jump(); say('x100!');
      if(conf) conf({ particleCount: 110, spread: 75, origin: { y: .35 },
        colors: ['#FC9931','#E6B123','#1A6AFF','#ffffff'] });
    });
  });

  /* ------------------------------------------------------------------
     REVEAL ON SCROLL
  ------------------------------------------------------------------ */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.rev').forEach(function(el, i){
    el.style.transitionDelay = (i % 3) * 60 + 'ms';
    io.observe(el);
  });
})();
