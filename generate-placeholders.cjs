const fs = require('fs');
const path = require('path');

// Function to create SVG placeholder
function createPlaceholder(folder, filename, title, color1, color2) {
  const svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)"/>
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    ${title}
  </text>
  <text x="200" y="230" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">
    ${filename}
  </text>
</svg>`;
  
  const fullPath = path.join('src/assets/images/products', folder, filename);
  fs.writeFileSync(fullPath, svgContent);
  console.log(`Created ${fullPath}`);
}

// Create placeholders for each category
const categories = [
  { 
    folder: 'islamic-books', 
    items: [
      { name: 'book-1.svg', title: 'Islamic Book', color1: '#8B4513', color2: '#A0522D' },
      { name: 'book-2.svg', title: 'Islamic Book', color1: '#654321', color2: '#8B4513' },
      { name: 'book-3.svg', title: 'Islamic Book', color1: '#5D4037', color2: '#8D6E63' },
      { name: 'book-4.svg', title: 'Islamic Book', color1: '#4E342E', color2: '#795548' },
      { name: 'book-5.svg', title: 'Islamic Book', color1: '#3E2723', color2: '#6D4C41' }
    ]
  },
  { 
    folder: 'customization', 
    items: [
      { name: 'bottle-1.svg', title: 'Custom Bottle', color1: '#2196F3', color2: '#21CBF3' },
      { name: 'mug-1.svg', title: 'Custom Mug', color1: '#FF9800', color2: '#FFC107' },
      { name: 'pen-1.svg', title: 'Custom Pen', color1: '#9C27B0', color2: '#E040FB' },
      { name: 'wallet-1.svg', title: 'Custom Wallet', color1: '#4CAF50', color2: '#69F0AE' },
      { name: 'frame-a4-1.svg', title: 'A4 Frame', color1: '#F44336', color2: '#FF5252' },
      { name: 'frame-mini-1.svg', title: 'Mini Frame', color1: '#00BCD4', color2: '#18FFFF' },
      { name: 'frame-wedding-1.svg', title: 'Wedding Frame', color1: '#E91E63', color2: '#FF4081' },
      { name: 'keychain-1.svg', title: 'Keychain', color1: '#FF5722', color2: '#FFAB40' },
      { name: 'rehal-1.svg', title: 'Rehal', color1: '#795548', color2: '#A1887F' },
      { name: 'bookmark-1.svg', title: 'Bookmark', color1: '#607D8B', color2: '#B0BEC5' },
      { name: 'coaster-1.svg', title: 'Coaster', color1: '#9E9E9E', color2: '#E0E0E0' },
      { name: 'pen-stand-1.svg', title: 'Pen Stand', color1: '#795548', color2: '#D7CCC8' }
    ]
  },
  { 
    folder: 'abaya', 
    items: [
      { name: 'abaya-1.svg', title: 'Abaya', color1: '#000000', color2: '#212121' },
      { name: 'abaya-2.svg', title: 'Abaya', color1: '#1B1B1B', color2: '#424242' },
      { name: 'abaya-3.svg', title: 'Abaya', color1: '#2D2D2D', color2: '#616161' },
      { name: 'abaya-4.svg', title: 'Abaya', color1: '#3D3D3D', color2: '#757575' },
      { name: 'abaya-5.svg', title: 'Abaya', color1: '#4D4D4D', color2: '#9E9E9E' }
    ]
  },
  { 
    folder: 'hijabs', 
    items: [
      { name: 'hijab-1.svg', title: 'Hijab', color1: '#3F51B5', color2: '#5C6BC0' },
      { name: 'hijab-2.svg', title: 'Hijab', color1: '#2196F3', color2: '#42A5F5' },
      { name: 'hijab-3.svg', title: 'Hijab', color1: '#00BCD4', color2: '#26C6DA' },
      { name: 'hijab-4.svg', title: 'Hijab', color1: '#009688', color2: '#26A69A' },
      { name: 'hijab-5.svg', title: 'Hijab', color1: '#4CAF50', color2: '#66BB6A' }
    ]
  },
  { 
    folder: 'jilbab', 
    items: [
      { name: 'jilbab-1.svg', title: 'Jilbab', color1: '#8E24AA', color2: '#AB47BC' },
      { name: 'jilbab-2.svg', title: 'Jilbab', color1: '#6A1B9A', color2: '#8E24AA' },
      { name: 'jilbab-3.svg', title: 'Jilbab', color1: '#4527A0', color2: '#5E35B1' },
      { name: 'jilbab-4.svg', title: 'Jilbab', color1: '#3949AB', color2: '#5C6BC0' },
      { name: 'jilbab-5.svg', title: 'Jilbab', color1: '#1E88E5', color2: '#42A5F5' }
    ]
  },
  { 
    folder: 'khimar', 
    items: [
      { name: 'khimar-1.svg', title: 'Khimar', color1: '#D81B60', color2: '#E91E63' },
      { name: 'khimar-2.svg', title: 'Khimar', color1: '#C2185B', color2: '#D81B60' },
      { name: 'khimar-3.svg', title: 'Khimar', color1: '#AD1457', color2: '#C2185B' },
      { name: 'khimar-4.svg', title: 'Khimar', color1: '#880E4F', color2: '#AD1457' },
      { name: 'khimar-5.svg', title: 'Khimar', color1: '#6A1B9A', color2: '#7B1FA2' }
    ]
  },
  { 
    folder: 'nosepiece', 
    items: [
      { name: 'nosepiece-1.svg', title: 'Nosepiece', color1: '#FFD600', color2: '#FFEA00' },
      { name: 'nosepiece-2.svg', title: 'Nosepiece', color1: '#FFAB00', color2: '#FFD600' },
      { name: 'nosepiece-3.svg', title: 'Nosepiece', color1: '#FF6D00', color2: '#FFAB00' },
      { name: 'nosepiece-4.svg', title: 'Nosepiece', color1: '#DD2C00', color2: '#FF6D00' },
      { name: 'nosepiece-5.svg', title: 'Nosepiece', color1: '#FF1744', color2: '#F50057' }
    ]
  },
  { 
    folder: 'alcohol-free-perfumes', 
    items: [
      { name: 'perfume-1.svg', title: 'Perfume', color1: '#7B1FA2', color2: '#9C27B0' },
      { name: 'perfume-2.svg', title: 'Perfume', color1: '#512DA8', color2: '#673AB7' },
      { name: 'perfume-3.svg', title: 'Perfume', color1: '#303F9F', color2: '#3F51B5' },
      { name: 'perfume-4.svg', title: 'Perfume', color1: '#1976D2', color2: '#2196F3' },
      { name: 'perfume-5.svg', title: 'Perfume', color1: '#0288D1', color2: '#03A9F4' }
    ]
  }
];

// Create all placeholders
categories.forEach(category => {
  category.items.forEach(item => {
    createPlaceholder(category.folder, item.name, item.title, item.color1, item.color2);
  });
});

console.log('All placeholder images created successfully!');