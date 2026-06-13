// Art by Carlos Tattoo — interactions + GA4 event tracking
(function(){
  function track(name,params){
    params=params||{};params.page_path=location.pathname;
    if(typeof gtag==='function')gtag('event',name,params);
  }
  // Mobile nav
  var burger=document.querySelector('.burger'),links=document.querySelector('.nav-links');
  if(burger)burger.addEventListener('click',function(){links.classList.toggle('open')});
  document.querySelectorAll('.dropdown>a').forEach(function(d){
    d.addEventListener('click',function(e){if(window.innerWidth<=600){e.preventDefault();d.parentElement.classList.toggle('open')}});
  });
  // Scroll reveal (respect reduced-motion)
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});}
  // Lightbox (keyboard accessible)
  var lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Enlarged tattoo image');lb.innerHTML='<img alt="">';document.body.appendChild(lb);
  var lbi=lb.querySelector('img'),lastFocus=null;
  function openLB(img){lbi.src=img.src;lbi.alt=img.alt;lb.classList.add('open');lastFocus=img.parentElement;lb.tabIndex=-1;lb.focus();track('view_gallery_image',{image_name:img.alt});}
  function closeLB(){lb.classList.remove('open');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  document.querySelectorAll('.grid figure img').forEach(function(img){
    var fig=img.parentElement;
    fig.setAttribute('tabindex','0');fig.setAttribute('role','button');fig.setAttribute('aria-label','View larger image: '+(img.alt||'tattoo'));
    fig.addEventListener('click',function(){openLB(img)});
    fig.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openLB(img)}});
  });
  lb.addEventListener('click',closeLB);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('open'))closeLB()});
  // GA4 event tracking via data-ga attributes
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-ga]');
    if(el)track(el.getAttribute('data-ga'),{link_url:el.href||'',link_text:(el.textContent||'').trim().slice(0,80)});
  });
  // Scroll depth (90%)
  var fired=false;
  window.addEventListener('scroll',function(){
    if(fired)return;
    var d=(window.scrollY+window.innerHeight)/document.body.scrollHeight;
    if(d>0.9){fired=true;track('scroll_90',{})}
  },{passive:true});
})();
