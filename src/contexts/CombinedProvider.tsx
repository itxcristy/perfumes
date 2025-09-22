import React, { memo, ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { NotificationProvider } from './NotificationContext';
import { ProductProvider } from './ProductContext';
import { CollectionProvider } from './CollectionContext';
import { CompareProvider } from './CompareContext';
import { ErrorProvider } from './ErrorContext';
import { OrderProvider } from './OrderContext';
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
                                        <RecommendationsProvider>
                                            <CartProvider>
                                                <WishlistProvider>
                                                    <CompareProvider>
                                                        <OrderProvider>
                                                            <AddressProvider>
                                                                {children}
                                                            </AddressProvider>
                                                        </OrderProvider>
                                                    </CompareProvider>
                                                </WishlistProvider>
                                            </CartProvider>
                                        </RecommendationsProvider>
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
