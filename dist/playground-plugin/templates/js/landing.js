(function(){let{manifest:e}=window.PLAYGROUND,c="title-section",i="example-container",p="attributes-section",d="attributes-table-container",m="events-section",u="events-table-container",h="functions-section",g="functions-table-container";function a(s,t,n,r){if(s&&(!n||!n.length)){let l=document.getElementById(s);l.style.display="none"}else{let l=document.getElementById(t);l.innerHTML=r(n)}}function b(s){let t=`<h1>${s.name}</h1>`;return t+='<table class="title-table"><tbody>',s.description&&(t+=`<tr><td>Description:</td><td>${s.description}</td></tr>`),s.publisher&&(t+=s.publisher.name?`<tr><td>Maintainer:</td><td>${s.publisher.name}</td></tr>`:"",t+=s.publisher.email?`<tr><td>Contact:</td><td>${s.publisher.email}</td></tr>`:""),s.repository&&(t+=`<tr><td>Repository:</td><td><a target="_blank" href="${s.repository}">${s.repository}</a></td></tr>`),s.documentation&&(t+='<tr><td>Documentation:</td><td><a href="/documentation">Link</a></td></tr>'),t+="</tbody></table>",t}function T(s){let t='<span class="hljs-comment">&lt;!-- Load the frontend bundle --&gt;</span>';t+='<span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"module"</span> <span class="hljs-attr">src</span>=<span class="hljs-string">"path/to/index.js"</span>&gt;<span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span></span>',t+="<span>&nbsp;</span>",t+=`<span class="hljs-comment">&lt;!-- Use the MFE's tag --&gt;</span>`,t+=`<span class="hljs-tag">&lt;<span class="hljs-name">${e.tag}</span> 
`;for(let n in s)t+=`  <span class="hljs-attr">${n}</span>=<span class="hljs-string">${s[n]}</span> 
`;return t+=`<span class="hljs-tag">&lt;/<span class="hljs-name">${e.tag}</span>&gt;</span>`,t}function f(s){return s.map(t=>`
          <tr>
              <td><span>${t.name}${t.required?" * ":""}</span></td>
              <td><span>${t.schema.type}</span></td>
              <td>${t.schema.enum?t.schema.enum.map(n=>`<span>${n}</span>`).join(" "):""}</td>
              <td>${t.description}</td>
          </tr>
        `).join(" ")}function E(s){return s.map(t=>`
          <tr>
              <td><span>${t.name}</span></td>
              <td class="collapsed">
                <button class="payload-btn close">Payload <img src="assets/chevron.svg" alt="arrow"/></button>
                ${o(t)}
              </td>
              <td>${t.description}</td>
          </tr>
        `).join(" ")}function $(s){return s.map(t=>`
          <tr>
              <td><span>${t.name}</span></td>
              <td class="collapsed">
                <button class="payload-btn close">Payload <img src="assets/chevron.svg" alt="arrow"/></button>
                ${o(t)}
              </td>
              <td>${t.description}</td>
          </tr>
        `).join(" ")}function o(s){return s.parameters?`
        <pre class="collapsed"><code>${JSON.stringify(s.parameters,null,2)}</code></pre>`:s.schema?`<pre class="collapsed"><code>${JSON.stringify(s.schema.properties,null,2)}</code></pre>`:`<pre class="collapsed"><code>${JSON.stringify(s.schema,null,2)}</code></pre>`}function I(){document.addEventListener("click",function(s){let t=s.target.closest("button");if(!t||!t.closest("table"))return;t.parentElement.closest("td").classList.toggle("collapsed")})}a(null,c,e,b),a(null,i,e.example.attributes,T),a(p,d,e.attributes,f),a(m,u,e.events,E),a(h,g,e.functions,$),I()})();
//# sourceMappingURL=landing.js.map
