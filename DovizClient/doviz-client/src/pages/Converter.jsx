import { useState, useEffect } from 'react';
import axios from 'axios';
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
    Paper,
    CircularProgress
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

function Converter()
{
    const [currencies, setCurrencies] = useState([]);
    const [fromCurrency, setFromCurrency] = useState('EUR');
    const [toCurrency, setToCurrency] = useState('USD');
    const [amount, setAmount] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            setError('Did not receive currencies: ' + error.message);
        }
    };

    const handleConvert = async () =>
    {
        setLoading(true);
        setError(null);
        try
        {
            const response = await axios.get(`http://localhost:8080/api/v1/rate?from=${fromCurrency}&to=${toCurrency}`);
            if (response.data.success)
            {
                const rate = response.data.data.rate;
                setResult({
                    from: fromCurrency,
                    to: toCurrency,
                    amount: amount,
                    convertedAmount: (amount * rate).toFixed(4),
                    rate: rate
                });
            }
        } catch (error)
        {
            setError('Got error while converting process: ' + error.message);
        } finally
        {
            setLoading(false);
        }
    };

    const handleSwap = () =>
    {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 6,
                        background: 'linear-gradient(120deg, #3f51b5 0%, #2196f3 100%)',
                        p: 4,
                        borderRadius: 3,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(33, 150, 243, 0.2)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
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
                            mb: 2
                        }}
                    >
                        Currency Converter
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: 1.5
                        }}
                    >
                        Convert your currency quickly and easily with live exchange rates
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
                            background: 'linear-gradient(90deg, #3f51b5, #2196f3)'
                        }
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 4,
                            fontWeight: 600,
                            color: '#3f51b5',
                            position: 'relative'
                        }}
                    >
                        Currency Conversion
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <TextField
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(63, 81, 181, 0.04)'
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#3f51b5',
                                            borderWidth: '2px'
                                        }
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    '&.Mui-focused': {
                                        color: '#3f51b5'
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 4,
                            position: 'relative'
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel>From Currency</InputLabel>
                            <Select
                                value={fromCurrency}
                                label="From Currency"
                                onChange={(e) => setFromCurrency(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: 2
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
                                                    borderRadius: '50%'
                                                }}
                                            />
                                        )}
                                        {currency.name} ({currency.code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            onClick={handleSwap}
                            sx={{
                                minWidth: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#303f9f',
                                    transform: 'rotate(180deg)',
                                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
                                }
                            }}
                        >
                            <SwapHorizIcon sx={{ fontSize: 28 }} />
                        </Button>

                        <FormControl fullWidth>
                            <InputLabel>To Currency</InputLabel>
                            <Select
                                value={toCurrency}
                                label="To Currency"
                                onChange={(e) => setToCurrency(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: 2
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
                                                    borderRadius: '50%'
                                                }}
                                            />
                                        )}
                                        {currency.name} ({currency.code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleConvert}
                        disabled={loading}
                        sx={{
                            py: 2,
                            borderRadius: '50px',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
                            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3949ab 0%, #1e88e5 100%)',
                                boxShadow: '0 6px 16px rgba(63, 81, 181, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            '&:active': {
                                transform: 'translateY(0)'
                            },
                            '&:disabled': {
                                background: '#e0e0e0'
                            }
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                                <span>Converting...</span>
                            </Box>
                        ) : (
                            'Convert'
                        )}
                    </Button>

                    {result && (
                        <Box
                            sx={{
                                mt: 4,
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    background: 'linear-gradient(180deg, #3f51b5, #2196f3)'
                                }
                            }}
                        >
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #3f51b5, #2196f3)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1
                                    }}
                                >
                                    {result.convertedAmount} {result.to}
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {result.amount} {result.from}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 3,
                                    mb: 2
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: '#3f51b5',
                                        fontWeight: 600,
                                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                        padding: '8px 16px',
                                        borderRadius: '20px'
                                    }}
                                >
                                    1 {result.from} = {result.rate.toFixed(4)} {result.to}
                                </Typography>
                            </Box>

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    color: 'text.secondary',
                                    backgroundColor: 'rgba(0,0,0,0.03)',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    display: 'inline-block'
                                }}
                            >
                                Last Update: {new Date().toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

export default Converter;
