import { motion } from 'framer-motion'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import GlassCard from '../ui/GlassCard'
import styles from './DataChart.module.css'

/**
 * DataChart - Animated chart component with dark theme
 * Supports line, area, and bar chart types
 */
function DataChart({
    title,
    subtitle,
    data,
    type = 'area',
    dataKeys = [],
    colors = ['#00d4ff', '#00ffc8'],
    height = 300,
    showGrid = true,
    showLegend = false,
    className = ''
}) {
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null

        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
                        {entry.name}: <strong>{entry.value.toLocaleString()}</strong>
                    </p>
                ))}
            </div>
        )
    }

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: 0, bottom: 0 }
        }

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: colors[index % colors.length] }}
                            />
                        ))}
                    </LineChart>
                )

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={colors[index % colors.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                )

            default: // area
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            {dataKeys.map((key, index) => (
                                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, index) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                fill={`url(#gradient-${key})`}
                            />
                        ))}
                    </AreaChart>
                )
        }
    }

    return (
        <GlassCard className={`${styles.chartCard} ${className}`} animate={false}>
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <motion.div
                className={styles.chartWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <ResponsiveContainer width="100%" height={height}>
                    {renderChart()}
                </ResponsiveContainer>
            </motion.div>
        </GlassCard>
    )
}

export default DataChart
