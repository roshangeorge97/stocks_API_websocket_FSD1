import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { updatePrice } from './store/StockSlice';
import StockList from './components/StockList';
import StocksView from './components/WatchList';

// Add global styles for select elements
const globalStyles = `
  select {
    background-color: #1e293b !important;
    color: #fff !important;
    border: 1px solid #334155 !important;
    padding: 0.5rem !important;
    border-radius: 0.375rem !important;
    outline: none !important;
  }

  select option {
    background-color: #1e293b !important;
    color: #fff !important;
  }

  select:focus {
    border-color: #60a5fa !important;
    box-shadow: 0 0 0 1px #60a5fa !important;
  }
`;

export default function App() {
  const dispatch = useDispatch();
  const stockToSubscribe = useSelector(store => store["stock-data"].stockToSubscribe);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    "wss://ws.finnhub.io?token=clnd5j9r01qkjffn5tn0clnd5j9r01qkjffn5tng",
    {
      share: false,
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
      onOpen: () => {
        console.log('WebSocket connection established.');
      },
      onClose: () => {
        console.log('WebSocket connection closed.');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      }
    }
  );

  useEffect(() => {
    if(stockToSubscribe && readyState === ReadyState.OPEN) {
      sendJsonMessage({'type':'subscribe', 'symbol': stockToSubscribe});
    }
  }, [stockToSubscribe, readyState, sendJsonMessage]);

  useEffect(() => {
    if(!lastJsonMessage) return;
    const {data} = lastJsonMessage;
    if(!data) return;
    const { p, s} = data[0];
    dispatch(updatePrice({ name: s, price: p}));
  }, [lastJsonMessage, dispatch]);

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#60a5fa',
              marginBottom: '0.5rem'
            }}>Stock Market Dashboard</h1>
            <p style={{ color: '#94a3b8' }}>Real-time market data and analysis</p>
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#94a3b8',
              fontSize: '0.875rem' 
            }}>
              Status: {
                readyState === ReadyState.CONNECTING ? 'Connecting...' :
                readyState === ReadyState.OPEN ? 'Connected' :
                readyState === ReadyState.CLOSING ? 'Closing...' :
                readyState === ReadyState.CLOSED ? 'Disconnected' :
                'Unknown'
              }
            </div>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid #334155'
            }}>
              <div style={{
                borderBottom: '1px solid #334155',
                padding: '1rem',
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#60a5fa'
                }}>Market Overview</h2>
              </div>
              <div style={{ padding: '1rem' }}>
                <StockList />
              </div>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid #334155'
            }}>
              <div style={{
                borderBottom: '1px solid #334155',
                padding: '1rem',
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#60a5fa'
                }}>Watchlist</h2>
              </div>
              <div style={{ padding: '1rem' }}>
                <StocksView />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}