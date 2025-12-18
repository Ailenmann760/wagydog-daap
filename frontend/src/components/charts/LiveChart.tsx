'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import axios from 'axios';

const TIMEFRAMES = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1H', value: '1h' },
    { label: '4H', value: '4h' },
    { label: '1D', value: '1d' },
];

const CHART_COLORS = {
    background: '#0f172a',
    grid: 'rgba(37, 99, 235, 0.1)',
    text: '#94a3b8',
    upColor: '#22c55e',
    downColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    volumeUp: 'rgba(34, 197, 94, 0.3)',
    volumeDown: 'rgba(239, 68, 68, 0.3)',
};

export default function LiveChart({
    chain = 'ethereum',
    pairAddress,
    height = 400,
    showVolume = true
}) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);

    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastPrice, setLastPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height,
            layout: {
                background: { type: ColorType.Solid, color: CHART_COLORS.background },
                textColor: CHART_COLORS.text,
            },
            grid: {
                vertLines: { color: CHART_COLORS.grid },
                horzLines: { color: CHART_COLORS.grid },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: 'rgba(37, 99, 235, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#2563eb',
                },
                horzLine: {
                    color: 'rgba(37, 99, 235, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#2563eb',
                },
            },
            rightPriceScale: {
                borderColor: CHART_COLORS.grid,
                scaleMargins: {
                    top: 0.1,
                    bottom: showVolume ? 0.2 : 0.1,
                },
            },
            timeScale: {
                borderColor: CHART_COLORS.grid,
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: CHART_COLORS.upColor,
            downColor: CHART_COLORS.downColor,
            wickUpColor: CHART_COLORS.wickUpColor,
            wickDownColor: CHART_COLORS.wickDownColor,
            borderUpColor: CHART_COLORS.upColor,
            borderDownColor: CHART_COLORS.downColor,
        });

        // Volume series
        let volumeSeries = null;
        if (showVolume) {
            volumeSeries = chart.addHistogramSeries({
                color: CHART_COLORS.volumeUp,
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.85,
                    bottom: 0,
                },
            });
        }

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [height, showVolume]);

    // Fetch chart data
    useEffect(() => {
        if (!pairAddress || !candlestickSeriesRef.current) return;

        const fetchChartData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const response = await axios.get(
                    `${apiUrl}/api/pairs/${chain}/${pairAddress}/chart?interval=${selectedTimeframe}`
                );

                if (response.data.success && response.data.data.length > 0) {
                    const data = response.data.data;

                    // Set candlestick data
                    candlestickSeriesRef.current.setData(
                        data.map(d => ({
                            time: d.time,
                            open: d.open,
                            high: d.high,
                            low: d.low,
                            close: d.close,
                        }))
                    );

                    // Set volume data
                    if (volumeSeriesRef.current) {
                        volumeSeriesRef.current.setData(
                            data.map(d => ({
                                time: d.time,
                                value: d.volume,
                                color: d.close >= d.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
                            }))
                        );
                    }

                    // Update price display
                    const lastCandle = data[data.length - 1];
                    const firstCandle = data[0];
                    setLastPrice(lastCandle.close);
                    setPriceChange(((lastCandle.close - firstCandle.open) / firstCandle.open) * 100);

                    // Fit content
                    chartRef.current?.timeScale().fitContent();
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Failed to load chart data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();

        // Refresh periodically
        const interval = setInterval(fetchChartData, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [pairAddress, chain, selectedTimeframe]);

    return (
        <div className="glass-surface rounded-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Price Chart</h3>
                    {lastPrice !== null && (
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                                ${lastPrice < 0.01 ? lastPrice.toExponential(4) : lastPrice.toFixed(4)}
                            </span>
                            {priceChange !== null && (
                                <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Timeframe Selector */}
                <div className="flex gap-1 bg-bg-surface rounded-lg p-1">
                    {TIMEFRAMES.map(tf => (
                        <button
                            key={tf.value}
                            onClick={() => setSelectedTimeframe(tf.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded transition ${selectedTimeframe === tf.value
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-white/10 text-text-muted'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/50 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-text-muted">Loading chart...</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/50 z-10">
                        <span className="text-red-400">{error}</span>
                    </div>
                )}
                <div ref={chartContainerRef} style={{ height }} />
            </div>
        </div>
    );
}
