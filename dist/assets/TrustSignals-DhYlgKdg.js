import{c as p,j as e,o as a,A as m,m as n}from"./index-CZfeFpFF.js";import{C as h,T as d}from"./truck-CLaVScap.js";import{R as x}from"./rotate-ccw-DHyFyuU3.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",key:"1xhozi"}]],g=p("headphones",u),f=[{icon:d,title:"Free Shipping",description:"On orders over $50",color:"text-emerald-600",bgColor:"bg-emerald-50"},{icon:x,title:"30-Day Returns",description:"Hassle-free returns",color:"text-blue-600",bgColor:"bg-blue-50"},{icon:a,title:"Secure Checkout",description:"SSL encrypted & protected",color:"text-neutral-700",bgColor:"bg-neutral-100"},{icon:g,title:"24/7 Support",description:"Expert customer care",color:"text-purple-600",bgColor:"bg-purple-50"}],y=({variant:t="grid",showIcons:i=!0,className:r=""})=>{const o={grid:"grid grid-cols-2 md:grid-cols-4 gap-4",horizontal:"flex flex-wrap justify-center gap-6",vertical:"space-y-4",compact:"flex flex-wrap justify-center gap-3"},c={grid:"text-center p-4",horizontal:"flex items-center space-x-3 p-3",vertical:"flex items-center space-x-4 p-4",compact:"flex items-center space-x-2 p-2 text-sm"};return e.jsx("div",{className:`${o[t]} ${r}`,children:f.map((s,l)=>e.jsxs(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:l*.1},className:`
            ${c[t]}
            bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 luxury-transition
          `,children:[i&&e.jsx("div",{className:`
              ${s.bgColor} p-3 rounded-full
              ${t==="grid"?"mx-auto mb-3":""}
              ${t==="compact"?"p-2":""}
            `,children:e.jsx(s.icon,{className:`
                ${s.color}
                ${t==="compact"?"h-4 w-4":"h-6 w-6"}
              `})}),e.jsxs("div",{className:t==="grid"?"text-center":"text-left",children:[e.jsx("h3",{className:`
              font-semibold text-gray-900
              ${t==="compact"?"text-sm":"text-base"}
            `,children:s.title}),e.jsx("p",{className:`
              text-gray-600
              ${t==="compact"?"text-xs":"text-sm"}
            `,children:s.description})]})]},s.title))})},v=({className:t=""})=>e.jsx("div",{className:`space-y-4 ${t}`,children:e.jsxs("div",{className:"bg-gray-50 rounded-lg p-4",children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-3",children:"Why Shop With Us?"}),e.jsx(y,{variant:"vertical",className:"space-y-3"})]})}),S=({className:t=""})=>{const i=[{icon:a,title:"Secure Checkout",description:"Your data is protected with 256-bit SSL encryption"},{icon:m,title:"Trusted by 50,000+",description:"Join thousands of satisfied customers"},{icon:h,title:"Quick Processing",description:"Orders processed within 24 hours"}];return e.jsxs("div",{className:`bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 ${t}`,children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4 text-center",children:"Shop with Confidence"}),e.jsx("div",{className:"space-y-3",children:i.map((r,o)=>e.jsxs(n.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{delay:o*.1},className:"flex items-center space-x-3",children:[e.jsx("div",{className:"p-2 bg-white rounded-full shadow-sm",children:e.jsx(r.icon,{className:"h-5 w-5 text-blue-600"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-gray-900 text-sm",children:r.title}),e.jsx("p",{className:"text-xs text-gray-600",children:r.description})]})]},r.title))})]})},w=({freeShipping:t,warranty:i,returns:r,className:o=""})=>{const c=[];return t&&c.push({icon:d,text:"Free Shipping",color:"text-blue-600"}),i&&c.push({icon:a,text:"Warranty",color:"text-green-600"}),r&&c.push({icon:x,text:"Returns",color:"text-purple-600"}),c.length===0?null:e.jsx("div",{className:`flex items-center space-x-2 ${o}`,children:c.map((s,l)=>e.jsxs("div",{className:"flex items-center space-x-1 text-xs text-gray-600",title:s.text,children:[e.jsx(s.icon,{className:`h-3 w-3 ${s.color}`}),e.jsx("span",{children:s.text})]},s.text))})};export{S as C,g as H,w as M,v as P};
