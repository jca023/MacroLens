interface DayData {
  date: Date
  calories: number
}

interface WeeklyChartProps {
  data: DayData[]
  targetCalories: number
}

export function WeeklyChart({ data, targetCalories }: WeeklyChartProps) {
  // Find max value for scaling (at least target + 20% for visual clarity)
  const maxCalories = Math.max(
    targetCalories * 1.2,
    ...data.map(d => d.calories)
  )

  const chartHeight = 120
  const chartWidth = 280
  const barWidth = 28
  const barGap = 12
  const paddingBottom = 24
  const paddingTop = 8

  const getBarHeight = (calories: number) => {
    const availableHeight = chartHeight - paddingBottom - paddingTop
    return (calories / maxCalories) * availableHeight
  }

  const getTargetLineY = () => {
    const availableHeight = chartHeight - paddingBottom - paddingTop
    return chartHeight - paddingBottom - (targetCalories / maxCalories) * availableHeight
  }

  const getDayLabel = (date: Date) => {
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    if (isToday) return 'Today'
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
  }

  // Calculate stats
  const daysWithData = data.filter(d => d.calories > 0)
  const averageCalories = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length)
    : 0
  const daysOnTarget = data.filter(d => d.calories > 0 && d.calories <= targetCalories).length

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">This Week</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-500">Under</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-gray-500">Over</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {/* Target line */}
          <line
            x1={0}
            y1={getTargetLineY()}
            x2={chartWidth}
            y2={getTargetLineY()}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <text
            x={chartWidth}
            y={getTargetLineY() - 4}
            textAnchor="end"
            className="fill-gray-600 text-[10px]"
          >
            {targetCalories}
          </text>

          {/* Bars */}
          {data.map((day, index) => {
            const barHeight = getBarHeight(day.calories)
            const x = index * (barWidth + barGap)
            const y = chartHeight - paddingBottom - barHeight
            const isOver = day.calories > targetCalories
            const isEmpty = day.calories === 0

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={isEmpty ? chartHeight - paddingBottom - 2 : y}
                  width={barWidth}
                  height={isEmpty ? 2 : barHeight}
                  rx={4}
                  className={
                    isEmpty
                      ? 'fill-zinc-800'
                      : isOver
                        ? 'fill-red-500'
                        : 'fill-emerald-500'
                  }
                />
                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {getDayLabel(day.date)}
                </text>
                {/* Calorie value on hover/always for today */}
                {day.calories > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className={`text-[9px] ${isOver ? 'fill-red-400' : 'fill-emerald-400'}`}
                  >
                    {day.calories}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex justify-between mt-4 pt-3 border-t border-zinc-800">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{averageCalories}</div>
          <div className="text-xs text-gray-500">Avg/day</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{daysOnTarget}/{daysWithData.length}</div>
          <div className="text-xs text-gray-500">Days on target</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-semibold ${averageCalories <= targetCalories ? 'text-emerald-500' : 'text-red-400'}`}>
            {averageCalories <= targetCalories ? '-' : '+'}{Math.abs(averageCalories - targetCalories)}
          </div>
          <div className="text-xs text-gray-500">vs target</div>
        </div>
      </div>
    </div>
  )
}
