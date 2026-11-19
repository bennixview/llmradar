/* Set theme before first paint (loaded synchronously in <head>): stored choice, else the OS preference, else dark */
(function(){var t=null;try{t=localStorage.getItem('llmradar-theme');}catch(e){}if(t!=='light'&&t!=='dark'){t='dark';try{if(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)t='light';}catch(e){}}document.documentElement.setAttribute('data-theme',t);})();
