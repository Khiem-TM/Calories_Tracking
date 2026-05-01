import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useBodyMetricsSummary,
  useBodyMetricsHistory,
  useLatestBodyMetrics,
  useBodyMetricsPhotos,
  useUploadPhoto,
  useDeletePhoto,
  useAddBodyMetrics,
} from '@/features/body-metrics/hooks/useBodyMetrics';
import '@/assets/app.css';
import type { UpsertBodyMetricPayload } from '@/features/body-metrics/services/bodyMetricsService';

function generatePolylinePoints(values: number[], w: number = 300, h: number = 60) {
  if (values.length === 0) return '';
  if (values.length === 1) return `0,${h/2} ${w},${h/2}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = range * 0.1;
  const pMin = min - padding;
  const pMax = max + padding;
  const scaleY = (v: number) => h - ((v - pMin) / (pMax - pMin)) * h;
  const scaleX = (i: number) => (i / (values.length - 1)) * w;

  return values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(' ');
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function bmiToPercent(bmi?: number) {
  if (!bmi) return 0;
  const val = Math.max(10, Math.min(40, bmi));
  return ((val - 10) / 30) * 100;
}

interface MetricForm {
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
}

export default function BodyMetricsPage() {
  const [period] = useState<'month'>('month');
  const { data: latest, isLoading: latestLoading } = useLatestBodyMetrics();
  const { data: summary } = useBodyMetricsSummary();
  const { data: history } = useBodyMetricsHistory(period);
  const { data: photos } = useBodyMetricsPhotos();

  const uploadMut = useUploadPhoto();
  const delMut = useDeletePhoto();
  const addMetricMut = useAddBodyMetrics();

  const { register, handleSubmit, reset } = useForm<MetricForm>();

  const onSubmit = (data: MetricForm) => {
    const payload: UpsertBodyMetricPayload = {
      weightKg: data.weightKg,
      bodyFatPct: data.bodyFatPct,
      waistCm: data.waistCm,
    };
    addMetricMut.mutate(payload, { onSuccess: () => reset() });
  };

  const wHist = (Array.isArray(history) ? history : [])
    .map((h: any) => Number(h.weightKg))
    .filter(Boolean) as number[];

  const bmi = latest?.bmi ? Number(latest.bmi) : undefined;
  const weight = latest?.weightKg ? Number(latest.weightKg) : undefined;
  const bodyFat = latest?.bodyFatPct ? Number(latest.bodyFatPct) : undefined;

  if (latestLoading) return <div>Đang tải...</div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Chỉ số Cơ thể</h1>
          <p>Theo dõi sự thay đổi theo thời gian thực</p>
        </div>
      </div>

      <div className="metric-grid">
        {/* BMI */}
        <div className="metric-card card">
          <h3>Chỉ số BMI</h3>
          <div className="bmi-gauge">
            <div className="bmi-value">{bmi ? bmi.toFixed(1) : '--'}</div>
            <div className="bmi-label">
              {bmi ? (
                bmi < 18.5 ? 'Thiếu cân' :
                bmi < 24.9 ? 'Bình thường' :
                bmi < 29.9 ? 'Thừa cân' : 'Béo phì'
              ) : 'Chưa có dữ liệu'}
            </div>
            <div className="bmi-scale">
              <div className="bmi-scale-bar">
                <div className="bmi-scale-zone" style={{width:'25%',background:'var(--warning)'}}></div>
                <div className="bmi-scale-zone" style={{width:'30%',background:'var(--primary)'}}></div>
                <div className="bmi-scale-zone" style={{width:'20%',background:'var(--warning)'}}></div>
                <div className="bmi-scale-zone" style={{width:'25%',background:'var(--danger)'}}></div>
                {bmi && (
                  <div className="bmi-marker" style={{ left: `${bmiToPercent(bmi)}%` }}></div>
                )}
              </div>
              <div className="bmi-scale-labels">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="metric-card card">
          <div className="card-header-flex">
            <h3>Cân nặng</h3>
            <span className="trend positive">
              {summary?.weightChange != null
                ? `${summary.weightChange > 0 ? '+' : ''}${Number(summary.weightChange).toFixed(1)}kg`
                : '-'}
            </span>
          </div>
          <div className="metric-huge">{weight ?? '--'} <span>kg</span></div>
          <div className="chart-container">
            <svg width="100%" height="80" preserveAspectRatio="none" viewBox="0 0 300 60">
              <polyline
                points={generatePolylinePoints(wHist)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Body fat */}
        <div className="metric-card card">
          <div className="card-header-flex">
            <h3>Tỷ lệ mỡ</h3>
          </div>
          <div className="metric-huge">{bodyFat ?? '--'} <span>%</span></div>
          <div className="chart-container">
            <svg width="100%" height="80" preserveAspectRatio="none" viewBox="0 0 300 60">
              <polyline points="0,50 300,50" fill="none" stroke="var(--warning)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card mt-24">
        <h3>Cập nhật chỉ số hôm nay</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="metrics-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div className="form-group">
            <label>Cân nặng (kg)</label>
            <input type="number" step="0.1" {...register('weightKg', { required: true, valueAsNumber: true })} className="input" />
          </div>
          <div className="form-group">
            <label>Tỷ lệ mỡ (%) <span className="text-muted">(Tùy chọn)</span></label>
            <input type="number" step="0.1" {...register('bodyFatPct', { valueAsNumber: true })} className="input" />
          </div>
          <div className="form-group">
            <label>Vòng eo (cm) <span className="text-muted">(Tùy chọn)</span></label>
            <input type="number" step="0.1" {...register('waistCm', { valueAsNumber: true })} className="input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addMetricMut.isPending}>
              {addMetricMut.isPending ? 'Đang lưu...' : 'Lưu chỉ số'}
            </button>
          </div>
        </form>
      </div>

      {/* Photos */}
      <div className="card mt-24">
        <div className="card-header-flex" style={{ marginBottom: '16px' }}>
          <h3>Hình ảnh tiến độ</h3>
          <label className="btn btn-ghost2 btn-sm" style={{ cursor: 'pointer' }}>
            + Thêm ảnh
            <input type="file" hidden accept="image/*" onChange={(e) => {
              if (e.target.files?.[0]) {
                const fd = new FormData();
                fd.append('file', e.target.files[0]);
                uploadMut.mutate(fd, { onSuccess: () => { e.target.value = ''; } });
              }
            }} />
          </label>
        </div>

        <div className="progress-photos">
          {(Array.isArray(photos) ? photos : []).map((photo: any) => (
            <div className="photo-card" key={photo.id}>
              <img src={photo.url} alt="Progress" />
              <div className="photo-date">{formatDate(photo.takenAt || photo.createdAt)}</div>
              <button className="photo-del" onClick={() => {
                if (confirm('Xóa ảnh này?')) delMut.mutate(photo.id);
              }}>X</button>
            </div>
          ))}
          {!Array.isArray(photos) || photos.length === 0 ? (
            <div className="text-muted" style={{ padding: '24px 0', textAlign: 'center', gridColumn: '1 / -1' }}>
              Chưa có ảnh. Thêm ảnh để theo dõi sự thay đổi ngoại hình!
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
