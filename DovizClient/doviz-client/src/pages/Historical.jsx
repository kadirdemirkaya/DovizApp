import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import
{
    Container,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import
{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    size: 12,
                    weight: '500'
                }
            }
        },
        title: {
            display: true,
            text: 'Historical Exchange Rates',
            font: {
                size: 16,
                weight: 'bold'
            },
            padding: 20
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000',
            bodyColor: '#666',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
                label: function (context)
                {
                    return `Rate: ${context.parsed.y.toFixed(4)}`;
                }
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    scales: {
        y: {
            beginAtZero: false,
            grid: {
                color: 'rgba(0, 0, 0, 0.06)',
                drawBorder: false
            },
            ticks: {
                padding: 10,
                color: '#666',
                font: {
                    size: 11
                }
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                padding: 10,
                color: '#666',
                font: {
                    size: 11
                },
                maxRotation: 45,
                minRotation: 45
            }
        }
    },
    elements: {
        line: {
            tension: 0.3
        },
        point: {
            radius: 4,
            borderWidth: 2,
            hoverRadius: 6
        }
    }
};

function Historical()
{
    const [currencies, setCurrencies] = useState([]);
    const [baseCurrency, setBaseCurrency] = useState('usd');
    const [targetCurrency, setTargetCurrency] = useState('try');
    const [startDate, setStartDate] = useState(dayjs('2023-01-01'));
    const [endDate, setEndDate] = useState(dayjs());
    const [historicalData, setHistoricalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState(null);

    useEffect(() =>
    {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () =>
    {
        try
        {
            const response = await axios.get('http://localhost:8080/api/v1/currencies');
            if (response.data && response.data.success && response.data.data)
            {
                const currencyData = Object.entries(response.data.data).map(([code, name]) => ({
                    code,
                    name
                }));
                setCurrencies(currencyData);
            }
        } catch (error)
        {
            setError('Could not fetch currencies: ' + error.message);
        }
    };

    const formatDate = (date) =>
    {
        return dayjs(date).format('YYYY-MM-DD');
    };

    const handleBaseChange = (event) =>
    {
        setBaseCurrency(event.target.value);
    };

    const handleTargetChange = (event) =>
    {
        setTargetCurrency(event.target.value);
    };

    const handleStartDateChange = (date) =>
    {
        setStartDate(date);
    };

    const handleEndDateChange = (date) =>
    {
        setEndDate(date);
    };

    const fetchHistoricalData = async () =>
    {
        setLoading(true);
        setError(null);
        try
        {
            const response = await axios.get(
                `http://localhost:8080/api/v1/rates/${baseCurrency.toLowerCase()}/${targetCurrency.toLowerCase()}/range?start=${formatDate(startDate)}&end=${formatDate(endDate)}`
            );
            if (response.data.success)
            {
                const data = response.data.data;
                if (!Array.isArray(data) || data.length === 0)
                {
                    setError('No historical data available for the selected period');
                    return;
                }
                const chartData = {
                    labels: data.map(item => dayjs(item.date).format('YYYY-MM-DD')),
                    datasets: [
                        {
                            label: `${baseCurrency}/${targetCurrency} Exchange Rate`,
                            data: data.map(item => parseFloat(item.rate)),
                            fill: true,
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#4caf50',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#4caf50'
                        }
                    ]
                };
                setChartData(chartData);
                setHistoricalData(data);
            } else
            {
                setError(response.data.message || 'Failed to fetch historical data');
            }
        } catch (error)
        {
            setError('Could not fetch historical data: ' + error.message);
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            background: 'linear-gradient(120deg, #2196f3 0%, #1976d2 100%)',
                            p: 4,
                            borderRadius: 3,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(25, 118, 210, 0.2)',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 800,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                letterSpacing: '0.5px',
                                position: 'relative'
                            }}
                        >
                            Historical Exchange Rates
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 400,
                                opacity: 0.9,
                                maxWidth: '600px',
                                margin: '0 auto',
                                lineHeight: 1.5,
                                position: 'relative'
                            }}
                        >
                            View and analyze historical exchange rates.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            mb: 4,
                            borderRadius: 3,
                            background: 'white',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #2196f3, #64b5f6)'
                            }
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: '#1976d2',
                                position: 'relative'
                            }}
                        >
                            Query Historical Data
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 3,
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>Base Currency</InputLabel>
                                <Select
                                    value={baseCurrency}
                                    onChange={handleBaseChange}
                                    label="Base Currency"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    {currencies.map((currency) => (
                                        <MenuItem
                                            key={currency.code}
                                            value={currency.code}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            {currency.flag && (
                                                <img
                                                    src={currency.flag}
                                                    alt={currency.code}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                            {currency.name ? `${currency.name} (${currency.code})` : currency.code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Target Currency</InputLabel>
                                <Select
                                    value={targetCurrency}
                                    onChange={handleTargetChange}
                                    label="Target Currency"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    {currencies.map((currency) => (
                                        <MenuItem
                                            key={currency.code}
                                            value={currency.code}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            {currency.flag && (
                                                <img
                                                    src={currency.flag}
                                                    alt={currency.code}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                            {currency.name ? `${currency.name} (${currency.code})` : currency.code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                slotProps={{ textField: { fullWidth: true } }}
                            />

                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                slotProps={{ textField: { fullWidth: true } }}
                                minDate={startDate}
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={fetchHistoricalData}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                    px: 6,
                                    py: 1.5,
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
                                    },
                                    '&:disabled': {
                                        background: '#e0e0e0'
                                    }
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} color="inherit" />
                                        <span>Loading...</span>
                                    </Box>
                                ) : (
                                    'Get Historical Data'
                                )}
                            </Button>
                        </Box>
                    </Paper>

                    {chartData && (
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                background: 'white',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #2196f3, #64b5f6)'
                                }
                            }}
                        >
                            <Box sx={{
                                height: 500,
                                width: '100%',
                                p: 2,
                                position: 'relative'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    p: 2,
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'center'
                                }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: 'text.secondary',
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            fontWeight: 500
                                        }}
                                    >
                                        {baseCurrency.toUpperCase()} → {targetCurrency.toUpperCase()}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: 'text.secondary',
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            fontWeight: 500
                                        }}
                                    >
                                        {formatDate(startDate)} - {formatDate(endDate)}
                                    </Typography>
                                </Box>
                                <Line data={chartData} options={chartOptions} />
                            </Box>
                        </Paper>
                    )}
                </Box>
            </Container>
        </LocalizationProvider>
    );
}

export default Historical;
