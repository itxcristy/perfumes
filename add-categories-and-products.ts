import { createCategory, createProduct } from './src/lib/crudOperations.ts';
import { Category, Product } from './src/types/index.ts';
import { createClient } from '@supabase/supabase-js';

// Simple script to update product images directly in the database
async function updateProductImages() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL and key are required');
      return;
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Define the image mappings for perfume products
    const perfumeImageUpdates = [
      { name: "Oud Al Rehab", imageUrl: "/images/products/perfumes/attar-1.jpg" },
      { name: "Rose Attar", imageUrl: "/images/products/perfumes/attar-2.jpg" },
      { name: "Jasmine Essence", imageUrl: "/images/products/perfumes/attar-3.jpg" },
      { name: "Musk Collection", imageUrl: "/images/products/perfumes/attar-1.jpg" },
      { name: "Sandalwood Oil", imageUrl: "/images/products/perfumes/attar-2.jpg" }
    ];
    
    console.log("Updating product images...");
    
    // Update each perfume product
    for (const product of perfumeImageUpdates) {
      const { data, error } = await supabase
        .from('products')
        .update({ images: [product.imageUrl] })
        .eq('name', product.name);
        
      if (error) {
        console.error(`Error updating ${product.name}:`, error);
      } else {
        console.log(`Successfully updated ${product.name} with image ${product.imageUrl}`);
      }
    }
    
    // Also update the Alcohol Free Perfumes category image
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .update({ image_url: "/images/products/perfumes/attar-1.jpg" })
      .eq('name', 'Alcohol Free Perfumes');
      
    if (categoryError) {
      console.error("Error updating category image:", categoryError);
    } else {
      console.log("Successfully updated Alcohol Free Perfumes category image");
    }
    
    console.log("Product image update completed!");
  } catch (error) {
    console.error("Error updating product images:", error);
  }
}

// Run the function
updateProductImages();

// Define the categories to add
const categoriesToAdd = [
  {
    name: "Islamic Books",
    description: "Collection of Islamic books and literature",
    imageUrl: "/src/assets/images/products/islamic-books/placeholder-book-cover-1.svg"
  },
  {
    name: "Customization",
    description: "Customization services for bottles, mugs, pens, and more",
    imageUrl: "/src/assets/images/products/customization/custom-1.svg"
  },
  {
    name: "Abaya",
    description: "Elegant and modest abayas for women",
    imageUrl: "/src/assets/images/products/abaya/abaya-1.svg"
  },
  {
    name: "Hijabs",
    description: "Stylish and comfortable hijabs for daily wear",
    imageUrl: "/src/assets/images/products/hijabs/hijab-1.svg"
  },
  {
    name: "Jilbab",
    description: "Traditional and modern jilbabs for modest fashion",
    imageUrl: "/src/assets/images/products/jilbab/jilbab-1.svg"
  },
  {
    name: "Khimar",
    description: "Beautiful khimars for elegant coverage",
    imageUrl: "/src/assets/images/products/khimar/khimar-1.svg"
  },
  {
    name: "Nosepiece",
    description: "Decorative nosepieces and jewelry",
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-1.svg"
  },
  {
    name: "Alcohol Free Perfumes",
    description: "Luxury alcohol-free perfumes and attars",
    imageUrl: "/images/products/perfumes/attar-1.jpg"
  }
];

// Define products for each category (5 products per category)
const productsToAdd = [
  // Islamic Books
  {
    name: "The Holy Quran - Cover 1",
    description: "Beautiful cover design for the Holy Quran",
    price: 29.99,
    categoryId: "", // Will be filled when category is created
    stock: 50,
    imageUrl: "/src/assets/images/products/islamic-books/the-holy-quran-cover-1.jpg",
    featured: true
  },
  {
    name: "The Holy Quran - Cover 2",
    description: "Elegant cover design for the Holy Quran",
    price: 29.99,
    categoryId: "",
    stock: 50,
    imageUrl: "/src/assets/images/products/islamic-books/the-holy-quran-cover-2.jpg",
    featured: true
  },
  {
    name: "The Sealed Nectar - Biography of Prophet Muhammad (PBUH)",
    description: "A comprehensive biography of Prophet Muhammad (PBUH)",
    price: 19.99,
    categoryId: "",
    stock: 50,
    imageUrl: "/src/assets/images/products/islamic-books/the-sealed-nectar-biography-of-prophet-muhammad.jpg",
    featured: true
  },
  {
    name: "Seerah an-Nabi - Biography of Prophet Muhammad (PBUH)",
    description: "Detailed biography of the life of Prophet Muhammad (PBUH)",
    price: 18.99,
    categoryId: "",
    stock: 45,
    imageUrl: "/src/assets/images/products/islamic-books/seerah-an-nabi-biography-of-prophet-muhammad.jpg",
    featured: true
  },
  {
    name: "Riyad as Salihin - Collection of Hadith",
    description: "Gardens of the Righteous - A collection of hadith",
    price: 14.99,
    categoryId: "",
    stock: 45,
    imageUrl: "/src/assets/images/products/islamic-books/riyad-as-salihin-collection-of-hadith.jpg",
    featured: true
  },
  {
    name: "Fortress of the Muslim - Daily Supplications",
    description: "Daily supplications from the Quran and Sunnah",
    price: 12.99,
    categoryId: "",
    stock: 60,
    imageUrl: "/src/assets/images/products/islamic-books/fortress-of-the-muslim-daily-suplications.jpg",
    featured: false
  },
  {
    name: "40 Hadith Nawawi - Essential Hadiths",
    description: "40 important hadiths with commentary",
    price: 16.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/islamic-books/forty-hadith-nawawi-essential-hadiths.jpg",
    featured: false
  },
  {
    name: "Islamic Finance - Banking Principles",
    description: "Understanding Islamic banking and finance principles",
    price: 24.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/islamic-finance-banking-principles.jpg",
    featured: true
  },
  {
    name: "Stories of the Prophets",
    description: "Collection of stories about the prophets in Islam",
    price: 22.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/src/assets/images/products/islamic-books/stories-of-the-prophets.jpg",
    featured: true
  },
  {
    name: "Understanding Islam - For New Muslims",
    description: "A comprehensive guide for new converts to Islam",
    price: 17.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/islamic-books/understanding-islam-for-new-muslims.jpg",
    featured: false
  },
  {
    name: "Collection of Duas from Quran and Sunnah",
    description: "Complete collection of supplications from the Quran and Sunnah",
    price: 13.99,
    categoryId: "",
    stock: 55,
    imageUrl: "/src/assets/images/products/islamic-books/collection-of-duas-from-quran-and-sunnah.jpg",
    featured: false
  },
  {
    name: "The Life of Prophet Ayyub (Job)",
    description: "The story of Prophet Ayyub (Job), known for his patience",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-life-of-prophet-ayyub.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Musa (Moses)",
    description: "The story of Prophet Musa (Moses) and his mission",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-musa.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Ibrahim (Abraham)",
    description: "The story of Prophet Ibrahim (Abraham), the father of prophets",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-ibrahim.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Yusuf (Joseph)",
    description: "The story of Prophet Yusuf (Joseph) and his brothers",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-yusuf.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Nuh (Noah)",
    description: "The story of Prophet Nuh (Noah) and the great flood",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-nuh.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Sulaiman (Solomon)",
    description: "The story of Prophet Sulaiman (Solomon) and his wisdom",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-sulaiman.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Dawud (David)",
    description: "The story of Prophet Dawud (David) and his psalms",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-dawud.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Isa (Jesus)",
    description: "The story of Prophet Isa (Jesus) in Islamic perspective",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-isa.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Yunus (Jonah)",
    description: "The story of Prophet Yunus (Jonah) and the whale",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-yunus.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Lut (Lot)",
    description: "The story of Prophet Lut (Lot) and his people",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-lut.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Hud",
    description: "The story of Prophet Hud and his people of 'Ad",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-hud.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Shuaib",
    description: "The story of Prophet Shuaib and his people of Madyan",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-shuaib.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Idris (Enoch)",
    description: "The story of Prophet Idris (Enoch), the first tailor",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-idris.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Ismail (Ishmael)",
    description: "The story of Prophet Ismail (Ishmael), the son of Ibrahim",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-ismail.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Iyas",
    description: "The story of Prophet Iyas and his people",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-iyas.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Yusha (Joshua)",
    description: "The story of Prophet Yusha (Joshua), successor of Musa",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-yusha.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Ayman",
    description: "The story of Prophet Ayman and his people",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-ayman.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Dhul-Kifl",
    description: "The story of Prophet Dhul-Kifl, known for his patience",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-dhul-kifl.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Harun (Aaron)",
    description: "The story of Prophet Harun (Aaron), brother of Musa",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-harun.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Zakariya (Zachariah)",
    description: "The story of Prophet Zakariya (Zachariah) and his son Yahya",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-zakariya.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Yahya (John)",
    description: "The story of Prophet Yahya (John), son of Zakariya",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-yahya.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Salih",
    description: "The story of Prophet Salih and his people of Thamud",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-salih.jpg",
    featured: false
  },
  {
    name: "The Story of Prophet Shammil",
    description: "The story of Prophet Shammil and his people",
    price: 11.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/islamic-books/the-story-of-prophet-shammil.jpg",
    featured: false
  },
  
  // Customization
  {
    name: "Customized Perfume Bottle",
    description: "Personalized perfume bottle with name engraving",
    price: 34.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/customization/bottle-1.svg",
    featured: true
  },
  {
    name: "Personalized Mug",
    description: "Custom mug with Islamic calligraphy",
    price: 18.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/customization/mug-1.svg",
    featured: false
  },
  {
    name: "Engraved Pen Set",
    description: "Luxury pen set with personalized engraving",
    price: 29.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/src/assets/images/products/customization/pen-1.svg",
    featured: true
  },
  {
    name: "Custom Wallet",
    description: "Leather wallet with personalized initials",
    price: 42.99,
    categoryId: "",
    stock: 20,
    imageUrl: "/src/assets/images/products/customization/wallet-1.svg",
    featured: false
  },
  {
    name: "A4 Size Frame",
    description: "Elegant A4 frame with Quranic verses",
    price: 39.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/customization/frame-a4-1.svg",
    featured: true
  },
  {
    name: "Mini Frame Collection",
    description: "Set of 3 mini frames with Islamic art",
    price: 27.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/src/assets/images/products/customization/frame-mini-1.svg",
    featured: false
  },
  {
    name: "Wedding Frame",
    description: "Special wedding frame with Islamic motifs",
    price: 49.99,
    categoryId: "",
    stock: 15,
    imageUrl: "/src/assets/images/products/customization/frame-wedding-1.svg",
    featured: true
  },
  {
    name: "Handmade Keychain",
    description: "Beautiful resin keychain with Islamic symbols",
    price: 12.99,
    categoryId: "",
    stock: 50,
    imageUrl: "/src/assets/images/products/customization/keychain-1.svg",
    featured: false
  },
  {
    name: "Resin Rehal",
    description: "Handcrafted prayer book stand",
    price: 22.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/customization/rehal-1.svg",
    featured: true
  },
  {
    name: "Bookmark Set",
    description: "Set of 5 Islamic bookmarks",
    price: 9.99,
    categoryId: "",
    stock: 60,
    imageUrl: "/src/assets/images/products/customization/bookmark-1.svg",
    featured: false
  },
  {
    name: "Decorative Coaster Set",
    description: "Set of 4 resin coasters with Islamic patterns",
    price: 19.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/customization/coaster-1.svg",
    featured: false
  },
  {
    name: "Luxury Pen Stand",
    description: "Elegant pen stand with Quranic calligraphy",
    price: 32.99,
    categoryId: "",
    stock: 20,
    imageUrl: "/src/assets/images/products/customization/pen-stand-1.svg",
    featured: true
  },
  
  // Abaya
  {
    name: "Classic Black Abaya",
    description: "Elegant black abaya with subtle embroidery",
    price: 89.99,
    categoryId: "",
    stock: 20,
    imageUrl: "/src/assets/images/products/abaya/abaya-1.svg",
    featured: true
  },
  {
    name: "Embroidered Abaya",
    description: "Beautifully embroidered abaya with floral patterns",
    price: 109.99,
    categoryId: "",
    stock: 15,
    imageUrl: "/src/assets/images/products/abaya/abaya-2.svg",
    featured: true
  },
  {
    name: "Simple White Abaya",
    description: "Pure white abaya for special occasions",
    price: 94.99,
    categoryId: "",
    stock: 18,
    imageUrl: "/src/assets/images/products/abaya/abaya-3.svg",
    featured: false
  },
  {
    name: "Designer Abaya",
    description: "Modern designer abaya with contemporary cuts",
    price: 129.99,
    categoryId: "",
    stock: 12,
    imageUrl: "/src/assets/images/products/abaya/abaya-4.svg",
    featured: true
  },
  {
    name: "Casual Abaya",
    description: "Comfortable everyday abaya with side slits",
    price: 79.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/abaya/abaya-5.svg",
    featured: false
  },
  
  // Hijabs
  {
    name: "Premium Cotton Hijab",
    description: "Soft cotton hijab in various colors",
    price: 14.99,
    categoryId: "",
    stock: 50,
    imageUrl: "/src/assets/images/products/hijabs/hijab-1.svg",
    featured: true
  },
  {
    name: "Silk Hijab Collection",
    description: "Luxurious silk hijabs with shine and comfort",
    price: 24.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/hijabs/hijab-2.svg",
    featured: true
  },
  {
    name: "Jersey Hijab",
    description: "Stretchy jersey hijab for active women",
    price: 12.99,
    categoryId: "",
    stock: 55,
    imageUrl: "/src/assets/images/products/hijabs/hijab-3.svg",
    featured: false
  },
  {
    name: "Printed Hijab Set",
    description: "Set of 3 printed hijabs with floral designs",
    price: 34.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/hijabs/hijab-4.svg",
    featured: true
  },
  {
    name: "Winter Hijab",
    description: "Warm winter hijab with fleece lining",
    price: 19.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/src/assets/images/products/hijabs/hijab-5.svg",
    featured: false
  },
  
  // Jilbab
  {
    name: "Traditional Jilbab",
    description: "Classic jilbab with full coverage",
    price: 69.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/jilbab/jilbab-1.svg",
    featured: true
  },
  {
    name: "Modern Jilbab",
    description: "Contemporary jilbab with stylish cuts",
    price: 79.99,
    categoryId: "",
    stock: 20,
    imageUrl: "/src/assets/images/products/jilbab/jilbab-2.svg",
    featured: true
  },
  {
    name: "Lightweight Jilbab",
    description: "Breathable jilbab for summer wear",
    price: 59.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/jilbab/jilbab-3.svg",
    featured: false
  },
  {
    name: "Embroidered Jilbab",
    description: "Beautifully embroidered jilbab for special occasions",
    price: 89.99,
    categoryId: "",
    stock: 15,
    imageUrl: "/src/assets/images/products/jilbab/jilbab-4.svg",
    featured: true
  },
  {
    name: "Casual Jilbab",
    description: "Everyday jilbab with comfortable fit",
    price: 54.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/src/assets/images/products/jilbab/jilbab-5.svg",
    featured: false
  },
  
  // Khimar
  {
    name: "Classic Khimar",
    description: "Traditional khimar with elegant drape",
    price: 49.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/khimar/khimar-1.svg",
    featured: true
  },
  {
    name: "Layered Khimar",
    description: "Multi-layer khimar for added style",
    price: 59.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/khimar/khimar-2.svg",
    featured: true
  },
  {
    name: "Sporty Khimar",
    description: "Active wear khimar for sports and exercise",
    price: 39.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/khimar/khimar-3.svg",
    featured: false
  },
  {
    name: "Fancy Khimar",
    description: "Decorative khimar with embellishments",
    price: 69.99,
    categoryId: "",
    stock: 20,
    imageUrl: "/src/assets/images/products/khimar/khimar-4.svg",
    featured: true
  },
  {
    name: "Simple Khimar",
    description: "Minimalist khimar for daily wear",
    price: 34.99,
    categoryId: "",
    stock: 45,
    imageUrl: "/src/assets/images/products/khimar/khimar-5.svg",
    featured: false
  },
  
  // Nosepiece
  {
    name: "Gold Nosepiece",
    description: "Elegant gold-plated nosepiece with pearls",
    price: 29.99,
    categoryId: "",
    stock: 25,
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-1.svg",
    featured: true
  },
  {
    name: "Silver Nose Ring",
    description: "Beautiful silver nose ring with intricate design",
    price: 24.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-2.svg",
    featured: true
  },
  {
    name: "Diamond Nosepiece",
    description: "Luxury nosepiece with crystal stones",
    price: 49.99,
    categoryId: "",
    stock: 15,
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-3.svg",
    featured: true
  },
  {
    name: "Simple Nose Ring",
    description: "Minimalist nose ring for everyday wear",
    price: 19.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-4.svg",
    featured: false
  },
  {
    name: "Bridal Nosepiece",
    description: "Special bridal nosepiece for weddings",
    price: 59.99,
    categoryId: "",
    stock: 10,
    imageUrl: "/src/assets/images/products/nosepiece/nosepiece-5.svg",
    featured: true
  },
  
  // Alcohol Free Perfumes
  {
    name: "Oud Al Rehab",
    description: "Luxury oud perfume without alcohol",
    price: 39.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/images/products/perfumes/attar-1.jpg",
    featured: true
  },
  {
    name: "Rose Attar",
    description: "Natural rose fragrance in oil base",
    price: 34.99,
    categoryId: "",
    stock: 40,
    imageUrl: "/images/products/perfumes/attar-2.jpg",
    featured: true
  },
  {
    name: "Jasmine Essence",
    description: "Pure jasmine oil perfume",
    price: 32.99,
    categoryId: "",
    stock: 45,
    imageUrl: "/images/products/perfumes/attar-3.jpg",
    featured: false
  },
  {
    name: "Musk Collection",
    description: "Set of 3 musk-based perfumes",
    price: 44.99,
    categoryId: "",
    stock: 30,
    imageUrl: "/images/products/perfumes/attar-1.jpg",
    featured: true
  },
  {
    name: "Sandalwood Oil",
    description: "Premium sandalwood attar",
    price: 37.99,
    categoryId: "",
    stock: 35,
    imageUrl: "/images/products/perfumes/attar-2.jpg",
    featured: false
  }
];

async function addCategoriesAndProducts() {
  try {
    console.log("Starting to add categories and products...");
    
    // Add categories first
    const createdCategories: Category[] = [];
    for (const categoryData of categoriesToAdd) {
      console.log(`Adding category: ${categoryData.name}`);
      const category = await createCategory(categoryData);
      createdCategories.push(category);
      console.log(`Category added: ${category.name} with ID: ${category.id}`);
    }
    
    // Map category names to IDs for product creation
    const categoryMap: Record<string, string> = {};
    for (const category of createdCategories) {
      // Map category names to IDs (we'll match based on partial name)
      if (category.name.includes("Islamic")) categoryMap["Islamic Books"] = category.id;
      else if (category.name.includes("Customization")) categoryMap["Customization"] = category.id;
      else if (category.name.includes("Abaya")) categoryMap["Abaya"] = category.id;
      else if (category.name.includes("Hijabs")) categoryMap["Hijabs"] = category.id;
      else if (category.name.includes("Jilbab")) categoryMap["Jilbab"] = category.id;
      else if (category.name.includes("Khimar")) categoryMap["Khimar"] = category.id;
      else if (category.name.includes("Nosepiece")) categoryMap["Nosepiece"] = category.id;
      else if (category.name.includes("Alcohol")) categoryMap["Alcohol Free Perfumes"] = category.id;
    }
    
    // Add products
    let productCount = 0;
    for (const productData of productsToAdd) {
      // Determine which category this product belongs to
      let categoryId = "";
      if (productData.name.includes("Book") || productData.description.includes("book") || productData.description.includes("literature") || productData.description.includes("Quran") || productData.description.includes("Hadith") || productData.description.includes("Prophet") || productData.description.includes("Islam")) {
        categoryId = categoryMap["Islamic Books"];
      } else if (productData.name.includes("Bottle") || productData.name.includes("Mug") || productData.name.includes("Pen") || productData.name.includes("Wallet") || productData.name.includes("Frame") || productData.name.includes("Keychain") || productData.name.includes("Rehal") || productData.name.includes("Bookmark") || productData.name.includes("Coaster") || productData.name.includes("Stand")) {
        categoryId = categoryMap["Customization"];
      } else if (productData.name.includes("Abaya") || productData.description.includes("abaya")) {
        categoryId = categoryMap["Abaya"];
      } else if (productData.name.includes("Hijab") || productData.description.includes("hijab")) {
        categoryId = categoryMap["Hijabs"];
      } else if (productData.name.includes("Jilbab") || productData.description.includes("jilbab")) {
        categoryId = categoryMap["Jilbab"];
      } else if (productData.name.includes("Khimar") || productData.description.includes("khimar")) {
        categoryId = categoryMap["Khimar"];
      } else if (productData.name.includes("Nose") || productData.description.includes("nose")) {
        categoryId = categoryMap["Nosepiece"];
      } else if (productData.name.includes("Perfume") || productData.name.includes("Attar") || productData.name.includes("Essence") || productData.name.includes("Musk") || productData.name.includes("Sandalwood") || productData.description.includes("perfume") || productData.description.includes("attar")) {
        categoryId = categoryMap["Alcohol Free Perfumes"];
      }
      
      if (!categoryId) {
        console.error(`Could not determine category for product: ${productData.name}`);
        continue;
      }
      
      // Update product data with correct category ID
      const productToAdd = {
        ...productData,
        categoryId: categoryId
      };
      
      console.log(`Adding product: ${productToAdd.name} to category: ${categoryId}`);
      const product = await createProduct(productToAdd);
      productCount++;
      console.log(`Product added: ${product.name} with ID: ${product.id}`);
    }
    
    console.log(`Successfully added ${createdCategories.length} categories and ${productCount} products!`);
  } catch (error) {
    console.error("Error adding categories and products:", error);
  }
}

// Run the function
addCategoriesAndProducts();