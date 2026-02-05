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

  const isDateToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Calculate stats
  const daysWithData = data.filter(d => d.calories > 0)
  const averageCalories = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length)
    : 0
  const daysOnTarget = data.filter(d => d.calories > 0 && d.calories <= targetCalories).length

  return (
    <div className="bg-[#262626] rounded-2xl p-4 border border-[#333]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#A1A1A1]">This Week</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97066]"></span>
            <span className="text-[#6B6B6B]">On track</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span>
            <span className="text-[#6B6B6B]">Over</span>
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
            stroke="#6B6B6B"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <text
            x={chartWidth}
            y={getTargetLineY() - 4}
            textAnchor="end"
            className="fill-[#6B6B6B] text-[10px]"
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
            const isToday = isDateToday(day.date)

            return (
              <g key={index}>
                {/* Today highlight background */}
                {isToday && (
                  <rect
                    x={x - 4}
                    y={0}
                    width={barWidth + 8}
                    height={chartHeight - 8}
                    rx={8}
                    className="fill-[#F97066]/5"
                  />
                )}
                {/* Bar */}
                <rect
                  x={x}
                  y={isEmpty ? chartHeight - paddingBottom - 3 : y}
                  width={barWidth}
                  height={isEmpty ? 3 : barHeight}
                  rx={6}
                  className={
                    isEmpty
                      ? 'fill-[#333]'
                      : isOver
                        ? 'fill-[#F87171]'
                        : 'fill-[#F97066]'
                  }
                />
                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className={`text-[10px] ${isToday ? 'fill-[#F97066] font-medium' : 'fill-[#6B6B6B]'}`}
                >
                  {getDayLabel(day.date)}
                </text>
                {/* Calorie value on hover/always for today */}
                {day.calories > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className={`text-[9px] font-medium ${isOver ? 'fill-[#F87171]' : 'fill-[#F97066]'}`}
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
      <div className="flex justify-between mt-4 pt-3 border-t border-[#333]">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#FAFAFA]">{averageCalories}</div>
          <div className="text-xs text-[#6B6B6B]">Avg/day</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[#FAFAFA]">{daysOnTarget}/{daysWithData.length}</div>
          <div className="text-xs text-[#6B6B6B]">Days on target</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-semibold ${averageCalories <= targetCalories ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
            {averageCalories <= targetCalories ? '-' : '+'}{Math.abs(averageCalories - targetCalories)}
          </div>
          <div className="text-xs text-[#6B6B6B]">vs target</div>
        </div>
      </div>
    </div>
  )
}
