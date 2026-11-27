import dashboardRepository from "../repository/dashboard.repository.js";
import {
  getCache,
  setCache,
  getDashboardSummaryCacheKey,
  getDashboardCashflowCacheKey,
} from "../web/redis.js";

const CACHE_TTL_SECONDS = 300;

export interface DashboardWalletItem {
  id: number;
  name: string;
  type: string;
  balance: number;
}

export interface DashboardSummaryResponse {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  walletsCount: number;
  activeBudgetsCount: number;
  wallets: DashboardWalletItem[];
}

export interface CashflowItem {
  date: string;
  income: number;
  expense: number;
  net: number;
}

const getSummary = async (userId: number): Promise<DashboardSummaryResponse> => {
  const cacheKey = getDashboardSummaryCacheKey(userId);
  const cached = await getCache<DashboardSummaryResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const [wallets, monthlyIncomeBigInt, monthlyExpenseBigInt, activeBudgetsCount] =
    await Promise.all([
      dashboardRepository.findWalletsByUserId(userId),
      dashboardRepository.getMonthlyAmountByType(
        userId,
        "INCOME",
        currentMonth,
        currentYear
      ),
      dashboardRepository.getMonthlyAmountByType(
        userId,
        "EXPENSE",
        currentMonth,
        currentYear
      ),
      dashboardRepository.countActiveBudgets(userId, currentMonth, currentYear),
    ]);

  const totalBalanceBigInt = wallets.reduce((acc, w) => acc + w.balance, 0n);

  const summary: DashboardSummaryResponse = {
    totalBalance: Number(totalBalanceBigInt),
    monthlyIncome: Number(monthlyIncomeBigInt),
    monthlyExpense: Number(monthlyExpenseBigInt),
    walletsCount: wallets.length,
    activeBudgetsCount,
    wallets: wallets.map((w) => ({
      id: w.id,
      name: w.name,
      type: w.type,
      balance: Number(w.balance),
    })),
  };

  await setCache(cacheKey, summary, CACHE_TTL_SECONDS);

  return summary;
};

const getCashflow = async (userId: number): Promise<CashflowItem[]> => {
  const cacheKey = getDashboardCashflowCacheKey(userId);
  const cached = await getCache<CashflowItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const transactions =
    await dashboardRepository.findPostedIncomeAndExpenseTransactions(userId);

  const grouped = new Map<string, { income: bigint; expense: bigint }>();

  for (const tx of transactions) {
    const dateKey = tx.date.toISOString().slice(0, 10);
    const current = grouped.get(dateKey) ?? { income: 0n, expense: 0n };

    if (tx.type === "INCOME") {
      current.income += tx.amount;
    } else if (tx.type === "EXPENSE") {
      current.expense += tx.amount;
    }

    grouped.set(dateKey, current);
  }

  const cashflow: CashflowItem[] = Array.from(grouped.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, totals]) => {
      const income = Number(totals.income);
      const expense = Number(totals.expense);
      return {
        date,
        income,
        expense,
        net: income - expense,
      };
    });

  await setCache(cacheKey, cashflow, CACHE_TTL_SECONDS);

  return cashflow;
};

export default {
  getSummary,
  getCashflow,
};
