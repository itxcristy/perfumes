import React, { memo, ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { NotificationProvider } from './NotificationContext';
import { ProductProvider } from './ProductContext'; // Use the correct context
import { CollectionProvider } from './CollectionContext';
import { CompareProvider } from './CompareContext';
import { ErrorProvider } from './ErrorContext';
import { OrderProvider } from './OrderContext'; // Use the correct context
import { AddressProvider } from './AddressContext';
import { RecommendationsProvider } from './RecommendationsContext';
import { ThemeProvider } from './ThemeContext';
import { AuthModalProvider } from './AuthModalContext';

import { SecurityProvider } from '../components/Security/SecurityProvider';

interface CombinedProviderProps {
    children: ReactNode;
}

/**
 * Combined provider that wraps all context providers in a single component
 * This reduces the nesting level and improves performance
 */
export const CombinedProvider = memo<CombinedProviderProps>(({ children }) => {
    return (
        <ErrorProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <SecurityProvider>
                            <AuthModalProvider>
                                <ProductProvider>
                                    <CollectionProvider>
                                        <CartProvider>
                                            <WishlistProvider>
                                                <CompareProvider>
                                                    <OrderProvider>
                                                        <AddressProvider>
                                                            <RecommendationsProvider>
                                                                {children}
                                                            </RecommendationsProvider>
                                                        </AddressProvider>
                                                    </OrderProvider>
                                                </CompareProvider>
                                            </WishlistProvider>
                                        </CartProvider>
                                    </CollectionProvider>
                                </ProductProvider>
                            </AuthModalProvider>
                        </SecurityProvider>
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </ErrorProvider>
    );
});

CombinedProvider.displayName = 'CombinedProvider';