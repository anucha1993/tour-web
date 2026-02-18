"use client";

import { useState, useEffect, useCallback } from "react";
import {
  memberPointsApi,
  MemberPointSummary,
  MemberPointTransaction,
  MemberPointLevel,
  MemberPointRule,
} from "@/lib/api";

export default function MemberPointsPage() {
  const [summary, setSummary] = useState<MemberPointSummary | null>(null);
  const [transactions, setTransactions] = useState<MemberPointTransaction[]>([]);
  const [levels, setLevels] = useState<MemberPointLevel[]>([]);
  const [rules, setRules] = useState<MemberPointRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "levels">("overview");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [txnPagination, setTxnPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const fetchSummary = useCallback(async () => {
    try {
      const res = await memberPointsApi.getSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  }, []);

  const fetchHistory = useCallback(
    async (page = 1) => {
      setTxnLoading(true);
      try {
        const res = await memberPointsApi.getHistory({
          type: typeFilter || undefined,
          page,
          per_page: 15,
        });
        if (res.success && res.data) {
          const pg = res.data;
          setTransactions(pg.data);
          setTxnPagination({
            currentPage: pg.current_page,
            lastPage: pg.last_page,
            total: pg.total,
          });
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setTxnLoading(false);
      }
    },
    [typeFilter]
  );

  const fetchLevels = useCallback(async () => {
    try {
      const res = await memberPointsApi.getLevels();
      if (res.success && res.data) {
        setLevels(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch levels:", err);
    }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await memberPointsApi.getRules();
      if (res.success && res.data) {
        setRules(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch rules:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchLevels(), fetchRules()]);
      setLoading(false);
    };
    init();
  }, [fetchSummary, fetchLevels, fetchRules]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(1);
    }
  }, [activeTab, fetchHistory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "earn":
        return "↑";
      case "spend":
        return "↓";
      case "expire":
        return "⏰";
      case "adjust":
        return "⚙️";
      default:
        return "•";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "earn":
        return "text-green-600";
      case "spend":
        return "text-red-600";
      case "expire":
        return "text-gray-400";
      case "adjust":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "earn":
        return "bg-green-50";
      case "spend":
        return "bg-red-50";
      case "expire":
        return "bg-gray-50";
      case "adjust":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 คะแนนสะสม</h1>
        <p className="text-gray-500 text-sm mt-1">
          จัดการคะแนน ดูสิทธิประโยชน์ และแลกส่วนลด
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="space-y-4">
          {/* Main points card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">คะแนนคงเหลือ</p>
                <p className="text-4xl font-bold mt-1">
                  {summary.total_points.toLocaleString()}
                </p>
                <p className="text-amber-200 text-xs mt-1">
                  สะสมทั้งหมด {summary.lifetime_points.toLocaleString()} คะแนน
                </p>
              </div>
              <div className="text-center">
                <span className="text-5xl">{summary.level?.icon || "🏅"}</span>
                <p className="text-sm font-semibold mt-1">
                  {summary.level?.name || "Bronze"}
                </p>
              </div>
            </div>

            {/* Level progress */}
            {summary.next_level && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100">
                    ถัดไป: {summary.next_level.icon} {summary.next_level.name}
                  </span>
                  <span className="font-semibold">
                    {summary.next_level.progress_percent.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(summary.next_level.progress_percent, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-amber-200 mt-1">
                  อีก ฿{Number(summary.next_level.spending_needed).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} เพื่ออัปเกรด
                </p>
              </div>
            )}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">ยอดสั่งซื้อสะสม</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                ฿{Number(summary.lifetime_spending).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">ได้รับเดือนนี้</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                +{summary.this_month_earned.toLocaleString()}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">กำลังหมดอายุ</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {summary.expiring_points.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">ภายใน 30 วัน</p>
            </div>
          </div>

          {/* Level perks */}
          {summary.level && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                สิทธิประโยชน์ระดับ {summary.level.icon} {summary.level.name}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-600">
                    {summary.level.discount_percent}%
                  </p>
                  <p className="text-xs text-gray-500">ส่วนลด</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-amber-600">
                    x{summary.level.point_multiplier}
                  </p>
                  <p className="text-xs text-gray-500">ตัวคูณ</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-purple-600">
                    ฿{summary.level.redemption_rate}
                  </p>
                  <p className="text-xs text-gray-500">ต่อคะแนน</p>
                </div>
              </div>
              {summary.level.benefits && summary.level.benefits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {summary.level.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: "overview", label: "ภาพรวม" },
          { key: "history", label: "ประวัติ" },
          { key: "levels", label: "ระดับสมาชิก" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && summary && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">วิธีสะสมคะแนน</h3>
            <div className="space-y-3">
              {rules.length > 0 ? rules.map((rule) => {
                let desc = '';
                if (rule.calc_type === 'fixed') {
                  desc = `ได้รับ ${rule.points} คะแนน`;
                  if (rule.max_points_per_day) desc += ` (จำกัด ${rule.max_points_per_day}/วัน)`;
                  if (rule.max_points_per_action) desc += ` (สูงสุด ${rule.max_points_per_action}/ครั้ง)`;
                } else {
                  desc = `ได้รับ 1 คะแนนต่อ ${Math.round(100 / Math.max(rule.percent_of_amount, 0.01))} บาท`;
                  if (rule.max_points_per_action) desc += ` (สูงสุด ${rule.max_points_per_action}/ครั้ง)`;
                }
                return (
                  <div key={rule.id} className="flex items-start gap-3">
                    <span className="text-xl">{rule.icon || '🎯'}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rule.name}</p>
                      <p className="text-xs text-gray-500">{rule.description || desc}</p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-gray-400">ไม่มีกฎการให้คะแนนที่เปิดใช้งาน</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {[
              { value: "", label: "ทั้งหมด" },
              { value: "earn", label: "ได้รับ" },
              { value: "spend", label: "ใช้" },
              { value: "expire", label: "หมดอายุ" },
              { value: "adjust", label: "ปรับ" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setTypeFilter(f.value);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === f.value
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Transactions */}
          {txnLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              ยังไม่มีประวัติ
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border border-gray-100 ${getTypeBg(txn.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(txn.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {txn.description || (txn.rule?.name ?? txn.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTypeColor(txn.type)}`}>
                      {txn.points > 0 ? "+" : ""}
                      {txn.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      คงเหลือ {txn.balance_after.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {txnPagination.lastPage > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500">
                หน้า {txnPagination.currentPage} / {txnPagination.lastPage}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchHistory(txnPagination.currentPage - 1)}
                  disabled={txnPagination.currentPage <= 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  ← ก่อนหน้า
                </button>
                <button
                  onClick={() => fetchHistory(txnPagination.currentPage + 1)}
                  disabled={txnPagination.currentPage >= txnPagination.lastPage}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "levels" && (
        <div className="space-y-3">
          {levels.map((level) => {
            const isCurrent = summary?.level?.id === level.id;
            return (
              <div
                key={level.id}
                className={`border rounded-xl p-4 transition-all ${
                  isCurrent
                    ? "border-amber-400 bg-amber-50 shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{level.icon || "🏅"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{level.name}</h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium">
                            ปัจจุบัน
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ฿{Number(level.min_spending).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ขึ้นไป
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-white/70 rounded-lg">
                    <p className="text-sm font-bold text-green-600">
                      {level.discount_percent}%
                    </p>
                    <p className="text-xs text-gray-500">ส่วนลด</p>
                  </div>
                  <div className="text-center p-2 bg-white/70 rounded-lg">
                    <p className="text-sm font-bold text-amber-600">
                      x{level.point_multiplier}
                    </p>
                    <p className="text-xs text-gray-500">ตัวคูณ</p>
                  </div>
                  <div className="text-center p-2 bg-white/70 rounded-lg">
                    <p className="text-sm font-bold text-purple-600">
                      ฿{level.redemption_rate}
                    </p>
                    <p className="text-xs text-gray-500">ต่อคะแนน</p>
                  </div>
                </div>
                {level.benefits && level.benefits.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {level.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
