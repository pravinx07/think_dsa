import { useState } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useData } from '../../contexts/DataContext'
import { useApi } from '../../hooks/useApi'

type Problem = {
  title: string
  url: string
  difficulty: 'Easy' | 'Medium'
  why?: string
}

type PatternEntry = {
  name: string
  mastery: number
  solved: number
  color?: string
}

type TargetState = {
  loading: boolean
  error: string | null
  problems: Problem[]
}

const difficultyStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-400/10 border border-amber-500/20',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl text-sm">
        <p className="font-bold text-slate-100 mb-1">{d.pattern}</p>
        <p className="text-indigo-400 font-semibold">{d.mastery}% Mastery</p>
        <p className="text-slate-500 text-xs mt-1">{d.solved} problems solved</p>
      </div>
    )
  }
  return null
}

export default function PatternRadarChart() {
  const { data } = useData()
  const { fetchApi } = useApi()

  // Map real backend patterns into chart-friendly format
  const patterns: PatternEntry[] = data.patterns || []

  const chartData = patterns.map((p) => ({
    pattern: p.name,
    mastery: Math.round(p.mastery),
    solved: p.solved,
  }))

  // Top 2 weakest patterns (mastery < 60%), sorted ascending
  const weakestPatterns = [...patterns]
    .filter((p) => p.mastery < 60)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 2)

  // Per-pattern state for AI-generated problem suggestions
  const [targetStates, setTargetStates] = useState<Record<string, TargetState>>({})

  const fetchProblems = async (patternName: string) => {
    // If already loaded or loading, skip
    if (targetStates[patternName]?.problems.length || targetStates[patternName]?.loading) return

    setTargetStates((prev) => ({
      ...prev,
      [patternName]: { loading: true, error: null, problems: [] },
    }))

    try {
      const result = await fetchApi(`/dashboard/targeted-problems?pattern=${encodeURIComponent(patternName)}`)
      setTargetStates((prev) => ({
        ...prev,
        [patternName]: { loading: false, error: null, problems: result.problems ?? [] },
      }))
    } catch (err: any) {
      setTargetStates((prev) => ({
        ...prev,
        [patternName]: {
          loading: false,
          error: err?.message ?? 'Failed to load suggestions.',
          problems: [],
        },
      }))
    }
  }

  const hasNoData = patterns.length === 0

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm">
          🕸️
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pattern Radar</h3>
          <p className="text-xs text-slate-600">Your DSA mastery across all patterns</p>
        </div>
      </div>

      {/* No data state */}
      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <p className="text-3xl">🕸️</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Solve some problems and use hints to populate your radar chart!
          </p>
        </div>
      ) : (
        <>
          {/* Radar Chart — fully driven by real backend data */}
          <div className="h-72 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="pattern"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  dot={{ fill: '#818cf8', r: 4 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weakness Targeting — only shown if weak patterns exist */}
          {weakestPatterns.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-white/5" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  🎯 Targeted Practice
                </p>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <p className="text-xs text-slate-500 mb-4 text-center">
                Your weakest patterns — click to get AI-curated problems to level up fast.
              </p>

              <div className="space-y-4">
                {weakestPatterns.map((weak) => {
                  const state = targetStates[weak.name]
                  const isLoaded = (state?.problems.length ?? 0) > 0
                  const isLoading = state?.loading ?? false
                  const hasError = !!state?.error

                  return (
                    <div key={weak.name} className="glass rounded-xl p-4 border border-white/5">
                      {/* Pattern header */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-100">{weak.name}</p>
                        <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          {Math.round(weak.mastery)}% — Weak
                        </span>
                      </div>

                      {/* Mastery bar */}
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700"
                          style={{ width: `${weak.mastery}%` }}
                        />
                      </div>

                      {/* Load suggestions button */}
                      {!isLoaded && !isLoading && !hasError && (
                        <button
                          onClick={() => fetchProblems(weak.name)}
                          className="w-full text-xs text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/10 py-2 rounded-lg transition-all"
                        >
                          ✨ Get AI Problem Suggestions
                        </button>
                      )}

                      {/* Loading */}
                      {isLoading && (
                        <div className="flex items-center gap-2 justify-center py-3">
                          <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}

                      {/* Error */}
                      {hasError && (
                        <div className="text-xs text-red-400 text-center py-2">
                          {state.error}
                          <button
                            onClick={() => {
                              setTargetStates(prev => ({ ...prev, [weak.name]: { loading: false, error: null, problems: [] } }))
                              fetchProblems(weak.name)
                            }}
                            className="ml-2 underline hover:no-underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* AI-generated problems */}
                      {isLoaded && (
                        <div className="space-y-2 mt-1">
                          {state.problems.map((prob) => (
                            <a
                              key={prob.title}
                              href={prob.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col gap-1 p-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-indigo-500/30 rounded-lg transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors font-medium">
                                  {prob.title}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${difficultyStyle[prob.difficulty] ?? 'text-zinc-400'}`}>
                                  {prob.difficulty}
                                </span>
                              </div>
                              {prob.why && (
                                <p className="text-[10px] text-slate-600">{prob.why}</p>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
