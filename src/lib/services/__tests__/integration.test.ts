import { describe, it, expect } from 'vitest';
import { NewProductService } from '../NewProductService';
import { NewCategoryService } from '../NewCategoryService';
import { NewUserService } from '../NewUserService';
import { NewOrderService } from '../NewOrderService';

describe('Service Integration', () => {
  it('should be able to instantiate all new services', () => {
    const productService = new NewProductService();
    const categoryService = new NewCategoryService();
    const userService = new NewUserService();
    const orderService = new NewOrderService();
    
    expect(productService).toBeInstanceOf(NewProductService);
    expect(categoryService).toBeInstanceOf(NewCategoryService);
    expect(userService).toBeInstanceOf(NewUserService);
    expect(orderService).toBeInstanceOf(NewOrderService);
  });

  it('should have the expected methods', () => {
    const productService = new NewProductService();
    const categoryService = new NewCategoryService();
    const userService = new NewUserService();
    const orderService = new NewOrderService();
    
    // Check ProductService methods
    expect(typeof productService.getProducts).toBe('function');
    expect(typeof productService.getProductById).toBe('function');
    expect(typeof productService.getProductBySlug).toBe('function');
    expect(typeof productService.getFeaturedProducts).toBe('function');
    expect(typeof productService.createProduct).toBe('function');
    expect(typeof productService.updateProduct).toBe('function');
    expect(typeof productService.deleteProduct).toBe('function');
    
    // Check CategoryService methods
    expect(typeof categoryService.getCategories).toBe('function');
    expect(typeof categoryService.getCategoryById).toBe('function');
    expect(typeof categoryService.getCategoryBySlug).toBe('function');
    expect(typeof categoryService.createCategory).toBe('function');
    expect(typeof categoryService.updateCategory).toBe('function');
    expect(typeof categoryService.deleteCategory).toBe('function');
    
    // Check UserService methods
    expect(typeof userService.getUserById).toBe('function');
    expect(typeof userService.createUser).toBe('function');
    expect(typeof userService.updateUser).toBe('function');
    expect(typeof userService.deleteUser).toBe('function');
    
    // Check OrderService methods
    expect(typeof orderService.createOrder).toBe('function');
    expect(typeof orderService.createGuestOrder).toBe('function');
    expect(typeof orderService.getOrderById).toBe('function');
    expect(typeof orderService.getUserOrders).toBe('function');
    expect(typeof orderService.updateOrderStatus).toBe('function');
  });
});