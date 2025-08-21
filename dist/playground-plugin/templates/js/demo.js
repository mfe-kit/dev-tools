(function(){let{manifest:s}=window.PLAYGROUND,i="playground-content",u="playground-controls",a="playground-controls-btn";function l(){let e=document.createElement(s.tag),n=document.getElementById(i),t=m();for(let o in t)e.setAttribute(o,t[o]);n.appendChild(e),d()}function m(){return window.location.search.length>1?r():(c(s.example.attributes),s.example.attributes)}function d(){let e=[],n=document.getElementById(u);s.attributes.forEach(t=>{e.push(p(t))}),e.push(`<div class="item"><button class="apply-btn" id="${a}">Apply</button></div>`),n.innerHTML=e.join(""),y(),document.getElementById(a).addEventListener("click",t=>{t.stopPropagation(),t.preventDefault();let o=h();c(o),window.location.reload()})}function p(e){let n="";if(e.schema.enum){let t=e.schema.enum.map(o=>`<option value="${o}">${o}</option>`).join("");n=`
        <select id="${e.name}" required="${e.required}">
          ${t}
        </select>
      `}else{let t=e.schema.type==="boolean"?"checkbox":"text";n=`
        <input id="${e.name}" type="${t}" required="${e.required}"/>
      `}return`
      <div class="item">
        <label for="${e.name}">${e.name}:</label>
        ${n}
      </div>
    `}function r(){let e=new URLSearchParams(window.location.search);return Object.fromEntries(e.entries())}function h(){let e={};return s.attributes.forEach(n=>{let t=document.getElementById(n.name);e[n.name]=t.type==="checkbox"?t.checked:t.value}),e}function y(){let e=r();for(let n in e){let t=document.getElementById(n);t.type==="checkbox"?t.checked=e[n]==="true":t.value=e[n]}}function c(e){let n=new URLSearchParams(e).toString(),t=new URL(window.location.href);t.search=n,window.history.replaceState({},"",t)}l()})();
//# sourceMappingURL=demo.js.map
