import { usePublicSettings } from './usePublicSettings';

export const useCartButtonStyles = () => {
  const { getSiteSetting } = usePublicSettings();

  // Get dynamic cart button settings
  const cartButtonText = getSiteSetting('cart_button_text') || 'Add to Cart';
  const cartButtonColor = getSiteSetting('cart_button_color') || '#7e22ce'; // Default purple
  const cartButtonTextColor = getSiteSetting('cart_button_text_color') || '#ffffff'; // Default white

  // Generate dynamic styles
  const cartButtonStyle = {
    backgroundColor: cartButtonColor,
    color: cartButtonTextColor,
  };

  const cartButtonHoverStyle = {
    backgroundColor: cartButtonColor,
    filter: 'brightness(0.9)',
  };

  return {
    cartButtonText,
    cartButtonStyle,
    cartButtonHoverStyle,
  };
};