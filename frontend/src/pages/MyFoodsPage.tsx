import { useState } from 'react'
import { Link } from 'react-router-dom'
// import { Plus, Heart, ChefHat } from 'lucide-react'
import { ListSkeleton } from '@/components/common/LoadingSkeleton'
import { useCustomFoods, useFavoriteFoods } from '@/features/food/hooks/useFood'
import type { Food } from '@/types/api'
import '@/assets/myfoods.css'

const getFoodEmoji = (foodName: string) => {
  const map: Record<string, string> = {
    'cơm': '🍚', 'phở': '🍜', 'chuối': '🍌', 'bơ': '🥑', 'táo': '🍎',
    'cam': '🍊', 'bánh': '🥐', 'trứng': '🥚', 'sữa': '🥛', 'thịt': '🥩',
    'salad': '🥗', 'nước': '🥤', 'gà': '🍗'
  }
  const nameLower = foodName.toLowerCase()
  for (const [key, emoji] of Object.entries(map)) {
    if (nameLower.includes(key)) return emoji
  }
  return '🍽️'
}

export default function MyFoodsPage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'custom'>('favorites')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: customData, isLoading: loadingCustom } = useCustomFoods()
  const { data: favData, isLoading: loadingFavs } = useFavoriteFoods()

  const customFoods: Food[] = Array.isArray(customData) ? customData : (customData?.items ?? [])
  const favFoods: Food[] = Array.isArray(favData) ? favData : (favData?.items ?? [])

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Thực phẩm của tôi</h1>
          <p>Yêu thích và thực phẩm tự tạo</p>
        </div>
        <div className="topbar-right">
          <div className="input-wrap" style={{ width: 220, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input className="input" placeholder="Tìm thực phẩm..." style={{ fontSize: 13, padding: '8px 8px 8px 34px', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <Link to="/create-food" className="btn btn-primary btn-sm">+ Tạo món mới</Link>
        </div>
      </div>

      <div className="content">
        <div className="page-tabs" id="page-tabs">
          <div className={`page-tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            ❤️ Yêu thích <span style={{ background: 'var(--green-light)', color: 'var(--green-mid)', borderRadius: 100, padding: '1px 8px', fontSize: 11, marginLeft: 4 }}>{favFoods.length}</span>
          </div>
          <div className={`page-tab ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
            🧑‍🍳 Tự tạo <span style={{ background: 'var(--green-light)', color: 'var(--green-mid)', borderRadius: 100, padding: '1px 8px', fontSize: 11, marginLeft: 4 }}>{customFoods.length}</span>
          </div>
        </div>

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{favFoods.length} món đã yêu thích</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost2 btn-sm" onClick={() => setViewMode('grid')} style={{ padding: '7px 12px', background: viewMode === 'grid' ? 'var(--green-light)' : '' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="0" y="8" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
                </button>
                <button className="btn btn-ghost2 btn-sm" onClick={() => setViewMode('list')} style={{ padding: '7px 12px', background: viewMode === 'list' ? 'var(--green-light)' : '' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/></svg>
                </button>
              </div>
            </div>

            {loadingFavs ? <ListSkeleton count={4} /> : favFoods.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🤍</div>
                <h3>Chưa có thực phẩm yêu thích</h3>
                <p>Nhấn nút tim ở các món ăn để lưu vào danh sách yêu thích.</p>
              </div>
            ) : (
              viewMode === 'grid' ? (
                <div className="food-grid fade-up">
                  {favFoods.map(food => (
                    <div className="food-card" key={food.id}>
                      <div className="food-card-img">{getFoodEmoji(food.name)}</div>
                      <button className="fav-pill">❤️ Yêu thích</button>
                      <div className="food-card-body">
                        <div className="food-card-name">{food.name}</div>
                        <div className="food-card-brand">{food.category || 'Món ăn'}</div>
                        <div className="food-card-macros">
                          <div className="macro-mini"><div className="v">{food.calories}</div><div className="l">kcal</div></div>
                          <div className="macro-mini"><div className="v">{food.carbs}g</div><div className="l">Carbs</div></div>
                          <div className="macro-mini"><div className="v">{food.protein}g</div><div className="l">Protein</div></div>
                          <div className="macro-mini"><div className="v">{food.fat}g</div><div className="l">Fat</div></div>
                        </div>
                      </div>
                      <div className="food-card-actions">
                        <button className="action-btn">Chi tiết</button>
                        <button className="action-btn add">+ Thêm</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fade-up">
                  {favFoods.map(food => (
                    <div className="food-list-row" key={food.id}>
                      <div className="fl-avatar">{getFoodEmoji(food.name)}</div>
                      <div className="fl-info"><div className="fl-name">{food.name}</div><div className="fl-sub">{food.category || 'Món ăn'}</div><div className="fl-macros"><span>C: {food.carbs}g</span><span>P: {food.protein}g</span><span>F: {food.fat}g</span></div></div>
                      <div><div className="fl-cal">{food.calories}</div><div className="fl-cal-unit">kcal/{food.servingSize || 100}g</div></div>
                      <div className="fl-btns">
                        <button className="icon-btn danger" title="Bỏ yêu thích">🤍</button>
                        <button className="add-round">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* CUSTOM TAB */}
        {activeTab === 'custom' && (
          <div className="fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{customFoods.length} món tự tạo</div>
            </div>

            {loadingCustom ? <ListSkeleton count={4} /> : customFoods.length === 0 ? (
              <div className="empty-state">
                <div className="icon">👨‍🍳</div>
                <h3>Chưa có thực phẩm tự tạo</h3>
                <p>Tạo món ăn riêng của bạn để dễ dàng theo dõi lượng calories.</p>
                <Link to="/create-food" className="btn btn-primary btn-sm" style={{ marginTop: 14, display: 'inline-flex' }}>+ Tạo món mới</Link>
              </div>
            ) : (
              <div>
                {customFoods.map(food => (
                  <div className="food-list-row" key={food.id}>
                    <div className="fl-avatar" style={{ background: '#fef3e2' }}>{getFoodEmoji(food.name)}</div>
                    <div className="fl-info">
                      <div className="fl-name">{food.name}</div>
                      <div className="fl-sub">Tự tạo</div>
                      <div className="fl-macros"><span>C: {food.carbs}g</span><span>P: {food.protein}g</span><span>F: {food.fat}g</span></div>
                    </div>
                    <div><div className="fl-cal">{food.calories}</div><div className="fl-cal-unit">kcal/{food.servingSize || 100}g</div></div>
                    <div className="fl-btns">
                      <Link to={`/create-food?id=${food.id}`} className="icon-btn" title="Chỉnh sửa">
                        <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                      </Link>
                      <button className="icon-btn danger" title="Xóa">
                        <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 7v3M8 7v3M3 4l.8 7.2a1 1 0 001 .8h4.4a1 1 0 001-.8L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="add-round">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
