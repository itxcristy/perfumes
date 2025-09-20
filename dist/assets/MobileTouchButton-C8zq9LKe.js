import{j as e,m as x}from"./index-CZfeFpFF.js";const y=({children:n,onClick:r,className:l="",icon:s,variant:o="primary",size:t="comfortable",loading:i=!1,disabled:a=!1,ariaLabel:u,title:m,fullWidth:c=!1,hapticFeedback:h=!1})=>{const p=`
    relative inline-flex items-center justify-center font-medium
    touch-manipulation select-none
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 active:transition-transform active:duration-100
    ${c?"w-full":""}
  `,f={primary:"bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-500 shadow-sm hover:shadow-md",secondary:"bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500 shadow-sm hover:shadow-md",ghost:"text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-500",danger:"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md"},b={minimum:"min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-1.5 text-xs rounded-md",comfortable:"min-h-[48px] min-w-[48px] px-3 sm:px-4 py-2 text-sm rounded-md",optimal:"min-h-[56px] min-w-[56px] px-4 sm:px-5 py-2.5 text-base rounded-lg"},d={minimum:"h-3.5 w-3.5",comfortable:"h-4 w-4",optimal:"h-5 w-5"},g=w=>{h&&"vibrate"in navigator&&navigator.vibrate(10),r==null||r(w)};return e.jsx(x.button,{onClick:g,disabled:a||i,className:`
        ${p}
        ${f[o]}
        ${b[t]}
        ${l}
        ${a?"opacity-50 cursor-not-allowed":""}
      `,"aria-label":u,title:m,whileTap:{scale:.95},transition:{type:"spring",stiffness:400,damping:25},children:i?e.jsx("div",{className:`${d[t]} border-2 border-current border-t-transparent rounded-full animate-spin`}):e.jsxs(e.Fragment,{children:[s&&e.jsx(s,{className:`${d[t]} ${n?"mr-1.5":""}`}),n]})})},$=({icon:n,onClick:r,className:l="",variant:s="ghost",size:o="comfortable",disabled:t=!1,ariaLabel:i,active:a=!1})=>{const u=`
    relative inline-flex items-center justify-center
    touch-manipulation select-none
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-90 active:transition-transform active:duration-100
    rounded-full
  `,m={primary:a?"bg-neutral-900 text-white shadow-md":"bg-white text-neutral-600 hover:bg-neutral-900 hover:text-white border border-neutral-200 shadow-sm",secondary:a?"bg-neutral-100 text-neutral-900 shadow-md":"bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200 shadow-sm",ghost:a?"bg-neutral-100 text-neutral-900":"text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"},c={minimum:"h-[44px] w-[44px]",comfortable:"h-[48px] w-[48px]",optimal:"h-[56px] w-[56px]"},h={minimum:"h-4 w-4",comfortable:"h-5 w-5",optimal:"h-6 w-6"};return e.jsx(x.button,{onClick:r,disabled:t,className:`
        ${u}
        ${m[s]}
        ${c[o]}
        ${l}
        ${t?"opacity-50 cursor-not-allowed":""}
      `,"aria-label":i,whileTap:{scale:.9},transition:{type:"spring",stiffness:400,damping:25},children:e.jsx(n,{className:h[o]})})};export{$ as M,y as a};
