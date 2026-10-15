import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ExpenseFilters, SortBy, SortOrder } from '../types'

export const initialFilters: ExpenseFilters = {
  searchQuery: '',
  categoryId: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  sortBy: 'date',
  sortOrder: 'desc',
}

const filterSlice = createSlice({
  name: 'filters',
  initialState: initialFilters,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setCategoryId: (state, action: PayloadAction<string>) => {
      state.categoryId = action.payload
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload
    },
    resetFilters: () => ({ ...initialFilters }),
  },
})

export const {
  setSearchQuery,
  setCategoryId,
  setPaymentMethod,
  setStartDate,
  setEndDate,
  setSortBy,
  setSortOrder,
  resetFilters,
} = filterSlice.actions

export default filterSlice.reducer
