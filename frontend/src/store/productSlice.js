import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Async Thunk to fetch filtered products from the backend API
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      // Build search query parameters from filter object
      const queryParams = new URLSearchParams();
      
      const allowedParams = [
        'mainCategory', 
        'subCategory', 
        'tag', 
        'minPrice', 
        'maxPrice', 
        'search', 
        'page', 
        'limit',
        'sortBy',
        'order'
      ];

      Object.keys(filters).forEach(key => {
        if (allowedParams.includes(key) && filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch products');
      }

      return data; // Returns { success: true, count: N, pagination: {...}, data: [...] }
    } catch (error) {
      return rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
);

const initialState = {
  products: [],
  pagination: {
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  },
  loading: false,
  error: null,
  filters: {
    mainCategory: 'Rangoli',
    subCategory: '',
    tag: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    order: 'desc'
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Update individual or multiple filter values
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page !== undefined ? action.payload.page : 1 // Reset to page 1 on filter changes unless explicitly specified
      };
    },
    // Reset filters to default state
    resetFilters: (state) => {
      state.filters = {
        ...initialState.filters
      };
    },
    // Clear error logs
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setFilter, resetFilters, clearError } = productSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;
export const selectActiveFilters = (state) => state.products.filters;

export default productSlice.reducer;
