import { Category } from "../types";

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Premium Fragrances",
    description: "Luxurious and sophisticated scents crafted with the finest ingredients for special occasions and evening wear.",
    image: "/images/categories/premium-fragrances.jpg",
    parentId: "",
    isActive: true,
    sortOrder: 1,
    productCount: 24,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: "2",
    name: "Everyday Scents",
    description: "Fresh and invigorating fragrances perfect for daily use and daytime activities.",
    image: "/images/categories/everyday-scents.jpg",
    parentId: "",
    isActive: true,
    sortOrder: 2,
    productCount: 36,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: "3",
    name: "Seasonal Collections",
    description: "Limited edition fragrances created for specific seasons and holidays.",
    image: "/images/categories/seasonal-collections.jpg",
    parentId: "",
    isActive: true,
    sortOrder: 3,
    productCount: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: "4",
    name: "Unisex Fragrances",
    description: "Versatile scents designed to appeal to all genders, featuring balanced compositions of floral, woody, and fresh notes.",
    image: "/images/categories/unisex-fragrances.jpg",
    parentId: "",
    isActive: true,
    sortOrder: 4,
    productCount: 28,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: "books-1",
    name: "Islamic Books",
    description: "Collection of Islamic books and literature",
    image: "/images/products/islamic-books/placeholder-book-cover-1.svg",
    parentId: "",
    isActive: true,
    sortOrder: 5,
    productCount: 34,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  }
];