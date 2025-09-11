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
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';

function Home()
{
    const [currencies, setCurrencies] = useState([]);
    const [selectedBase, setSelectedBase] = useState('USD');
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() =>
    {
        fetchCurrencies();
    }, []);

    useEffect(() =>
    {
        if (selectedBase)
        {
            fetchRates(selectedBase);
        }
    }, [selectedBase]);

    const fetchCurrencies = async () =>
    {
        setLoading(true);
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
            } else
            {
                setError('Could not fetch currencies: Invalid data format');
            }
        } catch (error)
        {
            setError('Could not fetch currencies: ' + error.message);
        } finally
        {
            setLoading(false);
        }
    };

    const fetchRates = async (base) =>
    {
        setLoading(true);
        try
        {
            const response = await axios.get(`http://localhost:8080/api/v1/rates/${base}`);
            if (response.data.success)
            {
                setRates(response.data.data);
            } else
            {
                setError('Could not fetch exchange rates');
            }
        } catch (error)
        {
            setError('Could not fetch exchange rates: ' + error.message);
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 6,
                        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                        p: 4,
                        borderRadius: 2,
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        Current Exchange Rates
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 3 }}>
                        Follow the current exchange rates of currencies around the world
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
                        p: 3,
                        mb: 4,
                        background: 'white',
                        borderRadius: 2
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Base Currency</InputLabel>
                        <Select
                            value={selectedBase}
                            label="Base Currency"
                            onChange={(e) => setSelectedBase(e.target.value)}
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
                </Paper>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={3}>
                        {Object.entries(rates.rates || {}).map(([code, rate]) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={code}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                                        transition: 'all 0.3s ease',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                            background: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '4px',
                                            background: 'linear-gradient(90deg, #1976d2, #64b5f6)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#1976d2',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {code}
                                                </Typography>
                                                {currencies.find(c => c.code === code)?.flag && (
                                                    <img
                                                        src={currencies.find(c => c.code === code)?.flag}
                                                        alt={code}
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.secondary',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {new Date().toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            mt: 2,
                                            mb: 3,
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                            textAlign: 'center'
                                        }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#1976d2',
                                                    textShadow: '1px 1px 1px rgba(0,0,0,0.05)',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                {rate.toFixed(4)}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            sx={{
                                                mt: 'auto',
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                color: '#666',
                                                textAlign: 'center',
                                                padding: '8px',
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            1 {selectedBase} = {rate.toFixed(4)} {code}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default Home;
