export type UserRole = 'USER' | 'ADMIN'
export type DecimalAmount = string
export type ISODateString = string
export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface RegisteredUser extends User {
  createdAt: ISODateString
}

export interface Category {
  id: string
  name: string
  isDefault: boolean
}

export interface Expense {
  id: string
  title: string
  amount: DecimalAmount
  categoryId: string
  category: Category
  date: ISODateString
  paymentMethod: string
  notes: string | null
  userId: string
  createdAt: ISODateString
}

export interface Budget {
  id: string
  amount: DecimalAmount
  month: number
  year: number
  userId: string
}

export interface CategoryInsight {
  categoryId: string
  name: string
  totalExpenses: number
  totalValue: DecimalAmount
}

export interface AdminExpense extends Expense {
  user: Pick<User, 'id' | 'email'>
}

export interface AdminInsights {
  totalRegisteredUsers: number
  totalExpensesRecorded: number
  totalValueOfExpenses: DecimalAmount
  currentMonth: {
    month: number
    year: number
    totalExpenses: number
    totalValue: DecimalAmount
  }
  spendingPerCategory: CategoryInsight[]
  top5Categories: CategoryInsight[]
  bottom5Categories: CategoryInsight[]
  recentExpenses: AdminExpense[]
  recentUsers: RegisteredUser[]
}

export interface Credentials {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

export interface ExpenseFilters {
  searchQuery: string
  categoryId: string
  paymentMethod: string
  startDate: string
  endDate: string
  sortBy: SortBy
  sortOrder: SortOrder
}

export interface PaginatedResponse<Item> {
  items: Item[]
  total: number
  page: number
  limit: number
  totalPages: number
}