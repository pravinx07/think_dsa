import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../../hooks/useApi'

type ReviewItem = {
  _id: string
  title: string
  pattern: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  leetcodeUrl: string
  stage: number
  nextReviewAt: string
  reviewCount: number
  lastResult: string | null
}

type QueueData = {
  dueToday: ReviewItem[]
  upcoming: ReviewItem[]
  totalInQueue: number
  todayCount: number
}

const SRS_INTERVALS = [1, 3, 7, 14, 30]

const difficultyStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-400/10 border border-amber-500/20',
  Hard: 'text-red-400 bg-red-400/10 border border-red-500/20',
}

const resultStyle = {
  easy: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  hard: 'bg-amber-500 hover:bg-amber-600 text-white',
  failed: 'bg-red-500 hover:bg-red-600 text-white',
}

const resultLabels = {
  easy: '✓ Got it!',
  hard: '~ Struggled',
  failed: '✗ Failed',
}

const resultTooltips = {
  easy: `Review in ${SRS_INTERVALS[1]} days`,
  hard: 'Review same interval',
  failed: 'Review tomorrow',
}

export default function DailyReview() {
  const { fetchApi } = useApi()
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marking, setMarking] = useState<string | null>(null) // item id being marked
  const [graduated, setGraduated] = useState<string[]>([]) // ids just graduated
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null) // id being removed

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchApi('/review-queue')
      setData(result)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load review queue.')
    } finally {
      setLoading(false)
    }
  }, [fetchApi])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const markReview = async (id: string, result: 'easy' | 'hard' | 'failed') => {
    setMarking(id)
    try {
      const res = await fetchApi(`/review-queue/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ result }),
      })

      if (res.graduated) {
        setGraduated(prev => [...prev, id])
        // Remove from list after animation
        setTimeout(() => {
          setData(prev => prev ? {
            ...prev,
            dueToday: prev.dueToday.filter(i => i._id !== id),
            totalInQueue: prev.totalInQueue - 1,
            todayCount: prev.todayCount - 1,
          } : prev)
        }, 600)
      } else {
        // Move out of today's list
        setData(prev => prev ? {
          ...prev,
          dueToday: prev.dueToday.filter(i => i._id !== id),
          todayCount: prev.todayCount - 1,
        } : prev)
      }
    } catch (err) {
      console.error('Mark review error:', err)
    } finally {
      setMarking(null)
    }
  }

  const removeItem = async (id: string) => {
    setRemoveId(id)
    try {
      await fetchApi(`/review-queue/${id}`, { method: 'DELETE' })
      setData(prev => prev ? {
        ...prev,
        dueToday: prev.dueToday.filter(i => i._id !== id),
        upcoming: prev.upcoming.filter(i => i._id !== id),
        totalInQueue: prev.totalInQueue - 1,
        todayCount: data?.dueToday.some(i => i._id === id) ? prev.todayCount - 1 : prev.todayCount,
      } : prev)
    } catch (err) {
      console.error('Remove error:', err)
    } finally {
      setRemoveId(null)
    }
  }

  const formatDaysUntil = (dateStr: string) => {
    const now = new Date()
    const due = new Date(dateStr)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return `In ${diff} days`
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-sm">📅</div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Daily Review</h3>
            <p className="text-xs text-slate-600">Spaced repetition queue</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-6">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchQueue} className="mt-2 text-xs text-indigo-400 underline">Retry</button>
      </div>
    )
  }

  // ─── Empty queue ──────────────────────────────────────────────────────────
  if (!data || data.totalInQueue === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-sm">📅</div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Daily Review</h3>
            <p className="text-xs text-slate-600">Spaced repetition queue</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <p className="text-2xl">🎉</p>
          <p className="text-slate-300 text-sm font-medium">Queue is empty!</p>
          <p className="text-slate-500 text-xs max-w-xs">
            Problems you struggle with (marked as "Struggled" or "Failed" in history) will appear here for spaced review.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-sm">📅</div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Daily Review</h3>
            <p className="text-xs text-slate-600">Spaced repetition queue • {data.totalInQueue} total</p>
          </div>
        </div>
        {data.todayCount > 0 && (
          <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-500/20 px-2.5 py-1 rounded-full animate-pulse">
            {data.todayCount} due today
          </span>
        )}
      </div>

      {/* Today's due problems */}
      {data.dueToday.length === 0 ? (
        <div className="text-center py-6 glass rounded-xl mb-4">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-slate-300 text-sm font-medium">All done for today!</p>
          <p className="text-slate-500 text-xs mt-1">Great work. Come back tomorrow.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {data.dueToday.map(item => {
            const isGraduating = graduated.includes(item._id)
            const isMarking = marking === item._id
            const isRemoving = removeId === item._id
            const stageLabel = `Stage ${item.stage + 1}/${SRS_INTERVALS.length}`

            return (
              <div
                key={item._id}
                className={`border border-white/5 glass rounded-xl p-4 transition-all duration-500 ${isGraduating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                {/* Problem header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.leetcodeUrl || `https://leetcode.com/problems/${item.title.toLowerCase().replace(/\s+/g, '-')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-100 hover:text-indigo-300 transition-colors truncate block"
                    >
                      {item.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${difficultyStyle[item.difficulty]}`}>
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.pattern}</span>
                      <span className="text-[10px] text-slate-600">{stageLabel}</span>
                      {isGraduating && (
                        <span className="text-[10px] text-yellow-400 font-bold animate-bounce">🎓 Graduated!</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    disabled={isRemoving || isMarking}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors shrink-0 disabled:opacity-40"
                    title="Remove from queue"
                  >
                    ✕
                  </button>
                </div>

                {/* Review result buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'hard', 'failed'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => markReview(item._id, r)}
                      disabled={isMarking || isRemoving}
                      title={resultTooltips[r]}
                      className={`text-xs py-1.5 rounded-lg font-medium transition-all disabled:opacity-40 ${resultStyle[r]}`}
                    >
                      {isMarking ? '...' : resultLabels[r]}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming preview */}
      {data.upcoming.length > 0 && (
        <div>
          <button
            onClick={() => setShowUpcoming(v => !v)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 flex items-center justify-center gap-1"
          >
            {showUpcoming ? '▲ Hide' : '▼ Show'} upcoming ({data.upcoming.length})
          </button>

          {showUpcoming && (
            <div className="space-y-2 mt-2">
              {data.upcoming.map(item => (
                <div key={item._id} className="flex items-center justify-between gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate font-medium">{item.title}</p>
                    <p className="text-[10px] text-slate-600">{item.pattern}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${difficultyStyle[item.difficulty]}`}>
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatDaysUntil(item.nextReviewAt)}
                    </span>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={removeId === item._id}
                      className="text-zinc-600 hover:text-red-400 text-xs transition-colors disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
