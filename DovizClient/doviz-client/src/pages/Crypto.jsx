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
    Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function Crypto()
{
    const [cryptos, setCryptos] = useState(['BTC', 'ETH', 'USDT', 'BNB', 'XRP']);
    const [selectedCrypto, setSelectedCrypto] = useState('BTC');
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() =>
    {
        if (selectedCrypto)
        {
            fetchCryptoRates(selectedCrypto);
        }
    }, [selectedCrypto]);

    const fetchCryptoRates = async (crypto) =>
    {
        setLoading(true);
        try
        {
            const response = await axios.get(`http://localhost:8080/api/v1/crypto/${crypto}`);
            if (response.data.success)
            {
                setRates(response.data.data);
            } else
            {
                setError('Could not fetch crypto rates');
            }
        } catch (error)
        {
            setError('Could not fetch crypto rates: ' + error.message);
        } finally
        {
            setLoading(false);
        }
    };

    const getChangeColor = (rate) =>
    {
        if (rate > 0) return 'success';
        if (rate < 0) return 'error';
        return 'default';
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Crypto Exchange Rates
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Crypto Currency</InputLabel>
                    <Select
                        value={selectedCrypto}
                        label="Crypto Currency"
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                    >
                        {cryptos.map((crypto) => (
                            <MenuItem key={crypto} value={crypto}>
                                {crypto}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {Object.entries(rates.rates || {}).map(([currency, rate]) => (
                            <Grid item xs={12} sm={6} md={4} key={currency}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" component="div">
                                                {currency}
                                            </Typography>
                                            <Chip
                                                icon={rate > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                                label={`${rate > 0 ? '+' : ''}${rate.toFixed(2)}%`}
                                                color={getChangeColor(rate)}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="h4" color="primary">
                                            {rate.toFixed(8)}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                                            1 {selectedCrypto} = {rate.toFixed(8)} {currency}
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

export default Crypto;
