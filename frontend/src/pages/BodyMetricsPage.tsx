import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { Info, ArrowDown, ArrowUp, Plus, Camera, Trash2 } from 'lucide-react';
import {
  useBodyMetricsSummary,
  useBodyMetricsHistory,
  useLatestBodyMetrics,
  useBodyMetricsPhotos,
  useUploadPhoto,
  useDeletePhoto,
  useAddBodyMetrics,
} from '@/features/body-metrics/hooks/useBodyMetrics';
import type { UpsertBodyMetricPayload } from '@/features/body-metrics/services/bodyMetricsService';

type TimeRange = 'week' | 'month' | '3months' | 'year';

type BodyMetricInput = {
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  neckCm?: number;
};

// --- COMPONENTS ---

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <h1 className="text-[32px] font-serif font-bold text-[#0E5B43] mb-1">{title}</h1>
    <p className="text-[15px] text-[#8A8A8A] font-medium">{subtitle}</p>
  </div>
);

const TimeRangeTabs = ({ value, onChange }: { value: TimeRange; onChange: (val: TimeRange) => void }) => {
  const tabs = [
    { id: 'week', label: '7 Ngày' },
    { id: 'month', label: '1 Tháng' },
    { id: '3months', label: '3 Tháng' },
    { id: 'year', label: '1 Năm' },
  ] as const;

  return (
    <div className="flex gap-1 bg-[#EBE8E0] p-1.5 rounded-full w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-200 ${
            value === t.id
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1B1B1B]'
              : 'text-[#8A8A8A] hover:text-[#1B1B1B]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

const BMICard = ({ bmi }: { bmi?: number }) => {
  const getStatus = (val: number) => {
    if (val < 18.5) return { label: 'Thiếu cân', color: 'bg-blue-400', pct: Math.max(0, (val - 10) / 30 * 100) };
    if (val < 24.9) return { label: 'Bình thường', color: 'bg-[#7ED957]', pct: (val - 10) / 30 * 100 };
    if (val < 29.9) return { label: 'Thừa cân', color: 'bg-amber-400', pct: (val - 10) / 30 * 100 };
    return { label: 'Béo phì', color: 'bg-red-500', pct: Math.min(100, (val - 10) / 30 * 100) };
  };

  const status = bmi ? getStatus(bmi) : null;

  return (
    <div className="bg-[#FFFFFF] rounded-[24px] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[12px] font-bold tracking-[0.08em] text-[#8A8A8A] uppercase">BMI</span>
        <Info className="w-[18px] h-[18px] text-[#8A8A8A]" />
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-[48px] font-serif font-bold text-[#1B1B1B] leading-none mb-3">
          {bmi ? bmi.toFixed(1) : '--'}
        </div>
        {status ? (
          <div className={`px-5 py-1.5 rounded-full text-[13px] font-bold text-white shadow-sm ${status.color}`}>
            {status.label}
          </div>
        ) : (
          <div className="px-5 py-1.5 rounded-full text-[13px] font-bold text-[#8A8A8A] bg-[#EBE8E0]">
            Chưa có
          </div>
        )}
      </div>
      <div className="mt-8 relative w-full h-[6px] rounded-full bg-gradient-to-r from-blue-400 via-[#7ED957] to-red-500">
        {status && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[4px] border-[#0E5B43] shadow-md transition-all duration-1000"
            style={{ left: `calc(${status.pct}% - 9px)` }}
          />
        )}
      </div>
    </div>
  );
};

const WeightCard = ({
  currentWeight,
  change,
  chartData,
}: {
  currentWeight?: number;
  change?: number;
  chartData: { weight: number }[];
}) => {
  return (
    <div className="bg-[#FFFFFF] rounded-[24px] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden relative hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[12px] font-bold tracking-[0.08em] text-[#8A8A8A] uppercase">Cân nặng</span>
        {change != null && change !== 0 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold ${change > 0 ? 'bg-red-50 text-red-600' : 'bg-[#F2FCEE] text-[#7ED957]'}`}>
            {change > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {Math.abs(change).toFixed(1)} kg
          </div>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-[48px] font-serif font-bold text-[#1B1B1B] flex items-baseline gap-2 leading-none">
          {currentWeight ?? '--'} <span className="text-[20px] font-sans font-medium text-[#8A8A8A]">kg</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[60%] opacity-90">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ED957" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7ED957" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#0E5B43"
              strokeWidth={2.5}
              fill="url(#weightGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const BodyFatCard = ({ percentage }: { percentage?: number }) => {
  const dash = percentage ? (percentage / 100) * 251 : 0;

  return (
    <div className="bg-[#FFFFFF] rounded-[24px] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="w-full text-left mb-4">
        <span className="text-[12px] font-bold tracking-[0.08em] text-[#8A8A8A] uppercase">Tỷ lệ mỡ</span>
      </div>
      <div className="relative w-[140px] h-[140px] flex items-center justify-center my-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#F4F1EA" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#7ED957"
            strokeWidth="10"
            strokeDasharray={`${dash} 251`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-[32px] font-serif font-bold text-[#1B1B1B]">{percentage ?? '--'}%</span>
        </div>
      </div>
    </div>
  );
};

const MetricMiniCard = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="bg-[#FFFFFF] rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform duration-300">
    <div className="text-[11px] font-bold tracking-[0.08em] text-[#8A8A8A] uppercase mb-3">{label}</div>
    <div className="text-[24px] font-serif font-bold text-[#1B1B1B] flex items-baseline gap-1.5">
      {value} {unit && <span className="text-[13px] font-sans font-medium text-[#8A8A8A]">{unit}</span>}
    </div>
  </div>
);

const MetricsUpdateForm = ({
  isPending,
  onSubmit,
}: {
  isPending: boolean;
  onSubmit: (data: BodyMetricInput) => void;
}) => {
  const { register, handleSubmit, reset } = useForm<BodyMetricInput>();

  const submitHandler = (data: BodyMetricInput) => {
    onSubmit(data);
    reset();
  };

  const fields = [
    { name: 'weightKg', label: 'Cân nặng', unit: 'kg', required: true },
    { name: 'bodyFatPct', label: 'Tỷ lệ mỡ', unit: '%' },
    { name: 'waistCm', label: 'Vòng eo', unit: 'cm' },
    { name: 'hipCm', label: 'Vòng mông', unit: 'cm' },
    { name: 'chestCm', label: 'Vòng ngực', unit: 'cm' },
    { name: 'neckCm', label: 'Vòng cổ', unit: 'cm' },
  ] as const;

  return (
    <div className="bg-[#EBF5EE] rounded-[28px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <h3 className="text-[22px] font-serif font-bold text-[#0E5B43] mb-2">Cập nhật chỉ số hôm nay</h3>
      <p className="text-[14px] text-[#5D7B6F] font-medium mb-8">Nhập dữ liệu mới để theo dõi tiến độ.</p>

      <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {fields.map((f) => (
            <div key={f.name} className="space-y-2.5">
              <label className="text-[13px] font-bold text-[#1B1B1B] block">{f.label}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register(f.name as any, { required: f.required, valueAsNumber: true })}
                  className="w-full bg-[#FFFFFF] border border-[#DCE8E1] rounded-[16px] px-5 py-3.5 text-[15px] font-medium text-[#1B1B1B] placeholder-[#A0AAB2] focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all"
                  placeholder="0.0"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] text-[#8A8A8A] font-semibold">
                  {f.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#0E5B43] hover:bg-[#0A4231] text-white px-8 py-3.5 rounded-full text-[14px] font-bold transition-colors disabled:opacity-70 shadow-lg flex items-center gap-2"
          >
            {isPending ? 'Đang lưu...' : 'Lưu chỉ số'}
          </button>
        </div>
      </form>
    </div>
  );
};

const WeightHistoryTimeline = ({ history }: { history: any[] }) => {
  const formatDateStr = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()} Tháng ${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[28px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)] h-full">
      <h3 className="text-[22px] font-serif font-bold text-[#0E5B43] mb-10">Lịch sử cân nặng</h3>
      <div className="relative pl-8 space-y-12 before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:h-full before:bg-[#F4F1EA] max-h-[420px] overflow-y-auto pr-2">
        {history.map((item, i) => {
          const prev = history[i + 1];
          const diff = prev ? (Number(item.weightKg) - Number(prev.weightKg)).toFixed(1) : null;

          return (
            <div key={item.id || item.recordedAt || i} className="relative group">
              <div
                className={`absolute left-[-32px] top-5 w-[16px] h-[16px] rounded-full border-[3.5px] border-white z-10 ${
                  i === 0 ? 'bg-[#7ED957] shadow-[0_0_0_6px_rgba(126,217,87,0.15)]' : 'bg-[#D1D5DB]'
                }`}
              />
              <div className="bg-[#F9F8F5] p-5 rounded-[20px] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#EBE8E0]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-bold text-[#8A8A8A] mb-1.5">
                      {i === 0 ? 'Hôm nay' : formatDateStr(item.recordedAt)}
                    </div>
                    <div className="text-[28px] font-serif font-bold text-[#1B1B1B] leading-none mt-1">
                      {item.weightKg} <span className="text-[16px] font-sans font-medium text-[#8A8A8A]">kg</span>
                    </div>
                  </div>
                  {diff && (
                    <div className={`text-[13px] font-bold mt-1 ${Number(diff) > 0 ? 'text-red-500' : 'text-[#0E5B43]'}`}>
                      {Number(diff) > 0 ? '+' : ''}
                      {diff} kg
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {history.length === 0 && <div className="text-[#8A8A8A] text-[14px] font-medium">Chưa có dữ liệu lịch sử.</div>}
      </div>
    </div>
  );
};

const ProgressPhotoCard = ({ photo, index, onDel }: { photo: any; index: number; onDel: () => void }) => {
  const dateStr = new Date(photo.takenAt || photo.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-[#F4F1EA]">
      <img src={photo.url} alt="Progress" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B]/90 via-black/20 to-transparent opacity-90" />
      <div className="absolute bottom-5 left-5 right-5 text-white">
        <div className="text-[11px] font-bold tracking-widest mb-1 uppercase text-[#FFFFFF] opacity-80">
          {index === 0 ? 'Sau' : 'Trước'}
        </div>
        <div className="text-[15px] font-medium">{index === 0 ? 'Hôm nay' : dateStr}</div>
      </div>
      <button
        onClick={onDel}
        className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
      >
        <Trash2 className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
};

const UploadPhotoCard = ({ onUpload }: { onUpload: (fd: FormData) => void }) => (
  <label className="aspect-[3/4] rounded-[24px] border-[2px] border-dashed border-[#DCE8E1] hover:border-[#7ED957] bg-[#F9F8F5] transition-colors flex flex-col items-center justify-center cursor-pointer text-[#8A8A8A] hover:text-[#0E5B43] group">
    <div className="p-4 rounded-full bg-white group-hover:bg-[#EAF5EC] transition-colors mb-4 shadow-sm border border-[#F4F1EA]">
      <Camera className="w-[22px] h-[22px] text-[#1B1B1B] group-hover:text-[#0E5B43]" />
    </div>
    <span className="text-[14px] font-bold text-[#1B1B1B]">Thêm ảnh mới</span>
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          const fd = new FormData();
          fd.append('file', e.target.files[0]);
          onUpload(fd);
        }
      }}
    />
  </label>
);

// --- MAIN PAGE ---

export default function BodyMetricsPage() {
  const [period, setPeriod] = useState<TimeRange>('month');

  const { data: latest, isLoading } = useLatestBodyMetrics();
  const { data: summary } = useBodyMetricsSummary();
  const { data: history } = useBodyMetricsHistory(period);
  const { data: photos } = useBodyMetricsPhotos();

  const uploadMut = useUploadPhoto();
  const delMut = useDeletePhoto();
  const addMetricMut = useAddBodyMetrics();

  const handleUpdateMetrics = (data: BodyMetricInput) => {
    addMetricMut.mutate(data);
  };

  const wHist = useMemo(() => {
    const arr = Array.isArray(history) ? history : [];
    return arr
      .map((h: any) => ({ weight: Number(h.weightKg), date: h.recordedAt }))
      .filter((d) => !isNaN(d.weight))
      .reverse();
  }, [history]);

  if (isLoading) {
    return (
      <div className="p-8 text-[#0E5B43] flex justify-center items-center h-screen font-medium bg-[#F4F1EA]">
        Đang tải dữ liệu...
      </div>
    );
  }

  const bmi = latest?.bmi ? Number(latest.bmi) : undefined;
  const weight = latest?.weightKg ? Number(latest.weightKg) : undefined;
  const bodyFat = latest?.bodyFatPct ? Number(latest.bodyFatPct) : undefined;
  const bmr = latest?.bmr ? Number(latest.bmr) : undefined;
  const tdee = latest?.tdee ? Number(latest.tdee) : undefined;
  const waist = latest?.waistCm ? Number(latest.waistCm) : undefined;
  const hip = latest?.hipCm ? Number(latest.hipCm) : undefined;
  const hipToWaist = waist && hip ? (waist / hip).toFixed(2) : undefined;

  return (
    <div className="bg-[#F4F1EA] -mt-7 -mx-8 -mb-7 px-8 py-7 font-sans text-[#1B1B1B]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
        
        {/* Header + TimeRangeTabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <PageHeader title="Chỉ số Cơ thể" subtitle="Theo dõi sự thay đổi theo thời gian thực" />
          <TimeRangeTabs value={period} onChange={setPeriod} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <BMICard bmi={bmi} />
          <WeightCard currentWeight={weight} change={summary?.weightChange} chartData={wHist} />
          <BodyFatCard percentage={bodyFat} />
        </div>

        {/* Minor Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricMiniCard label="BMR" value={bmr ? Math.round(bmr).toLocaleString() : '--'} unit="kcal/ngày" />
          <MetricMiniCard label="TDEE" value={tdee ? Math.round(tdee).toLocaleString() : '--'} unit="kcal/ngày" />
          <MetricMiniCard label="Vòng eo" value={waist ? waist.toString() : '--'} unit="cm" />
          <MetricMiniCard label="Hip-to-waist" value={hipToWaist ?? '--'} />
        </div>

        {/* BodyMetricsSection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            <MetricsUpdateForm isPending={addMetricMut.isPending} onSubmit={handleUpdateMetrics} />
          </div>
          <div className="lg:col-span-4">
            <WeightHistoryTimeline history={Array.isArray(history) ? history : []} />
          </div>
        </div>

        {/* ProgressPhotos */}
        <div className="bg-[#FFFFFF] rounded-[28px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)] mt-2">
          <div className="flex justify-between items-center mb-8">
            <PageHeader title="Ảnh tiến độ" subtitle="So sánh hình ảnh qua các giai đoạn." />
            <label className="bg-white border border-[#EBE8E0] hover:border-[#0E5B43] hover:bg-[#F9F8F5] text-[#1B1B1B] px-5 py-2.5 rounded-full text-[14px] font-bold transition-all cursor-pointer flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <Plus className="w-4 h-4 text-[#0E5B43]" />
              Thêm ảnh
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const fd = new FormData();
                    fd.append('file', e.target.files[0]);
                    uploadMut.mutate(fd);
                  }
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(Array.isArray(photos) ? photos : []).map((photo: any, idx: number) => (
               <ProgressPhotoCard
                key={photo.id}
                photo={photo}
                index={idx}
                onDel={() => {
                  if (confirm('Xóa ảnh này?')) delMut.mutate(photo.id);
                }}
              />
            ))}
            <UploadPhotoCard onUpload={(fd) => uploadMut.mutate(fd)} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-y-auto::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .overflow-y-auto {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}
