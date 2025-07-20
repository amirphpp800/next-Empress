import React, { useState, useCallback, useEffect } from 'react';
import { NUM_IPS_TO_GENERATE } from './constants';
import type { FetchedIpData } from './types';
import { generateRandomIpFromCidr, fetchIpInfo } from './services/ipService';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { Loader } from './components/Loader';
import { IpInfoCard } from './components/IpInfoCard';
import { ErrorMessage } from './components/ErrorMessage';
import { IpGrid } from './components/IpGrid';
import { InitialState } from './components/InitialState';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [ipDataList, setIpDataList] = useState<FetchedIpData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cidrRanges, setCidrRanges] = useState<string[]>([]);

  useEffect(() => {
    const fetchCidrs = async () => {
      try {
        const response = await fetch('/cidrs.json');
        if (!response.ok) {
          throw new Error('Failed to load CIDR ranges configuration.');
        }
        const data: string[] = await response.json();
        setCidrRanges(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Could not load configuration.');
      }
    };
    fetchCidrs();
  }, []);

  const handleFetchIps = useCallback(async () => {
    if (cidrRanges.length === 0) {
      setError("CIDR ranges are not loaded yet. Please try again in a moment.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIpDataList([]);

    try {
      const randomIps = Array.from({ length: NUM_IPS_TO_GENERATE }, () => {
        const randomCidr = cidrRanges[Math.floor(Math.random() * cidrRanges.length)];
        return generateRandomIpFromCidr(randomCidr);
      });

      const ipInfoPromises = randomIps.map(ip => fetchIpInfo(ip));
      const results = await Promise.all(ipInfoPromises);
      
      setIpDataList(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating IPs.');
    } finally {
      setIsLoading(false);
    }
  }, [cidrRanges]);

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Header />
        
        <div className="text-center my-8">
          <Button onClick={handleFetchIps} disabled={isLoading || cidrRanges.length === 0}>
            {isLoading ? (
              <>
                <Loader />
                Generating...
              </>
            ) : (
              'Generate & Fetch IPs'
            )}
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <Loader size="lg" />
            </div>
        )}
        
        {!isLoading && !error && ipDataList.length === 0 && <InitialState />}

        {!isLoading && ipDataList.length > 0 && (
          <IpGrid>
            {ipDataList.map((ipData, index) => (
              <IpInfoCard key={ipData.ip || index} data={ipData} />
            ))}
          </IpGrid>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;